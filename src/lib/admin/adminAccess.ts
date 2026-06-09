/** Routes editors may use in the custom admin panel (content + abstract management). */
export const EDITOR_ADMIN_PREFIXES = [
  '/admin/abstracts',
  '/admin/news',
  '/admin/resources',
  '/admin/speakers',
  '/admin/sessions',
  '/admin/volunteers',
] as const

/** Routes accountants may use (registrations, payments, donations, partnerships). */
export const ACCOUNTANT_ADMIN_PREFIXES = [
  '/admin/registrations',
  '/admin/orathon-registrations',
  '/admin/payments',
  '/admin/donations',
  '/admin/sponsorship-tiers',
  '/admin/partners',
  '/admin/partnership-inquiries',
  '/admin/stanbic-cert',
] as const

export type AdminPanelRole = 'admin' | 'editor' | 'reviewer' | 'accountant'

export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'admin' || role === 'super-admin'
}

export function isAccountantRole(role: string | undefined | null): boolean {
  return role === 'accountant'
}

/** Full admins and accountants (finance team). */
export function isFinanceRole(role: string | undefined | null): boolean {
  return isAdminRole(role) || isAccountantRole(role)
}

export function isAdminPanelRole(role: string | undefined | null): role is AdminPanelRole {
  return (
    role === 'admin' ||
    role === 'editor' ||
    role === 'reviewer' ||
    role === 'accountant'
  )
}

export function editorMayAccessPath(pathname: string): boolean {
  return EDITOR_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function accountantMayAccessPath(pathname: string): boolean {
  return ACCOUNTANT_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

export function adminHomeForRole(role: string): string {
  switch (role) {
    case 'editor':
    case 'reviewer':
      return '/admin/abstracts'
    case 'accountant':
      return '/admin/payments'
    case 'admin':
    default:
      return '/admin/dashboard'
  }
}

export function loginRedirectForRole(role: string, fallbackPath: string): string {
  if (role === 'editor') return `/login?type=editor&redirect=${fallbackPath}`
  if (role === 'reviewer') return `/login?type=reviewer&redirect=${fallbackPath}`
  if (role === 'accountant') return `/login?type=accountant&redirect=${fallbackPath}`
  return `/login?type=admin&redirect=${fallbackPath}`
}

/** Login portal types that use the privileged admin-panel cookie flow. */
export function usesAdminPanelPrivilegedLogin(type: string): boolean {
  return type === 'admin' || type === 'editor' || type === 'accountant'
}

/** Database roles permitted for each admin-panel login portal type. */
export function rolesAllowedForAdminPanelLogin(type: string): string[] {
  switch (type) {
    case 'admin':
      return ['admin', 'super-admin']
    case 'editor':
      return ['admin', 'super-admin', 'editor']
    case 'accountant':
      return ['admin', 'super-admin', 'accountant']
    default:
      return []
  }
}
