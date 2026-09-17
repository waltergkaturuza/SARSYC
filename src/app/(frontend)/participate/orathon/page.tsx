import { redirect } from 'next/navigation'

/** Legacy Orathon form route — registration now uses external country links. */
export default function OrathonPage() {
  redirect('/participate/register-orathon')
}
