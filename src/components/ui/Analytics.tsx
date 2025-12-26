'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    gtag: any
  }
}

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && window.gtag) {
      window.gtag('config', gaId, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams}` : ''),
      })
    }
  }, [pathname, searchParams, gaId])

  if (!gaId || gaId === 'G-XXXXXXXXXX') {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
            });
          `,
        }}
      />
    </>
  )
}

// Track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track form submissions
export function trackFormSubmission(formName: string) {
  trackEvent('form_submit', 'Forms', formName)
}

// Track downloads
export function trackDownload(fileName: string) {
  trackEvent('file_download', 'Downloads', fileName)
}

// Track registrations
export function trackRegistration(category: string) {
  trackEvent('registration', 'Conference', category)
}

// Track abstract submissions
export function trackAbstractSubmission(track: string) {
  trackEvent('abstract_submit', 'Conference', track)
}


