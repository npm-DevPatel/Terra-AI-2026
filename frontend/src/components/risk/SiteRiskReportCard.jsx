import Panel from '../shared/Panel'

export default function SiteRiskReportCard({ data }) {
  if (!data) return null

  return (
    <Panel className="absolute bottom-20 left-4 z-10 w-80 p-5 animate-reveal shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Site Suitability Report</h3>
          <p className="text-[10px] font-mono font-medium text-text-secondary mt-0.5">
            {data.site.lat.toFixed(4)}, {data.site.lng.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 pt-3 border-t border-border-default">
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Flood Zone</span>
          <span className="text-text-secondary">{data.flood_zone}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Land Class</span>
          <span className="text-text-secondary">{data.land_classification}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Legal Ref</span>
          <span className="text-text-secondary text-[10px]">{data.legal_reference}</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 p-3 rounded-lg bg-bg-base border border-border-default">
        <span className="text-[10px] text-text-muted uppercase tracking-wider">Recommendation</span>
        <p className="text-xs text-accent-teal mt-1 leading-relaxed">{data.recommendation}</p>
      </div>
    </Panel>
  )
}
