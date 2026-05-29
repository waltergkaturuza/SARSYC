import { Suspense } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <AdminLayout>{children}</AdminLayout>
    </Suspense>
  )
}

