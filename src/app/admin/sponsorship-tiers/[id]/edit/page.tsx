import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { getPayloadClient } from '@/lib/payload'
import SponsorshipTierForm from '@/components/admin/forms/SponsorshipTierForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function EditSponsorshipTierPage({
  params,
}: {
  params: { id: string }
}) {
  // Check authentication
  const user = await getCurrentUserFromCookies()
  
  if (!user || user.role !== 'admin') {
    redirect(`/login?type=admin&redirect=/admin/sponsorship-tiers/${params.id}/edit`)
  }

  const payload = await getPayloadClient()

  try {
    const tier = await payload.findByID({
      collection: 'sponsorship-tiers',
      id: params.id,
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Sponsorship Tier</h1>
          <p className="text-gray-600 mt-1">Update sponsorship tier details</p>
        </div>

        <SponsorshipTierForm mode="edit" initialData={tier} />
      </div>
    )
  } catch (error: any) {
    if (error.status === 404) {
      notFound()
    }
    throw error
  }
}
