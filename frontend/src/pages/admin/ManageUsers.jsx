/**
 * pages/admin/ManageUsers.jsx
 * User management — list, filter by role, toggle active, verify doctor license.
 */
import { useEffect, useState } from 'react'
import { RiSearchLine, RiToggleLine, RiShieldCheckLine } from 'react-icons/ri'
import { adminAPI } from '@/api/services'
import { PageHeader, LoadingSpinner, EmptyState, StatusBadge } from '@/components/common'
import toast from 'react-hot-toast'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('')

  const loadUsers = () => {
    adminAPI.listUsers({ role: role || undefined })
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [role])

  const toggleActive = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id)
      setUsers(u => u.map(x => x.id === id ? { ...x, is_active: data.is_active } : x))
      toast.success(data.is_active ? 'User enabled' : 'User disabled')
    } catch { toast.error('Action failed') }
  }

  const verifyLicense = async (doctorId) => {
    try {
      await adminAPI.verifyDoctorLicense(doctorId)
      toast.success('Doctor license verified!')
    } catch { toast.error('Failed to verify license') }
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Manage Users" subtitle="All registered users across the platform" />

      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 max-w-sm">
          <RiSearchLine className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)}
          className="input w-40 text-sm">
          <option value="">All Roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card">
        {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
          <EmptyState title="No users found" subtitle="Try adjusting your filter." />
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Email</th><th>Role</th>
                  <th>Status</th><th>Joined</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.full_name}</td>
                    <td className="text-slate-500">{u.email}</td>
                    <td><span className="badge badge-pending capitalize">{u.role}</span></td>
                    <td>
                      <span className={u.is_active ? 'badge-normal' : 'badge-low'}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleActive(u.id)} title="Toggle active"
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                          <RiToggleLine className="text-base" />
                        </button>
                        {u.role === 'doctor' && (
                          <button onClick={() => verifyLicense(u.id)} title="Verify doctor license"
                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors">
                            <RiShieldCheckLine className="text-base" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
