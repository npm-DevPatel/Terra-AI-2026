import { useState } from 'react'
import GlassPanel from '../shared/GlassPanel'

const layers = [
  { id: 'rivers', label: 'River Network', color: '#00E5FF', defaultOn: true, icon: '🌊' },
  { id: 'buffers', label: 'Riparian Buffer (30m)', color: '#14B8A6', defaultOn: true, icon: '🟢' },
  { id: 'encroachments', label: 'Encroachments', color: '#EF4444', defaultOn: true, icon: '⚠️' },
  { id: 'floodZones', label: 'Flood Zones', color: '#1E40AF', defaultOn: true, icon: '🌧' },
  { id: 'riskZones', label: 'Risk Heatmap', color: '#DC2626', defaultOn: true, icon: '🔥' },
]

export default function LayerControls({ onLayerToggle }) {
  const [visible, setVisible] = useState(
    layers.reduce((acc, l) => ({ ...acc, [l.id]: l.defaultOn }), {})
  )

  const toggleLayer = (layerId) => {
    const newVisibility = { ...visible, [layerId]: !visible[layerId] }
    setVisible(newVisibility)
    onLayerToggle?.(newVisibility)
  }

  return (
    <GlassPanel dark className="absolute top-4 right-14 z-10 p-3 w-56">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
        </svg>
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Layers</span>
      </div>
      <div className="space-y-1.5">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-left transition-all duration-200 ${
              visible[layer.id] ? 'bg-terra-elevated/50' : 'opacity-40'
            }`}
          >
            <div
              className="w-3 h-3 rounded-sm border flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: visible[layer.id] ? layer.color : 'transparent',
                borderColor: layer.color,
                boxShadow: visible[layer.id] ? `0 0 6px ${layer.color}40` : 'none',
              }}
            />
            <span className="text-[10px] text-slate-400">{layer.icon}</span>
            <span className={`text-xs transition-colors ${visible[layer.id] ? 'text-slate-300' : 'text-slate-600'}`}>
              {layer.label}
            </span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-terra-border/20">
        <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Flood Depth Legend</div>
        <div className="space-y-1">
          {[
            { color: '#22D3EE', label: "5' or Less" },
            { color: '#1E40AF', label: "5' - 10'" },
            { color: '#0000CD', label: "10' - 15'" },
            { color: '#DC2626', label: "15' - 20'" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.7 }} />
              <span className="text-[10px] text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}
