/**
 * pages/patient/HealthTrends.jsx
 * Real-time longitudinal health tracking — powered by extracted report data.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Minus, UploadCloud,
  Activity, HeartPulse, FlaskConical, AlertCircle,
  Info,
} from 'lucide-react'
import { trendsAPI } from '@/api/services'
import { useNavigate as useNav } from 'react-router-dom'

// ── Normal ranges for common parameters (neutral / typical adult) ──────────────
const NORMAL_RANGES = {
  'Hemoglobin':      { min: 12.0, max: 17.5, unit: 'g/dL' },
  'hemoglobin':      { min: 12.0, max: 17.5, unit: 'g/dL' },
  'WBC':             { min: 4000,  max: 11000, unit: '/µL' },
  'wbc':             { min: 4000,  max: 11000, unit: '/µL' },
  'Platelets':       { min: 150,   max: 450,   unit: '×10³/µL' },
  'platelets':       { min: 150,   max: 450,   unit: '×10³/µL' },
  'Glucose':         { min: 70,    max: 100,   unit: 'mg/dL' },
  'glucose':         { min: 70,    max: 100,   unit: 'mg/dL' },
  'HbA1c':           { min: 4.0,   max: 5.7,   unit: '%' },
  'hba1c':           { min: 4.0,   max: 5.7,   unit: '%' },
  'Creatinine':      { min: 0.6,   max: 1.2,   unit: 'mg/dL' },
  'creatinine':      { min: 0.6,   max: 1.2,   unit: 'mg/dL' },
  'Cholesterol':     { min: 0,     max: 200,   unit: 'mg/dL' },
  'cholesterol':     { min: 0,     max: 200,   unit: 'mg/dL' },
  'LDL':             { min: 0,     max: 100,   unit: 'mg/dL' },
  'ldl':             { min: 0,     max: 100,   unit: 'mg/dL' },
  'HDL':             { min: 40,    max: 60,    unit: 'mg/dL' },
  'hdl':             { min: 40,    max: 60,    unit: 'mg/dL' },
  'Triglycerides':   { min: 0,     max: 150,   unit: 'mg/dL' },
  'triglycerides':   { min: 0,     max: 150,   unit: 'mg/dL' },
  'RBC':             { min: 4.2,   max: 5.9,   unit: 'M/µL' },
  'rbc':             { min: 4.2,   max: 5.9,   unit: 'M/µL' },
  'TSH':             { min: 0.4,   max: 4.0,   unit: 'mIU/L' },
  'tsh':             { min: 0.4,   max: 4.0,   unit: 'mIU/L' },
}

// Per-chart gradient color palette
const CHART_COLORS = [
  '#4f6ef7', '#22c55e', '#f59e0b', '#ef4444',
  '#a855f7', '#06b6d4', '#f97316', '#10b981',
]

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

// ── Skeleton loader ─────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />
}

function TrendSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4 mt-4" />
    </div>
  )
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-slate-800 dark:text-white font-bold text-base">
        {payload[0].value} <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  )
}

// ── Trend insight text ─────────────────────────────────────────────────────
function buildInsight(paramName, data, unit) {
  if (!data || data.length < 2) return null
  const first = data[0].value
  const last = data[data.length - 1].value
  const delta = last - first
  const absDelta = Math.abs(delta).toFixed(2)
  const direction = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'remained stable'
  const count = data.length

  if (delta === 0) return `${paramName} remained stable across ${count} reports.`
  return `${paramName} ${direction} by ${absDelta} ${unit} across ${count} reports.`
}

// ── Single parameter chart card ─────────────────────────────────────────────
function TrendCard({ paramName, data, unit, color, index }) {
  const normRange = NORMAL_RANGES[paramName]
  const latest = data[data.length - 1]?.value
  const first = data[0]?.value
  const delta = latest !== undefined && first !== undefined ? latest - first : null
  const insight = buildInsight(paramName, data, unit)

  const isAboveNorm = normRange && latest > normRange.max
  const isBelowNorm = normRange && latest < normRange.min
  const statusColor = isAboveNorm || isBelowNorm ? 'text-amber-600' : 'text-emerald-600'
  const statusText = isAboveNorm ? 'Above range' : isBelowNorm ? 'Below range' : 'In range'

  // Format dates to short form
  const displayData = data.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <motion.div
      {...fadeUp}
      transition={{ delay: 0.1 * index }}
      className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white">{paramName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{unit}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>
            {latest?.toFixed?.(1) ?? latest}
          </p>
          {delta !== null && (
            <span className={`flex items-center justify-end gap-0.5 text-xs font-medium mt-0.5 ${
              delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : delta < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              {delta > 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
          {normRange && (
            <span className={`text-[11px] font-medium ${statusColor}`}>{statusText}</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false} tickLine={false}
            />
            {/* Healthy range band */}
            {normRange && (
              <ReferenceArea
                y1={normRange.min} y2={normRange.max}
                fill="#22c55e" fillOpacity={0.07}
              />
            )}
            {/* Normal range boundary lines */}
            {normRange && (
              <>
                <ReferenceLine y={normRange.min} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
                <ReferenceLine y={normRange.max} stroke="#22c55e" strokeDasharray="4 2" strokeOpacity={0.5} />
              </>
            )}
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Area
              type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
              fill={`url(#grad-${index})`}
              dot={{ r: 4, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Range legend */}
      {normRange && (
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400/30 border border-emerald-400/50" />
          Normal range: {normRange.min} – {normRange.max} {unit}
        </p>
      )}

      {/* Insight */}
      {insight && (
        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-brand" />
          {insight}
        </div>
      )}
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function HealthTrends() {
  const navigate = useNavigate()
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    trendsAPI.get()
      .then(r => setTrends(r.data))
      .catch(() => setError('Failed to load trends. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Empty/error states ─────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-slate-600 font-medium">{error}</p>
      </div>
    )
  }

  const paramEntries = trends ? Object.entries(trends.parameters) : []
  const hasScoreTrend = trends?.health_score?.length >= 2
  const hasParamTrend = paramEntries.length > 0
  const noData = trends?.total_reports === 0

  // Score trend display data
  const scoreData = (trends?.health_score || []).map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28 md:pb-8">

      {/* Page header */}
      <motion.div {...fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Health Trends</h1>
          <p className="text-sm text-slate-500 mt-1">
            Longitudinal tracking of your lab parameters across all uploaded reports
          </p>
        </div>
      </motion.div>

      {/* ── No reports at all ───────────────────────────────────────────────── */}
      {!loading && noData && (
        <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-5">
            <UploadCloud className="w-10 h-10 text-brand" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">No trend data available yet</h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            Upload medical reports to start tracking your health over time. Each report you upload adds a new data point to your personal health history.
          </p>
          <button onClick={() => navigate('/reports')} className="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Your First Report
          </button>
        </motion.div>
      )}

      {/* ── Has reports but not enough for trends ───────────────────────────── */}
      {!loading && !noData && !hasScoreTrend && !hasParamTrend && (
        <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">
            Upload more reports to generate trends
          </h2>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            You have {trends?.total_reports} report{trends?.total_reports === 1 ? '' : 's'} uploaded. Trends are generated when you have at least 2 analyzed reports with matching parameters.
          </p>
          <button onClick={() => navigate('/reports')} className="btn-primary px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Another Report
          </button>
        </motion.div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && (
        <>
          <Skeleton className="h-56 w-full rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0, 1, 2].map(i => <TrendSkeleton key={i} />)}
          </div>
        </>
      )}

      {/* ── Health Score card ────────────────────────────────────────────────── */}
      {!loading && hasScoreTrend && (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl"
        >
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Overall Health Score</h2>
                <p className="text-sm text-blue-100">Composite score from all extracted parameters</p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-5xl font-black">{trends?.latest_score ?? '—'}</p>
              {trends?.score_change !== null && trends?.score_change !== undefined && (
                <p className={`text-sm font-semibold mt-1 flex items-center justify-center sm:justify-end gap-1 ${
                  trends.score_change > 0 ? 'text-emerald-300' : trends.score_change < 0 ? 'text-red-300' : 'text-blue-200'
                }`}>
                  {trends.score_change > 0
                    ? <><TrendingUp className="w-4 h-4" /> +{trends.score_change} pts since first report</>
                    : trends.score_change < 0
                    ? <><TrendingDown className="w-4 h-4" /> {trends.score_change} pts since first report</>
                    : <><Minus className="w-4 h-4" /> No change</>
                  }
                </p>
              )}
            </div>
          </div>

          <div className="relative z-10 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                  axisLine={false} tickLine={false}
                  domain={['auto', 100]}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(30,41,59,0.9)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  formatter={v => [`${v}/100`, 'Health Score']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line
                  type="monotone" dataKey="value" stroke="#fff" strokeWidth={3}
                  dot={{ r: 5, fill: '#fff', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#a5b4fc' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* ── Parameter trend charts ───────────────────────────────────────────── */}
      {!loading && hasParamTrend && (
        <>
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-xl text-brand">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Lab Parameter Trends</h2>
              <p className="text-xs text-slate-400">Green band = healthy reference range</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paramEntries.map(([paramName, data], idx) => (
              <TrendCard
                key={paramName}
                paramName={paramName}
                data={data}
                unit={trends.parameter_units[paramName] || ''}
                color={CHART_COLORS[idx % CHART_COLORS.length]}
                index={idx}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
