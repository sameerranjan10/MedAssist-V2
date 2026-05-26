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
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-30">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Open menu"
            >
              <RiMenuLine className="text-xl" />
            </button>
            <div className="flex items-center gap-1.5">
              <MedAssistIcon size={24} uid="mobile-layout-logo" />
              <span className="font-semibold text-sm text-slate-800 dark:text-white">MedAssist</span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <FloatingChat />
    </div>
  )
}
