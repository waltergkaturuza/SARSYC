import { redirect } from 'next/navigation'

/** Legacy URL → Payments dashboard (Certification tab) */
export default function StanbicCertRedirectPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const tab = searchParams.tab || 'certification'
  redirect(`/admin/payments?tab=${encodeURIComponent(tab)}`)
}
