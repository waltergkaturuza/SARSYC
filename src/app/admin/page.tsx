import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  // Simple redirect to admin dashboard
  redirect('/admin/dashboard')
}


