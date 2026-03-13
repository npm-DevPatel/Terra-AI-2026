import { getRiskBadgeClass } from '../../utils/formatters'

export default function StatusBadge({ level, className = '' }) {
  const badgeClass = getRiskBadgeClass(level)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeClass} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {level}
    </span>
  )
}
