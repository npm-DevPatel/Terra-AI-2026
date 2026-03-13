import CountUpNumber from '../shared/CountUpNumber'
import metrics from '../../data/metrics.json'
import GlassPanel from '../shared/GlassPanel'

const items = [
  { label: 'Active Threats', value: metrics.active_encroachments, icon: '⚠️', textClass: 'text-risk-high', fillClass: 'bg-risk-high/10' },
  { label: 'River km Monitored', value: metrics.river_km_monitored, suffix: 'km', decimals: 1, icon: '🛰', textClass: 'text-accent-blue', fillClass: 'bg-accent-blue/10' },
  { label: 'High Risk Zones', value: metrics.high_risk_zones, icon: '🔴', textClass: 'text-risk-medium', fillClass: 'bg-risk-medium/10' },
  { label: 'Buffer Violations', value: metrics.buffer_violations, icon: '🚫', textClass: 'text-risk-high', fillClass: 'bg-risk-high/10' },
]

export default function HUDMetricsBar() {
  return (
    <div className="absolute bottom-20 left-4 z-10 animate-fade-up">
      <GlassPanel className="px-5 py-4 flex gap-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="px-5 py-4 min-w-[160px] hover:bg-bg-surface/40 transition-all duration-300 cursor-default rounded-xl group relative overflow-hidden"
          >
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-2.5 mb-2 relative z-10">
              <span className="text-base leading-none">{item.icon}</span>
              <span className="text-[11px] text-text-muted uppercase tracking-[0.1em] font-bold">{item.label}</span>
            </div>
            <div className={`text-2xl font-black ${item.textClass} relative z-10`}>
              <div className="group-hover:translate-x-1 transition-transform inline-block">
                <CountUpNumber value={item.value} suffix={item.suffix || ''} decimals={item.decimals || 0} />
              </div>
            </div>
          </div>
        ))}
      </GlassPanel>
    </div>
  )
}
