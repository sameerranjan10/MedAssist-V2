/**
 * pages/patient/Appointments.jsx
 * Upcoming/completed appointments with booking UI.
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { RiCalendarLine, RiVideoLine, RiAddLine, RiTimeLine, RiHospitalLine } from 'react-icons/ri'
import { PageHeader, Card, Avatar } from '@/components/common'

const APPOINTMENTS = [
  { id: 1, day: 15, month: 'MAY', doctor: 'Dr. Ananya Verma', spec: 'Hematologist',
    time: '10:30 AM', hospital: 'Apollo Hospitals', status: 'upcoming', initials: 'AV', color: 'bg-brand' },
  { id: 2, day: 22, month: 'MAY', doctor: 'Dr. Rahul Mehta', spec: 'Cardiologist',
    time: '11:00 AM', hospital: 'Fortis Hospital', status: 'upcoming', initials: 'RM', color: 'bg-emerald-500' },
  { id: 3, day: 5, month: 'JUN', doctor: 'Dr. Sneha Iyer', spec: 'General Physician',
    time: '09:30 AM', hospital: 'Manipal Hospital', status: 'upcoming', initials: 'SI', color: 'bg-orange-400' },
]

const TABS = ['Upcoming', 'Completed', 'Cancelled']

export default function Appointments() {
  const [activeTab, setActiveTab] = useState(0)
  const [showBook, setShowBook] = useState(false)

  return (
    <div className="p-6">
      <PageHeader
        title="Appointments"
        subtitle="Manage your upcoming and past consultations"
        actions={
          <button onClick={() => setShowBook(s => !s)}
            className="btn-primary flex items-center gap-1.5">
            <RiAddLine /> Book New
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-0 bg-slate-100 rounded-lg p-1 w-fit mb-5">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === i ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 mb-5">
        {APPOINTMENTS.map((appt, i) => (
          <motion.div key={appt.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="flex items-center gap-4">
              {/* Date block */}
              <div className="text-center w-10 flex-shrink-0">
                <p className="text-2xl font-bold text-brand leading-none">{appt.day}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{appt.month}</p>
              </div>

              {/* Doctor avatar */}
              <Avatar name={appt.doctor} size={10} color={appt.color} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">{appt.doctor}</p>
                <p className="text-xs text-slate-500">{appt.spec}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <RiTimeLine className="text-slate-400" /> {appt.time}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <RiHospitalLine className="text-slate-400" /> {appt.hospital}
                  </span>
                </div>
              </div>

              {/* Status + Join */}
              <div className="flex flex-col items-end gap-2">
                <span className="badge-pending text-[11px]">{appt.status}</span>
                <button className="flex items-center gap-1.5 bg-brand text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                  <RiVideoLine /> Join Video
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Book Appointment form */}
      {showBook && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <RiCalendarLine className="text-brand" /> Book New Appointment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <select className="input text-sm">
                <option>Select Doctor</option>
                <option>Dr. Ananya Verma</option>
                <option>Dr. Rahul Mehta</option>
                <option>Dr. Sneha Iyer</option>
              </select>
              <select className="input text-sm">
                <option>Select Specialization</option>
                <option>Hematologist</option>
                <option>Cardiologist</option>
                <option>General Physician</option>
              </select>
              <input type="date" className="input text-sm" />
              <button className="btn-primary">
                Book Appointment
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
