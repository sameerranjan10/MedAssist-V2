/**
 * pages/patient/AIAnalysis.jsx
 * Full analysis view: report header, tabbed layout, parameter table,
 * status donut, AI summary/explanation/recommendation, doctor verification status.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import {
  RiArrowLeftLine, RiDownloadLine, RiFileTextLine,
  RiCheckboxCircleLine, RiAlertLine, RiLightbulbLine,
  RiStethoscopeLine, RiLoader4Line,
} from 'react-icons/ri'
import { reportsAPI } from '@/api/services'
import { StatusBadge, LoadingSpinner, EmptyState } from '@/components/common'
import toast from 'react-hot-toast'

const TABS = ['Summary', 'Parameters', 'AI Explanation', 'Doctor Verification']
const STATUS_COLORS = { normal: '#22c55e', low: '#ef4444', high: '#f59e0b', critical: '#dc2626' }
const OVERALL_COLORS = { normal: '#22c55e', mild_abnormal: '#f59e0b', abnormal: '#ef4444', critical: '#dc2626' }

export default function AIAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport]     = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!id) { setLoading(false); return }
    Promise.all([reportsAPI.get(id), reportsAPI.getAnalysis(id)])
      .then(([r, a]) => { setReport(r.data); setAnalysis(a.data) })
      .catch(err => setError(err.response?.data?.detail || 'Failed to load analysis.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6"><LoadingSpinner fullPage text="Loading analysis…" /></div>

  if (!id || error === 'Analysis not ready yet') {
    return (
      <div className="p-6">
        <EmptyState title="Select a report to view analysis"
          subtitle="Go to My Reports and choose a processed report."
          icon={RiFileTextLine}
          action={<button onClick={() => navigate('/reports')} className="btn-primary">Go to Reports</button>} />
      </div>
    )
  }

  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>
  if (!analysis) return <div className="p-6"><LoadingSpinner text="Analysis in progress…" /></div>

  const params = analysis.extracted_params || {}
  const paramList = Object.values(params)
  const normalCount = paramList.filter(p => p.status === 'normal').length
  const abnormalCount = paramList.length - normalCount

  const donutData = [
    { name: 'Normal',   value: normalCount },
    { name: 'Abnormal', value: abnormalCount },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <RiArrowLeftLine /> Back
          </button>
          <h1 className="text-xl font-semibold text-slate-800">AI Analysis</h1>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <RiDownloadLine /> Download Summary
        </button>
      </div>

      {/* Report info bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-5">
        <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <RiFileTextLine className="text-red-500 text-base" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate">{report?.file_name}</p>
          <p className="text-xs text-slate-400">
            Uploaded {new Date(report?.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {report?.file_size_kb && ` • ${(report.file_size_kb / 1024).toFixed(1)} MB`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
          <RiCheckboxCircleLine /> Analysis Completed
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200 mb-5">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === i
                ? 'border-brand text-brand font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab: Summary */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{analysis.ai_summary}</p>

            {/* Overall status */}
            <div className="flex items-center gap-3 p-3 rounded-xl border mb-4"
              style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <RiAlertLine className="text-amber-500 text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800 capitalize">
                  {analysis.overall_status?.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-slate-500">
                  {abnormalCount} parameter{abnormalCount !== 1 ? 's' : ''} out of range
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xl font-bold" style={{ color: OVERALL_COLORS[analysis.overall_status] || '#22c55e' }}>
                  {analysis.health_score}
                </p>
                <p className="text-xs text-slate-400">Health Score</p>
              </div>
            </div>

            {/* Key params preview (top 5) */}
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Key Parameters</h3>
            <table className="data-table">
              <thead>
                <tr><th>Parameter</th><th>Your Value</th><th>Normal Range</th><th>Status</th></tr>
              </thead>
              <tbody>
                {paramList.slice(0, 5).map(p => (
                  <tr key={p.label}>
                    <td className="font-medium text-slate-700">{p.label}</td>
                    <td className={p.status === 'normal' ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {p.value} {p.unit}
                    </td>
                    <td className="text-slate-400">{p.normal_range}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Donut chart */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Overall Status</h3>
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%"
                      innerRadius={40} outerRadius={62}
                      paddingAngle={3} dataKey="value">
                      {donutData.map((_, idx) => (
                        <Cell key={idx} fill={idx === 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Normal — {normalCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Abnormal — {abnormalCount}</span>
                </div>
              </div>
            </div>

            {/* AI recommendation */}
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex gap-2.5">
              <RiLightbulbLine className="text-emerald-600 text-base flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-1">AI Recommendation</p>
                <p className="text-xs text-emerald-700 leading-relaxed">{analysis.ai_recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Parameters */}
      {activeTab === 1 && (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Parameter</th><th>Your Value</th><th>Unit</th><th>Normal Range</th><th>Status</th></tr>
            </thead>
            <tbody>
              {paramList.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">No parameters extracted</td></tr>
              ) : paramList.map(p => (
                <tr key={p.label}>
                  <td className="font-medium">{p.label}</td>
                  <td className={`font-semibold ${p.status === 'normal' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {p.value}
                  </td>
                  <td className="text-slate-400">{p.unit}</td>
                  <td className="text-slate-400">{p.normal_range}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: AI Explanation */}
      {activeTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">📋 Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.ai_summary}</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">🔬 Detailed Explanation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.ai_explanation}</p>
          </div>
          <div className="card lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">💡 Recommendations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{analysis.ai_recommendation}</p>
          </div>
        </div>
      )}

      {/* Tab: Doctor Verification */}
      {activeTab === 3 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <RiStethoscopeLine className="text-brand text-xl" />
            <h3 className="text-sm font-semibold text-slate-700">Doctor Verification Status</h3>
          </div>
          <StatusBadge status={report?.status} />
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            {report?.status === 'verified'
              ? 'A certified doctor has reviewed and approved this analysis.'
              : report?.status === 'rejected'
              ? 'This report was rejected by the reviewing doctor. Please re-upload or contact support.'
              : 'This report is awaiting review by a certified doctor. You will be notified when verified.'}
          </p>
        </div>
      )}
    </div>
  )
}
