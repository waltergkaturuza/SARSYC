import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.sarsyc.org'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
  title: 'SARSYC VI - Southern African Regional Students and Youth Conference',
  description: 'Join us for SARSYC VI in Windhoek, Namibia, August 5-7, 2026. Align for Action: Sustaining Progress in Youth Health and Education.',
  keywords: ['SARSYC', 'youth conference', 'Southern Africa', 'youth health', 'education', 'SAYWHAT'],
  authors: [{ name: 'SAYWHAT' }],
  applicationName: 'SARSYC',
  openGraph: {
    title: 'SARSYC VI - Windhoek, Namibia',
    description: 'Align for Action: Sustaining Progress in Youth Health and Education',
    type: 'website',
    locale: 'en_US',
    siteName: 'SARSYC VI',
    url: 'https://www.sarsyc.org',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'SARSYC logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'SARSYC VI - Windhoek, Namibia',
    description: 'Align for Action: Sustaining Progress in Youth Health and Education',
    images: ['/icon-512.png'],
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
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}






