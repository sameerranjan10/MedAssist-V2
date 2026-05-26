import { useEffect, useState } from 'react'
import { RiSearchLine, RiToggleLine, RiShieldCheckLine } from 'react-icons/ri'
import { adminAPI } from '@/api/services'
import { PageHeader, LoadingSpinner, EmptyState, Card } from '@/components/common'
import toast from 'react-hot-toast'

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const loadDoctors = () => {
    adminAPI.listUsers({ role: 'doctor' })
      .then(r => setDoctors(r.data))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadDoctors() }, [])

  const toggleActive = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id)
      setDoctors(d => d.map(x => x.id === id ? { ...x, is_active: data.is_active } : x))
      toast.success(data.is_active ? 'Doctor enabled' : 'Doctor disabled')
    } catch { toast.error('Action failed') }
  }

  const verifyLicense = async (id) => {
    try {
      await adminAPI.verifyDoctorLicense(id)
      toast.success('License verified!')
    } catch { toast.error('Verification failed') }
  }

  const filtered = doctors.filter(d =>
    d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Manage Doctors" subtitle="View and verify doctor accounts" />
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <RiSearchLine className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search doctors..." className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400" />
        </div>
      </div>
      <Card>
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="No doctors found" subtitle="No doctors match your search." />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td className="font-medium">{d.full_name}</td>
                    <td className="text-slate-500">{d.email}</td>
                    <td>
                      <span className={d.is_active ? 'badge-normal' : 'badge-low'}>
                        {d.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">
                      {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(d.id)} title="Toggle active"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                          <RiToggleLine className="text-base" />
                        </button>
                        <button onClick={() => verifyLicense(d.id)} title="Verify license"
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors">
                          <RiShieldCheckLine className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
