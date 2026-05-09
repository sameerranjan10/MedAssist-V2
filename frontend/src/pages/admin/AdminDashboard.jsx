/**
 * pages/admin/AdminDashboard.jsx
 * Hospital admin overview — KPI stats, donut charts, recent activity feed.
 */
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  RiTeamLine, RiFileList3Line, RiShieldCheckLine,
  RiStethoscopeLine, RiCheckLine, RiBuildingLine,
  RiFileUploadLine,
} from 'react-icons/ri'
import { adminAPI } from '@/api/services'
import { StatCard, LoadingSpinner, Card } from '@/components/common'

const MONTHLY_DATA = [
  { month: 'Jan', reports: 320, verified: 280 },
  { month: 'Feb', reports: 380, verified: 340 },
  { month: 'Mar', reports: 290, verified: 260 },
  { month: 'Apr', reports: 450, verified: 420 },
  { month: 'May', reports: 510, verified: 480 },
]

const ACTIVITIES = [
  { icon: RiCheckLine,       color: 'bg-primary-50 text-brand',    text: 'Dr. Ananya Verma verified a report',        time: '10 May • 11:20 AM' },
  { icon: RiBuildingLine,    color: 'bg-primary-50 text-brand',    text: 'Dr. Rahul Mehta joined Apollo Hospital',    time: '10 May • 10:15 AM' },
  { icon: RiFileUploadLine,  color: 'bg-primary-50 text-brand',    text: 'New report uploaded by Rohan Sharma',       time: '10 May • 09:45 AM' },
  { icon: RiShieldCheckLine, color: 'bg-emerald-50 text-emerald-600', text: 'Dr. Vivek Rao\'s license was verified',  time: '09 May • 04:10 PM' },
]

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.stats()
      .then(r => setStats(r.data))
      .catch(() => setStats({
        total_patients: 1245, total_doctors: 45, total_reports: 3678,
        verified_reports: 2980, pending_reports: 420, rejected_reports: 278, reports_today: 34,
      }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><LoadingSpinner fullPage /></div>

  const reportBreakdown = [
    { name: 'Normal',        value: 1890, color: '#4f6ef7' },
    { name: 'Mild Abnormal', value: 1120, color: '#f59e0b' },
    { name: 'Abnormal',      value: 668,  color: '#ef4444' },
    { name: 'Critical',      value: 0,    color: '#6b7280' },
  ]
  const verifyBreakdown = [
    { name: 'Pending',  value: stats.pending_reports,  color: '#f59e0b' },
    { name: 'Verified', value: stats.verified_reports, color: '#22c55e' },
    { name: 'Rejected', value: stats.rejected_reports, color: '#ef4444' },
  ]

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Hospital Admin</h1>
          <p className="text-sm text-slate-500 mt-0.5">Dashboard Overview • 01 May – 10 May, 2025</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Patients"    value={stats.total_patients.toLocaleString()}
          icon={RiTeamLine} iconColor="text-brand" trend={12.5} />
        <StatCard label="Reports Analyzed"  value={stats.total_reports.toLocaleString()}
          icon={RiFileList3Line} iconColor="text-violet-500" trend={18.3} />
        <StatCard label="Verified Reports"  value={stats.verified_reports.toLocaleString()}
          icon={RiShieldCheckLine} iconColor="text-emerald-500" trend={15.7} />
        <StatCard label="Active Doctors"    value={stats.total_doctors}
          icon={RiStethoscopeLine} iconColor="text-amber-500" trend={8.2} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Reports Overview donut */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Reports Overview</h3>
          <div className="flex items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportBreakdown} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                    {reportBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {reportBreakdown.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name} — {d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Verification Status donut */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Verification Status</h3>
          <div className="flex items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={verifyBreakdown} cx="50%" cy="50%"
                    innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                    {verifyBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v.toLocaleString(), n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 text-xs">
              {verifyBreakdown.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name} — {d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bar chart + Activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Reports vs Verified</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="reports"  fill="#c7d2fe" radius={[4,4,0,0]} name="Reports" />
                <Bar dataKey="verified" fill="#4f6ef7" radius={[4,4,0,0]} name="Verified" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Recent Activities</h3>
            <button className="text-xs text-brand font-medium">View All</button>
          </div>
          <div className="space-y-0">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.color}`}>
                  <a.icon className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">{a.text}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
