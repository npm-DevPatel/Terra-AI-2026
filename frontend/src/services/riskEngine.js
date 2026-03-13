/**
 * Risk Engine
 * Computes composite risk scores and generates risk zone GeoJSON
 * by combining flood data, river proximity, and encroachment density.
 */

/**
 * Compute a risk score for a given point based on multiple factors.
 * Returns a score from 0 (no risk) to 100 (critical risk).
 */
export function computeRiskScore({ distanceFromRiver, floodRiskLevel, encroachmentCount, insideBuffer }) {
  let score = 0

  // Proximity factor (0-40 points)
  if (distanceFromRiver <= 5) score += 40
  else if (distanceFromRiver <= 10) score += 35
  else if (distanceFromRiver <= 15) score += 28
  else if (distanceFromRiver <= 20) score += 20
  else if (distanceFromRiver <= 30) score += 12
  else if (distanceFromRiver <= 50) score += 5

  // Flood risk factor (0-30 points)
  const floodScores = { 'CRITICAL': 30, 'HIGH': 24, 'MEDIUM': 16, 'ELEVATED': 8, 'LOW': 2 }
  score += floodScores[floodRiskLevel] || 2

  // Buffer violation (0-20 points)
  if (insideBuffer) score += 20

  // Encroachment density (0-10 points)
  if (encroachmentCount > 5) score += 10
  else if (encroachmentCount > 3) score += 7
  else if (encroachmentCount > 1) score += 4
  else if (encroachmentCount > 0) score += 2

  return Math.min(100, score)
}

/**
 * Classify a risk score into a level
 */
export function classifyRisk(score) {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 40) return 'MEDIUM'
  if (score >= 20) return 'ELEVATED'
  return 'LOW'
}

/**
 * Generate risk zone GeoJSON from encroachments and river data.
 * Creates a composite risk heatmap.
 */
export function generateRiskZones(encroachmentData, riversData, floodData) {
  const riskFeatures = []

  if (!encroachmentData?.features) return { type: 'FeatureCollection', features: [] }

  for (const enc of encroachmentData.features) {
    const props = enc.properties || {}

    // Find matching flood data for this encroachment's river
    const matchingFlood = floodData?.find(f =>
      (props.river_name || '').toLowerCase().includes(f.river.toLowerCase().split(' ')[0])
    )

    const riskScore = computeRiskScore({
      distanceFromRiver: props.distance_from_river_m || 30,
      floodRiskLevel: matchingFlood?.riskLevel || 'MEDIUM',
      encroachmentCount: 1,
      insideBuffer: (props.distance_from_river_m || 30) <= 30,
    })

    const riskLevel = classifyRisk(riskScore)

    // Create an expanded risk zone around the encroachment
    const coords = enc.geometry?.coordinates?.[0]
    if (!coords || coords.length < 3) continue

    // Calculate centroid
    const centroid = coords.reduce(
      (acc, c) => [acc[0] + c[0] / coords.length, acc[1] + c[1] / coords.length],
      [0, 0]
    )

    // Create expanding risk ring
    const riskRadius = riskLevel === 'CRITICAL' ? 0.0008
      : riskLevel === 'HIGH' ? 0.0006
      : riskLevel === 'MEDIUM' ? 0.0004
      : 0.0003

    const riskPolygon = createCirclePolygon(centroid, riskRadius, 16)

    const riskColors = {
      'CRITICAL': '#DC2626',
      'HIGH': '#EF4444',
      'MEDIUM': '#F97316',
      'ELEVATED': '#FBBF24',
      'LOW': '#22D3EE',
    }

    riskFeatures.push({
      type: 'Feature',
      properties: {
        id: props.id,
        risk_score: riskScore,
        risk_level: riskLevel,
        color: riskColors[riskLevel],
        river_name: props.river_name,
        distance_m: props.distance_from_river_m,
        description: `${riskLevel} RISK — Score: ${riskScore}/100. ${props.description || ''}`,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [riskPolygon],
      },
    })
  }

  return { type: 'FeatureCollection', features: riskFeatures }
}

/**
 * Create a circle polygon approximation
 */
function createCirclePolygon(center, radius, numPoints) {
  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    points.push([
      center[0] + radius * Math.cos(angle),
      center[1] + radius * Math.sin(angle) * 0.9, // slightly flatten for lat
    ])
  }
  return points
}

/**
 * Get overall risk summary metrics
 */
export function getRiskSummary(riskZones) {
  if (!riskZones?.features) return { critical: 0, high: 0, medium: 0, low: 0, avgScore: 0 }

  const levels = riskZones.features.map(f => f.properties.risk_level)
  const scores = riskZones.features.map(f => f.properties.risk_score)

  return {
    critical: levels.filter(l => l === 'CRITICAL').length,
    high: levels.filter(l => l === 'HIGH').length,
    medium: levels.filter(l => l === 'MEDIUM').length,
    low: levels.filter(l => ['LOW', 'ELEVATED'].includes(l)).length,
    avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
  }
}
