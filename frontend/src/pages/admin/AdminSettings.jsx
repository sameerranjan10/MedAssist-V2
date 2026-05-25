import { PageHeader, Card } from '@/components/common'
import useThemeStore from '@/store/themeStore'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="p-6">
      <PageHeader title="Settings" subtitle="Manage system configurations" />
      <Card>
        <div className="space-y-5 max-w-md">
          {/* Appearance Section */}
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Appearance</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} className="text-brand focus:ring-brand" />
                Light Mode
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="text-brand focus:ring-brand" />
                Dark Mode
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Notifications</h4>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name</label>
            <input type="text" className="input" defaultValue="MedAssist" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
            <input type="email" className="input" defaultValue="admin@medassist.local" />
          </div>
          <div className="pt-2">
            <button className="btn-primary" onClick={() => toast.success('Preferences saved successfully')}>Save Changes</button>
          </div>
        </div>
      </Card>
    </div>
  )
}
