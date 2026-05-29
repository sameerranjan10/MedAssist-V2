import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '@/store/authStore'
import { authAPI, dashboardAPI } from '@/api/services'
import toast from 'react-hot-toast'
import { 
  Calendar, Droplet, FileText, ShieldCheck, 
  Mail, Phone, User, MapPin, Edit2, Save, X, Loader2,
  Ruler, Weight, Activity, AlertTriangle, PhoneCall, Stethoscope, BadgeCheck, Info
} from 'lucide-react'

export default function PatientProfile() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingMed, setSavingMed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingMed, setIsEditingMed] = useState(false)
  const [stats, setStats] = useState(null)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    phone: '',
    address: ''
  })
  const [medInfo, setMedInfo] = useState({
    height: '',
    weight: '',
    bmi: '',
    allergies: '',
    emergency_contact: '',
    primary_physician: ''
  })
  const [createdAt, setCreatedAt] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [profileRes, statsRes] = await Promise.all([
        authAPI.getProfile(),
        dashboardAPI.stats().catch(() => ({ data: null }))
      ])
      
      const { data } = profileRes
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        date_of_birth: data.patient_profile?.date_of_birth || '',
        gender: data.patient_profile?.gender || '',
        blood_group: data.patient_profile?.blood_group || '',
        phone: data.patient_profile?.phone || '',
        address: data.patient_profile?.address || ''
      })
      setMedInfo({
        height: data.patient_profile?.height || '',
        weight: data.patient_profile?.weight || '',
        bmi: data.patient_profile?.bmi || '',
        allergies: data.patient_profile?.allergies || '',
        emergency_contact: data.patient_profile?.emergency_contact || '',
        primary_physician: data.patient_profile?.primary_physician || ''
      })
      setCreatedAt(data.created_at)
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch (err) {
      toast.error('Failed to load profile details.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const calcBMI = (height, weight) => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w || h <= 0 || w <= 0) return ''
    const hCm = h < 10 ? h * 30.48 : h  // convert feet if < 10
    const hM = hCm / 100
    return (w / (hM * hM)).toFixed(1)
  }

  const getBMICategory = (bmi) => {
    const b = parseFloat(bmi)
    if (!b) return null
    if (b < 18.5) return { label: 'Underweight',   color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-700' }
    if (b < 25)   return { label: 'Normal Weight ✓', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700' }
    if (b < 30)   return { label: 'Overweight',     color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-700' }
    return               { label: 'Obese',           color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-200 dark:border-red-700' }
  }

  const handleMedChange = (e) => {
    const { name, value } = e.target
    setMedInfo(p => {
      const updated = { ...p, [name]: value }
      if (name === 'height' || name === 'weight') {
        const newBMI = calcBMI(
          name === 'height' ? value : p.height,
          name === 'weight' ? value : p.weight
        )
        updated.bmi = newBMI
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile.full_name.trim()) {
      toast.error('Name cannot be empty.')
      return
    }
    setSaving(true)
    try {
      const { data } = await authAPI.updateProfile(profile)
      updateUser({ full_name: data.full_name })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleMedSubmit = async (e) => {
    e.preventDefault()
    setSavingMed(true)
    try {
      // Store clean numeric values for height, weight, bmi
      const payload = {
        ...medInfo,
        height: medInfo.height ? String(parseFloat(medInfo.height) || medInfo.height) : '',
        weight: medInfo.weight ? String(parseFloat(medInfo.weight) || medInfo.weight) : '',
        bmi:    medInfo.bmi   ? String(medInfo.bmi) : '',
      }
      await authAPI.updateProfile(payload)
      toast.success('Medical information updated!')
      setIsEditingMed(false)
      await fetchData()   // refresh so view shows latest values
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update medical info.')
    } finally {
      setSavingMed(false)
    }
  }

  const calculateAge = (dob) => {
    if (!dob) return '—'
    const diff = Date.now() - new Date(dob).getTime()
    return Math.abs(new Date(diff).getUTCFullYear() - 1970) + ' Years'
  }

  const memberSince = createdAt 
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown'

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-4xl text-brand mb-2" />
        <p className="text-slate-500 text-sm">Loading your profile...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Section 1: Hero Profile Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 p-6 sm:p-10 text-white"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-2xl flex-shrink-0">
              {profile.full_name?.charAt(0) || 'U'}
            </div>
            
            {/* Details */}
            <div className="text-center sm:text-left space-y-2 mt-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{profile.full_name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-100 font-medium text-sm sm:text-base">
                <BadgeCheck className="w-5 h-5" /> Verified Patient
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-blue-100 mt-3">
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> Patient ID: MED-{String(user?.id || 1024).padStart(6, '0')}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Member Since: {memberSince}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email || user?.email}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="mt-4 sm:mt-0 px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl backdrop-blur-md font-semibold transition-all shadow-lg flex items-center gap-2"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </motion.div>

      {/* Section 2: Health Snapshot Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { icon: Calendar, label: 'Age', value: calculateAge(profile.date_of_birth), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { icon: Droplet, label: 'Blood Group', value: profile.blood_group || '—', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          { icon: FileText, label: 'Reports Uploaded', value: stats?.reports_uploaded || '0', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
          { icon: ShieldCheck, label: 'Health Score', value: stats?.health_score ? `${stats.health_score}%` : '—', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.2 }}
            className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4"
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0`}>
              <stat.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Forms / Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 3: Personal Information Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Personal Information</h2>
          </div>

          {isEditing ? (
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} className="input w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input type="date" name="date_of_birth" value={profile.date_of_birth} onChange={handleChange} className="input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                  <select name="gender" value={profile.gender} onChange={handleChange} className="input w-full bg-white dark:bg-slate-800">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Blood Group</label>
                  <select name="blood_group" value={profile.blood_group} onChange={handleChange} className="input w-full bg-white dark:bg-slate-800">
                    <option value="">Select</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="input w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                  <textarea name="address" value={profile.address} onChange={handleChange} rows="2" className="input w-full resize-none py-2.5" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: User, label: 'Full Name', value: profile.full_name },
                { icon: Mail, label: 'Email Address', value: profile.email || user?.email },
                { icon: Phone, label: 'Phone Number', value: profile.phone },
                { icon: Calendar, label: 'Date of Birth', value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('en-US') : '' },
                { icon: Activity, label: 'Gender', value: profile.gender },
                { icon: MapPin, label: 'Address', value: profile.address },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${item.label === 'Address' ? 'sm:col-span-2' : ''}`}>
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{item.value || <span className="text-slate-300 font-normal">Not Added Yet</span>}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Section 4: Medical Information Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 h-fit mb-20 md:mb-0"
        >
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Medical Information</h2>
            </div>
            {!isEditingMed && (
              <button
                onClick={() => setIsEditingMed(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {isEditingMed ? (
            <form onSubmit={handleMedSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Height</label>
                  <input type="text" name="height" value={medInfo.height} onChange={handleMedChange} placeholder="e.g. 175 cm" className="input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Weight</label>
                  <input type="text" name="weight" value={medInfo.weight} onChange={handleMedChange} placeholder="e.g. 70 kg" className="input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    BMI
                    <span className="ml-1 text-[10px] font-medium text-brand bg-brand/10 px-1.5 py-0.5 rounded-full normal-case tracking-normal">Auto-calculated</span>
                    <span className="relative group inline-block ml-1 cursor-help align-middle">
                      <Info className="w-3.5 h-3.5 text-slate-400 inline" />
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center leading-relaxed">
                        Body Mass Index calculated from your height and weight.
                      </span>
                    </span>
                  </label>
                  <div className={`input w-full flex items-center justify-between ${medInfo.bmi ? 'bg-slate-50 dark:bg-slate-700/50' : 'bg-slate-50/50 dark:bg-slate-800'}`}>
                    <span className={`font-semibold ${medInfo.bmi ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                      {medInfo.bmi || 'Enter height & weight'}
                    </span>
                    {medInfo.bmi && (() => {
                      const cat = getBMICategory(medInfo.bmi)
                      return cat ? <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span> : null
                    })()}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Physician</label>
                  <input type="text" name="primary_physician" value={medInfo.primary_physician} onChange={handleMedChange} placeholder="Dr. Name" className="input w-full" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Allergies</label>
                  <textarea name="allergies" value={medInfo.allergies} onChange={handleMedChange} rows="2" placeholder="e.g. Penicillin, Peanuts" className="input w-full resize-none py-2.5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Emergency Contact</label>
                  <input type="text" name="emergency_contact" value={medInfo.emergency_contact} onChange={handleMedChange} placeholder="Name — +91 98765 43210" className="input w-full" />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditingMed(false); fetchData() }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button type="submit" disabled={savingMed} className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md">
                  {savingMed ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {savingMed ? 'Saving...' : 'Save Medical Info'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Ruler,         label: 'Height',           value: medInfo.height ? `${parseFloat(medInfo.height) || medInfo.height} cm` : '' },
                { icon: Weight,        label: 'Weight',           value: medInfo.weight ? `${parseFloat(medInfo.weight) || medInfo.weight} kg` : '' },
                { icon: Stethoscope,   label: 'Primary Physician', value: medInfo.primary_physician },
                { icon: AlertTriangle, label: 'Allergies',        value: medInfo.allergies, full: false },
                { icon: PhoneCall,     label: 'Emergency Contact', value: medInfo.emergency_contact, full: false },
              ].map((item, idx) => (
                <div key={idx} className={`flex items-start gap-4 ${item.full ? 'sm:col-span-2' : ''}`}>
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      {item.value || <span className="text-slate-300 dark:text-slate-500 font-normal">Not Added Yet</span>}
                    </p>
                  </div>
                </div>
              ))}

              {/* BMI + Status card — full width */}
              {medInfo.bmi ? (() => {
                const cat = getBMICategory(medInfo.bmi)
                return (
                  <div className="sm:col-span-2">
                    <div className={`flex items-center justify-between p-4 rounded-2xl border ${cat.bg} ${cat.border}`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-white/60 dark:bg-slate-700/60">
                          <Activity className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">BMI</p>
                          <p className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{medInfo.bmi}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1.5 rounded-xl text-sm font-bold border ${cat.color} ${cat.bg} ${cat.border}`}>
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })() : (
                <div className="sm:col-span-2 flex items-start gap-4">
                  <div className="mt-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">BMI</p>
                    <p className="text-sm font-semibold mt-1"><span className="text-slate-300 dark:text-slate-500 font-normal">Not Added Yet</span></p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
