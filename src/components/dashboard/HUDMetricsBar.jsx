import GlassPanel from '../shared/GlassPanel'
import CountUpNumber from '../shared/CountUpNumber'
import metrics from '../../data/metrics.json'

const items = [
  { label: 'Active Threats', value: metrics.active_encroachments, icon: '⚠️', color: 'text-threat-red' },
  { label: 'River km Monitored', value: metrics.river_km_monitored, suffix: 'km', decimals: 1, icon: '🛰', color: 'text-accent-cyan' },
  { label: 'High Risk Zones', value: metrics.high_risk_zones, icon: '🔴', color: 'text-threat-orange' },
  { label: 'Buffer Violations', value: metrics.buffer_violations, icon: '🚫', color: 'text-status-warn' },
]

export default function HUDMetricsBar() {
  return (
    <div className="absolute bottom-20 left-4 z-10 flex gap-3 animate-slide-in-up">
      {items.map((item, i) => (
        <GlassPanel
          dark
          key={i}
          className="px-4 py-3 min-w-[140px] hover:scale-105 transition-transform duration-200 cursor-default"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{item.icon}</span>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
          </div>
          <div className={`text-2xl ${item.color}`}>
            <CountUpNumber value={item.value} suffix={item.suffix || ''} decimals={item.decimals || 0} />
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}
