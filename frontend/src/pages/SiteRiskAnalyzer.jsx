import { useState, useCallback, useRef, useEffect } from 'react'
import maplibregl from 'maplibre-gl'
import MapContainer from '../components/map/MapContainer'
import LocationSearch from '../components/search/LocationSearch'
import AIChatPanel from '../components/risk/AIChatPanel'
import SiteRiskReportCard from '../components/risk/SiteRiskReportCard'
import { useSiteRisk } from '../hooks/useSiteRisk'

// Helper function to create circle coordinates
function createCircleCoordinates(latCenter, lngCenter, radiusKm) {
  const R = 6371 // Earth radius in km
  const points = 64 // Number of points for smooth circle
  const coordinates = []

  for (let i = 0; i < points; i++) {
    const angle = (i / points) * (2 * Math.PI)
    const lat = latCenter + (radiusKm / R) * (180 / Math.PI) * Math.cos(angle)
    const lng = lngCenter + (radiusKm / R) * (180 / Math.PI) * Math.sin(angle) / Math.cos((latCenter * Math.PI) / 180)
    coordinates.push([lng, lat])
  }

  // Close the circle
  coordinates.push(coordinates[0])
  return coordinates
}

export default function SiteRiskAnalyzer() {
  const { result, loading, assessSite, clearResult } = useSiteRisk()
  const [markers, setMarkers] = useState([])
  const mapContainerRef = useRef(null)

  const handleMapClick = useCallback(({ lat, lng }, map) => {
    // Remove existing markers except location search markers
    markers.forEach(m => {
      if (m.element?.dataset?.type !== 'location-search') {
        m.remove()
      }
    })

    // Create pulsing marker element
    const el = document.createElement('div')
    el.style.cssText = `
      width: 24px; height: 24px; border-radius: 50%;
      background: radial-gradient(circle, var(--accent-teal) 30%, rgba(13, 148, 136, 0.3) 70%);
      border: 2px solid var(--accent-teal);
      box-shadow: 0 0 16px rgba(13, 148, 136, 0.6);
      animation: pulse 2s ease-in-out infinite;
      cursor: pointer;
    `

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map)

    setMarkers(prev => {
      const locationMarkers = prev.filter(m => m.element?.dataset?.type === 'location-search')
      return [...locationMarkers, marker]
    })
    assessSite(lat, lng)
  }, [markers, assessSite])

  // Handle location selection from search
  const handleLocationSelect = useCallback((location) => {
    if (!mapContainerRef.current) return

    const map = mapContainerRef.current.getMap()
    if (!map) {
      console.error('Map not available')
      return
    }

    // Ensure map is loaded before adding sources/layers
    const addCircle = () => {
      try {
        // Remove existing search circle layer if it exists
        if (map.getLayer('search-circle-outline')) {
          map.removeLayer('search-circle-outline')
        }
        if (map.getLayer('search-circle-layer')) {
          map.removeLayer('search-circle-layer')
        }
        if (map.getSource('search-circle')) {
          map.removeSource('search-circle')
        }

        // Create a 7.5 km radius circle (middle of 5-10 km range)
        const radiusKm = 7.5
        const circleCoordinates = createCircleCoordinates(location.lat, location.lng, radiusKm)

        // Add circle as GeoJSON source and layer
        map.addSource('search-circle', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [circleCoordinates],
            },
          },
        })

        map.addLayer({
          id: 'search-circle-layer',
          type: 'fill',
          source: 'search-circle',
          paint: {
            'fill-color': '#22c55e',
            'fill-opacity': 0.2,
          },
        })

        // Add circle outline
        map.addLayer({
          id: 'search-circle-outline',
          type: 'line',
          source: 'search-circle',
          paint: {
            'line-color': '#22c55e',
            'line-width': 3,
            'line-opacity': 0.8,
          },
        })

        console.log('✅ Circle added successfully at', location.lat, location.lng)
      } catch (error) {
        console.error('Error adding circle:', error)
      }
    }

    // If map is already loaded, add circle immediately
    if (map.isStyleLoaded()) {
      addCircle()
    } else {
      // Wait for map to load
      map.once('styledata', addCircle)
    }

    // Pan and zoom to location
    map.flyTo({
      center: [location.lng, location.lat],
      zoom: 13,
      duration: 1500,
    })

    // Assess site at the selected location
    assessSite(location.lat, location.lng)
  }, [markers, assessSite])

  return (
    <div className="relative w-full h-full bg-bg-base">
      <MapContainer ref={mapContainerRef} onMapClick={handleMapClick} interactive>
        <LocationSearch onLocationSelect={handleLocationSelect} mapRef={mapContainerRef} />
        <SiteRiskReportCard data={result} />
        <AIChatPanel siteRisk={result} loading={loading} />

        {/* Instruction overlay (shown when no result) */}
        {!result && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-fade-in shadow-md rounded-xl">
            <div className="bg-bg-surface border border-border-default rounded-xl px-6 py-3 flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-accent-teal" />
                <div className="w-3 h-3 rounded-full bg-accent-teal absolute inset-0 animate-ping opacity-50" />
              </div>
              <span className="text-sm text-text-secondary font-medium tracking-wide">Click anywhere on the map to assess site suitability</span>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  )
}
