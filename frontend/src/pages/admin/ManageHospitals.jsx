/**
 * pages/admin/ManageHospitals.jsx
 * CRUD for hospital records — list, create, delete.
 */
import { useEffect, useState } from 'react'
import { RiAddLine, RiDeleteBinLine, RiBuildingLine } from 'react-icons/ri'
import { adminAPI } from '@/api/services'
import { PageHeader, LoadingSpinner, EmptyState, Card } from '@/components/common'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', city: '', address: '', phone: '', email: '' }

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)

  const load = () => {
    adminAPI.listHospitals()
      .then(r => setHospitals(r.data))
      .catch(() => toast.error('Failed to load hospitals'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name) { toast.error('Hospital name is required'); return }
    setSaving(true)
    try {
      await adminAPI.createHospital(form)
      toast.success('Hospital added!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch { toast.error('Failed to create hospital') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this hospital?')) return
    try {
      await adminAPI.deleteHospitals?.(id)
      setHospitals(h => h.filter(x => x.id !== id))
      toast.success('Hospital removed')
    } catch { toast.error('Failed to remove hospital') }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Manage Hospitals"
        subtitle="Add and manage hospital partnerships"
        actions={
          <button onClick={() => setShowForm(s => !s)}
            className="btn-primary flex items-center gap-1.5">
            <RiAddLine /> Add Hospital
          </button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card className="mb-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">New Hospital</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Hospital name *" className="input sm:col-span-2" required />
            <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              placeholder="City" className="input" />
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Phone" className="input" />
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="Email" className="input" type="email" />
            <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Address" className="input" />
            <div className="sm:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Add Hospital'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card>
        {loading ? <LoadingSpinner /> : hospitals.length === 0 ? (
          <EmptyState title="No hospitals added yet" icon={RiBuildingLine}
            action={<button onClick={() => setShowForm(true)} className="btn-primary">Add First Hospital</button>} />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>City</th><th>Phone</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {hospitals.map(h => (
                <tr key={h.id}>
                  <td className="font-medium">{h.name}</td>
                  <td className="text-slate-500">{h.city || '—'}</td>
                  <td className="text-slate-500">{h.phone || '—'}</td>
                  <td>
                    <span className={h.is_active ? 'badge-normal' : 'badge-low'}>
                      {h.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(h.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors">
                      <RiDeleteBinLine />
                    </button>
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
