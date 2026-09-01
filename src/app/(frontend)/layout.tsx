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
    <div className="flex flex-col min-h-screen">
      <AnalyticsTracker />
      <Header />
      <main className="flex-grow pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
      <DonateFAB />
    </div>
  )
}






