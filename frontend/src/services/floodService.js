/**
 * Flood Data Service
 * Fetches real-time river discharge data from Open-Meteo GloFAS API
 * and generates flood risk zone GeoJSON.
 * Free, no API key required.
 */

const GLOFAS_API = 'https://flood-api.open-meteo.com/v1/flood'

// Key river monitoring points around Nairobi (lat, lng)
const RIVER_MONITOR_POINTS = [
  { name: 'Mathare River - Upper', lat: -1.2545, lng: 36.8680, river: 'Mathare River' },
  { name: 'Mathare River - Mid', lat: -1.2620, lng: 36.8520, river: 'Mathare River' },
  { name: 'Mathare River - Lower', lat: -1.2680, lng: 36.8340, river: 'Mathare River' },
  { name: 'Nairobi River - Upper', lat: -1.2750, lng: 36.8900, river: 'Nairobi River' },
  { name: 'Nairobi River - Mid', lat: -1.2870, lng: 36.8600, river: 'Nairobi River' },
  { name: 'Nairobi River - Lower', lat: -1.2945, lng: 36.8350, river: 'Nairobi River' },
  { name: 'Ngong River - Upper', lat: -1.2850, lng: 36.7950, river: 'Ngong River' },
  { name: 'Ngong River - Mid', lat: -1.2920, lng: 36.8130, river: 'Ngong River' },
  { name: 'Ngong River - Lower', lat: -1.2990, lng: 36.8290, river: 'Ngong River' },
]

/**
 * Fetch river discharge data for all monitoring points
 */
export async function fetchFloodData() {
  const results = []

  for (const point of RIVER_MONITOR_POINTS) {
    try {
      const url = `${GLOFAS_API}?latitude=${point.lat}&longitude=${point.lng}&daily=river_discharge,river_discharge_mean,river_discharge_max&past_days=30&forecast_days=7`
      const response = await fetch(url)

      if (!response.ok) continue

      const data = await response.json()

      if (data.daily) {
        const discharges = data.daily.river_discharge || []
        const maxDischarges = data.daily.river_discharge_max || []
        const meanDischarges = data.daily.river_discharge_mean || []
        const dates = data.daily.time || []

        // Get latest values
        const latestDischarge = discharges[discharges.length - 1] || 0
        const latestMax = maxDischarges[maxDischarges.length - 1] || 0
        const latestMean = meanDischarges[meanDischarges.length - 1] || 0

        // Calculate flood risk level based on discharge vs mean
        const riskRatio = latestMax > 0 ? latestDischarge / latestMean : 1
        let riskLevel = 'LOW'
        let floodDepthCategory = '0'

        if (riskRatio > 3) {
          riskLevel = 'CRITICAL'
          floodDepthCategory = '15-20'
        } else if (riskRatio > 2) {
          riskLevel = 'HIGH'
          floodDepthCategory = '10-15'
        } else if (riskRatio > 1.5) {
          riskLevel = 'MEDIUM'
          floodDepthCategory = '5-10'
        } else if (riskRatio > 1) {
          riskLevel = 'ELEVATED'
          floodDepthCategory = '5 or less'
        }

        results.push({
          ...point,
          latestDischarge,
          latestMax,
          latestMean,
          riskRatio: Math.round(riskRatio * 100) / 100,
          riskLevel,
          floodDepthCategory,
          dates,
          dischargeHistory: discharges,
          maxHistory: maxDischarges,
        })
      }
    } catch (error) {
      console.warn(`[Terra AI] Failed to fetch flood data for ${point.name}:`, error)
    }
  }

  return results
}

/**
 * Generate flood risk zone GeoJSON from river geometries and discharge data.
 * Creates buffer polygons around rivers colored by flood risk level.
 */
