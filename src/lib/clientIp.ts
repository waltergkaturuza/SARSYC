/**
 * Resolve client IP from reverse-proxy headers (Vercel, Cloudflare, nginx, etc.).
 */
export function getClientIpFromRequest(request?: Request): string {
  if (!request) return 'unknown'

  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')

  return (
    (forwarded && forwarded.split(',')[0].trim()) ||
    (vercelForwarded && vercelForwarded.split(',')[0].trim()) ||
    realIp ||
    cfConnecting ||
    'unknown'
  )
}

export function getUserAgentFromRequest(request?: Request): string {
  return request?.headers.get('user-agent') || 'unknown'
}

/** Short device/browser label for audit list rows. */
export function formatDeviceLabel(userAgent: string): string {
  if (!userAgent || userAgent === 'unknown') return '—'

  const ua = userAgent

  let browser = 'Browser'
  if (/Edg\//i.test(ua)) browser = 'Edge'
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome'
  else if (/Firefox\//i.test(ua)) browser = 'Firefox'
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari'
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera'

  let os = 'Unknown OS'
  if (/Windows NT/i.test(ua)) os = 'Windows'
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) os = 'macOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  const mobile = /Mobile|Android|iPhone|iPad/i.test(ua) ? ' · Mobile' : ''
  return `${browser} · ${os}${mobile}`
}
