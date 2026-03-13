export function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTimestamp(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(dateString)
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export function formatCoordinate(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

export function getRiskColor(level) {
  switch (level?.toUpperCase()) {
    case 'HIGH': return '#EF4444'
    case 'MEDIUM': return '#FBBF24'
    case 'LOW': return '#10B981'
    default: return '#94A3B8'
  }
}

export function getRiskBadgeClass(level) {
  switch (level?.toUpperCase()) {
    case 'HIGH': return 'badge-high'
    case 'MEDIUM': return 'badge-medium'
    case 'LOW': return 'badge-low'
    default: return ''
  }
}
