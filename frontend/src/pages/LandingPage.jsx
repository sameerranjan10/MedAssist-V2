/**
 * pages/LandingPage.jsx
 * MedAssist — Premium futuristic healthcare landing page.
 * Editorial SaaS feel. Dark layered surfaces. Subtle glow.
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  RiRobot2Line, RiFileSearchLine, RiScanLine, RiLineChartLine,
  RiChat3Line, RiTeamLine, RiDashboardLine, RiArrowRightLine,
  RiPlayCircleLine, RiUploadCloud2Line,
  RiFlashlightLine, RiHeartPulseLine, RiEyeLine, RiStethoscopeLine,
  RiBrainLine, RiHospitalLine, RiCheckDoubleLine,
  RiUserLine, RiMicroscopeLine, RiArrowDownLine, RiSunLine, RiMoonLine,
} from 'react-icons/ri'
import useThemeStore from '@/store/themeStore'
import MedAssistIcon from '@/components/MedAssistIcon'


/* ═══════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════ */
const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}

const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
}


/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

/* ── Premium Card ── */
function PremiumCard({ children, className = '', hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : {}}
      className={`relative group rounded-[24px] border transition-all duration-500
        border-slate-200/80 dark:border-white/10
        bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl
        shadow-card dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)]
        hover:shadow-card-hover dark:hover:shadow-[0_8px_40px_rgba(34,211,238,0.2)]
        hover:border-brand/30 dark:hover:border-cyan-400/30
        overflow-hidden
        ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}

/* ── Section Header ── */
function SectionHeader({ tag, title, desc, align = 'center' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      className={`mb-16 md:mb-20 ${align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left max-w-2xl'}`}
    >
      {tag && (
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase
          bg-brand/10 text-brand border border-brand/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/30 mb-6 
          shadow-sm dark:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-cyan-400 animate-pulse" />
          {tag}
        </span>
      )}
      <h2 className="font-sora text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-[1.2] tracking-tight mb-5 dark:drop-shadow-sm">
        {title}
      </h2>
      {desc && <p className="text-slate-500 dark:text-slate-300 text-base md:text-lg leading-relaxed">{desc}</p>}
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
    <div className="flex items-end gap-1.5 h-10">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div key={i}
          initial={{ height: 4 }}
          whileInView={{ height: `${Math.random() * 28 + 8}px` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.08 }}
          className="w-1.5 rounded-full"
          style={{ background: `linear-gradient(to top, ${color}30, ${color})` }}
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative rounded-[24px] border overflow-hidden
      border-slate-200/80 dark:border-white/10
      bg-white/90 dark:bg-white/[0.03] backdrop-blur-3xl
      shadow-card dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 md:p-8">
      
      {/* Scanning Laser */}
      {phase >= 1 && phase < 3 && (
        <motion.div animate={{ y: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand dark:via-cyan-400 to-transparent shadow-[0_0_10px_rgba(79,110,247,0.5)] dark:shadow-[0_0_20px_rgba(34,211,238,0.8)] z-20" />
      )}
      
      <div className="flex items-center gap-4 mb-6 border-b border-slate-100 dark:border-white/5 pb-5">
        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center shadow-inner border border-slate-200/50 dark:border-white/10">
          <RiFileSearchLine className="text-brand dark:text-cyan-400 text-2xl dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        </div>
        <div>
          <h5 className="text-base font-semibold text-slate-800 dark:text-white tracking-wide">Blood_Report_2025.pdf</h5>
          <span className={`text-[11px] uppercase tracking-wider font-bold ${
            phase >= 3 ? 'text-emerald-500 dark:text-emerald-400' : 'text-brand dark:text-cyan-400 animate-pulse'
          }`}>
            {phase < 1 ? 'Uploading…' : phase < 3 ? 'Scanning Document…' : 'Analysis Complete'}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <motion.div key={row.label}
            initial={{ opacity: 0, x: -10 }}
            animate={phase >= 2 ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.12 }}
            className="flex items-center justify-between text-sm py-3 px-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{row.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 dark:text-white font-mono font-medium">{row.value}</span>
              <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                row.status === 'normal' ? 'bg-emerald-400 dark:shadow-[0_0_10px_rgba(52,211,153,0.6)]' : row.status === 'high' ? 'bg-amber-400 dark:shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'bg-rose-400 animate-pulse dark:shadow-[0_0_15px_rgba(244,63,94,0.8)]'
              }`} />
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 p-5 rounded-xl bg-brand/5 dark:bg-cyan-500/10 border border-brand/10 dark:border-cyan-500/30 overflow-hidden shadow-inner dark:shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]">
            <div className="flex items-center gap-2 mb-3">
              <RiBrainLine className="text-brand dark:text-cyan-400 text-lg dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
              <span className="text-xs font-bold text-brand dark:text-cyan-400 tracking-wide uppercase">AI Summary & Recommendation</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Elevated blood sugar (210 mg/dL) indicates hyperglycemia. WBC slightly above normal. 
              <br/><span className="text-slate-900 dark:text-white mt-2 block">Action: Schedule fasting glucose retest & HbA1c evaluation.</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Dashboard Preview ── */
function DashboardPreview({ title, icon: Icon, role, gradient, items }) {
  return (
    <PremiumCard className="p-6 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center ${gradient} shadow-lg dark:shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10`}>
          <Icon className="text-white text-xl" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{role}</p>
        </div>
      </div>
      <div className="space-y-2 mb-6 flex-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs py-2.5 px-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.04] border border-slate-100 dark:border-white/5">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
            <span className="text-slate-900 dark:text-white font-mono font-medium">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-end">
        <MiniChart color={gradient.includes('cyan') ? '#22d3ee' : gradient.includes('indigo') ? '#818cf8' : gradient.includes('emerald') ? '#34d399' : '#f59e0b'} />
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase">Real-time</span>
      </div>
    </PremiumCard>
  )
}


