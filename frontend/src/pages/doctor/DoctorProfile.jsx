import { useState, useEffect } from 'react'
import { PageHeader, Card } from '@/components/common'
import useAuthStore from '@/store/authStore'
import { authAPI } from '@/api/services'
import { RiUserLine, RiMailLine, RiStethoscopeLine, RiShieldCheckLine, RiBriefcaseLine, RiPhoneLine, RiEdit2Line, RiSaveLine, RiCloseLine, RiLoader4Line } from 'react-icons/ri'
import toast from 'react-hot-toast'

export default function DoctorProfile() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    specialization: '',
    license_number: '',
    experience_years: 0,
    phone: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const { data } = await authAPI.getProfile()
      setProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        specialization: data.doctor_profile?.specialization || '',
        license_number: data.doctor_profile?.license_number || '',
        experience_years: data.doctor_profile?.experience_years || 0,
        phone: data.doctor_profile?.phone || ''
      })
    } catch (err) {
      toast.error('Failed to load profile details.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.name === 'experience_years' ? parseInt(e.target.value) || 0 : e.target.value
    setProfile(p => ({ ...p, [e.target.name]: val }))
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

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <RiLoader4Line className="animate-spin text-4xl text-brand mb-2" />
        <p className="text-slate-500 text-sm">Loading profile details...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <PageHeader title="Doctor Profile" subtitle="Manage your professional information and credentials" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Card - Quick info */}
        <Card className="md:col-span-1 flex flex-col items-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-brand text-3xl font-semibold mb-4 shadow-inner">
            {profile.full_name?.charAt(0) || 'D'}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white truncate w-full">{profile.full_name}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium capitalize mt-0.5">{user?.role} Portal</p>
          
          <div className="w-full border-t border-slate-100 dark:border-slate-800 my-4"></div>
          
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <RiMailLine className="text-base text-slate-400" />
              <span className="truncate flex-1">{profile.email || user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
              <RiUserLine className="text-base text-slate-400" />
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
        </Card>

        {/* Right Card - Form/Details */}
        <Card className="md:col-span-2 p-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-6">
            <h4 className="font-semibold text-slate-800 dark:text-white text-base">Professional Details</h4>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                <RiEdit2Line /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Dr. Rohan Sharma"
                    required
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={profile.specialization}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="General Physician"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">License Number</label>
                  <input
                    type="text"
                    name="license_number"
                    value={profile.license_number}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="MED-123456"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={profile.experience_years}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="5"
                    min="0"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="+91 98765 43211"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  {saving ? (
                    <><RiLoader4Line className="animate-spin" /> Saving...</>
                  ) : (
                    <><RiSaveLine /> Save Changes</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    fetchProfile() // reload original profile values
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RiCloseLine /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Specialization */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                  <RiStethoscopeLine className="text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Specialization</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.specialization || 'Not set'}</p>
                </div>
              </div>

              {/* License Number */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center flex-shrink-0">
                  <RiShieldCheckLine className="text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">License Number</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.license_number || 'Not set'}</p>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                  <RiBriefcaseLine className="text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Experience</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.experience_years ? `${profile.experience_years} Years` : 'Not set'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                  <RiPhoneLine className="text-lg" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 dark:text-slate-500">Phone Number</label>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile.phone || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
