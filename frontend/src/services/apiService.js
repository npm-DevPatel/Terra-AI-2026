/**
 * Terra AI — API Service
 * Centralized client for all backend API calls with error handling and fallbacks.
 */

const API_BASE = '/api'

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.warn(`[Terra AI] API call failed for ${endpoint}:`, error.message)
    throw error
  }
}

/**
 * Health check
 */
export async function checkHealth() {
  return apiFetch('/health')
}

/**
 * Get river GeoJSON data
 */
export async function fetchRivers() {
  return apiFetch('/rivers')
}

/**
 * Get encroachment GeoJSON data
 */
export async function fetchEncroachments() {
  return apiFetch('/encroachments')
}

/**
 * Get alert feed
 */
export async function fetchAlerts() {
  return apiFetch('/alerts')
}

/**
 * Get dashboard metrics
 */
export async function fetchMetrics() {
  return apiFetch('/metrics')
}

/**
 * Assess site risk for a given location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<object>} Site risk assessment
 */
export async function assessSiteRisk(lat, lng) {
  return apiFetch('/site-risk', {
    method: 'POST',
    body: JSON.stringify({ lat, lng }),
  })
}

/**
 * Send a chat message to the AI
 * @param {string} message - User message
 * @param {number|null} lat - Optional latitude context
 * @param {number|null} lng - Optional longitude context
 * @returns {Promise<object>} AI response
 */
export async function sendChatMessage(message, lat = null, lng = null) {
  return apiFetch('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, lat, lng }),
  })
}

/**
 * Geocode a place name
 * @param {string} query - Search query
 * @returns {Promise<Array>} Geocoding results
 */
export async function geocodePlace(query) {
  return apiFetch(`/geocode?q=${encodeURIComponent(query)}`)
}

/**
 * Check if the backend is reachable
 */
export async function isBackendAvailable() {
  try {
    const result = await checkHealth()
    return result?.status === 'online'
  } catch {
    return false
  }
}
