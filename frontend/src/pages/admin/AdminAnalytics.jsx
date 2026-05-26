import { PageHeader, Card, EmptyState } from '@/components/common'
import { RiLineChartLine } from 'react-icons/ri'

export default function AdminAnalytics() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Analytics" subtitle="In-depth platform statistics and growth" />
      <Card>
        <EmptyState title="Analytics Data Unavailable" subtitle="Not enough data collected for detailed analytics yet." icon={RiLineChartLine} />
      </Card>
    </div>
  )
}
