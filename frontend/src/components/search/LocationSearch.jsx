import { useState, useRef, useEffect } from 'react'
import searchIcon from '../../assets/search.png'
import locationIcon from '../../assets/location.png'

export default function LocationSearch({ onLocationSelect, mapRef }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Handle input change with debouncing
  const handleInputChange = async (e) => {
    const value = e.target.value
    setQuery(value)

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    setShowSuggestions(true)

    // Debounce API calls
    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Use Nominatim (OpenStreetMap) for geocoding - no API key required, no deprecation issues
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=ke&limit=6`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) throw new Error('Geocoding request failed')

        const results = await response.json()
        setSuggestions(results || [])
      } catch (error) {
        console.error('Geocoding error:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    const placeName = suggestion.display_name || suggestion.name
    setQuery(placeName)
    setSuggestions([])
    setShowSuggestions(false)

    const lat = parseFloat(suggestion.lat)
    const lng = parseFloat(suggestion.lon)

    onLocationSelect({
      lat,
      lng,
      name: placeName,
      icon: locationIcon,
    })
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="absolute top-4 left-4 z-20 w-80">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-bg-surface border border-border-default rounded-xl px-4 py-2.5 shadow-lg hover:border-accent-teal transition-colors duration-200">
          <img src={searchIcon} alt="Search" className="w-5 h-5 text-text-secondary opacity-60" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            placeholder="Search locations in Kenya..."
            className="ml-3 bg-transparent outline-none text-sm text-text-primary placeholder-text-muted flex-1 font-medium"
          />
          {loading && (
            <div className="ml-2 w-4 h-4 border-2 border-accent-teal border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full mt-2 w-full bg-bg-surface border border-border-default rounded-xl shadow-xl overflow-hidden z-30 animate-fade-in"
          >
            <div className="max-h-72 overflow-y-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-bg-sunken transition-colors duration-150 border-b border-border-subtle last:border-b-0 flex items-start gap-3"
                >
                  <img src={locationIcon} alt="Location" className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {suggestion.name || suggestion.display_name?.split(',')[0]}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {suggestion.display_name?.split(',').slice(1, 3).join(',')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {showSuggestions && !loading && suggestions.length === 0 && query.length >= 2 && (
          <div className="absolute top-full mt-2 w-full bg-bg-surface border border-border-default rounded-xl shadow-xl p-4 text-center">
            <p className="text-sm text-text-muted">No locations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
