import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import { getRiskColor } from '../../utils/formatters'

export default function SiteRiskReportCard({ data }) {
  if (!data) return null

  const riskColor = getRiskColor(data.risk_level)
  const riskScore = data.risk_score || 0
  const circumference = 2 * Math.PI * 40
  const dashOffset = circumference - (riskScore / 100) * circumference

  return (
    <GlassPanel dark className="absolute bottom-20 left-4 z-10 w-80 p-5 animate-reveal">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Site Risk Report</h3>
          <p className="text-[10px] font-mono text-slate-500 mt-0.5">
            {data.site.lat.toFixed(4)}, {data.site.lng.toFixed(4)}
          </p>
        </div>
        <StatusBadge level={data.risk_level} />
      </div>

      {/* Risk Gauge */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="risk-gauge w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={riskColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ filter: `drop-shadow(0 0 6px ${riskColor}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold font-mono" style={{ color: riskColor }}>{riskScore}</span>
            <span className="text-[9px] text-slate-500 uppercase">Risk Score</span>
          </div>
        </div>

        <div className="space-y-2.5 flex-1">
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Distance to River</span>
            <div className="text-sm font-mono font-semibold text-slate-200">{data.distance_from_river_m}m</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Nearest River</span>
            <div className="text-sm text-slate-200">{data.nearest_river}</div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase">Buffer Status</span>
            <div className={`text-sm font-semibold ${data.inside_buffer ? 'text-threat-red' : 'text-status-safe'}`}>
              {data.inside_buffer ? '⚠️ Inside Buffer' : '✅ Outside Buffer'}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 pt-3 border-t border-terra-border/20">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Flood Zone</span>
          <span className="text-slate-300">{data.flood_zone}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Land Class</span>
          <span className="text-slate-300">{data.land_classification}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Legal Ref</span>
          <span className="text-slate-400 text-[10px]">{data.legal_reference}</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 p-3 rounded-lg bg-terra-void/60 border border-terra-border/10">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Recommendation</span>
        <p className="text-xs text-accent-cyan mt-1 leading-relaxed">{data.recommendation}</p>
      </div>
    </GlassPanel>
  )
}