export function generateFloodZones(riversGeoJSON, floodData) {
  const floodFeatures = []

  if (!riversGeoJSON || !riversGeoJSON.features) return { type: 'FeatureCollection', features: [] }

  // Risk level → buffer widths in approximate degrees at Nairobi's latitude
  const RISK_BUFFERS = {
    'CRITICAL': { offset: 0.0009, color: '#DC2626', depth: '15-20 ft', opacity: 0.35 },   // ~100m
    'HIGH':     { offset: 0.00065, color: '#0000CD', depth: '10-15 ft', opacity: 0.30 },   // ~72m
    'MEDIUM':   { offset: 0.00045, color: '#1E40AF', depth: '5-10 ft', opacity: 0.25 },    // ~50m
    'ELEVATED': { offset: 0.00035, color: '#06B6D4', depth: '5 ft or less', opacity: 0.20 }, // ~39m
    'LOW':      { offset: 0.00027, color: '#22D3EE', depth: 'Minimal', opacity: 0.12 },    // ~30m
  }

  for (const river of riversGeoJSON.features) {
    const riverName = river.properties?.name || ''

    // Find matching flood data for this river
    const matchingFlood = floodData.find(f =>
      riverName.toLowerCase().includes(f.river.toLowerCase().split(' ')[0])
    )

    // Default to ELEVATED if no data (rivers always have some risk)
    const riskLevel = matchingFlood?.riskLevel || 'ELEVATED'
    const bufferConfig = RISK_BUFFERS[riskLevel] || RISK_BUFFERS['ELEVATED']

    // Generate buffer polygon around the river
    const coords = river.geometry.type === 'LineString'
      ? river.geometry.coordinates
      : river.geometry.type === 'MultiLineString'
        ? river.geometry.coordinates.flat()
        : []

    if (coords.length < 2) continue

    const offset = bufferConfig.offset

    // Create multiple risk zone rings (innermost = highest risk)
    const zones = [
      { factor: 1.0, level: riskLevel, ...bufferConfig },
      { factor: 1.8, level: 'BACKGROUND', color: bufferConfig.color, depth: bufferConfig.depth, opacity: bufferConfig.opacity * 0.4 },
    ]

    for (const zone of zones) {
      const zoneOffset = offset * zone.factor
      const upper = coords.map(c => [c[0], c[1] - zoneOffset])
      const lower = [...coords].reverse().map(c => [c[0], c[1] + zoneOffset])

      floodFeatures.push({
        type: 'Feature',
        properties: {
          river_name: riverName,
          risk_level: zone.level,
          flood_depth: zone.depth,
          color: zone.color,
          opacity: zone.opacity,
          discharge: matchingFlood?.latestDischarge || 0,
          risk_ratio: matchingFlood?.riskRatio || 1,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[...upper, ...lower, upper[0]]],
        },
      })
    }
  }

  return { type: 'FeatureCollection', features: floodFeatures }
}

/**
 * Get summary flood metrics for the dashboard
 */
export function getFloodMetrics(floodData) {
  if (!floodData || floodData.length === 0) {
    return {
      highRiskPoints: 0,
      avgDischarge: 0,
      maxDischarge: 0,
      overallRisk: 'LOW',
    }
  }

  const highRisk = floodData.filter(f => ['HIGH', 'CRITICAL'].includes(f.riskLevel))
  const avgDischarge = floodData.reduce((sum, f) => sum + f.latestDischarge, 0) / floodData.length
  const maxDischarge = Math.max(...floodData.map(f => f.latestDischarge))

  let overallRisk = 'LOW'
  if (highRisk.length > 2) overallRisk = 'CRITICAL'
  else if (highRisk.length > 0) overallRisk = 'HIGH'
  else if (floodData.some(f => f.riskLevel === 'MEDIUM')) overallRisk = 'MEDIUM'

  return {
    highRiskPoints: highRisk.length,
    avgDischarge: Math.round(avgDischarge * 100) / 100,
    maxDischarge: Math.round(maxDischarge * 100) / 100,
    overallRisk,
  }
}
