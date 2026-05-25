import { PageHeader, Card, EmptyState } from '@/components/common'
import { RiVerifiedBadgeLine } from 'react-icons/ri'

export default function VerifiedReports() {
  return (
    <div className="p-6">
      <PageHeader title="Verified Reports" subtitle="History of reports you have successfully verified" />
      <Card>
        <EmptyState title="No verified reports" subtitle="You have not verified any reports yet." icon={RiVerifiedBadgeLine} />
      </Card>
    </div>
  )
}
