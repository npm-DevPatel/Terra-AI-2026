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
      <GlassPanel dark className="p-2">
        <div className="flex items-center gap-2 mb-2 px-1">
          <svg className="w-3.5 h-3.5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Map View</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <div className={`grid ${isExpanded ? 'grid-cols-2' : 'grid-cols-4'} gap-1.5`}>
          {MAP_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => onStyleChange?.(style.id)}
              className={`flex ${isExpanded ? 'flex-row items-center gap-2 px-3 py-2' : 'flex-col items-center gap-1 px-2 py-1.5'} rounded-lg transition-all duration-200 ${
                activeStyle === style.id
                  ? 'bg-accent-cyan/15 border border-accent-cyan/30 shadow-[0_0_8px_rgba(0,229,255,0.15)]'
                  : 'bg-terra-elevated/30 border border-transparent hover:bg-terra-elevated/50'
              }`}
            >
              <span className="text-sm">{style.icon}</span>
              <div className={isExpanded ? 'text-left' : 'text-center'}>
                <div className={`text-[10px] font-medium ${activeStyle === style.id ? 'text-accent-cyan' : 'text-slate-400'}`}>
                  {style.label}
                </div>
                {isExpanded && (
                  <div className="text-[9px] text-slate-600">{style.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
