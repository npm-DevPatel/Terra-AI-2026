import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import riversData from '../../data/rivers.json'
import encroachmentData from '../../data/encroachments.json'

// Free dark basemap — no API key needed
const DARK_STYLE = {
  version: 8,
  name: 'Terra Dark',
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
}

export default function MapContainer({ onMapClick, interactive = true, center, zoom, children }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const animationRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: DARK_STYLE,
      center: center || [36.8219, -1.2921],
      zoom: zoom || 12,
      pitch: 40,
      bearing: -15,
      antialias: true,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right')

    map.on('load', () => {
      mapRef.current = map

      // ── River Network (Glow Layer — wide blurred line) ──
      map.addSource('rivers', {
        type: 'geojson',
        data: riversData,
      })

      // Ultra-wide ambient glow (no blur — solid wide line)
      map.addLayer({
        id: 'rivers-glow-outer',
        type: 'line',
        source: 'rivers',
        paint: {
          'line-color': '#005F6B',
          'line-width': 30,
          'line-opacity': 0.3,
        },
      })

      // Wide glow
      map.addLayer({
        id: 'rivers-glow',
        type: 'line',
        source: 'rivers',
        paint: {
          'line-color': '#00B8D4',
          'line-width': 14,
          'line-opacity': 0.4,
        },
      })

      // Mid glow — bright and crisp
      map.addLayer({
        id: 'rivers-glow-mid',
        type: 'line',
        source: 'rivers',
        paint: {
          'line-color': '#00E5FF',
          'line-width': 6,
          'line-opacity': 0.7,
        },
      })

      // Crisp core line — full brightness
      map.addLayer({
        id: 'rivers-core',
        type: 'line',
        source: 'rivers',
        paint: {
          'line-color': '#00E5FF',
          'line-width': 3,
          'line-opacity': 1,
        },
      })

      // ── Riparian Buffer (30m zone) ──
      const bufferFeatures = riversData.features.map(river => {
        const coords = river.geometry.coordinates
        const offset = 0.00027 // ~30m in degrees at Nairobi's latitude
        const upper = coords.map(c => [c[0], c[1] - offset])
        const lower = [...coords].reverse().map(c => [c[0], c[1] + offset])
        return {
          type: 'Feature',
          properties: { ...river.properties, buffer_width_m: 30 },
          geometry: {
            type: 'Polygon',
            coordinates: [[...upper, ...lower, upper[0]]],
          },
        }
      })

      map.addSource('riparian-buffers', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: bufferFeatures },
      })

      map.addLayer({
        id: 'riparian-buffers-fill',
        type: 'fill',
        source: 'riparian-buffers',
        paint: {
          'fill-color': '#14B8A6',
          'fill-opacity': 0.1,
        },
      })

      map.addLayer({
        id: 'riparian-buffers-line',
        type: 'line',
        source: 'riparian-buffers',
        paint: {
          'line-color': '#14B8A6',
          'line-width': 1.5,
          'line-opacity': 0.5,
          'line-dasharray': [4, 4],
        },
      })

      // ── Encroachment Zones ──
      map.addSource('encroachments', {
        type: 'geojson',
        data: encroachmentData,
      })

      map.addLayer({
        id: 'encroachments-glow',
        type: 'line',
        source: 'encroachments',
        paint: {
          'line-color': '#FF1744',
          'line-width': 8,
          'line-opacity': 0.15,
          'line-blur': 6,
        },
      })

      map.addLayer({
        id: 'encroachments-fill',
        type: 'fill',
        source: 'encroachments',
        paint: {
          'fill-color': [
            'match', ['get', 'severity'],
            'HIGH', '#EF4444',
            'MEDIUM', '#F97316',
            '#FBBF24'
          ],
          'fill-opacity': 0.4,
        },
      })

      map.addLayer({
        id: 'encroachments-outline',
        type: 'line',
        source: 'encroachments',
        paint: {
          'line-color': '#FF1744',
          'line-width': 2,
          'line-opacity': 0.8,
        },
      })

      // ── Encroachment Pulse Animation ──
      let pulsePhase = 0
      function pulseEncroachments() {
        pulsePhase += 0.02
        const opacity = 0.25 + Math.sin(pulsePhase) * 0.2
        if (map.getLayer('encroachments-fill')) {
          map.setPaintProperty('encroachments-fill', 'fill-opacity', opacity)
        }
        const glowOpacity = 0.5 + Math.sin(pulsePhase * 0.7) * 0.3
        if (map.getLayer('encroachments-outline')) {
          map.setPaintProperty('encroachments-outline', 'line-opacity', glowOpacity)
        }
        // River glow pulse (visible range)
        const riverGlow = 0.35 + Math.sin(pulsePhase * 0.3) * 0.1
        if (map.getLayer('rivers-glow')) {
          map.setPaintProperty('rivers-glow', 'line-opacity', riverGlow)
        }
        animationRef.current = requestAnimationFrame(pulseEncroachments)
      }
      pulseEncroachments()

      // ── River Hover ──
      map.on('mouseenter', 'rivers-core', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'rivers-core', () => {
        map.getCanvas().style.cursor = ''
      })

      // ── Encroachment Click Popup ──
      map.on('click', 'encroachments-fill', (e) => {
        if (!e.features?.length) return
        const f = e.features[0]
        new maplibregl.Popup({ offset: 10, className: 'terra-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div style="min-width:200px">
              <div style="font-size:11px;color:#94A3B8;margin-bottom:4px">${f.properties.id}</div>
              <div style="font-weight:600;margin-bottom:6px;color:#F1F5F9">${f.properties.description}</div>
              <div style="display:flex;gap:12px;font-size:12px;color:#94A3B8">
                <span>🏞 ${f.properties.river_name}</span>
                <span>📏 ${f.properties.distance_from_river_m}m</span>
              </div>
              <div style="margin-top:6px;padding:4px 8px;background:rgba(239,68,68,0.15);border-radius:4px;font-size:11px;color:#EF4444;font-weight:600;display:inline-block">
                ${f.properties.severity} RISK
              </div>
            </div>
          `)
          .addTo(map)
      })

      // ── Map Click (for site risk) ──
      if (interactive && onMapClick) {
        map.on('click', (e) => {
          const encFeatures = map.queryRenderedFeatures(e.point, { layers: ['encroachments-fill'] })
          if (encFeatures.length > 0) return
          onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng }, map)
        })
      }

      setMapLoaded(true)
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="absolute inset-0" />
      {mapLoaded && children}
    </div>
  )
}
