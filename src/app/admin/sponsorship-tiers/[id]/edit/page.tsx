import { redirect } from 'next/navigation'

export default function EditSponsorshipTierPage({
  params,
}: {
  params: { id: string }
}) {
  // Redirect to Payload admin for editing
  redirect(`/admin/collections/sponsorship-tiers/${params.id}`)
}

