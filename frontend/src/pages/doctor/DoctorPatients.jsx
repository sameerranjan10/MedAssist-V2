import { PageHeader, Card, EmptyState } from '@/components/common'
import { RiTeamLine } from 'react-icons/ri'

export default function DoctorPatients() {
  return (
    <div className="p-6">
      <PageHeader title="My Patients" subtitle="Manage and view details of your assigned patients" />
      <Card>
        <EmptyState title="No patients assigned" subtitle="Patients will appear here once they consult with you." icon={RiTeamLine} />
      </Card>
    </div>
  )
}
