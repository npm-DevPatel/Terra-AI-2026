import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import Panel from '../shared/Panel'
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
  { name: 'High', value: 15, color: 'var(--risk-high)' },
  { name: 'Medium', value: 13, color: 'var(--risk-medium)' },
  { name: 'Low', value: 10, color: 'var(--status-safe)' },
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
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '8px',
  color: 'var(--text-secondary)',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
}

export function EncroachmentTimelineChart() {
  return (
    <Panel className="p-5 shadow-md rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-text-primary">Encroachments Over Time</h3>
        <span className="text-[10px] font-mono text-risk-high">+100% since 2022</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={encroachmentTimelineData}>
          <defs>
            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--risk-high)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--risk-high)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="count" stroke="var(--risk-high)" fill="url(#gradRed)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function RiskDistributionChart() {
  return (
    <Panel className="p-5 shadow-md rounded-xl">
      <h3 className="text-base font-bold text-text-primary mb-4">Risk Distribution</h3>
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
            formatter={(value) => <span className="text-xs text-text-secondary font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function RiverCorridorChart() {
  return (
    <Panel className="p-5 shadow-md rounded-xl">
      <h3 className="text-base font-bold text-text-primary mb-4">Violations by River</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={riverCorridorData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey="river" stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="violations" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function MonthlyTrendChart() {
  return (
    <Panel className="p-5 shadow-md rounded-xl">
      <h3 className="text-base font-bold text-text-primary mb-4">Monthly Detection Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={monthlyTrendData}>
          <defs>
            <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-teal)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--accent-teal)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <YAxis stroke="var(--text-muted)" fontSize={10} fontFamily="JetBrains Mono" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="violations" stroke="var(--risk-medium)" strokeWidth={2} dot={{ fill: 'var(--risk-medium)', r: 3 }} />
          <Line type="monotone" dataKey="area" stroke="var(--accent-teal)" strokeWidth={2} dot={{ fill: 'var(--accent-teal)', r: 3 }} name="Area (m²)" />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  )
}

export function InsightCards() {
  const cards = [
    { label: 'Rivers Monitored', value: 4, icon: '🏞', color: 'text-accent-teal' },
    { label: 'Detection Accuracy', value: 92, suffix: '%', icon: '🎯', color: 'text-status-safe' },
    { label: 'River km Covered', value: 47.2, suffix: 'km', decimals: 1, icon: '🛰', color: 'text-accent-blue' },
    { label: 'Weekly Alerts', value: 7, icon: '🔔', color: 'text-risk-medium' },
    { label: 'Pending Reviews', value: 5, icon: '📋', color: 'text-risk-medium' },
    { label: 'Enforcement Actions', value: 3, icon: '⚖️', color: 'text-accent-teal' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <Panel key={i} className="p-4 hover:scale-[1.02] transition-transform cursor-default shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span>{card.icon}</span>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">{card.label}</span>
          </div>
          <div className={`text-2xl font-bold ${card.color}`}>
            <CountUpNumber value={card.value} suffix={card.suffix || ''} decimals={card.decimals || 0} />
          </div>
        </Panel>
      ))}
    </div>
  )
}
