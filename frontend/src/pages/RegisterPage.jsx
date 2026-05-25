/**
 * pages/RegisterPage.jsx
 * New account creation — role selection, form validation, JWT on success.
 * Styled exactly like LoginPage (two-column premium layout) with background image.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiHeartPulseLine, RiMailLine, RiLockLine,
  RiUserLine, RiLoader4Line, RiEyeLine, RiEyeOffLine,
} from 'react-icons/ri'
import { authAPI } from '@/api/services'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'patient', label: 'Patient',      emoji: '🧑‍⚕️', desc: 'Upload & analyse reports' },
  { value: 'doctor',  label: 'Doctor',       emoji: '👨‍⚕️', desc: 'Verify AI findings' },
  { value: 'admin',   label: 'Hospital Admin', emoji: '🏥', desc: 'Manage the platform' },
]

export default function RegisterPage() {
  const [form, setForm]         = useState({ full_name: '', email: '', password: '', role: 'patient' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login }  = useAuthStore()
  const { theme }  = useThemeStore()
  const navigate   = useNavigate()

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      login(data)
      toast.success('Account created! Welcome to MedAssist.')
      const dest = data.role === 'doctor' ? '/doctor' : data.role === 'admin' ? '/admin' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#fafbff 100%)' }}>
      {/* Left panel (matching LoginPage) */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-center px-16 w-[480px] flex-shrink-0"
        style={{ background: '#14114a' }}
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
            <RiHeartPulseLine className="text-white text-xl" />
          </div>
          <span className="text-white text-xl font-semibold">MedAssist</span>
        </div>
        <h2 className="text-white text-3xl font-bold mb-4 leading-tight">
          Your AI-powered<br />health intelligence<br />platform
        </h2>
        <p className="text-white/60 text-sm leading-relaxed mb-10">
          Upload medical reports, get instant AI analysis, and connect with certified doctors — all in one secure platform.
        </p>
        <div className="space-y-4">
          {[
            { icon: '🔬', title: 'AI Report Analysis',  desc: 'Instant insights from lab reports' },
            { icon: '💬', title: 'RAG Chatbot',         desc: 'Ask questions about your reports' },
            { icon: '✅', title: 'Doctor Verification', desc: 'Certified doctors review your reports' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{f.title}</p>
                <p className="text-white/50 text-xs">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right — form (matching LoginPage, with background image overlay) */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto relative"
        style={{
          backgroundImage: theme === 'dark'
            ? 'linear-gradient(rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.9)), url(/doctor-patient-xray.jpg)'
            : 'linear-gradient(rgba(245, 247, 251, 0.85), rgba(245, 247, 251, 0.85)), url(/doctor-patient-xray.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md bg-transparent"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <RiHeartPulseLine className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-white">MedAssist</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Start your health intelligence journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      form.role === r.value
                        ? 'border-brand bg-primary-50 ring-1 ring-brand/30 dark:bg-brand/10 dark:border-brand'
                        : 'border-slate-200 hover:border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}>
                    <div className="text-lg mb-1">{r.emoji}</div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{r.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="full_name" value={form.full_name} onChange={handleChange}
                  placeholder="Rohan Sharma" className="input pl-9" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" className="input pl-9" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 8 characters" className="input pl-9 pr-10" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2">
              {loading ? <><RiLoader4Line className="animate-spin" /> Creating account…</> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {"Already have an account? "}
            <Link to="/login" className="text-brand dark:text-cyan-400 font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
