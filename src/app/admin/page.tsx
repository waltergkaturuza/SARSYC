import { redirect } from 'next/navigation'
import { getCurrentUserFromCookies } from '@/lib/getCurrentUser'
import { adminHomeForRole, isAdminPanelRole } from '@/lib/admin/adminAccess'

export default async function AdminRootPage() {
  const user = await getCurrentUserFromCookies()

  if (!user || !isAdminPanelRole(user.role)) {
    redirect('/login?type=admin&redirect=/admin')
  }

  redirect(adminHomeForRole(user.role))
}



