export type RegistrationListFilters = {
  status?: string
  paymentStatus?: string
  country?: string
  category?: string
  gender?: string
  search?: string
}

export function registrationSearchOrConditions(query: string): Record<string, unknown>[] {
  const q = query.trim()
  if (!q) return []

  const conditions: Record<string, unknown>[] = [
    { firstName: { contains: q } },
    { lastName: { contains: q } },
    { email: { contains: q } },
    { registrationId: { contains: q } },
    { organization: { contains: q } },
    { phone: { contains: q } },
  ]

  const parts = q.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    conditions.push({
      and: [
        { firstName: { contains: parts[0] } },
        { lastName: { contains: parts.slice(1).join(' ') } },
      ],
    })
  }

  return conditions
}

export function buildRegistrationListWhere(filters: RegistrationListFilters): Record<string, unknown> {
  const and: Record<string, unknown>[] = []

  if (filters.status && filters.status !== 'all') {
    and.push({ status: { equals: filters.status } })
  }
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    and.push({ paymentStatus: { equals: filters.paymentStatus } })
  }
  if (filters.country && filters.country !== 'all') {
    and.push({ country: { equals: filters.country } })
  }
  if (filters.category && filters.category !== 'all') {
    and.push({ category: { equals: filters.category } })
  }
  if (filters.gender && filters.gender !== 'all') {
    and.push({ gender: { equals: filters.gender } })
  }

  const search = filters.search?.trim()
  if (search) {
    and.push({ or: registrationSearchOrConditions(search) })
  }

  if (and.length === 0) return {}
  if (and.length === 1) return and[0]
  return { and }
}

/** Admin routes that support a `search` query param in the URL. */
export const ADMIN_SEARCH_ROUTES: { prefix: string; searchParam?: string }[] = [
  { prefix: '/admin/registrations' },
  { prefix: '/admin/donations' },
  { prefix: '/admin/volunteers' },
  { prefix: '/admin/orathon-registrations' },
  { prefix: '/admin/users' },
  { prefix: '/admin/abstracts' },
  { prefix: '/admin/speakers' },
  { prefix: '/admin/news' },
  { prefix: '/admin/audit-logs' },
  { prefix: '/admin/youth-steering-committee' },
]

export function adminSearchRouteForPath(pathname: string): string | null {
  const match = ADMIN_SEARCH_ROUTES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`))
  return match?.prefix ?? null
}

export function pushAdminSearch(router: { push: (url: string) => void }, pathname: string, query: string) {
  const base = adminSearchRouteForPath(pathname) ?? '/admin/registrations'
  const params = new URLSearchParams()
  const q = query.trim()
  if (q) params.set('search', q)
  router.push(`${base}${params.toString() ? `?${params.toString()}` : ''}`)
}
