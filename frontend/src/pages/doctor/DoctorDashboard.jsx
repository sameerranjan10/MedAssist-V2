/**
 * pages/doctor/DoctorDashboard.jsx
 * Summary stats for the doctor — pending count, today's verified, etc.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RiFileTextLine, RiCheckboxCircleLine, RiTeamLine, RiArrowRightLine } from 'react-icons/ri'
import { doctorAPI } from '@/api/services'
import { StatCard, LoadingSpinner, Card } from '@/components/common'
import useAuthStore from '@/store/authStore'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    doctorAPI.stats()
      .then(r => setStats(r.data))
      .catch(() => setStats({ pending_reports: 0, total_verified: 0 }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><LoadingSpinner fullPage /></div>

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          Welcome, {user?.full_name} 👨‍⚕️
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {stats?.specialization || 'Doctor'} — Doctor Portal
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Pending Reports"  value={stats?.pending_reports || 0}
          icon={RiFileTextLine} iconColor="text-amber-500"
          sub={<span className="text-amber-600 font-medium">Awaiting review</span>} />
        <StatCard label="Total Verified"   value={stats?.total_verified || 0}
          icon={RiCheckboxCircleLine} iconColor="text-emerald-500"
          sub={<span className="text-emerald-600">All time</span>} />
        <StatCard label="Assigned Patients" value="24"
          icon={RiTeamLine} iconColor="text-brand"
          sub="Active patients" />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Review Pending Reports', desc: `${stats?.pending_reports || 0} awaiting verification`, to: '/doctor/pending', icon: RiFileTextLine, color: 'text-amber-500' },
            { label: 'View Verified Reports',  desc: 'Browse completed verifications', to: '/doctor/verified', icon: RiCheckboxCircleLine, color: 'text-emerald-500' },
          ].map(a => (
            <button key={a.label} onClick={() => navigate(a.to)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-200 hover:border-brand hover:bg-primary-50 transition-all group">
              <a.icon className={`text-xl ${a.color}`} />
              <div className="text-left">
                <p className="text-sm font-medium text-slate-700">{a.label}</p>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
              <RiArrowRightLine className="ml-auto text-slate-300 group-hover:text-brand transition-colors" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
