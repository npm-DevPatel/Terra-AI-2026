import { useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import MapContainer from '../components/map/MapContainer'
import AIChatPanel from '../components/risk/AIChatPanel'
import SiteRiskReportCard from '../components/risk/SiteRiskReportCard'
import { useSiteRisk } from '../hooks/useSiteRisk'

export default function SiteRiskAnalyzer() {
  const { result, loading, assessSite, clearResult } = useSiteRisk()
  const [markers, setMarkers] = useState([])

  const handleMapClick = useCallback(({ lat, lng }, map) => {
    // Remove existing markers
    markers.forEach(m => m.remove())

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

    setMarkers([marker])
    assessSite(lat, lng)
  }, [markers, assessSite])

  return (
    <div className="relative w-full h-full bg-bg-base">
      <MapContainer onMapClick={handleMapClick} interactive>
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
              <span className="text-sm text-text-secondary font-medium tracking-wide">Click anywhere on the map to assess site risk</span>
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  )
}
