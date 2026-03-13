import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import alertsData from '../../data/alerts.json'
import { formatTimestamp } from '../../utils/formatters'

const severityColor = {
  HIGH: 'border-risk-high',
  MEDIUM: 'border-risk-medium',
  LOW: 'border-risk-low',
  INFO: 'border-accent-teal',
}

const severityIcon = {
  HIGH: '⚠️',
  MEDIUM: '📊',
  LOW: '✅',
  INFO: 'ℹ️',
}

export default function AlertFeed() {
  return (
    <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100%-100px)] overflow-hidden flex flex-col animate-fade-up">
      <GlassPanel className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border-default/80 flex items-center justify-between bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-risk-high animate-breathe" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-risk-high animate-ping opacity-40" />
            </div>
            <span className="text-[13px] font-bold text-text-primary uppercase tracking-wider">Live Alerts</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-white bg-accent-teal px-2 py-0.5 rounded-full shadow-sm shadow-accent-teal/20">
            {alertsData.length}
          </span>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-transparent">
          {alertsData.map((alert, i) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl bg-bg-surface/60 border border-border-default shadow-sm hover:shadow-md hover:bg-bg-surface/90 hover:border-border-strong/50 transition-all duration-300 cursor-pointer group border-l-4 ${severityColor[alert.severity] || 'border-border-default'} animate-fade-up`}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{severityIcon[alert.severity] || '📋'}</span>
                  <span className="text-[14px] font-bold text-text-primary group-hover:text-accent-teal transition-colors line-clamp-1 leading-tight">
                    {alert.title}
                  </span>
                </div>
              </div>
              <p className="text-[12px] text-text-secondary line-clamp-2 mb-3 leading-relaxed">{alert.description}</p>
              <div className="flex items-center justify-between">
                {alert.severity !== 'INFO' && <StatusBadge level={alert.severity} />}
                {alert.severity === 'INFO' && <span className="text-[10px] text-accent-teal font-bold px-2 py-0.5 bg-accent-teal-light rounded-lg border border-accent-teal/20">SYSTEM</span>}
                <span className="text-[10px] text-text-ghost font-mono font-medium">{formatTimestamp(alert.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}
