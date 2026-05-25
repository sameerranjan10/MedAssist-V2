/**
 * pages/LandingPage.jsx
 * MedAssist — Premium futuristic healthcare landing page.
 * Light + Dark mode. Layered depth. Floating UI elements. Premium SaaS feel.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiRobot2Line, RiFileSearchLine, RiScanLine, RiLineChartLine,
  RiChat3Line, RiTeamLine, RiDashboardLine, RiArrowRightLine,
  RiPlayCircleLine, RiUploadCloud2Line,
  RiFlashlightLine, RiHeartPulseLine, RiEyeLine, RiStethoscopeLine,
  RiBrainLine, RiHospitalLine, RiCheckDoubleLine,
  RiUserLine, RiMicroscopeLine, RiArrowDownLine, RiSunLine, RiMoonLine,
} from 'react-icons/ri'
import useThemeStore from '@/store/themeStore'
import HealthcareIllo from '@/components/HealthcareIllo'

/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

/* ── Glass Card ── */
function GlassCard({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -5, scale: 1.015 } : {}}
      className={`relative group rounded-2xl border transition-all duration-500
        border-slate-200/60 dark:border-white/[0.08]
        bg-white/70 dark:bg-white/[0.03]
        backdrop-blur-sm dark:backdrop-blur-xl
        shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        hover:shadow-[0_8px_40px_rgba(79,110,247,0.1)] dark:hover:shadow-[0_8px_40px_rgba(34,211,238,0.06)]
        hover:border-brand/30 dark:hover:border-cyan-400/20
        ${className}`}
    >
      {/* Hover glow border (dark mode) */}
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
        hidden dark:block"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.15), transparent, rgba(129,140,248,0.1))',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude', WebkitMaskComposite: 'xor', padding: '1px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

/* ── Section Header ── */
function SectionHeader({ tag, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16 max-w-3xl mx-auto"
    >
      {tag && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide
          bg-brand/10 text-brand border border-brand/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-cyan-400 animate-pulse" />
          {tag}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}
      </h2>
      {desc && <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">{desc}</p>}
    </motion.div>
  )
}

/* ── Animated Counter ── */
function AnimCounter({ end, suffix = '', duration = 2 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const steps = 60, inc = end / steps
    let cur = 0
    const t = setInterval(() => {
      cur += inc
      if (cur >= end) { setVal(end); clearInterval(t) }
      else setVal(Math.floor(cur))
    }, (duration * 1000) / steps)
    return () => clearInterval(t)
  }, [started, end, duration])

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── Mini Chart ── */
function MiniChart({ color = '#4f6ef7', bars = 7 }) {
  return (
    <div className="flex items-end gap-1 h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div key={i}
          initial={{ height: 4 }}
          whileInView={{ height: `${Math.random() * 28 + 8}px` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.08 }}
          className="w-1.5 rounded-full"
          style={{ background: `linear-gradient(to top, ${color}40, ${color})` }}
        />
      ))}
    </div>
  )
}


