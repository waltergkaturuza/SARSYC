/**
 * Stanbic Zimbabwe / N-Genius Online — hosted payment page (redirect) API helpers.
 * Docs: https://docs.ngenius-payments.com/reference/hosted-payment-page
 * Sandbox URLs from Stanbic use *.stanbicbank.co.zw (configure via env).
 */

function gatewayBase(): string | null {
  const u = process.env.STANBIC_API_GATEWAY_URL?.trim().replace(/\/$/, '')
  return u || null
}

export function stanbicHostedPaymentsConfigured(): boolean {
  const b = gatewayBase()
  const key = process.env.STANBIC_MERCHANT_API_KEY?.trim()
  const outlet = process.env.STANBIC_OUTLET_REFERENCE?.trim()
  const realm = process.env.STANBIC_REALM_NAME?.trim()
  return Boolean(b && key && outlet && realm)
}

/** Minor units e.g. 5000 = USD 50.00 when currency is USD. */
export function registrationFeeMinorUnits(): number {
  const raw = process.env.REGISTRATION_FEE_MINOR_UNITS?.trim()
  if (!raw) return 0
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export function registrationFeeCurrency(): string {
  return (process.env.REGISTRATION_FEE_CURRENCY || 'USD').trim().toUpperCase() || 'USD'
}

/** True when gateway is configured AND a positive registration fee is set. */
export function registrationRequiresHostedPayment(): boolean {
  return stanbicHostedPaymentsConfigured() && registrationFeeMinorUnits() > 0
}

export function publicSiteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    ''
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return (vercel.startsWith('http') ? vercel : `https://${vercel}`).replace(/\/$/, '')
  return 'http://localhost:3000'
}

function basicAuthHeader(): string {
  const apiKey = process.env.STANBIC_MERCHANT_API_KEY?.trim() || ''
  // N-Genius examples use "Authorization: Basic " + portal API key string; alternately HTTP Basic (key:password).
  if (process.env.STANBIC_API_KEY_AUTHORIZATION_RAW === 'true') {
    return `Basic ${apiKey}`
  }
  const token = Buffer.from(`${apiKey}:`, 'utf8').toString('base64')
  return `Basic ${token}`
}

export async function stanbicAccessToken(): Promise<{ access_token: string }> {
  const base = gatewayBase()
  if (!base) throw new Error('STANBIC_API_GATEWAY_URL is not set')

  const url = `${base}/identity/auth/access-token`
  const realmName = process.env.STANBIC_REALM_NAME?.trim() || 'StanbicBankZimbabweSandbox'

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.ni-identity.v1+json',
      'Content-Type': 'application/vnd.ni-identity.v1+json',
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify({ realmName }),
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : `Stanbic auth failed (${res.status}): ${text.slice(0, 200)}`,
    )
  }

  const tok = data.access_token
  if (typeof tok !== 'string' || !tok) {
    throw new Error('Stanbic auth: missing access_token in response')
  }
  return { access_token: tok }
}

export type HostedOrderResult = {
  orderReference: string
  paymentHref: string
}

export async function stanbicCreateHostedOrder(params: {
  accessToken: string
  currencyCode: string
  /** Minor currency units */
  value: number
  emailAddress: string
  redirectUrl: string
  merchantOrderReference?: string
}): Promise<HostedOrderResult> {
  const base = gatewayBase()
  const outlet = process.env.STANBIC_OUTLET_REFERENCE?.trim()
  if (!base || !outlet) throw new Error('Stanbic gateway or outlet not configured')

  const action = (process.env.STANBIC_ORDER_ACTION || 'PURCHASE').trim().toUpperCase() as
    | 'PURCHASE'
    | 'AUTH'

  const body: Record<string, unknown> = {
    action: action === 'AUTH' ? 'AUTH' : 'PURCHASE',
    amount: { currencyCode: params.currencyCode, value: params.value },
    emailAddress: params.emailAddress,
    merchantAttributes: {
      redirectUrl: params.redirectUrl,
    },
  }

  if (params.merchantOrderReference) {
    body.merchantOrderReference = params.merchantOrderReference
  }

  const url = `${base}/transactions/outlets/${encodeURIComponent(outlet)}/orders`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/vnd.ni-payment.v2+json',
      Accept: 'application/vnd.ni-payment.v2+json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const msg =
      typeof data.message === 'string'
        ? data.message
        : `Create order failed (${res.status}): ${text.slice(0, 300)}`
    throw new Error(msg)
  }

  const links = data._links as Record<string, { href?: string }> | undefined
  const href = links?.payment?.href
  const reference = typeof data.reference === 'string' ? data.reference : undefined

  if (!href || !reference) {
    throw new Error('Create order: missing payment.href or reference in gateway response')
  }

  return { orderReference: reference, paymentHref: href }
}

export async function stanbicRetrieveOrder(params: {
  accessToken: string
  orderReference: string
}): Promise<{ raw: Record<string, unknown>; paymentStates: string[] }> {
  const base = gatewayBase()
  const outlet = process.env.STANBIC_OUTLET_REFERENCE?.trim()
  if (!base || !outlet) throw new Error('Stanbic gateway or outlet not configured')

  const url = `${base}/transactions/outlets/${encodeURIComponent(outlet)}/orders/${encodeURIComponent(params.orderReference)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: 'application/vnd.ni-payment.v2+json',
    },
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : `Retrieve order failed (${res.status}): ${text.slice(0, 300)}`,
    )
  }

  const embedded = data._embedded as { payment?: Array<{ state?: string }> } | undefined
  const paymentStates =
    embedded?.payment?.map((p) => (typeof p.state === 'string' ? p.state : '')).filter(Boolean) || []

  return { raw: data, paymentStates }
}

/** Treat these N-Genius payment states as successfully collected (PURCHASE / capture). */
const PAID_STATES = new Set(['CAPTURED', 'PURCHASED', 'AUTHORISED', 'AUTHORIZED'])

export function isOrderPaymentSuccessful(paymentStates: string[]): boolean {
  return paymentStates.some((s) => PAID_STATES.has(s))
}
