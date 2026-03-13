export default function Panel({ children, className = '', elevated = false }) {
  const bgClass = elevated ? 'bg-bg-elevated' : 'bg-white'
  return (
    <div className={`${bgClass} border border-border-default rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  )
}
