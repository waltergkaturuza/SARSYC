import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { getPayloadClient } from '@/lib/payload'
import SponsorshipTierForm from '@/components/admin/forms/SponsorshipTierForm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function NewSponsorshipTierPage() {
  // Check authentication
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect('/login?type=admin&redirect=/admin/sponsorship-tiers/new')
  }

  const payload = await getPayloadClient()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Sponsorship Tier</h1>
        <p className="text-gray-600 mt-1">Add a new sponsorship pricing package</p>
      </div>

      <SponsorshipTierForm mode="create" />
    </div>
  )
}
