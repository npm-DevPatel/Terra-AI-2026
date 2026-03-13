/**
 * Overpass API Service
 * Fetches real river/waterway data for Nairobi from OpenStreetMap.
 * Free, no API key required.
 */

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

const NAIROBI_RIVERS_QUERY = `
[out:json][timeout:30];
area["name"="Nairobi"]["admin_level"="4"]->.nairobi;
(
  way["waterway"="river"](area.nairobi);
  way["waterway"="stream"](area.nairobi);
  relation["waterway"="river"](area.nairobi);
);
out geom;
`

const CACHE_KEY = 'terra_ai_rivers_geojson'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Convert Overpass JSON response to GeoJSON FeatureCollection
 */
function overpassToGeoJSON(data) {
  const features = []

  for (const element of data.elements) {
    if (element.type === 'way' && element.geometry) {
      const coordinates = element.geometry.map(pt => [pt.lon, pt.lat])
      const name = element.tags?.name || 'Unnamed Waterway'
      const waterway = element.tags?.waterway || 'river'

      features.push({
        type: 'Feature',
        properties: {
          id: `osm-${element.id}`,
          name,
          osm_id: element.id,
          waterway_type: waterway,
          risk_level: getRiskLevel(name),
          monitored_since: '2020-01-01',
          encroachment_count: 0,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      })
    } else if (element.type === 'relation' && element.members) {
      // Combine relation members into a single MultiLineString
      const lineStrings = []
      for (const member of element.members) {
        if (member.type === 'way' && member.geometry) {
          lineStrings.push(member.geometry.map(pt => [pt.lon, pt.lat]))
        }
      }
      if (lineStrings.length > 0) {
        const name = element.tags?.name || 'Unnamed Waterway'
        features.push({
          type: 'Feature',
          properties: {
            id: `osm-rel-${element.id}`,
            name,
            osm_id: element.id,
            waterway_type: element.tags?.waterway || 'river',
            risk_level: getRiskLevel(name),
            monitored_since: '2020-01-01',
            encroachment_count: 0,
          },
          geometry: {
            type: 'MultiLineString',
            coordinates: lineStrings,
          },
        })
      }
    }
  }

  return { type: 'FeatureCollection', features }
}

/**
 * Assign risk levels based on known Nairobi rivers
 */
function getRiskLevel(name) {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('mathare')) return 'HIGH'
  if (lowerName.includes('nairobi')) return 'HIGH'
  if (lowerName.includes('ngong')) return 'MEDIUM'
  if (lowerName.includes('kirichwa')) return 'LOW'
  if (lowerName.includes('getathuru')) return 'MEDIUM'
  return 'MEDIUM'
}

/**
 * Check localStorage cache
 */
function getCachedRivers() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

/**
 * Save to localStorage cache
 */
function cacheRivers(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch {
    // localStorage full or unavailable — ignore
  }
}

/**
 * Fetch real river data from Overpass API
 * Falls back to cached data if available, or returns null on failure.
 */
export async function fetchNairobiRivers() {
  // Try cache first
  const cached = getCachedRivers()
  if (cached) {
    console.log('[Terra AI] Using cached river data (%d features)', cached.features.length)
    return cached
  }

  try {
    console.log('[Terra AI] Fetching real river data from Overpass API...')
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(NAIROBI_RIVERS_QUERY)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`)
    }

    const json = await response.json()
    const geojson = overpassToGeoJSON(json)

    console.log('[Terra AI] Fetched %d river features from OSM', geojson.features.length)
    cacheRivers(geojson)
    return geojson
  } catch (error) {
    console.warn('[Terra AI] Overpass API fetch failed:', error)
    return null
  }
}
