/**
 * App.jsx
 * Root router — public routes (auth) + role-protected dashboard routes.
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from '@/store/authStore'

// Auth pages
import LoginPage    from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import LandingPage  from '@/pages/LandingPage'

// Layout
import AppLayout from '@/components/Layout/AppLayout'

// Patient pages
import PatientDashboard  from '@/pages/patient/Dashboard'
import MyReports         from '@/pages/patient/MyReports'
import AIAnalysis        from '@/pages/patient/AIAnalysis'
import ChatAssistant     from '@/pages/patient/ChatAssistant'
import HealthTrends      from '@/pages/patient/HealthTrends'
import Appointments      from '@/pages/patient/Appointments'
import PatientProfile    from '@/pages/patient/Profile'
import PatientSettings   from '@/pages/patient/Settings'

// Doctor pages
import DoctorDashboard      from '@/pages/doctor/DoctorDashboard'
import PendingReports       from '@/pages/doctor/PendingReports'
import ReportVerify         from '@/pages/doctor/ReportVerify'
import VerifiedReports      from '@/pages/doctor/VerifiedReports'
import DoctorPatients       from '@/pages/doctor/DoctorPatients'
import DoctorAppointments   from '@/pages/doctor/DoctorAppointments'
import DoctorProfile        from '@/pages/doctor/DoctorProfile'
import DoctorSettings       from '@/pages/doctor/DoctorSettings'

// Admin pages
import AdminDashboard      from '@/pages/admin/AdminDashboard'
import ManageUsers         from '@/pages/admin/ManageUsers'
import ManageHospitals     from '@/pages/admin/ManageHospitals'
import ManageDoctors       from '@/pages/admin/ManageDoctors'
import ManageReports       from '@/pages/admin/ManageReports'
import AdminVerifications  from '@/pages/admin/AdminVerifications'
import AdminAnalytics      from '@/pages/admin/AdminAnalytics'
import AdminSettings       from '@/pages/admin/AdminSettings'

/** Redirect unauthenticated users to /login */
function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

/** Redirect already-logged-in users away from auth pages */
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    const dest = user?.role === 'doctor' ? '/doctor' : user?.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Patient routes */}
      <Route element={<PrivateRoute allowedRoles={['patient']}><AppLayout role="patient" /></PrivateRoute>}>
        <Route path="/dashboard"    element={<PatientDashboard />} />
        <Route path="/reports"      element={<MyReports />} />
        <Route path="/analysis/:id" element={<AIAnalysis />} />
        <Route path="/analysis"     element={<AIAnalysis />} />
        <Route path="/chat"         element={<ChatAssistant />} />
        <Route path="/trends"       element={<HealthTrends />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/profile"      element={<PatientProfile />} />
        <Route path="/settings"     element={<PatientSettings />} />
      </Route>

      {/* Doctor routes */}
      <Route path="/doctor" element={<PrivateRoute allowedRoles={['doctor']}><AppLayout role="doctor" /></PrivateRoute>}>
        <Route index              element={<DoctorDashboard />} />
        <Route path="pending"     element={<PendingReports />} />
        <Route path="verify/:id"  element={<ReportVerify />} />
        <Route path="verified"    element={<VerifiedReports />} />
        <Route path="patients"    element={<DoctorPatients />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="profile"     element={<DoctorProfile />} />
        <Route path="settings"    element={<DoctorSettings />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><AppLayout role="admin" /></PrivateRoute>}>
        <Route index                 element={<AdminDashboard />} />
        <Route path="users"          element={<ManageUsers />} />
        <Route path="doctors"        element={<ManageDoctors />} />
        <Route path="reports"        element={<ManageReports />} />
        <Route path="verifications"  element={<AdminVerifications />} />
        <Route path="hospitals"      element={<ManageHospitals />} />
        <Route path="analytics"      element={<AdminAnalytics />} />
        <Route path="settings"       element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
