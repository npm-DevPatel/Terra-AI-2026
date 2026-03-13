import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import alertsData from '../../data/alerts.json'
import { formatTimestamp } from '../../utils/formatters'

const severityIcon = {
  HIGH: '🔴',
  MEDIUM: '🟡',
  LOW: '🟢',
  INFO: 'ℹ️',
}

export default function AlertFeed() {
  return (
    <GlassPanel dark className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100%-100px)] overflow-hidden flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-terra-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-threat-red" />
            <div className="w-2 h-2 rounded-full bg-threat-red absolute inset-0 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Alerts</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{alertsData.length} alerts</span>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alertsData.map((alert, i) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg bg-terra-void/50 border border-terra-border/10 hover:border-accent-cyan/20 transition-all duration-200 cursor-pointer group"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">{severityIcon[alert.severity] || '📋'}</span>
                <span className="text-xs font-medium text-slate-200 group-hover:text-accent-cyan transition-colors line-clamp-1">
                  {alert.title}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">{alert.description}</p>
            <div className="flex items-center justify-between">
              {alert.severity !== 'INFO' && <StatusBadge level={alert.severity} />}
              {alert.severity === 'INFO' && <span className="text-[10px] text-accent-teal">System</span>}
              <span className="text-[10px] font-mono text-slate-600">{formatTimestamp(alert.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  )
}
