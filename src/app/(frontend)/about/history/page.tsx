import { redirect } from 'next/navigation'

/** Past editions now live under Previous Conferences (CMS-backed). */
export default function HistoryRedirectPage() {
  redirect('/conferences')
}
