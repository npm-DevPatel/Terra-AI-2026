export default function GlassPanel({ children, className = '', dark = false }) {
  return (
    <div className={`${dark ? 'glass-panel-dark' : 'glass-panel'} ${className}`}>
      {children}
    </div>
  )
}
