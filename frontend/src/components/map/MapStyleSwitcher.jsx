import { useState } from 'react'
import GlassPanel from '../shared/GlassPanel'

const MAP_STYLES = [
  {
    id: 'satellite',
    label: 'Satellite',
    icon: '🛰',
    description: 'High-res imagery',
  },
  {
    id: 'rivers',
    label: 'Rivers',
    icon: '🌊',
    description: 'River network focus',
  },
  {
    id: 'terrain',
    label: 'Terrain',
    icon: '⛰',
    description: 'Elevation & topo',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: '🌙',
    description: 'Dark intelligence',
  },
]

export default function MapStyleSwitcher({ activeStyle = 'satellite', onStyleChange }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute top-4 left-4 z-10">
      <GlassPanel className="p-2.5 shadow-xl border-border-default/80 max-w-[200px]">
        <div className="flex items-center gap-2.5 mb-2.5 px-1.5">
          <div className="w-4.5 h-4.5 text-accent-teal">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Base Map</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto w-5 h-5 flex items-center justify-center rounded-lg hover:bg-bg-elevated/80 text-text-muted hover:text-text-primary transition-all shadow-sm active:scale-90"
          >
            <svg className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <div className={`grid ${isExpanded ? 'grid-cols-2' : 'grid-cols-4'} gap-1.5`}>
          {MAP_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => onStyleChange?.(style.id)}
              className={`flex ${isExpanded ? 'flex-row items-center gap-3 px-3 py-2.5' : 'flex-col items-center gap-1.5 px-1 py-2'} rounded-xl transition-all duration-300 ring-1 ${
                activeStyle === style.id
                  ? 'bg-accent-teal text-white shadow-md ring-accent-teal border-transparent'
                  : 'bg-bg-base/40 ring-border-default/20 hover:bg-bg-elevated/80'
              }`}
            >
              <span className={`text-base leading-none ${activeStyle === style.id ? 'scale-110' : ''} transition-transform`}>{style.icon}</span>
              <div className={isExpanded ? 'text-left' : 'text-center'}>
                <div className={`text-[10px] font-bold leading-tight ${activeStyle === style.id ? 'text-white' : 'text-text-primary'}`}>
                  {style.label}
                </div>
                {isExpanded && (
                  <div className={`text-[9px] font-medium mt-0.5 leading-tight ${activeStyle === style.id ? 'text-teal-50' : 'text-text-muted'}`}>{style.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
