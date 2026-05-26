/**
 * pages/patient/Dashboard.jsx
 * Patient home dashboard — stats, recent report, health trend chart, AI tip, quick actions.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  RiFileList3Line, RiRobot2Line, RiHeartPulseLine,
  RiCalendarLine, RiUploadCloudLine,
  RiMessage2Line, RiArrowRightLine,
} from 'react-icons/ri'
import { dashboardAPI } from '@/api/services'
import useAuthStore from '@/store/authStore'
import { StatCard, LoadingSpinner, StatusBadge, Card, EmptyState } from '@/components/common'
import toast from 'react-hot-toast'

export default function PatientDashboard() {
  const { user, getInitials } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTrendIdx, setSelectedTrendIdx] = useState(0)

  useEffect(() => {
    dashboardAPI.stats()
      .then(r => setStats(r.data))
      .catch((err) => {
        toast.error('Failed to load dashboard data.')
        setStats(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6"><LoadingSpinner fullPage /></div>
  
  const latest = stats?.recent_reports?.[0]
  const hasTrends = stats?.health_trends?.length > 0
  const activeTrend = hasTrends ? stats.health_trends[selectedTrendIdx] : null

  return (
    <div className="p-4 md:p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{"Here's your health overview"}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative shadow-card hover:shadow-card-hover transition-shadow">
            <RiCalendarLine className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white text-xs font-semibold">
            {getInitials()}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Reports Uploaded" value={stats?.reports_uploaded || 0}
          icon={RiFileList3Line} iconColor="text-brand"
          sub={<span className="text-brand cursor-pointer" onClick={() => navigate('/reports')}>View all</span>} />
        <StatCard label="AI Analyses" value={stats?.ai_analyses || 0}
          icon={RiRobot2Line} iconColor="text-violet-500"
          sub={<span className="text-brand cursor-pointer" onClick={() => navigate('/analysis')}>View all</span>} />
        <StatCard label="Health Score" value={stats?.health_score ? `${stats.health_score}/100` : '—/100'}
          icon={RiHeartPulseLine} iconColor="text-emerald-500"
          sub={stats?.health_score >= 80 ? <span className="text-emerald-600 font-medium">Good</span> : stats?.health_score >= 50 ? <span className="text-amber-600 font-medium">Fair</span> : <span className="text-slate-400">Not available</span>} />
        <StatCard label="Upcoming Appt." value={stats?.upcoming_appointments?.length ? stats.upcoming_appointments[0].date : 'None'}
          icon={RiCalendarLine} iconColor="text-amber-500"
          sub={stats?.upcoming_appointments?.length ? stats.upcoming_appointments[0].time : 'No appointments'} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Recent Report */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Recent Report</h3>
          </div>
          {latest ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-brand/20 flex items-center justify-center flex-shrink-0">
                  <RiFileList3Line className="text-brand text-base" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{latest.file_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(latest.uploaded_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <StatusBadge status={latest.status} />
              </div>
              <div className="flex items-center justify-center h-16 rounded-lg bg-slate-50 dark:bg-slate-800/50 mb-3 text-slate-400 text-xs gap-2">
                <RiFileList3Line className="text-brand text-xl" /> Report Preview
              </div>
              <button onClick={() => navigate(`/analysis/${latest.id}`)}
                className="btn-primary w-full text-center">
                View Full Report
              </button>
            </>
          ) : (
            <EmptyState title="No reports uploaded yet" subtitle="Upload your first report to see analytics" icon={RiFileList3Line} />
          )}
        </Card>

        {/* Health Trend Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Health Trends</h3>
            {hasTrends ? (
              <select 
                value={selectedTrendIdx}
                onChange={(e) => setSelectedTrendIdx(Number(e.target.value))}
                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand">
                {stats.health_trends.map((t, idx) => (
                  <option key={t.parameter_name} value={idx}>{t.parameter_name}</option>
                ))}
              </select>
            ) : null}
          </div>
          {hasTrends ? (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeTrend.data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#4f6ef7" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(v) => [`${v} ${activeTrend.unit}`, activeTrend.parameter_name]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f6ef7" strokeWidth={2.5}
                    fill="url(#trendGrad)" dot={{ r: 4, fill: '#4f6ef7', strokeWidth: 0 }}
                    activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-36 flex items-center justify-center text-slate-400 text-sm">
                No trend data available yet.
             </div>
          )}
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Health Tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-start gap-4 rounded-xl p-4 border border-indigo-100 dark:border-slate-700 bg-gradient-to-br from-[#eef1ff] to-[#f0fdf4] dark:from-[#18243b] dark:to-[#18243b]"
        >
          <div className="text-3xl flex-shrink-0">🥗</div>
          <div>
            <p className="text-xs font-semibold text-brand dark:text-white mb-1">AI Health Tip for You</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
              {stats?.ai_tip || "Upload your first report to receive personalized health tips."}
            </p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: RiUploadCloudLine,       label: 'Upload New Report',    to: '/reports' },
              { icon: RiCalendarLine, label: 'Book Appointment',     to: '/appointments' },
              { icon: RiMessage2Line,     label: 'Chat with AI Assistant', to: '/chat' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.to)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand dark:hover:border-brand hover:bg-primary-50 dark:hover:bg-brand/10 transition-all group text-sm font-medium text-slate-700 dark:text-slate-200">
                <a.icon className="text-brand text-base" />
                {a.label}
                <RiArrowRightLine className="ml-auto text-slate-300 group-hover:text-brand transition-colors" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
