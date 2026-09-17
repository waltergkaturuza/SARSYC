/**
 * Public volunteer applications (SARSYC VI).
 *
 * - Default: closed (post-conference cycle).
 * - Reopen: set `NEXT_PUBLIC_VOLUNTEER_APPLICATIONS_CLOSED=false` and redeploy.
 * - Force closed: set `NEXT_PUBLIC_VOLUNTEER_APPLICATIONS_CLOSED=true`.
 */
export function isVolunteerApplicationClosed(): boolean {
  const v = process.env.NEXT_PUBLIC_VOLUNTEER_APPLICATIONS_CLOSED
  if (v === 'false') return false
  if (v === 'true') return true
  return true
}
