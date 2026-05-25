import { useEffect, useState } from 'react'
import { RiSearchLine, RiFileList3Line } from 'react-icons/ri'
import { adminAPI } from '@/api/services'
import { PageHeader, LoadingSpinner, EmptyState, Card } from '@/components/common'
import toast from 'react-hot-toast'

export default function ManageReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    adminAPI.listReports()
      .then(r => setReports(r.data))
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter(r =>
    r.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <PageHeader title="Platform Reports" subtitle="View all medical reports on the platform" />
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <RiSearchLine className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by patient or title..." className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400" />
        </div>
      </div>
      <Card>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="No reports found" icon={RiFileList3Line} subtitle="No reports match your search." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th><th>Patient</th><th>Status</th><th>Uploaded At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="font-medium">{r.title || 'Untitled Report'}</td>
                  <td className="text-slate-500">{r.patient_name || `Patient #${r.patient_id}`}</td>
                  <td>
                    <span className={r.status === 'verified' ? 'badge-normal' : r.status === 'pending' ? 'badge-pending' : 'badge-low'}>
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
