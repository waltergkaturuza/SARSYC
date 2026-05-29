import { Suspense } from 'react'
import { getPayloadClient } from '@/lib/payload'
import { loadPaymentsDashboardData } from '@/lib/admin/paymentsDashboard'
import PaymentsDashboard from '@/components/admin/PaymentsDashboard'

export const revalidate = 0

export default async function AdminPaymentsPage() {
  const payload = await getPayloadClient()
  const data = await loadPaymentsDashboardData(payload)

  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400">
            Loading payments…
          </div>
        }
      >
        <PaymentsDashboard data={data} />
      </Suspense>
    </div>
  )
}
