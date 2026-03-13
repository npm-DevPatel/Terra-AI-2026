import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import GlassPanel from '../shared/GlassPanel'
import CountUpNumber from '../shared/CountUpNumber'

// ── Mock Chart Data ──
const encroachmentTimelineData = [
  { year: '2020', count: 4 },
  { year: '2021', count: 7 },
  { year: '2022', count: 11 },
  { year: '2023', count: 15 },
  { year: '2024', count: 19 },
  { year: '2025', count: 28 },
  { year: '2026', count: 38 },
]

const riskDistributionData = [
  { name: 'High', value: 15, color: '#EF4444' },
  { name: 'Medium', value: 13, color: '#FBBF24' },
  { name: 'Low', value: 10, color: '#10B981' },
]

const riverCorridorData = [
  { river: 'Mathare', violations: 14, area: 1250 },
  { river: 'Nairobi', violations: 18, area: 890 },
  { river: 'Ngong', violations: 6, area: 520 },
  { river: 'Kirichwa', violations: 2, area: 180 },
]

const monthlyTrendData = [
  { month: 'Jul', violations: 2, area: 340 },
  { month: 'Aug', violations: 3, area: 520 },
  { month: 'Sep', violations: 4, area: 680 },
  { month: 'Oct', violations: 3, area: 510 },
  { month: 'Nov', violations: 5, area: 890 },
  { month: 'Dec', violations: 4, area: 720 },
  { month: 'Jan', violations: 6, area: 1100 },
  { month: 'Feb', violations: 5, area: 950 },
  { month: 'Mar', violations: 7, area: 1350 },
]

const tooltipStyle = {
  backgroundColor: 'rgba(5, 8, 16, 0.9)',
  border: '1px solid rgba(0, 229, 255, 0.12)',
  borderRadius: '8px',
  color: '#F1F5F9',
  fontSize: '12px',
}

export function EncroachmentTimelineChart() {
  return (
    <GlassPanel dark className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Encroachments Over Time</h3>
        <span className="text-[10px] font-mono text-threat-red">+100% since 2022</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={encroachmentTimelineData}>
          <defs>
            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="year" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="count" stroke="#EF4444" fill="url(#gradRed)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassPanel>
  )
}

export function RiskDistributionChart() {
  return (
    <GlassPanel dark className="p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={riskDistributionData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {riskDistributionData.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </GlassPanel>
  )
}

export function RiverCorridorChart() {
  return (
    <GlassPanel dark className="p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Violations by River</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={riverCorridorData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="river" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="violations" fill="#00E5FF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </GlassPanel>
  )
}

export function MonthlyTrendChart() {
  return (
    <GlassPanel dark className="p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Monthly Detection Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={monthlyTrendData}>
          <defs>
            <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis dataKey="month" stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="#475569" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="violations" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} />
          <Line type="monotone" dataKey="area" stroke="#00E5FF" strokeWidth={2} dot={{ fill: '#00E5FF', r: 3 }} name="Area (m²)" />
        </LineChart>
      </ResponsiveContainer>
    </GlassPanel>
  )
}

export function InsightCards() {
  const cards = [
    { label: 'Rivers Monitored', value: 4, icon: '🏞', color: 'text-accent-cyan' },
    { label: 'Detection Accuracy', value: 92, suffix: '%', icon: '🎯', color: 'text-status-safe' },
    { label: 'River km Covered', value: 47.2, suffix: 'km', decimals: 1, icon: '🛰', color: 'text-accent-teal' },
    { label: 'Weekly Alerts', value: 7, icon: '🔔', color: 'text-threat-orange' },
    { label: 'Pending Reviews', value: 5, icon: '📋', color: 'text-status-warn' },
    { label: 'Enforcement Actions', value: 3, icon: '⚖️', color: 'text-accent-cyan' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <GlassPanel dark key={i} className="p-4 hover:scale-[1.02] transition-transform cursor-default">
          <div className="flex items-center gap-2 mb-2">
            <span>{card.icon}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{card.label}</span>
          </div>
          <div className={`text-2xl ${card.color}`}>
            <CountUpNumber value={card.value} suffix={card.suffix || ''} decimals={card.decimals || 0} />
          </div>
        </GlassPanel>
      ))}
    </div>
  )
}
