/**
 * pages/doctor/PendingReports.jsx
 * Split-panel: patient list (left) + report detail + verify form (right).
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RiSearchLine, RiCheckLine, RiCloseLine,
  RiInformationLine, RiFileTextLine, RiUserLine,
} from 'react-icons/ri'
import { doctorAPI } from '@/api/services'
import { StatusBadge, LoadingSpinner, EmptyState } from '@/components/common'
import toast from 'react-hot-toast'

const PRIORITY_MAP = {
  critical:      { label: 'Critical',  cls: 'badge-critical' },
  abnormal:      { label: 'High',      cls: 'badge-low' },
  mild_abnormal: { label: 'Medium',    cls: 'badge-high' },
  normal:        { label: 'Low',       cls: 'badge-normal' },
}

export default function PendingReports() {
  const [reports, setReports]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [detail, setDetail]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [remarks, setRemarks]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch]       = useState('')

  const loadReports = () => {
    doctorAPI.pendingReports()
      .then(r => { setReports(r.data); if (r.data.length > 0) selectReport(r.data[0]) })
      .catch(() => toast.error('Failed to load pending reports'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReports() }, [])

  const selectReport = async (r) => {
    setSelected(r)
    setDetail(null)
    setDetailLoading(true)
    try {
      const { data } = await doctorAPI.getReportDetail(r.id)
      setDetail(data)
    } catch {
      toast.error('Failed to load report detail')
    } finally {
      setDetailLoading(false)
    }
  }

  const verify = async (decision) => {
    if (!selected) return
    setSubmitting(true)
    try {
      await doctorAPI.verify({ report_id: selected.id, decision, remarks })
      toast.success(
        decision === 'approved' ? '✅ Report approved & verified!' :
        decision === 'rejected' ? '❌ Report rejected.' :
        'ℹ️ More information requested.'
      )
      setRemarks('')
      loadReports()
    } catch {
      toast.error('Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = reports.filter(r =>
    r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.file_name?.toLowerCase().includes(search.toLowerCase())
  )

  const priority = detail?.analysis?.overall_status
    ? PRIORITY_MAP[detail.analysis.overall_status] || PRIORITY_MAP.normal
    : PRIORITY_MAP.normal

  const abnormParams = detail?.analysis?.extracted_params
    ? Object.values(detail.analysis.extracted_params).filter(p => p.status !== 'normal')
    : []

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Pending Report Verification</h1>
        <p className="text-sm text-slate-500 mt-0.5">{reports.length} reports awaiting your review</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '70vh' }}>

        {/* Left — Patient list */}
        <div className="card flex flex-col overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 mb-3">
            <RiSearchLine className="text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient or report…"
              className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400" />
          </div>

          {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
            <EmptyState title="No pending reports" subtitle="All caught up!" icon={RiFileTextLine} />
          ) : (
            <div className="space-y-2 overflow-y-auto flex-1">
              {filtered.map(r => {
                const pri = PRIORITY_MAP[r.overall_status] || PRIORITY_MAP.normal
                return (
                  <motion.div key={r.id}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => selectReport(r)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selected?.id === r.id
                        ? 'border-brand bg-primary-50 dark:bg-brand/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{r.patient_name}</p>
                        <p className="text-xs text-slate-400 truncate">{r.file_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(r.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`${pri.cls} badge ml-2`}>{pri.label}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right — Report detail + verify form */}
        <div className="card flex flex-col">
          {!selected ? (
            <EmptyState title="Select a report" subtitle="Click a patient from the list to review" icon={RiUserLine} />
          ) : detailLoading ? (
            <LoadingSpinner text="Loading report…" />
          ) : detail ? (
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Report header */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <RiFileTextLine className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{detail.report.file_name}</p>
                  <p className="text-xs text-slate-400">
                    {detail.patient.name}
                    {detail.patient.gender && ` • ${detail.patient.gender}`}
                  </p>
                </div>
                <span className={`${priority.cls} badge`}>{priority.label} Priority</span>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-100 dark:border-slate-700">
                <div className="flex">
                  {['AI Analysis', 'Patient Info'].map((t, i) => (
                    <button key={t}
                      className="px-4 py-2 text-sm font-medium text-brand border-b-2 border-brand">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              {detail.analysis && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">AI Summary</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{detail.analysis.ai_summary}</p>
                  </div>

                  {/* Abnormalities */}
                  {abnormParams.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">Key Abnormalities</p>
                      <div className="flex flex-wrap gap-2">
                        {abnormParams.map(p => (
                          <span key={p.label}
                            className="bg-red-50 text-red-700 border border-red-100 rounded-full px-2.5 py-1 text-xs font-medium">
                            {p.label}: {p.value} {p.unit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Your Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Add your professional remarks, corrections, or notes for the patient…"
                  className="input resize-none min-h-[80px] text-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => verify('needs_info')} disabled={submitting}
                  className="btn-secondary flex items-center gap-1.5 flex-1 justify-center">
                  <RiInformationLine /> Request Info
                </button>
                <button onClick={() => verify('rejected')} disabled={submitting}
                  className="btn-danger flex items-center gap-1.5 flex-1 justify-center">
                  <RiCloseLine /> Reject
                </button>
                <button onClick={() => verify('approved')} disabled={submitting}
                  className="btn-success flex items-center gap-1.5 flex-1 justify-center">
                  <RiCheckLine /> Approve & Verify
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="Could not load report" subtitle="Please try selecting another report" />
          )}
        </div>
      </div>
    </div>
  )
}
