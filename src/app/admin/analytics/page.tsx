import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export const revalidate = 0

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUserFromCookies()
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/analytics')
  }

  return <AnalyticsDashboard />
}
