import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import encroachmentData from '../../data/encroachments.json'
import { formatDate } from '../../utils/formatters'

export default function EncroachmentTable() {
  const encroachments = encroachmentData.features.map(f => f.properties)

  return (
    <GlassPanel dark className="w-full overflow-hidden">
      <div className="px-4 py-3 border-b border-terra-border/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-threat-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Detected Violations</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{encroachments.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-terra-border/10">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">River</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Dist.</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Area</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Detected</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {encroachments.map((enc, i) => (
              <tr
                key={enc.id}
                className="border-b border-terra-border/5 hover:bg-terra-elevated/30 transition-colors cursor-pointer group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <td className="px-4 py-3 text-xs font-mono text-accent-cyan group-hover:text-accent-cyan">{enc.id}</td>
                <td className="px-4 py-3 text-xs text-slate-300">{enc.river_name}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-300">{enc.distance_from_river_m}m</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-300">{enc.area_sqm} m²</td>
                <td className="px-4 py-3"><StatusBadge level={enc.severity} /></td>
                <td className="px-4 py-3 text-xs font-mono text-slate-400">{formatDate(enc.detected_date)}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{enc.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  )
}
