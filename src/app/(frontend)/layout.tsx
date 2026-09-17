import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DonateFAB from '@/components/layout/DonateFAB'
import { AnalyticsTracker } from '@/components/analytics/AnalyticsTracker'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnalyticsTracker />
      <Header />
      <main className="min-w-0 flex-1 overflow-x-hidden pt-14 md:pt-16">
        {children}
      </main>
      <Footer />
      <DonateFAB />
    </div>
  )
}






