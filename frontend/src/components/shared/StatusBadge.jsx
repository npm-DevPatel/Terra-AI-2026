export default function StatusBadge({ level, className = '' }) {
  const getBadgeClass = (lvl) => {
    switch (lvl?.toUpperCase()) {
      case 'HIGH':
      case 'DANGER':
      case 'CRITICAL':
        return 'bg-risk-high-bg text-risk-high border-risk-high/30 shadow-[0_2px_8px_-2px_rgba(220,38,38,0.2)]'
      case 'MEDIUM':
      case 'WARNING':
        return 'bg-risk-medium-bg text-risk-medium border-risk-medium/30 shadow-[0_2px_8px_-2px_rgba(217,119,6,0.2)]'
      case 'LOW':
      case 'ONLINE':
      case 'SAFE':
        return 'bg-accent-green-light text-accent-green border-accent-green/30 shadow-[0_2px_8px_-2px_rgba(22,163,74,0.15)]'
      default:
        return 'bg-bg-elevated text-text-muted border-border-default shadow-sm'
    }
  }

  const badgeClass = getBadgeClass(level)

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all hover:scale-105 select-none ${badgeClass} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_4px_currentColor]" />
      {level}
    </span>
  )
}
