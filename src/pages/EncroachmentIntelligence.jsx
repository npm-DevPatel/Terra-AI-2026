import ComparisonSlider from '../components/encroachment/ComparisonSlider'
import EncroachmentTable from '../components/encroachment/EncroachmentTable'
import GlassPanel from '../components/shared/GlassPanel'
import CountUpNumber from '../components/shared/CountUpNumber'
import metrics from '../data/metrics.json'

export default function EncroachmentIntelligence() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Encroachments', value: metrics.active_encroachments, color: 'text-threat-red', icon: '⚠️' },
          { label: 'Area Encroached', value: metrics.total_area_encroached_sqm, suffix: ' m²', color: 'text-threat-orange', icon: '📐' },
          { label: 'Structures Flagged', value: metrics.structures_flagged_total, color: 'text-status-warn', icon: '🏗' },
          { label: 'Confidence Rate', value: 92, suffix: '%', color: 'text-status-safe', icon: '🎯' },
        ].map((stat, i) => (
          <GlassPanel dark key={i} className="px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{stat.icon}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-xl ${stat.color}`}>
              <CountUpNumber value={stat.value} suffix={stat.suffix || ''} />
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Comparison Slider */}
      <ComparisonSlider />

      {/* Violations Table */}
      <EncroachmentTable />
    </div>
  )
}