/* ── Report Scan Demo ── */
function ReportScanDemo() {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  const rows = [
    { label: 'Hemoglobin', value: '14.2 g/dL', status: 'normal' },
    { label: 'WBC Count', value: '11,500 /µL', status: 'high' },
    { label: 'Platelets', value: '245,000 /µL', status: 'normal' },
    { label: 'Blood Sugar', value: '210 mg/dL', status: 'critical' },
    { label: 'Creatinine', value: '0.9 mg/dL', status: 'normal' },
  ]

  return (
    <div className="relative rounded-xl border overflow-hidden
      border-slate-200/60 dark:border-white/[0.08]
      bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-sm
      shadow-lg shadow-black/5 dark:shadow-black/30 p-5">
      {phase >= 1 && phase < 3 && (
        <motion.div animate={{ y: [0, 300] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand dark:via-cyan-400 to-transparent z-20" />
      )}
      <div className="flex items-center gap-2 mb-4">
        <RiFileSearchLine className="text-brand dark:text-cyan-400" />
        <span className="text-xs font-medium text-slate-600 dark:text-white/70">Blood_Report_2025.pdf</span>
        <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${
          phase >= 3 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-brand/10 dark:bg-cyan-500/20 text-brand dark:text-cyan-400'
        }`}>
          {phase < 1 ? 'Uploading…' : phase < 3 ? 'AI Scanning…' : 'Analysis Complete'}
        </span>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <motion.div key={row.label}
            initial={{ opacity: 0, x: -10 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.12 }}
            className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50/80 dark:bg-white/[0.02]">
            <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-800 dark:text-white/90 font-mono">{row.value}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                row.status === 'normal' ? 'bg-emerald-400' : row.status === 'high' ? 'bg-amber-400' : 'bg-red-400 animate-pulse'
              }`} />
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-brand/5 dark:bg-cyan-500/10 border border-brand/20 dark:border-cyan-500/20">
            <div className="flex items-center gap-1.5 mb-1">
              <RiBrainLine className="text-brand dark:text-cyan-400 text-sm" />
              <span className="text-[10px] font-semibold text-brand dark:text-cyan-400 uppercase tracking-wider">AI Summary</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Elevated blood sugar (210 mg/dL) indicates hyperglycemia. WBC slightly above normal. 
              Recommend: fasting glucose retest & HbA1c evaluation.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Dashboard Preview ── */
function DashboardPreview({ title, icon: Icon, role, gradient, items }) {
  return (
    <GlassCard className="p-5 h-full" delay={0.1}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gradient}`}>
          <Icon className="text-white text-lg" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h4>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{role}</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50/80 dark:bg-white/[0.03]">
            <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className="text-slate-800 dark:text-white/80 font-mono text-[11px]">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between items-end">
        <MiniChart color={gradient.includes('cyan') ? '#22d3ee' : gradient.includes('indigo') ? '#818cf8' : gradient.includes('emerald') ? '#34d399' : '#f59e0b'} />
        <span className="text-[10px] text-slate-400">Real-time</span>
      </div>
    </GlassCard>
  )
}

/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()

  const FEATURES = [
    { icon: RiScanLine, title: 'AI Report Analysis', desc: 'Upload any medical report and our AI instantly extracts, categorizes, and analyzes every biomarker with clinical precision.', gradient: 'from-cyan-500 to-blue-600', chartColor: '#22d3ee' },
    { icon: RiEyeLine, title: 'OCR Medical Extraction', desc: 'Advanced OCR engine reads handwritten and printed medical documents, converting them into structured digital data.', gradient: 'from-indigo-500 to-purple-600', chartColor: '#818cf8' },
    { icon: RiLineChartLine, title: 'Health Trend Analytics', desc: 'Track your biomarkers over time with intelligent trend analysis, predictive alerts, and personalized health scores.', gradient: 'from-emerald-500 to-cyan-600', chartColor: '#34d399' },
    { icon: RiChat3Line, title: 'AI Health Assistant', desc: 'Chat with an AI that understands your complete medical history, answers health questions, and provides evidence-based guidance.', gradient: 'from-violet-500 to-indigo-600', chartColor: '#a78bfa' },
    { icon: RiTeamLine, title: 'Doctor Collaboration', desc: 'Doctors review, verify, and annotate AI-analyzed reports. Seamless patient-doctor communication with real-time updates.', gradient: 'from-amber-500 to-orange-600', chartColor: '#fbbf24' },
    { icon: RiDashboardLine, title: 'Smart Dashboard Intelligence', desc: 'Role-based dashboards for patients, doctors, and admins with real-time analytics and actionable insights.', gradient: 'from-rose-500 to-pink-600', chartColor: '#fb7185' },
  ]

  const STATS = [
    { value: 10000, suffix: '+', label: 'Reports Analyzed', icon: RiFileSearchLine },
    { value: 98, suffix: '%', label: 'OCR Accuracy', icon: RiScanLine },
    { value: 500, suffix: '+', label: 'AI Diagnostics Daily', icon: RiBrainLine },
    { value: 24, suffix: '/7', label: 'Real-time Insights', icon: RiFlashlightLine },
  ]

  const DASHBOARDS = [
    { title: 'Patient Dashboard', icon: RiUserLine, role: 'Patient View', gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600', items: [{ label: 'Reports', value: '12' }, { label: 'Health Score', value: '87/100' }, { label: 'Upcoming', value: '2 appts' }] },
    { title: 'Doctor Dashboard', icon: RiStethoscopeLine, role: 'Doctor View', gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600', items: [{ label: 'Pending Reviews', value: '8' }, { label: 'Verified Today', value: '23' }, { label: 'Patients', value: '156' }] },
    { title: 'Admin Dashboard', icon: RiHospitalLine, role: 'Admin View', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600', items: [{ label: 'Total Users', value: '2,847' }, { label: 'Active Doctors', value: '48' }, { label: 'Monthly Reports', value: '1.2K' }] },
    { title: 'Lab Technician', icon: RiMicroscopeLine, role: 'Lab View', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600', items: [{ label: 'Pending OCR', value: '5' }, { label: 'Processed', value: '342' }, { label: 'Accuracy', value: '98.2%' }] },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f7fb] dark:bg-[#030712]">

      {/* ─── Background Layers ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Light mode: soft blue gradients */}
        <div className="dark:hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-brand/[0.06] blur-[120px]" />
          <div className="absolute top-[35%] left-[-8%] w-[500px] h-[500px] rounded-full bg-cyan-400/[0.05] blur-[100px]" />
          <div className="absolute bottom-[-5%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-400/[0.04] blur-[90px]" />
          <div className="absolute top-[60%] left-[40%] w-[300px] h-[300px] rounded-full bg-emerald-300/[0.03] blur-[80px]" />
        </div>
        {/* Dark mode: deep glows */}
        <div className="hidden dark:block">
          <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.08] blur-[120px]" />
          <div className="absolute top-[35%] left-[-8%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[15%] w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[100px]" />
        </div>
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-slate-500" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hGrid)" />
        </svg>

        {/* Subtle EKG heartbeat pulse waves across the background */}
        <svg className="absolute top-[18%] left-0 w-full h-[180px] opacity-[0.04] dark:opacity-[0.03] text-brand dark:text-cyan-400"
          viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,90 L300,90 L315,60 L330,120 L345,75 L360,95 L375,90 L750,90 L765,40 L780,140 L795,70 L810,105 L825,90 L1100,90 L1115,55 L1130,125 L1145,75 L1160,98 L1175,90 L1440,90"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg className="absolute top-[55%] left-0 w-full h-[180px] opacity-[0.03] dark:opacity-[0.02] text-brand dark:text-cyan-400"
          viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,90 L150,90 L165,55 L180,125 L195,75 L210,98 L225,90 L600,90 L615,60 L630,120 L645,75 L660,95 L675,90 L1050,90 L1065,40 L1080,140 L1095,70 L1110,105 L1125,90 L1440,90"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Subtle watermark medical symbols */}
        <div className="absolute top-[14%] left-[6%] text-[140px] opacity-[0.03] dark:opacity-[0.02] text-brand dark:text-cyan-400 select-none">
          <RiHospitalLine />
        </div>
        <div className="absolute top-[48%] right-[4%] text-[200px] opacity-[0.025] dark:opacity-[0.015] text-brand dark:text-cyan-400 select-none animate-pulse" style={{ animationDuration: '4s' }}>
          <RiHeartPulseLine />
        </div>
        <div className="absolute bottom-[8%] left-[7%] text-[130px] opacity-[0.03] dark:opacity-[0.02] text-brand dark:text-cyan-400 select-none">
          <RiStethoscopeLine />
        </div>
      </div>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50
        bg-white/70 dark:bg-[#030712]/60
        backdrop-blur-xl
        border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center
              shadow-md shadow-brand/20">
              <RiHeartPulseLine className="text-white text-lg" />
            </div>
            <span className="text-lg font-bold text-slate-800 dark:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Med<span className="text-brand dark:text-cyan-400">Assist</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Analysis', 'Dashboards', 'Metrics'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors duration-300">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} title="Toggle Theme"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white
                hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
              {theme === 'dark' ? <RiSunLine className="text-lg" /> : <RiMoonLine className="text-lg" />}
            </button>
            <button onClick={() => navigate('/login')}
              className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="text-sm font-medium px-5 py-2 rounded-xl
                bg-gradient-to-r from-brand to-indigo-500 dark:from-cyan-500 dark:to-indigo-500
                text-white shadow-lg shadow-brand/25 dark:shadow-cyan-500/20
                hover:shadow-xl hover:shadow-brand/30 dark:hover:shadow-cyan-500/30
                hover:scale-[1.03] transition-all duration-300 active:scale-[0.97]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
         HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="relative z-20 pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[520px]">
            {/* ── Left: Copy ── */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6
                  bg-brand/10 text-brand border border-brand/20
                  dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-cyan-400 animate-pulse" />
                AI-Powered Healthcare Intelligence
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold leading-[1.1] mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-slate-900 dark:text-white">Transform Medical Reports Into </span>
                <span className="bg-gradient-to-r from-brand via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                  Intelligent Health Insights
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-8 max-w-xl">
                AI-powered report analysis, OCR extraction, smart health tracking,
                and intelligent medical assistance — all in one platform.
              </motion.p>

              {/* CTA Buttons — premium style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-brand to-indigo-500 dark:from-cyan-500 dark:to-indigo-500
                    text-white
                    shadow-[0_4px_25px_rgba(79,110,247,0.35)] dark:shadow-[0_4px_25px_rgba(34,211,238,0.3)]
                    hover:shadow-[0_6px_35px_rgba(79,110,247,0.45)] dark:hover:shadow-[0_6px_35px_rgba(34,211,238,0.4)]
                    hover:scale-[1.04] transition-all duration-300 active:scale-[0.97]">
                  Get Started <RiArrowRightLine />
                </button>
                <button onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm
                    border border-slate-200/80 dark:border-white/10
                    text-slate-700 dark:text-white/90
                    bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm
                    hover:bg-white dark:hover:bg-white/[0.08]
                    hover:border-brand/30 dark:hover:border-cyan-400/20
                    hover:shadow-lg hover:shadow-brand/5 dark:hover:shadow-cyan-500/5
                    transition-all duration-300 active:scale-[0.97]">
                  <RiUploadCloud2Line /> Upload Report
                </button>
                <button className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm
                    text-slate-400 hover:text-brand dark:hover:text-cyan-400 transition-all duration-300">
                  <RiPlayCircleLine className="text-lg" /> Watch Demo
                </button>
              </motion.div>

              {/* Trusted by */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mt-10 flex items-center gap-5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Trusted by</span>
                <div className="flex items-center gap-2">
                  {['AIIMS', 'Apollo', 'Fortis', 'Max Health'].map((n) => (
                    <span key={n} className="text-[11px] font-medium text-slate-400 dark:text-slate-600 px-3 py-1.5 rounded-lg
                      bg-white/60 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] backdrop-blur-sm">
                      {n}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── Right: Layered Hero Composition ── */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative flex items-center justify-center min-h-[480px]"
              >
                {/* Layer 1: Large glow circle */}
                <div className="absolute w-[380px] h-[380px] rounded-full
                  bg-gradient-to-br from-brand/10 via-cyan-400/5 to-indigo-500/10
                  dark:from-cyan-400/15 dark:via-indigo-500/10 dark:to-brand/15
                  blur-3xl" />

                {/* Layer 2: Secondary breathing glow */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-[300px] h-[300px] rounded-full
                    bg-brand/[0.06] dark:bg-cyan-500/[0.08] blur-[60px]" />

                {/* Layer 3: Interactive Zdog Illustration */}
                <div className="relative z-10">
                  <HealthcareIllo width={420} height={420} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating Stats Strip ─── */}
      <section className="relative z-20 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-6
              bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl
              border-slate-200/60 dark:border-white/[0.06]
              shadow-lg shadow-black/[0.03] dark:shadow-black/20"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <stat.icon className="text-2xl text-brand dark:text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-0.5"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll indicator */}
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="flex justify-center py-6 relative z-20">
        <RiArrowDownLine className="text-slate-300 dark:text-slate-600 text-xl" />
      </motion.div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative z-20 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Platform Features"
            title="Everything You Need for Intelligent Healthcare"
            desc="Six powerful modules working together to revolutionize how medical data is processed, analyzed, and acted upon." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <GlassCard key={i} className="p-6" delay={i * 0.08}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4
                  shadow-lg shadow-black/10`}>
                  <f.icon className="text-white text-xl" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <MiniChart color={f.chartColor} bars={6} />
                  <span className="text-xs text-slate-400 flex items-center gap-1 group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors">
                    Learn more <RiArrowRightLine />
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI REPORT ANALYSIS DEMO ─── */}
      <section id="analysis" className="relative z-20 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader tag="Live AI Demo" title="See AI Analysis in Action"
                desc="Watch how MedAssist processes a real blood report — from upload to intelligent diagnosis in seconds." />
              <div className="space-y-4 mt-2">
                {[
                  { icon: RiUploadCloud2Line, label: 'Upload any medical report (PDF, image, or scan)' },
                  { icon: RiScanLine, label: 'AI extracts values using advanced OCR technology' },
                  { icon: RiFlashlightLine, label: 'Abnormal values flagged with clinical context' },
                  { icon: RiBrainLine, label: 'AI generates personalized summary & recommendations' },
                ].map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 dark:bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                      <s.icon className="text-brand dark:text-cyan-400" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <ReportScanDemo />
          </div>
        </div>
      </section>

      {/* ─── MULTI-ROLE DASHBOARDS ─── */}
      <section id="dashboards" className="relative z-20 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Multi-Role Dashboards" title="One Platform, Every Perspective"
            desc="Tailored dashboards for patients, doctors, administrators, and lab technicians." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DASHBOARDS.map((d, i) => <DashboardPreview key={i} {...d} />)}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-20 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionHeader tag="How It Works" title="From Upload to Insight in 3 Steps" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: RiUploadCloud2Line, title: 'Upload Report', desc: 'Upload any medical report — PDF, image, or scanned document. Our OCR handles the rest.' },
              { step: '02', icon: RiBrainLine, title: 'AI Analyzes', desc: 'Our AI engine processes, extracts, categorizes and identifies anomalies with clinical precision.' },
              { step: '03', icon: RiCheckDoubleLine, title: 'Get Insights', desc: 'Receive AI-generated summaries, health scores, trend analysis, and actionable recommendations.' },
            ].map((item, i) => (
              <GlassCard key={i} className="p-6 text-center" delay={i * 0.15}>
                <span className="text-4xl font-bold bg-gradient-to-b from-slate-200 dark:from-white/20 to-slate-100 dark:to-white/5 bg-clip-text text-transparent mb-4 block"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-brand/10 dark:bg-brand/20 border border-brand/10 dark:border-white/[0.08] flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-brand dark:text-cyan-400 text-xl" />
                </div>
                <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-20 py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-10 md:p-14 text-center overflow-hidden" hover={false}>
            {/* Accent glow */}
            <div className="absolute inset-0 rounded-2xl
              bg-gradient-to-br from-brand/[0.04] to-cyan-500/[0.03]
              dark:from-cyan-500/[0.06] dark:to-indigo-500/[0.04] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px
              bg-gradient-to-r from-transparent via-brand/30 dark:via-cyan-400/30 to-transparent" />

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-indigo-600 dark:from-cyan-500 dark:to-indigo-500 flex items-center justify-center mx-auto mb-6
                shadow-lg shadow-brand/25 dark:shadow-cyan-500/25">
                <RiRobot2Line className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ready to Experience the Future of Healthcare?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-base mb-8 max-w-2xl mx-auto">
                Join thousands of patients and healthcare providers already using MedAssist
                to transform medical reports into actionable health intelligence.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-brand to-indigo-500 dark:from-cyan-500 dark:to-indigo-500
                    text-white
                    shadow-[0_4px_25px_rgba(79,110,247,0.35)] dark:shadow-[0_4px_25px_rgba(34,211,238,0.3)]
                    hover:shadow-[0_6px_35px_rgba(79,110,247,0.45)] dark:hover:shadow-[0_6px_35px_rgba(34,211,238,0.4)]
                    hover:scale-[1.04] transition-all duration-300 active:scale-[0.98]">
                  Start Free Today <RiArrowRightLine />
                </button>
                <button onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm
                    border border-slate-200/80 dark:border-white/10
                    text-slate-700 dark:text-white/90
                    bg-white/60 dark:bg-white/[0.04] backdrop-blur-sm
                    hover:bg-white dark:hover:bg-white/[0.08] transition-all duration-300">
                  Sign In
                </button>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-20 border-t border-slate-200 dark:border-white/[0.05] py-12 px-6
        bg-white/40 dark:bg-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-indigo-600 flex items-center justify-center shadow-md shadow-brand/15">
                  <RiHeartPulseLine className="text-white text-sm" />
                </div>
                <span className="text-base font-bold text-slate-800 dark:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Med<span className="text-brand dark:text-cyan-400">Assist</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI-powered healthcare intelligence platform transforming medical data into actionable health insights.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'AI Analysis', 'Dashboard', 'Pricing'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'HIPAA', 'Security'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-white uppercase tracking-wider mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-xs text-slate-500 hover:text-brand dark:hover:text-cyan-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200/60 dark:border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400">© 2025 MedAssist. All rights reserved.</p>
            <p className="text-[11px] text-slate-400">Built with AI for the future of healthcare.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
