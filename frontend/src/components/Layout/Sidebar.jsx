/**
 * components/Layout/Sidebar.jsx
 * Navy sidebar with role-based navigation links.
 */
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiDashboardLine, RiFileList3Line, RiMicroscopeLine,
  RiRobot2Line, RiLineChartLine, RiCalendarLine,
  RiStethoscopeLine, RiHospitalLine, RiUserLine,
  RiSettingsLine, RiLogoutBoxLine, RiHeartPulseLine,
  RiShieldCheckLine, RiTeamLine, RiBuilding2Line,
  RiFileTextLine,RiVerifiedBadgeLine, RiSunLine, RiMoonLine
} from 'react-icons/ri'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import toast from 'react-hot-toast'
import MedAssistIcon from '@/components/MedAssistIcon'

const NAV_ITEMS = {
  patient: [
    { label: 'Dashboard',      icon: RiDashboardLine,  to: '/dashboard' },
    { label: 'My Reports',     icon: RiFileList3Line,   to: '/reports' },
    { label: 'AI Analysis',    icon: RiMicroscopeLine,  to: '/analysis' },
    { label: 'Chat Assistant', icon: RiRobot2Line,      to: '/chat' },
    { label: 'Health Trends',  icon: RiLineChartLine,   to: '/trends' },
    { label: 'Appointments',   icon: RiCalendarLine,    to: '/appointments' },
    { label: 'Profile',        icon: RiUserLine,        to: '/profile' },
    { label: 'Settings',       icon: RiSettingsLine,    to: '/settings' },
  ],
  doctor: [
    { label: 'Dashboard',        icon: RiDashboardLine,     to: '/doctor' },
    { label: 'Pending Reports',  icon: RiFileTextLine,   to: '/doctor/pending', badge: true },
    { label: 'Verified Reports', icon: RiVerifiedBadgeLine, to: '/doctor/verified' },
    { label: 'Patients',         icon: RiTeamLine,          to: '/doctor/patients' },
    { label: 'Appointments',     icon: RiCalendarLine,      to: '/doctor/appointments' },
    { label: 'Profile',          icon: RiUserLine,          to: '/doctor/profile' },
    { label: 'Settings',         icon: RiSettingsLine,      to: '/doctor/settings' },
  ],
  admin: [
    { label: 'Dashboard',   icon: RiDashboardLine,   to: '/admin' },
    { label: 'Doctors',     icon: RiStethoscopeLine, to: '/admin/doctors' },
    { label: 'Patients',    icon: RiTeamLine,        to: '/admin/users' },
    { label: 'Reports',     icon: RiFileList3Line,   to: '/admin/reports' },
    { label: 'Verifications',icon: RiShieldCheckLine,to: '/admin/verifications' },
    { label: 'Hospitals',   icon: RiBuilding2Line,   to: '/admin/hospitals' },
    { label: 'Analytics',   icon: RiLineChartLine,   to: '/admin/analytics' },
    { label: 'Settings',    icon: RiSettingsLine,    to: '/admin/settings' },
  ],
}

const PORTAL_LABELS = {
  patient: null,
  doctor: 'Doctor Portal',
  admin: 'Hospital Admin',
}

export default function Sidebar({ role }) {
  const { user, logout, getInitials } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore() // Vite trigger reload
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || NAV_ITEMS.patient

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <motion.aside
      initial={{ x: -220 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-[190px] flex-shrink-0 flex flex-col overflow-y-auto"
      style={{ background: '#14114a' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <MedAssistIcon size={32} uid="sidebar" />
        <span className="text-white font-semibold text-[15px]">
          {PORTAL_LABELS[role] ?? 'MedAssist'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-2 px-0">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/doctor' || item.to === '/admin'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="text-base flex-shrink-0" />
            <span className="text-[12.5px]">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full">
                8
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade box — patient only */}
      {role === 'patient' && (
        <div className="mx-3 mb-3 rounded-xl p-3"
          style={{ background: 'linear-gradient(135deg,#4f6ef7,#7c3aed)' }}>
          <p className="text-white/80 text-[11px] mb-2 leading-snug">
            Unlock advanced insights and priority support.
          </p>
          <button className="w-full bg-white text-brand text-[11px] font-semibold py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}

      {/* User row */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
            {getInitials()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-[12px] font-medium truncate">{user?.full_name}</p>
            <p className="text-white/50 text-[11px] capitalize">{role}</p>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <button onClick={toggleTheme} title="Toggle Theme"
              className="text-white/40 hover:text-white/80 transition-colors">
              {theme === 'dark' ? <RiSunLine className="text-sm" /> : <RiMoonLine className="text-sm" />}
            </button>
            <button onClick={handleLogout} title="Logout"
              className="text-white/40 hover:text-white/80 transition-colors">
              <RiLogoutBoxLine className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
