/**
 * utils/index.js
 * Shared frontend utility functions.
 */

// ── Date formatting ───────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${date} • ${time}`
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(dateStr)
}

// ── File helpers ──────────────────────────────────────────────────────────────
export function fileSizeLabel(kb) {
  if (!kb) return '—'
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

export function fileTypeIcon(type) {
  const icons = { pdf: '📄', png: '🖼️', jpg: '🖼️', jpeg: '🖼️', tiff: '🖼️' }
  return icons[type?.toLowerCase()] || '📎'
}

// ── Status helpers ────────────────────────────────────────────────────────────
export function statusLabel(status) {
  const labels = {
    uploaded:             'Uploaded',
    processing:           'Processing',
    analyzed:             'Analyzed',
    pending_verification: 'Pending Review',
    verified:             'Verified',
    rejected:             'Rejected',
  }
  return labels[status] || status?.replace(/_/g, ' ') || '—'
}

export function overallStatusLabel(status) {
  const labels = {
    normal:        'All Normal',
    mild_abnormal: 'Mild Abnormalities',
    abnormal:      'Abnormal',
    critical:      'Critical',
  }
  return labels[status] || status?.replace(/_/g, ' ') || '—'
}

export function healthScoreLabel(score) {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600' }
  if (score >= 70) return { label: 'Good',      color: 'text-emerald-500' }
  if (score >= 55) return { label: 'Fair',      color: 'text-amber-500' }
  if (score >= 40) return { label: 'Below Avg', color: 'text-orange-500' }
  return              { label: 'Poor',      color: 'text-red-500' }
}

// ── String helpers ────────────────────────────────────────────────────────────
export function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function truncate(str, max = 40) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ── Number helpers ────────────────────────────────────────────────────────────
export function formatNumber(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-IN')
}

export function pct(value, total) {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

// ── Colour helpers ────────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  normal:   '#22c55e',
  low:      '#ef4444',
  high:     '#f59e0b',
  critical: '#dc2626',
  unknown:  '#94a3b8',
}

export const CHART_PALETTE = [
  '#4f6ef7', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#64748b',
]
