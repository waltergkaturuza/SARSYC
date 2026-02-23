'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SESSION_KEY = 'sarsyc_analytics_session'
const TRACK_URL = '/api/analytics/track'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid || sid.length < 8) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function sendBeacon(data: object) {
  try {
    const body = JSON.stringify(data)
    if (navigator.sendBeacon) {
      const url = typeof window !== 'undefined' ? `${window.location.origin}${TRACK_URL}` : TRACK_URL
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
    } else {
      fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // Ignore tracking errors
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return

    if (lastPath.current === pathname) return
    lastPath.current = pathname

    const sessionId = getSessionId()
    sendBeacon({
      type: 'pageview',
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined,
      sessionId,
    })
  }, [pathname])

  return null
}

export function trackEvent(
  eventType: string,
  metadata?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return
  const sessionId = getSessionId()
  sendBeacon({
    type: 'event',
    eventType,
    path: window.location.pathname,
    sessionId,
    metadata: metadata || undefined,
  })
}
