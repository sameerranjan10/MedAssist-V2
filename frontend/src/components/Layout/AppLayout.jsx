/**
 * components/Layout/AppLayout.jsx
 * Shell with sidebar + main content area.
 * Renders different nav items based on role prop.
 */
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { FloatingChat } from '@/components/common'

export default function AppLayout({ role }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <FloatingChat />
    </div>
  )
}
