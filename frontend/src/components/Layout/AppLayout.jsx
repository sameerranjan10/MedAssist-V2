/**
 * components/Layout/AppLayout.jsx
 * Shell with sidebar + main content area.
 * Renders different nav items based on role prop.
 */
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { FloatingChat } from '@/components/common'
import { RiMenuLine } from 'react-icons/ri'
import MedAssistIcon from '@/components/MedAssistIcon'
import DockNav from './DockNav'
import { NAV_ITEMS } from './Sidebar'

export default function AppLayout({ role }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
      {/* Mobile Backdrop overlay when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="flex md:hidden items-center px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-30">
          <div className="flex items-center gap-1.5">
            <MedAssistIcon size={24} uid="mobile-layout-logo" />
            <span className="font-semibold text-sm text-slate-800 dark:text-white">MedAssist</span>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
        
        {/* Mobile Dock Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white via-white/80 dark:from-slate-900 dark:via-slate-900/80 to-transparent">
          <DockNav items={NAV_ITEMS[role] || NAV_ITEMS.patient} />
        </div>
      </div>

      <FloatingChat />
    </div>
  )
}
