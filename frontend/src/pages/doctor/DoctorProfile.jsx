import { PageHeader, Card } from '@/components/common'
import useAuthStore from '@/store/authStore'
import { RiUserLine, RiMailLine } from 'react-icons/ri'

export default function DoctorProfile() {
  const { user } = useAuthStore()

  return (
    <div className="p-6">
      <PageHeader title="Doctor Profile" subtitle="Manage your professional information" />
      <Card>
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
            {user?.full_name?.charAt(0) || 'D'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-800">{user?.full_name || 'Dr. User'}</h3>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <RiMailLine /> {user?.email || 'doctor@example.com'}
            </div>
            <div className="flex items-center gap-2 text-slate-500 mt-1 capitalize">
              <RiUserLine /> Role: {user?.role || 'Doctor'}
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4 max-w-md">
          <h4 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Professional Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Specialization</label>
              <p className="text-sm text-slate-800">General Physician</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">License Number</label>
              <p className="text-sm text-slate-800">MED-123456</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Hospital Affiliation</label>
              <p className="text-sm text-slate-800">Apollo Hospitals</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
              <p className="text-sm text-slate-800">+91 98765 43211</p>
            </div>
          </div>
          <div className="pt-4">
             <button className="btn-primary text-sm px-4 py-2">Edit Profile</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
