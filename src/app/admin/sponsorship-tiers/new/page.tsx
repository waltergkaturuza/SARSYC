import { redirect } from 'next/navigation'

export default function NewSponsorshipTierPage() {
  // Redirect to Payload admin for creating
  redirect('/admin/collections/sponsorship-tiers/create')
}

