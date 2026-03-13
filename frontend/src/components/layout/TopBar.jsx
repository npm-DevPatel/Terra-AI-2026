import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Monitoring Dashboard',
  '/site-risk': 'Site Suitability Analyzer',
  '/encroachment': 'Encroachment Intelligence',
  '/insights': 'Data Insights',
}

export default function TopBar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Terra AI'

  return (
    <header className="fixed top-0 left-[72px] right-0 h-14 bg-white border-b border-border-default shadow-sm flex items-center justify-between px-6 z-40">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold text-text-primary">{title}</h1>
        <div className="w-16 hidden sm:block h-px bg-border-strong opacity-30" />
      </div>

      {/* Center: Location */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <svg className="w-4 h-4 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="font-mono text-xs">Nairobi, Kenya</span>
        <span className="text-border-default mx-2">|</span>
        <span className="font-mono text-xs text-text-muted">1.2921°S, 36.8219°E</span>
      </div>

      {/* Right: Empty for clean layout */}
      <div className="flex items-center gap-4" />
    </header>
  )
}
