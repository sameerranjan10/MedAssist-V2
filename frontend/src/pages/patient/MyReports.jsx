/**
 * pages/patient/MyReports.jsx
 * Drag-and-drop upload + paginated report list with status badges.
 */
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUploadCloudLine, RiFileList3Line, RiDeleteBinLine,
  RiLoader4Line, RiEyeLine, RiCheckLine,
} from 'react-icons/ri'
import { reportsAPI } from '@/api/services'
import { PageHeader, StatusBadge, EmptyState, LoadingSpinner } from '@/components/common'
import toast from 'react-hot-toast'

export default function MyReports() {
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const loadReports = () => {
    reportsAPI.list()
      .then(r => setReports(r.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReports() }, [])

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      await reportsAPI.upload(fd)
      toast.success('Report uploaded! AI analysis is running in the background.')
      loadReports()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg', '.tiff'] },
    maxFiles: 1,
    disabled: uploading,
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return
    try {
      await reportsAPI.delete(id)
      setReports(r => r.filter(x => x.id !== id))
      toast.success('Report deleted.')
    } catch {
      toast.error('Failed to delete report.')
    }
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="My Reports"
        subtitle="Upload and manage your medical reports"
      />

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer mb-6 transition-all ${
          isDragActive
            ? 'border-brand bg-primary-50 dark:bg-brand/20'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-brand dark:hover:border-brand hover:bg-primary-50/50 dark:hover:bg-brand/10'
        } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2">
              <RiLoader4Line className="text-brand text-3xl animate-spin" />
              <p className="text-sm font-medium text-slate-600">Uploading & analysing…</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 text-center">
              <RiUploadCloudLine className="text-brand text-4xl" />
              <p className="text-sm font-semibold text-slate-700">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your report here'}
              </p>
              <p className="text-xs text-slate-400">Supports PDF, PNG, JPG up to 20 MB</p>
              <button type="button"
                className="btn-primary mt-1 px-5">
                Browse Files
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reports list */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Uploaded Reports
          <span className="ml-2 text-xs font-normal text-slate-400">({reports.length})</span>
        </h3>

        {loading ? <LoadingSpinner /> : reports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            subtitle="Upload your first medical report to get started."
            icon={RiFileList3Line}
          />
        ) : (
          <div className="space-y-0">
            {reports.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <RiFileList3Line className="text-brand text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{r.file_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {r.file_size_kb && ` • ${(r.file_size_kb / 1024).toFixed(1)} MB`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                  {r.status !== 'uploaded' && r.status !== 'processing' && (
                    <button onClick={() => navigate(`/analysis/${r.id}`)}
                      title="View analysis"
                      className="w-8 h-8 rounded-lg hover:bg-primary-50 flex items-center justify-center text-brand transition-colors">
                      <RiEyeLine />
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)}
                    title="Delete report"
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
                    <RiDeleteBinLine />
                  </button>
                </div>
                {r.status === 'processing' && (
                  <RiLoader4Line className="text-amber-500 animate-spin" />
                )}
                {r.status === 'verified' && (
                  <RiCheckLine className="text-emerald-500" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
