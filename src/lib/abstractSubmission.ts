/**
 * Public abstract submission (SARSYC VI Research Indaba).
 *
 * - Default: closed (post call-for-papers).
 * - Reopen: set `NEXT_PUBLIC_ABSTRACT_SUBMISSION_CLOSED=false` in env and redeploy.
 * - Force closed: set `NEXT_PUBLIC_ABSTRACT_SUBMISSION_CLOSED=true`.
 */
export function isAbstractSubmissionClosed(): boolean {
  const v = process.env.NEXT_PUBLIC_ABSTRACT_SUBMISSION_CLOSED
  if (v === 'false') return false
  if (v === 'true') return true
  return true
}
