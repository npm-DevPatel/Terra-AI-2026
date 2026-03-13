import { useState } from 'react'
import Panel from '../shared/Panel'

const layers = [
  { id: 'rivers', label: 'River Network', color: '#0891B2', defaultOn: true, icon: '🌊' },
  { id: 'buffers', label: 'Riparian Buffer (30m)', color: '#16A34A', defaultOn: true, icon: '🟢' },
  { id: 'encroachments', label: 'Encroachments', color: '#DC2626', defaultOn: true, icon: '⚠️' },
  { id: 'floodZones', label: 'Flood Zones', color: '#0284C7', defaultOn: true, icon: '🌧' },
  { id: 'riskZones', label: 'Risk Heatmap', color: '#D97706', defaultOn: true, icon: '🔥' },
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
    <Panel className="absolute top-4 right-14 z-10 p-4 w-60 shadow-xl">
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="w-5 h-5 rounded-lg bg-accent-teal-light border border-accent-teal/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-text-primary uppercase tracking-widest">Layers</span>
      </div>
      
      <div className="space-y-1">
        {layers.map(layer => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-xl text-left transition-all duration-300 group ${
              visible[layer.id] 
                ? 'bg-bg-elevated/60 text-text-primary border border-accent-teal/10' 
                : 'text-text-secondary opacity-50 hover:opacity-80 hover:bg-bg-surface/40 border border-transparent'
            }`}
          >
            <div
              className="w-3.5 h-3.5 rounded-md flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm"
              style={{
                backgroundColor: visible[layer.id] ? layer.color : 'transparent',
                border: `2px solid ${layer.color}`,
              }}
            />
            <span className="text-sm leading-none">{layer.icon}</span>
            <span className={`text-[13px] leading-tight transition-all ${visible[layer.id] ? 'font-bold' : 'font-medium'}`}>
              {layer.label}
            </span>
            {visible[layer.id] && (
              <div className="ml-auto w-1 h-1 rounded-full bg-accent-teal" />
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border-default/60">
        <div className="text-[9px] font-bold text-text-muted uppercase tracking-[0.15em] mb-3 px-1">Flood Depth Distribution</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {[
            { color: '#0ea5e9', label: "≤ 5'" },
            { color: '#0284c7', label: "5' - 10'" },
            { color: '#0369a1', label: "10' - 15'" },
            { color: '#075985', label: "> 15'" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-5 h-2.5 rounded-[2px] shadow-sm transform hover:scale-110 transition-transform cursor-help" style={{ backgroundColor: item.color, opacity: 0.9 }} title={item.label} />
              <span className="text-[10px] text-text-secondary font-bold font-mono">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
