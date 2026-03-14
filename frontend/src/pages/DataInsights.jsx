import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'

export default function DataInsights() {
  const location = useLocation()
  const navigate = useNavigate()
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [siteRisk, setSiteRisk] = useState(null)
  const [suitabilityScore, setSuitabilityScore] = useState(70) // Demo score
  const [dataPoints, setDataPoints] = useState({
    airQuality: { value: 72, explanation: 'Air quality index for resident health. A 7-floor building will have ~150-200 residents. This level supports healthy living conditions.' },
    airPollutionPM25: { value: 38, unit: 'µg/m³', explanation: 'Particulate matter concentration (WHO safe: <15). Moderately elevated; recommend HVAC systems with quality air filtration for all units.' },
    nearestMarket: { name: 'Kibera Market', distance: 0.8 },
    nearestHealthCenter: { name: 'St. John Health Centre', distance: 1.2 },
    nearestSchool: { name: 'Nairobi Academy', distance: 0.6 },
    populationDensity: { value: 420, unit: '/km²', explanation: 'Moderate density indicates adequate market demand for 200+ residential units without oversaturation. Supports infrastructure capacity.' },
    soilFertility: { value: 68, explanation: 'Soil quality for foundation stability. Good for landscaping common areas. Consider soil testing before pile foundation design.' },
    waterAvailability: { value: 82, explanation: 'Critical for 7-floor building. Supports 200+ residents with daily consumption of 200-250L per capita. Requires reliable supply agreements.' },
    roadAccessibility: { value: 88, explanation: 'Primary access road capacity. Excellent for emergency services, construction delivery, and daily traffic from 200+ residents and vehicles.' },
    electricityAccess: { value: 85, explanation: 'Grid reliability important. A 7-floor residential building requires 150-200kW peak capacity. Plan for backup generator (50-100kW). ' },
    securityRating: { value: 78, explanation: 'Neighborhood safety level is good. Important for resident confidence and property value. Recommend perimeter security system.' },
    infrastructureMatureity: { value: 81, explanation: 'Existing infrastructure (sewage, water pipes, roads, utilities) maturity. High score means supporting a 200-unit building with minimal upgrades.' }
  })

  useEffect(() => {
    if (location.state?.siteRisk) {
      const risk = location.state.siteRisk
      setSiteRisk(risk)
    }
  }, [location])

  useEffect(() => {
    if (siteRisk?.site && mapContainerRef.current) {
      const lat = siteRisk.site.lat
      const lng = siteRisk.site.lng

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

      try {
        // Initialize maplibre map
        const map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json',
          center: [lng, lat],
          zoom: 16,
          pitch: 0,
          bearing: 0,
        })

        mapRef.current = map

        const addCircleAndMarker = () => {
          try {
            // Remove existing layers/sources if they exist
            if (map.getLayer('site-circle-outline')) map.removeLayer('site-circle-outline')
            if (map.getLayer('site-circle-layer')) map.removeLayer('site-circle-layer')
            if (map.getSource('site-circle')) map.removeSource('site-circle')

            // Create 7.5 km radius circle
            const radiusKm = 7.5
            const circleCoordinates = createCircleCoordinates(lat, lng, radiusKm)

            // Add circle as GeoJSON source
            map.addSource('site-circle', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [circleCoordinates],
                },
              },
            })

            // Add circle fill
            map.addLayer({
              id: 'site-circle-layer',
              type: 'fill',
              source: 'site-circle',
              paint: {
                'fill-color': '#0D9488',
                'fill-opacity': 0.15,
              },
            })

            // Add circle outline
            map.addLayer({
              id: 'site-circle-outline',
              type: 'line',
              source: 'site-circle',
              paint: {
                'line-color': '#0D9488',
                'line-width': 2,
                'line-opacity': 0.8,
              },
            })

            // Add marker
            const markerEl = document.createElement('div')
            markerEl.style.cssText = `
              width: 24px; height: 24px; border-radius: 50%;
              background: radial-gradient(circle, #0D9488 30%, rgba(13, 148, 136, 0.3) 70%);
              border: 2px solid #0D9488;
              box-shadow: 0 0 16px rgba(13, 148, 136, 0.6);
            `

            new maplibregl.Marker({ element: markerEl })
              .setLngLat([lng, lat])
              .addTo(map)
          } catch (error) {
            console.error('Error adding circle and marker:', error)
          }
        }

        if (map.isStyleLoaded()) {
          addCircleAndMarker()
        } else {
          map.once('styledata', addCircleAndMarker)
        }

        return () => {
          map.remove()
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }
  }, [siteRisk])

  const DataCard = ({ label, value, unit = '', icon = '📊', explanation = '' }) => (
    <div className="bg-bg-surface/80 border border-border-default rounded-lg p-4 backdrop-blur-sm hover:shadow-md transition-all hover:bg-white group cursor-help">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-accent-teal">{value}{unit}</div>
      {explanation && (
        <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border-default/50 opacity-90 group-hover:opacity-100 transition-opacity">
          {explanation}
        </p>
      )}
    </div>
  )

  return (
    <div className="h-screen w-full bg-bg-base overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-surface/90 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Site Suitability Insights</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {siteRisk?.site ? `Location: ${siteRisk.site.lat.toFixed(4)}, ${siteRisk.site.lng.toFixed(4)}` : 'No site selected yet'}
          </p>
        </div>
        <button
          onClick={() => navigate('/site-risk')}
          className="px-4 py-2 bg-bg-elevated hover:bg-white border border-border-default rounded-lg transition-all text-sm font-medium"
        >
          ← Back to Analyzer
        </button>
      </div>

      {/* Empty State - When no site has been selected */}
      {!siteRisk && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">No Site Selected</h2>
              <p className="text-sm text-text-muted">
                Return to the analyzer and click "Get Insights" after your 3rd site assessment to view detailed suitability analysis.
              </p>
            </div>
            <button
              onClick={() => navigate('/site-risk')}
              className="px-6 py-2.5 bg-accent-teal text-white rounded-lg hover:bg-teal-600 transition-all font-medium text-sm"
            >
              Back to Analyzer
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when siteRisk data is available */}
      {siteRisk && (
        <div className="flex flex-col overflow-y-auto">
          <div className="flex gap-0 w-full">
            {/* Left Sidebar - Environmental Data */}
            <div className="w-72 border-r border-border-default bg-bg-surface/40 p-5 space-y-4 flex-shrink-0">
                <div>
                <h2 className="text-sm font-bold text-text-primary mb-4 uppercase tracking-wider sticky top-0 bg-bg-surface/40 py-2">Environmental Data</h2>
                <div className="space-y-3">
                  <DataCard label="Air Quality Index" value={dataPoints.airQuality.value} unit="%" icon="🌬️" explanation={dataPoints.airQuality.explanation} />
                  <DataCard label="PM2.5 Level" value={dataPoints.airPollutionPM25.value} unit={dataPoints.airPollutionPM25.unit} icon="💨" explanation={dataPoints.airPollutionPM25.explanation} />
                  <DataCard label="Soil Fertility" value={dataPoints.soilFertility.value} unit="%" icon="🌱" explanation={dataPoints.soilFertility.explanation} />
                  <DataCard label="Water Availability" value={dataPoints.waterAvailability.value} unit="%" icon="💧" explanation={dataPoints.waterAvailability.explanation} />
                  <DataCard label="Population Density" value={dataPoints.populationDensity.value} unit={dataPoints.populationDensity.unit} icon="👥" explanation={dataPoints.populationDensity.explanation} />
                </div>
              </div>
            </div>

          {/* Center - Satellite Map (Main Focus) */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
              style={{ backgroundColor: '#e8f0ed' }}
            />
          </div>

          {/* Right Sidebar - Infrastructure & Analysis */}
          <div className="w-80 border-l border-border-default bg-bg-surface/40 p-5 space-y-4 flex-shrink-0">
            {/* Suitability Score Card */}
            <div className="bg-accent-teal/5 border border-accent-teal/20 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(13, 148, 136, 0.2)" strokeWidth="5" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${(suitabilityScore / 100) * 285} 285`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-accent-teal">{suitabilityScore}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Suitability</h3>
                  <p className="text-xs text-text-muted">Moderate to good potential for residential development</p>
                </div>
              </div>

              <div className="border-t border-accent-teal/10 pt-3 space-y-2">
                <h4 className="text-xs font-semibold text-text-primary">Key Factors</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 flex-shrink-0">✓</span>
                    <span className="text-text-muted"><span className="text-text-primary font-semibold block">Infrastructure</span>Roads, electricity, sewage available</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 flex-shrink-0">✓</span>
                    <span className="text-text-muted"><span className="text-text-primary font-semibold block">Soil Quality</span>Fertile, good for landscaping</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 flex-shrink-0">⚠</span>
                    <span className="text-text-muted"><span className="text-text-primary font-semibold block">Flood Risk</span>Plan drainage & elevation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500 flex-shrink-0">⚠</span>
                    <span className="text-text-muted"><span className="text-text-primary font-semibold block">Population</span>High density area</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Infrastructure Data */}
            <div>
              <h2 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider sticky top-0 bg-bg-surface/40 py-2">Infrastructure</h2>
              <div className="space-y-3">
                <DataCard label="Road Access" value={dataPoints.roadAccessibility.value} unit="%" icon="🛣️" explanation={dataPoints.roadAccessibility.explanation} />
                <DataCard label="Electricity" value={dataPoints.electricityAccess.value} unit="%" icon="⚡" explanation={dataPoints.electricityAccess.explanation} />
                <DataCard label="Infra Maturity" value={dataPoints.infrastructureMatureity.value} unit="%" icon="🏗️" explanation={dataPoints.infrastructureMatureity.explanation} />
                <DataCard label="Security" value={dataPoints.securityRating.value} unit="%" icon="🛡️" explanation={dataPoints.securityRating.explanation} />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider sticky top-0 bg-bg-surface/40 py-2">Amenities</h3>
              <div className="space-y-2">
                <div className="bg-bg-surface/80 border border-border-default rounded-lg p-2.5">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Market</div>
                  <div className="font-semibold text-text-primary text-xs">{dataPoints.nearestMarket.name}</div>
                  <div className="text-xs text-accent-teal">{dataPoints.nearestMarket.distance} km</div>
                </div>
                <div className="bg-bg-surface/80 border border-border-default rounded-lg p-2.5">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-0.5">Health</div>
                  <div className="font-semibold text-text-primary text-xs">{dataPoints.nearestHealthCenter.name}</div>
                  <div className="text-xs text-accent-teal">{dataPoints.nearestHealthCenter.distance} km</div>
                </div>
                <div className="bg-bg-surface/80 border border-border-default rounded-lg p-2.5">
                  <div className="text-xs text-text-muted uppercase tracking-wider mb-0.5">School</div>
                  <div className="font-semibold text-text-primary text-xs">{dataPoints.nearestSchool.name}</div>
                  <div className="text-xs text-accent-teal">{dataPoints.nearestSchool.distance} km</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
