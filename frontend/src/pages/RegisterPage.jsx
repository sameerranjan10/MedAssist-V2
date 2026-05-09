/**
 * pages/RegisterPage.jsx
 * New account creation — role selection, form validation, JWT on success.
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
    <div className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#fafbff 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
            <RiHeartPulseLine className="text-white text-lg" />
          </div>
          <span className="font-semibold text-slate-800 text-lg">MedAssist</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create account</h1>
        <p className="text-sm text-slate-500 mb-6">Start your health intelligence journey</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    form.role === r.value
                      ? 'border-brand bg-primary-50 ring-1 ring-brand/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}>
                  <div className="text-lg mb-1">{r.emoji}</div>
                  <div className="text-xs font-medium text-slate-700">{r.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Full name</label>
            <div className="relative">
              <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="full_name" value={form.full_name} onChange={handleChange}
                placeholder="Rohan Sharma" className="input pl-9" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email address</label>
            <div className="relative">
              <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@example.com" className="input pl-9" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                placeholder="Min. 8 characters" className="input pl-9 pr-10" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
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
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-1">
            {loading ? <><RiLoader4Line className="animate-spin" /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
