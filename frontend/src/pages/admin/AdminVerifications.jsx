import { PageHeader, Card, EmptyState } from '@/components/common'
import { RiShieldCheckLine } from 'react-icons/ri'

export default function AdminVerifications() {
  return (
    <div className="p-6">
      <PageHeader title="Verifications" subtitle="Manage doctor licenses and report verifications" />
      <Card>
        <EmptyState title="No pending verifications" subtitle="All requests have been processed." icon={RiShieldCheckLine} />
      </Card>
    </div>
  )
}
