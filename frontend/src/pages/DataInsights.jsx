import { EncroachmentTimelineChart, RiskDistributionChart, RiverCorridorChart, MonthlyTrendChart, InsightCards } from '../components/insights/Charts'
import GlassPanel from '../components/shared/GlassPanel'
import CountUpNumber from '../components/shared/CountUpNumber'

export default function DataInsights() {
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header Banner */}
      <GlassPanel dark className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-200">Encroachment Analytics</h2>
            <p className="text-sm text-slate-500 mt-0.5">Nairobi River Corridor Monitoring — 2020 to 2026</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold text-threat-red">
                <CountUpNumber value={12450} suffix=" m²" />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total Area Encroached</span>
            </div>
            <div className="w-px h-10 bg-terra-border/20" />
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-cyan">
                <CountUpNumber value={38} />
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Structures Detected</span>
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
