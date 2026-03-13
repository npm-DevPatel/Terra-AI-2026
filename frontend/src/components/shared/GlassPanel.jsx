export default function GlassPanel({ children, className = '', dark = false }) {
  const bgClass = dark ? 'bg-bg-elevated/95' : 'bg-bg-surface/95'
  return (
    <div className={`${bgClass} backdrop-blur-md border border-border-default/80 rounded-2xl shadow-lg ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  )
}
