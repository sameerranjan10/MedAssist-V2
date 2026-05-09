/**
 * pages/patient/HealthTrends.jsx
 * Multi-parameter trend charts from report history.
 */
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

import { PageHeader, Card } from '@/components/common'

// Simulated multi-report history (replace with real API data)
const HB_DATA  = [
  { date: 'Dec 24', value: 10.5, low: 13.0 },
  { date: 'Jan 25', value: 10.8, low: 13.0 },
  { date: 'Feb 25', value: 10.4, low: 13.0 },
  { date: 'Mar 25', value: 10.9, low: 13.0 },
  { date: 'Apr 25', value: 11.0, low: 13.0 },
  { date: 'May 25', value: 11.2, low: 13.0 },
]
const WBC_DATA  = [
  { date: 'Dec 24', value: 7100 }, { date: 'Jan 25', value: 7400 },
  { date: 'Feb 25', value: 7200 }, { date: 'Mar 25', value: 7300 },
  { date: 'Apr 25', value: 7250 }, { date: 'May 25', value: 7200 },
]
const PLT_DATA  = [
  { date: 'Dec 24', value: 230 }, { date: 'Jan 25', value: 245 },
  { date: 'Feb 25', value: 240 }, { date: 'Mar 25', value: 250 },
  { date: 'Apr 25', value: 248 }, { date: 'May 25', value: 245 },
]
const SCORE_DATA = [
  { date: 'Dec 24', value: 65 }, { date: 'Jan 25', value: 68 },
  { date: 'Feb 25', value: 64 }, { date: 'Mar 25', value: 70 },
  { date: 'Apr 25', value: 73 }, { date: 'May 25', value: 78 },
]

function TrendCard({ title, data, dataKey = 'value', color, unit, refLine, refLabel }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            {refLine && (
              <ReferenceLine y={refLine} stroke="#ef4444" strokeDasharray="4 2"
                label={{ value: refLabel, position: 'right', fontSize: 9, fill: '#ef4444' }} />
            )}
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={v => [`${v} ${unit}`, title]} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5}
              fill={`url(#grad-${color})`}
              dot={{ r: 3.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default function HealthTrends() {
  return (
    <div className="p-6">
      <PageHeader
        title="Health Trends"
        subtitle="Track your lab parameters across reports over time"
        actions={
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand text-slate-600">
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        }
      />

      {/* Health score trend */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Overall Health Score</h3>
            <p className="text-xs text-slate-400 mt-0.5">Composite score from all parameters</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-500">78</p>
            <p className="text-xs text-emerald-600">▲ 13 pts vs Dec</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SCORE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={v => [`${v}/100`, 'Health Score']} />
              <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2.5}
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Parameter grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrendCard title="Hemoglobin (Hb)" data={HB_DATA}  color="#4f6ef7" unit="g/dL"
          refLine={13.0} refLabel="Min 13.0" />
        <TrendCard title="WBC Count"        data={WBC_DATA} color="#22c55e" unit="/µL" />
        <TrendCard title="Platelet Count"   data={PLT_DATA} color="#f59e0b" unit="×10³/µL" />
      </div>
    </div>
  )
}
