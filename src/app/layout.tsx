import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SARSYC VI - Southern African Regional Students and Youth Conference',
  description: 'Join us for SARSYC VI in Windhoek, Namibia, August 5-7, 2026. Align for Action: Sustaining Progress in Youth Health and Education.',
  keywords: ['SARSYC', 'youth conference', 'Southern Africa', 'youth health', 'education', 'SAYWHAT'],
  authors: [{ name: 'SAYWHAT' }],
  openGraph: {
    title: 'SARSYC VI - Windhoek, Namibia',
    description: 'Align for Action: Sustaining Progress in Youth Health and Education',
    type: 'website',
    locale: 'en_US',
    siteName: 'SARSYC VI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SARSYC VI - Windhoek, Namibia',
    description: 'Align for Action: Sustaining Progress in Youth Health and Education',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}






