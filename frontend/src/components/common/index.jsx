/**
 * components/common/index.jsx
 * Shared UI building blocks used across all dashboard pages.
 */
import { motion } from 'framer-motion'
import { RiLoader4Line, RiInboxLine } from 'react-icons/ri'

export { default as FloatingChat } from './FloatingChat'

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, iconColor = 'text-brand', trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          {Icon && <Icon className={`text-base ${iconColor}`} />}
          {label}
        </p>
      </div>
      <p className="text-2xl font-semibold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
      {trend && (
        <p className={`text-[11px] mt-1 font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </p>
      )}
    </motion.div>
  )
}

// ── Status Badge ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  low:        'badge-low',
  high:       'badge-high',
  normal:     'badge-normal',
  critical:   'badge-critical',
  pending:    'badge-pending',
  pending_verification: 'badge-pending',
  verified:   'badge-verified',
  rejected:   'badge-rejected',
  processing: 'badge-processing',
  uploaded:   'badge-pending',
  analyzed:   'badge-pending',
  mild_abnormal: 'bg-amber-100 text-amber-700 badge',
  abnormal:   'badge-low',
}

export function StatusBadge({ status, label }) {
  const cls = STATUS_MAP[status?.toLowerCase()] || 'badge bg-slate-100 text-slate-600'
  const text = label || (status ? status.replace(/_/g, ' ') : '—')
  return <span className={cls}>{text}</span>
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, emoji }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
          {emoji && <span className="mr-2">{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">{actions}</div>}
    </div>
  )
}

// ── Section Title ─────────────────────────────────────────────────────────────
export function SectionTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-semibold text-slate-700 mb-2.5 ${className}`}>
      {children}
    </h3>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function LoadingSpinner({ text = 'Loading…', fullPage = false }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <RiLoader4Line className="text-brand text-3xl animate-spin" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
  if (fullPage) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">{inner}</div>
    )
  }
  return <div className="flex items-center justify-center py-10">{inner}</div>
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ title = 'Nothing here yet', subtitle, icon: Icon = RiInboxLine, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <Icon className="text-4xl text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1 max-w-xs">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`card ${onClick ? 'cursor-pointer card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 8, color = 'bg-brand' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ className = '' }) {
  return <hr className={`border-slate-100 ${className}`} />
}

// ── Inline Error ──────────────────────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
      {message}
    </div>
  )
}
