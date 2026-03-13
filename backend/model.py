"""
Land Suitability Model for Residential Development
Calculates suitability percentage based on multiple environmental and infrastructure factors.
"""

def calculate_suitability_score(site_data):
    """
    Calculate residential suitability percentage for a given site.
    
    Args:
        site_data: Dict containing site assessment data
            - distance_from_river_m: Distance from river in meters
            - inside_buffer: Boolean indicating if inside riparian buffer
            - flood_zone: Flood zone classification
            - land_classification: Land use classification
            - slope: Terrain slope in degrees
            - soil_type: Type of soil
            - infrastructure_access: Dict with road, sewer, water access
            - proximity_to_amenities: Dict with distances to amenities
    
    Returns:
        Dict with detailed suitability assessment
    """
    
    score = 0
    factors = {}
    
    # 1. River Buffer Distance (Max: 25 points)
    river_score = calculate_river_suitability(
        site_data.get('distance_from_river_m', 0),
        site_data.get('inside_buffer', False)
    )
    score += river_score
    factors['river_buffer'] = river_score
    
    # 2. Flood Risk Assessment (Max: 20 points)
    flood_score = calculate_flood_risk_score(site_data.get('flood_zone', 'UNKNOWN'))
    score += flood_score
    factors['flood_risk'] = flood_score
    
    # 3. Land Classification (Max: 15 points)
    land_score = calculate_land_classification_score(site_data.get('land_classification', 'UNKNOWN'))
    score += land_score
    factors['land_classification'] = land_score
    
    # 4. Terrain & Soil Suitability (Max: 20 points)
    terrain_score = calculate_terrain_suitability(
        site_data.get('slope', 0),
        site_data.get('soil_type', 'UNKNOWN')
    )
    score += terrain_score
    factors['terrain_soil'] = terrain_score
    
    # 5. Infrastructure Access (Max: 15 points)
    infrastructure_score = calculate_infrastructure_score(
        site_data.get('infrastructure_access', {})
    )
    score += infrastructure_score
    factors['infrastructure'] = infrastructure_score
    
    # 6. Amenities Proximity (Max: 5 points)
    amenities_score = calculate_amenities_score(
        site_data.get('proximity_to_amenities', {})
    )
    score += amenities_score
    factors['amenities'] = amenities_score
    
    return {
        'overall_suitability': min(100, max(0, score)),
        'factors': factors,
        'recommendation': generate_recommendation(min(100, max(0, score))),
        'key_concerns': identify_concerns(site_data, factors)
    }


def calculate_river_suitability(distance_m, inside_buffer):
    """
    Evaluate suitability based on river proximity and buffer regulations.
    Safe distance is typically > 60m from river.
    """
    if inside_buffer:
        return 0  # Not suitable - inside protected corridor
    
    if distance_m < 30:
        return 5   # Very risky
    elif distance_m < 60:
        return 10  # Risky - below typical planning buffer
    elif distance_m < 100:
        return 18  # Acceptable but requires caution
    else:
        return 25  # Excellent


def calculate_flood_risk_score(flood_zone):
    """
    Evaluate flood risk based on flood zone classification.
    """
    zone_scores = {
        'LOW': 20,
        'MODERATE': 12,
        'HIGH': 5,
        'VERY_HIGH': 0,
        'UNKNOWN': 10
    }
    return zone_scores.get(flood_zone.upper(), 10)


def calculate_land_classification_score(land_class):
    """
    Evaluate suitability based on land classification.
    Residential zones score highest.
    """
    class_scores = {
        'RESIDENTIAL': 15,
        'MIXED_USE': 12,
        'AGRICULTURAL': 8,
        'COMMERCIAL': 10,
        'INDUSTRIAL': 3,
        'PROTECTED': 0,
        'UNKNOWN': 7
    }
    return class_scores.get(land_class.upper(), 7)


def calculate_terrain_suitability(slope, soil_type):
    """
    Evaluate terrain and soil suitability for building foundations.
    Low slopes (< 15%) and stable soils are preferred.
    """
    score = 0
    
    # Slope evaluation (0-12 points)
    if slope < 10:
        score += 12
    elif slope < 15:
        score += 10
    elif slope < 25:
        score += 6
    else:
        score += 2
    
    # Soil type evaluation (0-8 points)
    soil_scores = {
        'SANDY': 7,
        'CLAY': 4,
        'BLACK_COTTON': 2,  # Expansive soil - problematic
        'LOAM': 8,
        'ROCK': 6,
        'UNKNOWN': 4
    }
    score += soil_scores.get(soil_type.upper(), 4)
    
    return score


def calculate_infrastructure_score(infrastructure_access):
    """
    Evaluate availability of essential infrastructure.
    Road access, water supply, and sewage systems are critical.
    """
    score = 0
    
    criteria = {
        'road_access': 6,
        'water_supply': 5,
        'sewage_system': 4
    }
    
    for criterion, max_points in criteria.items():
        if infrastructure_access.get(criterion, False):
            score += max_points
    
    return score


def calculate_amenities_score(proximity_to_amenities):
    """
    Bonus points for proximity to important amenities.
    Health centers, schools, markets improve livability.
    """
    score = 0
    
    # Distance thresholds in kilometers
    if proximity_to_amenities.get('health_center_km', float('inf')) < 2:
        score += 2
    if proximity_to_amenities.get('school_km', float('inf')) < 1.5:
        score += 2
    if proximity_to_amenities.get('market_km', float('inf')) < 1:
        score += 1
    
    return min(5, score)


def identify_concerns(site_data, factors):
    """
    Identify and list key concerns that limit suitability.
    """
    concerns = []
    
    if site_data.get('inside_buffer', False):
        concerns.append('Located inside protected riparian corridor - requires special permits')
    
    if site_data.get('flood_zone') == 'HIGH' or site_data.get('flood_zone') == 'VERY_HIGH':
        concerns.append('High flood risk - significant drainage/mitigation needed')
    
    if site_data.get('soil_type', '').upper() == 'BLACK_COTTON':
        concerns.append('Black cotton soil - expensive piling foundation required')
    
    if factors.get('infrastructure', 0) < 8:
        concerns.append('Limited infrastructure access - roads/utilities need development')
    
    if site_data.get('distance_from_river_m', 0) < 60:
        concerns.append('Close to river - requires environmental impact assessment')
    
    return concerns


def generate_recommendation(suitability_score):
    """
    Generate text recommendation based on overall suitability score.
    """
    if suitability_score >= 80:
        return 'Highly suitable for residential development with standard approvals'
    elif suitability_score >= 65:
        return 'Moderately suitable - minor site preparation and mitigation measures required'
    elif suitability_score >= 50:
        return 'Marginally suitable - significant environmental or infrastructure challenges present'
    elif suitability_score >= 30:
        return 'Low suitability - major constraints requiring substantial investment'
    else:
        return 'Not recommended for residential development - critical issues present'


# Example usage
if __name__ == '__main__':
    sample_site = {
        'distance_from_river_m': 150,
        'inside_buffer': False,
        'flood_zone': 'LOW',
        'land_classification': 'RESIDENTIAL',
        'slope': 8,
        'soil_type': 'LOAM',
        'infrastructure_access': {
            'road_access': True,
            'water_supply': True,
            'sewage_system': True
        },
        'proximity_to_amenities': {
            'health_center_km': 1.2,
            'school_km': 0.8,
            'market_km': 0.5
        }
    }
    
    result = calculate_suitability_score(sample_site)
    print(f"Suitability Score: {result['overall_suitability']}%")
    print(f"Recommendation: {result['recommendation']}")
    print(f"Key Concerns: {result['key_concerns']}")