/* ═══════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useThemeStore()
  
  // Scroll parallax for backgrounds
  const { scrollYProgress, scrollY } = useScroll()
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400])
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const heroY = useTransform(scrollY, [0, 600], [0, 150])

  // Navbar dynamic styling
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    return scrollY.onChange(latest => setScrolled(latest > 50))
  }, [scrollY])

  const FEATURES = [
    { icon: RiScanLine, title: 'AI Report Analysis', desc: 'Upload any medical report and our AI instantly extracts, categorizes, and analyzes every biomarker with clinical precision.', gradient: 'from-cyan-500 to-blue-600', chartColor: '#22d3ee' },
    { icon: RiEyeLine, title: 'OCR Medical Extraction', desc: 'Advanced OCR engine reads handwritten and printed medical documents, converting them into structured digital data.', gradient: 'from-indigo-500 to-purple-600', chartColor: '#818cf8' },
    { icon: RiLineChartLine, title: 'Health Trend Analytics', desc: 'Track your biomarkers over time with intelligent trend analysis, predictive alerts, and personalized health scores.', gradient: 'from-emerald-500 to-cyan-600', chartColor: '#34d399' },
    { icon: RiChat3Line, title: 'AI Health Assistant', desc: 'Chat with an AI that understands your complete medical history, answers health questions, and provides evidence-based guidance.', gradient: 'from-violet-500 to-indigo-600', chartColor: '#a78bfa' },
    { icon: RiTeamLine, title: 'Doctor Collaboration', desc: 'Doctors review, verify, and annotate AI-analyzed reports. Seamless patient-doctor communication with real-time updates.', gradient: 'from-amber-500 to-orange-600', chartColor: '#fbbf24' },
    { icon: RiDashboardLine, title: 'Smart Dashboards', desc: 'Role-based dashboards for patients, doctors, and admins with real-time analytics and actionable insights.', gradient: 'from-rose-500 to-pink-600', chartColor: '#fb7185' },
  ]

  const STATS = [
    { value: 1000, suffix: '+', label: 'Reports Analyzed', icon: RiFileSearchLine },
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
    <div className="relative min-h-screen font-sans overflow-x-hidden bg-slate-50 dark:bg-black transition-colors duration-500 text-slate-600 dark:text-slate-300 selection:bg-brand/20 dark:selection:bg-cyan-500/30">

      {/* ─── Background System ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Parallax Ambient Gradients (Hidden in Dark Mode for Pure Black) */}
        <motion.div style={{ y: y1 }} className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] rounded-full bg-brand/[0.04] dark:hidden blur-[160px]" />
        <motion.div style={{ y: y2 }} className="absolute top-[30%] left-[-10%] w-[800px] h-[800px] rounded-full bg-indigo-500/[0.03] dark:hidden blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-brand/[0.02] dark:hidden blur-[120px]" />
        
        {/* Minimal Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="editorialGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-900 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#editorialGrid)" />
        </svg>
      </div>

      {/* ─── FLOATING NAVBAR ─── */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed left-0 right-0 z-[100] flex justify-center px-4 md:px-6 pointer-events-none transition-all duration-500
          ${scrolled ? 'top-4' : 'top-6 md:top-8'}`}>
        <nav className={`w-full rounded-full flex items-center justify-between transition-all duration-500 pointer-events-auto
          ${scrolled 
            ? 'max-w-4xl h-14 px-5 bg-white/80 dark:bg-white/[0.02] backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
            : 'max-w-6xl h-20 px-8 bg-transparent border-transparent'}`}>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} 
              className={`flex items-center justify-center transition-all duration-500
                ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}>
              <MedAssistIcon size={scrolled ? 32 : 40} uid="nav" />
            </motion.div>
            <span className={`font-bold text-slate-900 dark:text-white font-sora tracking-tight group-hover:opacity-80 transition-all duration-500
              ${scrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
              Med<span className="text-brand dark:text-cyan-400">Assist</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Analysis', 'Dashboards'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className={`font-medium text-slate-600 hover:text-brand dark:text-slate-300 dark:hover:text-cyan-400 transition-colors relative group
                  ${scrolled ? 'text-[13px]' : 'text-[15px]'}`}>
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand dark:bg-cyan-400 transition-all duration-300 group-hover:w-full dark:shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={toggleTheme} title="Toggle Theme"
              className={`rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/10 transition-all duration-500
                ${scrolled ? 'p-1.5' : 'p-2'}`}>
              {theme === 'dark' ? <RiSunLine className={scrolled ? 'text-[16px]' : 'text-[20px]'} /> : <RiMoonLine className={scrolled ? 'text-[16px]' : 'text-[20px]'} />}
            </button>
            <button onClick={() => navigate('/login')}
              className={`hidden sm:block font-semibold text-slate-700 dark:text-slate-300 hover:text-brand dark:hover:text-cyan-400 transition-all duration-500 px-2
                ${scrolled ? 'text-[13px]' : 'text-[15px]'}`}>
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className={`font-semibold rounded-full bg-slate-900 text-white dark:bg-cyan-400 dark:text-black hover:bg-slate-800 dark:hover:bg-cyan-300 dark:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-500 transform active:scale-95
                ${scrolled ? 'text-[13px] px-4 py-2' : 'text-[15px] px-6 py-2.5'}`}>
              Get Started
            </button>
          </div>
        </nav>
      </motion.div>

      {/* ═══════════════════════════════════════
         HERO SECTION (Editorial SaaS)
         ═══════════════════════════════════════ */}
      <section className="relative z-10 pt-40 pb-20 px-6 lg:min-h-[90vh] flex flex-col justify-center">
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            
            {/* ── Left: Copy ── */}
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase mb-8
                  bg-brand/10 text-brand border border-brand/20 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-cyan-400 animate-pulse" />
                Premium Healthcare AI
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-sora text-4xl md:text-5xl lg:text-[4rem] font-bold leading-[1.1] mb-8 tracking-tight dark:drop-shadow-md">
                <span className="text-slate-900 dark:text-white">Transform Medical Reports Into </span>
                <br className="hidden lg:block" />
                <span className="bg-gradient-to-r from-brand to-indigo-500 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent dark:drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  Intelligent Health Insights
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg text-slate-500 dark:text-slate-300 leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
                AI-powered report analysis, OCR extraction, smart health tracking,
                and intelligent medical assistance — elegantly unified in one platform.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button onClick={() => navigate('/register')}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-4 rounded-[16px] font-semibold text-[15px]
                    bg-gradient-to-r from-brand to-indigo-600 dark:from-cyan-400 dark:to-cyan-400 text-white dark:text-black relative overflow-hidden group
                    shadow-[0_8px_30px_rgba(79,110,247,0.3)] dark:shadow-[0_0_30px_rgba(34,211,238,0.5)]
                    hover:shadow-[0_12px_40px_rgba(79,110,247,0.4)] dark:hover:shadow-[0_0_40px_rgba(34,211,238,0.7)]
                    hover:-translate-y-1 transition-all duration-300">
                  <span className="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                  <span className="relative z-10 flex items-center gap-2">Get Started <RiArrowRightLine className="text-lg group-hover:translate-x-1 transition-transform" /></span>
                </button>
                <button onClick={() => navigate('/register')}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 px-7 py-4 rounded-[16px] font-semibold text-[15px]
                    border border-slate-200 dark:border-white/10
                    text-slate-700 dark:text-white
                    bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-sm
                    hover:border-brand/30 dark:hover:border-cyan-400/50 hover:shadow-sm dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]
                    transition-all duration-300 hover:-translate-y-1 group">
                  <RiUploadCloud2Line className="text-lg group-hover:-translate-y-1 transition-transform" /> Upload Report
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="mt-14 flex flex-col items-center lg:items-start gap-4">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Trusted by medical leaders</span>
                <div className="flex items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-500 text-slate-600 dark:text-slate-400">
                  <div className="font-sora font-bold text-xl cursor-pointer hover:text-brand dark:hover:text-cyan-400 transition-colors dark:drop-shadow-sm">AIIMS</div>
                  <div className="font-sora font-bold text-xl tracking-tighter cursor-pointer hover:text-brand dark:hover:text-cyan-400 transition-colors dark:drop-shadow-sm">APOLLO</div>
                  <div className="font-sora font-bold text-xl cursor-pointer hover:text-brand dark:hover:text-cyan-400 transition-colors dark:drop-shadow-sm">FORTIS</div>
                </div>
              </motion.div>
            </div>

            {/* ── Right: Embedded Showcase ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="relative mt-12 lg:mt-0 max-w-[500px] lg:max-w-none mx-auto w-full flex justify-center items-center"
            >
              {/* Soft ambient glow behind the raw illustration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-brand/10 dark:bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none" />

              {/* Main Illustration */}
              <motion.img
                animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                src="/hero-doctor.svg"
                alt="Healthcare Illustration"
                className="relative z-10 w-[95%] h-auto object-contain drop-shadow-xl dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              />
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="relative z-10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <PremiumCard className="p-8 rounded-[32px]">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-200 dark:divide-white/10">
              {STATS.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center px-4">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 font-sora tracking-tight dark:drop-shadow-sm">
                    <AnimCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                    <stat.icon className="text-brand dark:text-cyan-400 text-lg dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </PremiumCard>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative z-10 py-24 px-6 scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Core Platform"
            title="Intelligent Healthcare Modules"
            desc="Enterprise-grade tools working seamlessly to analyze, extract, and monitor medical data." />
          
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="h-full">
                <PremiumCard className="p-8 flex flex-col h-full cursor-pointer">
                  <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-md dark:shadow-[0_10px_20px_rgba(0,0,0,0.4)] border border-white/10`}>
                    <f.icon className="text-white text-2xl drop-shadow-sm" />
                  </motion.div>
                  <h3 className="font-sora text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors dark:drop-shadow-sm">{f.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">{f.desc}</p>
                  <div className="pt-5 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between mt-auto">
                    <MiniChart color={f.chartColor} bars={6} />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors">
                      Explore <motion.span whileHover={{ x: 3 }}><RiArrowRightLine /></motion.span>
                    </span>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── AI REPORT ANALYSIS DEMO ─── */}
      <section id="analysis" className="relative z-10 py-24 px-6 scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <SectionHeader tag="Live Analysis" title="Instant Medical Report Extraction"
                desc="Watch MedAssist process a standard blood report, extracting biomarkers and identifying anomalies in seconds." align="left" />
              
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-6 mt-8">
                {[
                  { icon: RiUploadCloud2Line, title: 'Secure Upload', desc: 'Accepts PDF, image, or scanned documents' },
                  { icon: RiScanLine, title: 'OCR Processing', desc: 'Extracts values with 98%+ clinical accuracy' },
                  { icon: RiFlashlightLine, title: 'Anomaly Detection', desc: 'Flags critical values instantly' },
                  { icon: RiBrainLine, title: 'AI Recommendation', desc: 'Generates personalized health steps' },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeLeft}
                    className="flex gap-5 p-5 rounded-[24px] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:shadow-sm dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] cursor-pointer group">
                    <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-[16px] bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-[0_5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center flex-shrink-0 dark:group-hover:border-cyan-500/30 transition-colors">
                      <s.icon className="text-brand dark:text-cyan-400 text-2xl group-hover:scale-110 transition-transform dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    </motion.div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 font-sora group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors">{s.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <div className="order-1 lg:order-2">
              <ReportScanDemo />
            </div>
          </div>
        </div>
      </section>

      {/* ─── MULTI-ROLE DASHBOARDS ─── */}
      <section id="dashboards" className="relative z-10 py-24 px-6 scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <SectionHeader tag="Unified Access" title="Role-Based Intelligence Dashboards"
            desc="Secure, tailored environments designed specifically for patients, doctors, lab technicians, and hospital administrators." />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DASHBOARDS.map((d, i) => (
              <motion.div key={i} variants={fadeUp} className="h-full">
                <DashboardPreview {...d} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 py-24 px-6 scroll-mt-36">
        <div className="max-w-6xl mx-auto">
          <SectionHeader tag="Workflow" title="From Upload to Insight in 3 Steps" />
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mt-16">
            {/* Left: Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative flex justify-center max-w-[500px] mx-auto lg:max-w-none w-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-indigo-500/10 dark:from-cyan-500/20 dark:to-indigo-500/20 rounded-full blur-[100px] w-[80%] h-[80%] m-auto pointer-events-none" />
              <motion.img 
                animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                src="/how-it-works.svg" 
                alt="Process illustration" 
                className="relative z-10 w-full drop-shadow-lg dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              />
            </motion.div>

            {/* Right: 3 Cards Stacked */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-col gap-6">
              {[
                { step: '01', icon: RiUploadCloud2Line, title: 'Upload Report', desc: 'Securely upload your medical report. Our OCR handles printed and handwritten text.' },
                { step: '02', icon: RiBrainLine, title: 'AI Analyzes', desc: 'The AI engine processes, extracts, and categorizes biomarkers with clinical precision.' },
                { step: '03', icon: RiCheckDoubleLine, title: 'Get Insights', desc: 'Receive visual summaries, health scores, and actionable medical recommendations.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <PremiumCard className="p-6 md:p-8 flex flex-col sm:flex-row items-start gap-6 relative overflow-hidden">
                    <span className="absolute -right-4 -bottom-6 text-[140px] font-bold font-sora text-slate-100 dark:text-white/[0.03] pointer-events-none select-none leading-none z-0 transition-transform duration-500 group-hover:scale-110 group-hover:text-brand/5 dark:group-hover:text-cyan-500/5">
                      {item.step}
                    </span>
                    
                    <div className="w-16 h-16 rounded-[20px] bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/10 shadow-inner dark:shadow-[0_10px_20px_rgba(0,0,0,0.4)] flex items-center justify-center flex-shrink-0 relative z-10 group-hover:bg-brand dark:group-hover:bg-cyan-500 dark:group-hover:border-cyan-400 dark:group-hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] transition-all duration-500">
                      <item.icon className="text-brand dark:text-cyan-400 text-3xl group-hover:text-white transition-colors duration-500 dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] group-hover:drop-shadow-none" />
                    </div>
                    
                    <div className="relative z-10 pt-2">
                      <h4 className="text-xl font-bold font-sora text-slate-900 dark:text-white mb-3 group-hover:text-brand dark:group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[280px]">{item.desc}</p>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* We keep CTA naturally dark in both modes for SaaS impact */}
          <div className="relative rounded-[40px] md:rounded-[60px] p-12 md:p-24 text-center overflow-hidden
            bg-slate-900 dark:bg-white/[0.03] backdrop-blur-2xl border border-slate-800 dark:border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] group hover:shadow-[0_20px_100px_rgba(34,211,238,0.15)] hover:border-brand/30 dark:hover:border-cyan-500/30 transition-all duration-700">
            
            {/* Glowing Accent Layers */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-brand dark:via-cyan-400 to-transparent opacity-80 group-hover:opacity-100 group-hover:w-[90%] transition-all duration-700 shadow-[0_0_30px_rgba(79,110,247,0.8)] dark:shadow-[0_0_30px_rgba(34,211,238,1)]" />
            <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand/30 dark:bg-cyan-500/20 blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} className="relative z-10">
              <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-brand to-indigo-600 dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center mx-auto mb-8
                shadow-[0_15px_40px_rgba(79,110,247,0.4)] dark:shadow-[0_15px_40px_rgba(34,211,238,0.5)] ring-4 ring-brand/20 dark:ring-cyan-500/20 cursor-pointer transition-transform border border-white/20">
                <RiRobot2Line className="text-white text-4xl drop-shadow-md" />
              </motion.div>
              <h2 className="font-sora text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-md">
                Ready to Experience the <br className="hidden md:block" />Future of Healthcare?
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Join premium medical institutions and proactive patients globally using MedAssist
                to transform raw medical data into actionable health intelligence.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => navigate('/register')}
                  className="px-10 py-5 rounded-[16px] font-bold text-slate-900 bg-white dark:bg-cyan-400 dark:text-black shadow-[0_0_30px_rgba(255,255,255,0.4)] dark:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] dark:hover:shadow-[0_0_40px_rgba(34,211,238,0.7)] hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                  Deploy MedAssist Today
                </button>
                <button onClick={() => navigate('/login')}
                  className="px-10 py-5 rounded-[16px] font-semibold text-white border border-slate-600 dark:border-cyan-500/50 dark:text-cyan-400 hover:bg-white/10 dark:hover:bg-cyan-500/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                  Talk to Sales
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-slate-200 dark:border-white/5 py-16 px-6 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center">
                  <MedAssistIcon size={40} uid="footer" />
                </div>
                <span className="text-2xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
                  Med<span className="text-brand dark:text-cyan-400">Assist</span>
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                Enterprise AI healthcare platform transforming medical data into actionable insights for patients and doctors.
              </p>
            </div>
            {[
              { title: 'Platform', links: ['Features', 'AI Engine', 'Dashboards', 'Security'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'HIPAA Compliance', 'Cookie Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold font-sora text-slate-900 dark:text-white mb-5 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand dark:hover:text-cyan-400 transition-colors inline-block hover:translate-x-1 duration-200">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">© 2026 MedAssist Healthcare. All rights reserved.</p>
            <div className="flex gap-4 text-slate-400 dark:text-slate-500">
              <span className="text-xs font-medium uppercase tracking-widest hover:text-brand dark:hover:text-cyan-400 transition-colors cursor-pointer">Built with AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
