import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  {
    path: '/site-risk',
    label: 'Site Risk',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    path: '/insights',
    label: 'Insights',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] hover:w-[220px] transition-all duration-300 ease-in-out bg-white border-r border-border-default flex flex-col group overflow-hidden z-50">
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-border-default/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-accent-teal-light border border-accent-teal/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-accent-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 2L2 19h20L12 2z" strokeLinejoin="round" />
              <line x1="8" y1="14" x2="16" y2="14" strokeLinecap="round" />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <span className="text-sm font-bold text-accent-teal tracking-wider">TERRA</span>
            <span className="text-sm font-light text-text-secondary ml-1">AI</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-accent-teal-light text-accent-teal border-l-[3px] border-accent-teal rounded-r-lg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-accent-teal' : 'text-text-ghost'}`}>{item.icon}</span>
                  <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
