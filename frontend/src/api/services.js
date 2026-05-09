/**
 * api/services.js
 * All API call functions grouped by domain.
 */
import api from './client'

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post('/api/auth/register', data),
  login:    (data)  => api.post('/api/auth/login', data),
  me:       ()      => api.get('/api/auth/me'),
  logout:   ()      => api.post('/api/auth/logout'),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  stats: () => api.get('/api/dashboard/stats'),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportsAPI = {
  upload:      (formData)   => api.post('/api/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list:        (params)     => api.get('/api/reports', { params }),
  get:         (id)         => api.get(`/api/reports/${id}`),
  getAnalysis: (id)         => api.get(`/api/reports/${id}/analysis`),
  delete:      (id)         => api.delete(`/api/reports/${id}`),
}

// ── Chatbot ───────────────────────────────────────────────────────────────────
export const chatAPI = {
  ask:        (data)        => api.post('/api/chatbot/ask', data),
  history:    (reportId)    => api.get(`/api/chatbot/${reportId}/history`),
  clearHistory:(reportId)   => api.delete(`/api/chatbot/${reportId}/history`),
}

// ── Doctor ────────────────────────────────────────────────────────────────────
export const doctorAPI = {
  pendingReports:  (params) => api.get('/api/doctor/pending-reports', { params }),
  getReportDetail: (id)     => api.get(`/api/doctor/reports/${id}`),
  verify:          (data)   => api.post('/api/doctor/verify', data),
  stats:           ()       => api.get('/api/doctor/stats'),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats:              ()        => api.get('/api/admin/stats'),
  listUsers:          (params)  => api.get('/api/admin/users', { params }),
  toggleUser:         (id)      => api.patch(`/api/admin/users/${id}/toggle-active`),
  verifyDoctorLicense:(id)      => api.patch(`/api/admin/doctors/${id}/verify-license`),
  listHospitals:      ()        => api.get('/api/admin/hospitals'),
  createHospital:     (data)    => api.post('/api/admin/hospitals', data),
  listReports:        (params)  => api.get('/api/admin/reports', { params }),
}
