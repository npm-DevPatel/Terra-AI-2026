import { EncroachmentTimelineChart, RiskDistributionChart, RiverCorridorChart, MonthlyTrendChart, InsightCards } from '../components/insights/Charts'
import GlassPanel from '../components/shared/GlassPanel'
import CountUpNumber from '../components/shared/CountUpNumber'

export default function DataInsights() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-bg-base">
      {/* Header Banner */}
      <GlassPanel className="px-6 py-4 !bg-bg-surface border border-border-default shadow-md rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Encroachment Analytics</h2>
            <p className="text-sm text-text-muted mt-0.5">Nairobi River Corridor Monitoring — 2020 to 2026</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-risk-high">
                <CountUpNumber value={12450} suffix=" m²" />
              </div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Total Area Encroached</span>
            </div>
            <div className="w-px h-10 bg-border-default" />
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-teal">
                <CountUpNumber value={38} />
              </div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">Structures Detected</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-4">
        <EncroachmentTimelineChart />
        <RiskDistributionChart />
        <RiverCorridorChart />
        <MonthlyTrendChart />
      </div>

      {/* Insight Cards */}
      <InsightCards />
    </div>
  )
}
