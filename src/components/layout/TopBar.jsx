import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Monitoring Dashboard',
  '/site-risk': 'Site Risk Analyzer',
  '/encroachment': 'Encroachment Intelligence',
  '/insights': 'Data Insights',
}

export default function TopBar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Terra AI'

  return (
    <header className="h-14 bg-terra-primary/80 backdrop-blur-md border-b border-terra-border/20 flex items-center justify-between px-6 z-40">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-semibold text-slate-200">{title}</h1>
        <div className="hud-line w-16 hidden sm:block" />
      </div>

      {/* Center: Location */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <span className="font-mono text-xs">Nairobi, Kenya</span>
        <span className="text-terra-border mx-2">|</span>
        <span className="font-mono text-xs text-slate-500">1.2921°S, 36.8219°E</span>
      </div>

      {/* Right: System Status */}
      <div className="flex items-center gap-4">
        {/* Scan Status */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-mono">Last scan: 2h ago</span>
        </div>

        {/* System Online */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-status-safe" />
            <div className="w-2 h-2 rounded-full bg-status-safe absolute inset-0 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-medium text-status-safe">System Online</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-terra-elevated/50 transition-colors" id="notifications-btn">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-threat-red rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            7
          </span>
        </button>
      </div>
    </header>
  )
}
