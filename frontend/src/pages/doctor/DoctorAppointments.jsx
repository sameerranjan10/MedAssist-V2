import { PageHeader, Card, EmptyState } from '@/components/common'
import { RiCalendarLine } from 'react-icons/ri'

export default function DoctorAppointments() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Appointments" subtitle="Your upcoming consultations and schedule" />
      <Card>
        <EmptyState title="No upcoming appointments" subtitle="Your schedule is clear for now." icon={RiCalendarLine} />
      </Card>
    </div>
  )
}
