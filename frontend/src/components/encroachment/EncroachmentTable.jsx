import GlassPanel from '../shared/GlassPanel'
import StatusBadge from '../shared/StatusBadge'
import encroachmentData from '../../data/encroachments.json'
import { formatDate } from '../../utils/formatters'

export default function EncroachmentTable() {
  const encroachments = encroachmentData.features.map(f => f.properties)

  return (
    <GlassPanel className="w-full overflow-hidden shadow-xl border-border-default/80">
      <div className="px-5 py-4 border-b border-border-default/80 flex items-center justify-between bg-bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-risk-high-bg border border-risk-high/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-risk-high" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-text-primary uppercase tracking-widest">Detected Violations</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-bg-elevated text-[11px] font-bold text-text-muted border border-border-default/50">
          {encroachments.length} RECORDS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-bg-sunken/40">
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">ID</th>
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">River</th>
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Dist.</th>
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Area</th>
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Severity</th>
              <th className="px-5 py-3 text-left text-[11px] font-black text-text-muted uppercase tracking-[0.15em]">Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/40">
            {encroachments.map((enc, i) => (
              <tr
                key={enc.id}
                className="hover:bg-bg-surface/40 transition-all duration-200 cursor-pointer group"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <td className="px-5 py-4 text-[12px] font-mono font-bold text-accent-teal group-hover:underline transition-all underline-offset-2">{enc.id}</td>
                <td className="px-5 py-4 text-[13px] font-bold text-text-primary">{enc.river_name}</td>
                <td className="px-4 py-4 text-[12px] font-mono font-bold text-text-secondary">{enc.distance_from_river_m}m</td>
                <td className="px-4 py-4 text-[12px] font-mono font-bold text-text-secondary">{enc.area_sqm} m²</td>
                <td className="px-5 py-4"><StatusBadge level={enc.severity} /></td>
                <td className="px-5 py-4 text-[11px] font-bold text-text-muted mt-1">{formatDate(enc.detected_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  )
}
