import { useState, useCallback } from 'react'
import siteRiskData from '../data/siteRiskResponses.json'

export function useSiteRisk() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const assessSite = useCallback((lat, lng) => {
    setLoading(true)

    // Simulate API delay
    setTimeout(() => {
      // Find nearest preset based on distance
      const presets = Object.values(siteRiskData.presets)
      let closest = null
      let minDist = Infinity

      presets.forEach(preset => {
        const d = Math.sqrt(
          Math.pow(lat - preset.site.lat, 2) +
          Math.pow(lng - preset.site.lng, 2)
        )
        if (d < minDist) {
          minDist = d
          closest = preset
        }
      })

      // If the click is within ~0.01 degrees of a preset, use it
      if (minDist < 0.015 && closest) {
        setResult({ ...closest, site: { lat, lng } })
      } else {
        // Generate a dynamic response based on proximity
        const distance = Math.round(minDist * 111000) // rough meters
        const insideBuffer = distance < 30

        setResult({
          site: { lat, lng },
          risk_level: insideBuffer ? 'HIGH' : distance < 100 ? 'MEDIUM' : 'LOW',
          risk_score: insideBuffer ? 75 + Math.round(Math.random() * 20) : distance < 100 ? 40 + Math.round(Math.random() * 20) : Math.round(Math.random() * 25),
          distance_from_river_m: distance > 500 ? 340 + Math.round(Math.random() * 100) : distance,
          nearest_river: closest?.nearest_river || 'Nairobi River',
          inside_buffer: insideBuffer,
          buffer_width_m: 30,
          flood_zone: insideBuffer ? 'Zone A — High Risk' : distance < 100 ? 'Zone B — Moderate Risk' : 'Zone C — Minimal Risk',
          land_classification: insideBuffer ? 'Riparian Reserve' : 'General Zone',
          legal_reference: 'Kenya Water Act (2016), Section 25',
          recommendation: insideBuffer
            ? 'Do not build. Legal violations apply under Water Act (2016).'
            : distance < 100
              ? 'Proceed with caution. Consult county planning office.'
              : 'Site is clear for construction subject to standard planning approvals.',
          ai_narrative: insideBuffer
            ? `This location is approximately ${distance}m from the nearest river centreline, within the legally protected 30-metre riparian buffer. Building here violates the Kenya Water Act (2016) and poses significant flood risk.`
            : distance < 100
              ? `This site is ${distance}m from the nearest river, outside but near the 30-metre buffer. Moderate flood risk applies. Additional review recommended.`
              : `This location is ${distance}m from the nearest river. It is well outside any riparian buffer zone. Standard building regulations apply.`
        })
      }

      setLoading(false)
    }, 1500)
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
  }, [])

  return { result, loading, assessSite, clearResult }
}
