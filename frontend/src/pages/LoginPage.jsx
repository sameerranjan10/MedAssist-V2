/**
 * pages/LoginPage.jsx
 * Animated login form — JWT auth → Zustand store → role-based redirect.
 * Styled exactly like RegisterPage with a beautiful background image on the right.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiHeartPulseLine, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiLoader4Line } from 'react-icons/ri'
import { authAPI } from '@/api/services'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const { login } = useAuthStore()
  const { theme } = useThemeStore()
  const navigate  = useNavigate()

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      toast.success(`Welcome back, ${data.full_name}!`)
      const dest = data.role === 'doctor' ? '/doctor' : data.role === 'admin' ? '/admin' : '/dashboard'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#fafbff 100%)' }}>
      {/* Left panel */}
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

      {/* Right — form (with background image overlay) */}
      <div
        className="flex-1 flex items-center justify-center px-6 relative"
        style={{
          backgroundImage: theme === 'dark'
            ? 'linear-gradient(rgba(3, 7, 18, 0.9), rgba(3, 7, 18, 0.9)), url(/doctor-patient-consult.jpg)'
            : 'linear-gradient(rgba(245, 247, 251, 0.85), rgba(245, 247, 251, 0.85)), url(/doctor-patient-consult.jpg)',
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

          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Welcome back — enter your details below</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  className="input pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="input pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2">
              {loading ? <><RiLoader4Line className="animate-spin" /> Signing in…</> : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {"Don't have an account? "}
            <Link to="/register" className="text-brand dark:text-cyan-400 font-medium hover:underline">
              Create one
            </Link>
          </p>


        </motion.div>
      </div>
    </div>
  )
}
