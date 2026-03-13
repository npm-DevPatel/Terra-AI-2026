/**
 * Land Suitability Model for Residential Development
 * JavaScript version of backend model.py
 */

export function calculateSuitabilityScore(siteData) {
  let score = 0
  const factors = {}

  // 1. River Buffer Distance (Max: 25 points)
  const riverScore = calculateRiverSuitability(
    siteData.distance_from_river_m || 0,
    siteData.inside_buffer || false
  )
  score += riverScore
  factors.river_buffer = riverScore

  // 2. Flood Risk Assessment (Max: 20 points)
  const floodScore = calculateFloodRiskScore(siteData.flood_zone || 'UNKNOWN')
  score += floodScore
  factors.flood_risk = floodScore

  // 3. Land Classification (Max: 15 points)
  const landScore = calculateLandClassificationScore(siteData.land_classification || 'UNKNOWN')
  score += landScore
  factors.land_classification = landScore

  // 4. Terrain & Soil Suitability (Max: 20 points)
  const terrainScore = calculateTerrainSuitability(
    siteData.slope || 0,
    siteData.soil_type || 'UNKNOWN'
  )
  score += terrainScore
  factors.terrain_soil = terrainScore

  // 5. Infrastructure Access (Max: 15 points)
  const infrastructureScore = calculateInfrastructureScore(
    siteData.infrastructure_access || {}
  )
  score += infrastructureScore
  factors.infrastructure = infrastructureScore

  // 6. Amenities Proximity (Max: 5 points)
  const amenitiesScore = calculateAmenitiesScore(
    siteData.proximity_to_amenities || {}
  )
  score += amenitiesScore
  factors.amenities = amenitiesScore

  const finalScore = Math.min(100, Math.max(0, score))

  return {
    overall_suitability: finalScore,
    factors,
    recommendation: generateRecommendation(finalScore),
    key_concerns: identifyConcerns(siteData, factors),
  }
}

function calculateRiverSuitability(distanceM, insideBuffer) {
  if (insideBuffer) {
    return 0
  }

  if (distanceM < 30) {
    return 5
  } else if (distanceM < 60) {
    return 10
  } else if (distanceM < 100) {
    return 18
  } else {
    return 25
  }
}

function calculateFloodRiskScore(floodZone) {
  const zoneScores = {
    LOW: 20,
    MODERATE: 12,
    HIGH: 5,
    VERY_HIGH: 0,
    UNKNOWN: 10,
  }
  return zoneScores[floodZone.toUpperCase()] || 10
}

function calculateLandClassificationScore(landClass) {
  const classScores = {
    RESIDENTIAL: 15,
    MIXED_USE: 12,
    AGRICULTURAL: 8,
    COMMERCIAL: 10,
    INDUSTRIAL: 3,
    PROTECTED: 0,
    UNKNOWN: 7,
  }
  return classScores[landClass.toUpperCase()] || 7
}

function calculateTerrainSuitability(slope, soilType) {
  let score = 0

  // Slope evaluation (0-12 points)
  if (slope < 10) {
    score += 12
  } else if (slope < 15) {
    score += 10
  } else if (slope < 25) {
    score += 6
  } else {
    score += 2
  }

  // Soil type evaluation (0-8 points)
  const soilScores = {
    SANDY: 7,
    CLAY: 4,
    BLACK_COTTON: 2,
    LOAM: 8,
    ROCK: 6,
    UNKNOWN: 4,
  }
  score += soilScores[soilType.toUpperCase()] || 4

  return score
}

function calculateInfrastructureScore(infrastructureAccess) {
  let score = 0

  const criteria = {
    road_access: 6,
    water_supply: 5,
    sewage_system: 4,
  }

  Object.entries(criteria).forEach(([criterion, maxPoints]) => {
    if (infrastructureAccess[criterion]) {
      score += maxPoints
    }
  })

  return score
}

function calculateAmenitiesScore(proximityToAmenities) {
  let score = 0

  if ((proximityToAmenities.health_center_km || Infinity) < 2) {
    score += 2
  }
  if ((proximityToAmenities.school_km || Infinity) < 1.5) {
    score += 2
  }
  if ((proximityToAmenities.market_km || Infinity) < 1) {
    score += 1
  }

  return Math.min(5, score)
}

function identifyConcerns(siteData, factors) {
  const concerns = []

  if (siteData.inside_buffer) {
    concerns.push('Located inside protected riparian corridor - requires special permits')
  }

  if (siteData.flood_zone === 'HIGH' || siteData.flood_zone === 'VERY_HIGH') {
    concerns.push('High flood risk - significant drainage/mitigation needed')
  }

  if ((siteData.soil_type || '').toUpperCase() === 'BLACK_COTTON') {
    concerns.push('Black cotton soil - expensive piling foundation required')
  }

  if (factors.infrastructure < 8) {
    concerns.push('Limited infrastructure access - roads/utilities need development')
  }

  if ((siteData.distance_from_river_m || 0) < 60) {
    concerns.push('Close to river - requires environmental impact assessment')
  }

  return concerns
}

function generateRecommendation(suitabilityScore) {
  if (suitabilityScore >= 80) {
    return 'Highly suitable for residential development with standard approvals'
  } else if (suitabilityScore >= 65) {
    return 'Moderately suitable - minor site preparation and mitigation measures required'
  } else if (suitabilityScore >= 50) {
    return 'Marginally suitable - significant environmental or infrastructure challenges present'
  } else if (suitabilityScore >= 30) {
    return 'Low suitability - major constraints requiring substantial investment'
  } else {
    return 'Not recommended for residential development - critical issues present'
  }
}
