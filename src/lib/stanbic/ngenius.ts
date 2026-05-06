/**
 * Stanbic Zimbabwe / N-Genius Online — hosted payment page (redirect) API helpers.
 * Docs: https://docs.ngenius-payments.com/reference/hosted-payment-page
 * Sandbox URLs from Stanbic use *.stanbicbank.co.zw (configure via env).
 */

import type { RegistrationPackageId } from '@/lib/registrationPackages'
import {
  getRegistrationPricingTier,
  minorAmountForPackage,
} from '@/lib/registrationPackages'
import { STANBIC_ENV_FALLBACK } from '@/lib/stanbic/stanbicEnvFallback'

function resolvedGatewayBase(): string | null {
  const u =
    process.env.STANBIC_API_GATEWAY_URL?.trim().replace(/\/$/, '') ||
    STANBIC_ENV_FALLBACK.STANBIC_API_GATEWAY_URL.trim().replace(/\/$/, '')
  return u || null
}

/** Host for `/identity/auth/access-token` — optional dedicated identity URL, else gateway. */
function resolvedIdentityRoot(): string | null {
  const explicit = process.env.STANBIC_IDENTITY_URL?.trim().replace(/\/$/, '')
  const fromFile = STANBIC_ENV_FALLBACK.STANBIC_IDENTITY_URL.trim().replace(/\/$/, '')
  return explicit || fromFile || resolvedGatewayBase()
}

function resolvedMerchantApiKey(): string {
  const fromEnv = process.env.STANBIC_MERCHANT_API_KEY?.trim()
  return fromEnv || STANBIC_ENV_FALLBACK.STANBIC_MERCHANT_API_KEY.trim()
}

function resolvedOutletReference(): string {
  return (
    process.env.STANBIC_OUTLET_REFERENCE?.trim() ||
    STANBIC_ENV_FALLBACK.STANBIC_OUTLET_REFERENCE.trim()
  )
}

function resolvedRealmName(): string {
  return (
    process.env.STANBIC_REALM_NAME?.trim() ||
    STANBIC_ENV_FALLBACK.STANBIC_REALM_NAME.trim() ||
    'StanbicBankZimbabweSandbox'
  )
}

/** True when value is Base64 of `clientId:clientSecret` (Stanbic portal copy-paste), not a plain API key id. */
function looksLikePreencodedNiBasic(credential: string): boolean {
  if (credential.length < 24) return false
  if (!/^[A-Za-z0-9+/]+=*$/.test(credential)) return false
  try {
    const decoded = Buffer.from(credential, 'base64').toString('utf8')
    return decoded.includes(':') && /^[\x20-\x7E]+$/.test(decoded)
  } catch {
    return false
  }
}

function stanbicOutboundTimeoutMs(): number {
  const raw = process.env.STANBIC_FETCH_TIMEOUT_MS?.trim()
  const fallbackCfg = STANBIC_ENV_FALLBACK.STANBIC_FETCH_TIMEOUT_MS
  const n = raw ? parseInt(raw, 10) : fallbackCfg
  const base = Number.isFinite(n) && n >= 5000 ? n : fallbackCfg >= 5000 ? fallbackCfg : 45000
  return Math.min(base, 120000)
}

function stanbicFetchInit(extra?: RequestInit): RequestInit {
  return {
    ...extra,
    signal: AbortSignal.timeout(stanbicOutboundTimeoutMs()),
  }
}

/** User-facing message for failed outbound calls to N-Genius (timeouts, DNS, etc.). */
export function formatStanbicOutboundError(err: unknown): string {
  if (!(err instanceof Error)) {
    return typeof err === 'string' ? err : 'Payment gateway request failed'
  }
  const msg = err.message || ''
  const name = err.name || ''
  if (
    name === 'AbortError' ||
    name === 'TimeoutError' ||
    /aborted|timed out|timeout/i.test(msg)
  ) {
    return `Stanbic/N-Genius did not respond within ${stanbicOutboundTimeoutMs()}ms. Please try again shortly.`
  }
  return msg
}

/**
 * Pick route HTTP status when N-Genius outbound fails.
 * 502 = upstream responded with a client error (credentials, validation, redirect URL block).
 * 503 = timeout, DNS, connectivity, or upstream 5xx.
 */
export function httpStatusForStanbicOutboundFailure(message: string): number {
  const m = message.trim()
  if (/did not respond within/i.test(m) || /^Stanbic\/N-Genius did not respond/i.test(m)) return 503
  if (/abort|timed out|timeout|fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN/i.test(m)) return 503
  const match = m.match(/\((\d{3})\)/)
  const code = match ? parseInt(match[1], 10) : NaN
  if (Number.isFinite(code) && code >= 400 && code < 500) return 502
  return 503
}

export function stanbicHostedPaymentsConfigured(): boolean {
  const b = resolvedGatewayBase()
  const key = resolvedMerchantApiKey()
  const outlet = resolvedOutletReference()
  const realm = resolvedRealmName()
  return Boolean(b && key && outlet && realm)
}

/**
 * Optional flat override in minor units (e.g. 5000 = USD 50.00 when currency is USD).
 * When greater than zero, every hosted order uses this amount instead of package-based pricing (useful for sandbox tests).
 */
export function registrationFeeMinorUnits(): number {
  const raw = process.env.REGISTRATION_FEE_MINOR_UNITS?.trim()
  if (!raw) return 0
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/** Amount to charge for a registration, given the selected package and current pricing tier. */
export function resolveHostedPaymentMinorUnits(packageId: RegistrationPackageId): number {
  const override = registrationFeeMinorUnits()
  if (override > 0) return override
  return minorAmountForPackage(packageId, getRegistrationPricingTier())
}

export function registrationFeeCurrency(): string {
  return (process.env.REGISTRATION_FEE_CURRENCY || 'USD').trim().toUpperCase() || 'USD'
}

/** True when gateway is configured, pricing period is open, and hosted card payment should be offered. */
export function registrationRequiresHostedPayment(): boolean {
  if (!stanbicHostedPaymentsConfigured()) return false
  const tier = getRegistrationPricingTier()
  if (tier === 'closed') return false
  if (registrationFeeMinorUnits() > 0) return true
  return tier === 'early' || tier === 'late'
}

export function publicSiteOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
    ''
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return (vercel.startsWith('http') ? vercel : `https://${vercel}`).replace(/\/$/, '')
  const fb = STANBIC_ENV_FALLBACK.PUBLIC_SITE_ORIGIN_FALLBACK.trim()
  if (fb) return fb.replace(/\/$/, '')
  return 'http://localhost:3000'
}

/** Env wins when set (`true` / `false`); otherwise use fallback file. */
function resolvedRawAuthorizationFlag(): boolean {
  const e = process.env.STANBIC_API_KEY_AUTHORIZATION_RAW?.trim().toLowerCase()
  if (e === 'true') return true
  if (e === 'false') return false
  return STANBIC_ENV_FALLBACK.STANBIC_API_KEY_AUTHORIZATION_RAW === true
}

function basicAuthHeader(): string {
  const apiKey = resolvedMerchantApiKey()
  const envExplicit = Boolean(process.env.STANBIC_MERCHANT_API_KEY?.trim())
  const rawMode = resolvedRawAuthorizationFlag()
  const usePreencodedBasic =
    rawMode || !envExplicit || (envExplicit && looksLikePreencodedNiBasic(apiKey))
  if (usePreencodedBasic) {
    return `Basic ${apiKey}`
  }
  const token = Buffer.from(`${apiKey}:`, 'utf8').toString('base64')
  return `Basic ${token}`
}

/** Map N-Genius identity error JSON into a single string (often more useful than plain "Bad Request"). */
function formatIdentityFailureDetail(data: Record<string, unknown>, text: string): string {
  const top = data.message
  if (typeof top === 'string' && top.trim()) return top.trim()
  const errs = data.errors ?? data.invalidFields ?? data.validationErrors
  if (Array.isArray(errs) && errs.length) {
    return errs
      .map((item) => {
        if (item != null && typeof item === 'object') {
          const o = item as Record<string, unknown>
          const m = o.message ?? o.reason ?? o.detail ?? o.description
          if (typeof m === 'string') return m.trim()
          const f = o.field ?? o.fieldName
          if (typeof f === 'string') return `${f}: ${JSON.stringify(o)}`
        }
        return String(item)
      })
      .join(' — ')
  }
  const code = [data.errorCode, data.code].find((x) => typeof x === 'string') as string | undefined
  const reason = data.reason ?? data.error ?? data.detail
  if (code && typeof reason === 'string') return `${code}: ${reason.trim()}`
  if (typeof reason === 'string' && reason.trim()) return reason.trim()
  return text.slice(0, 400).trim()
}

export async function stanbicAccessToken(): Promise<{ access_token: string }> {
  const base = resolvedIdentityRoot()
  if (!base) throw new Error('STANBIC_API_GATEWAY_URL is not set')

  const url = `${base}/identity/auth/access-token`
  const realmName = resolvedRealmName()

  const res = await fetch(url, stanbicFetchInit({
    method: 'POST',
    headers: {
      Accept: 'application/vnd.ni-identity.v1+json',
      'Content-Type': 'application/vnd.ni-identity.v1+json',
      Authorization: basicAuthHeader(),
    },
    body: JSON.stringify({ realmName }),
  }))

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const looksLikeHtml = /<html[\s>]|<!doctype html|<body[\s>]/i.test(text)
    let detail: string
    if (looksLikeHtml) {
      detail =
        'The token URL returned an HTML page (not the N-Genius API). Remove or fix STANBIC_IDENTITY_URL (try clearing it so the gateway host is used), verify STANBIC_API_GATEWAY_URL matches your Stanbic pack, or ask the bank if server IPs must be allow-listed.'
      console.error('[stanbic] access-token unexpected HTML', { url, status: res.status })
    } else {
      detail = formatIdentityFailureDetail(data, text)
      if (!detail || detail.toLowerCase() === 'bad request') {
        detail =
          'Token rejected (realm, gateway URL, and API key must all belong to the same Stanbic sandbox or live environment).'
      }
      console.error('[stanbic] access-token failed', {
        url,
        status: res.status,
        gateway: resolvedGatewayBase(),
        realm: realmName,
        detail: detail.slice(0, 160),
      })
    }
    throw new Error(`Stanbic auth failed (${res.status}): ${detail}`)
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
  createOrderHttpStatus: number
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
  const base = resolvedGatewayBase()
  const outlet = resolvedOutletReference()
  if (!base || !outlet) throw new Error('Stanbic gateway or outlet not configured')

  const action = (
    process.env.STANBIC_ORDER_ACTION?.trim() || STANBIC_ENV_FALLBACK.STANBIC_ORDER_ACTION
  ).toUpperCase() as 'PURCHASE' | 'AUTH'

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
  const res = await fetch(url, stanbicFetchInit({
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      'Content-Type': 'application/vnd.ni-payment.v2+json',
      Accept: 'application/vnd.ni-payment.v2+json',
    },
    body: JSON.stringify(body),
  }))

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const detail =
      typeof data.message === 'string' && data.message.trim()
        ? data.message.trim()
        : text.slice(0, 300)
    throw new Error(`Create order failed (${res.status}): ${detail}`)
  }

  const links = data._links as Record<string, { href?: string }> | undefined
  const href = links?.payment?.href
  const reference = typeof data.reference === 'string' ? data.reference : undefined

  if (!href || !reference) {
    throw new Error('Create order: missing payment.href or reference in gateway response')
  }

  return { orderReference: reference, paymentHref: href, createOrderHttpStatus: res.status }
}

export async function stanbicRetrieveOrder(params: {
  accessToken: string
  orderReference: string
}): Promise<{ raw: Record<string, unknown>; paymentStates: string[]; retrieveHttpStatus: number }> {
  const base = resolvedGatewayBase()
  const outlet = resolvedOutletReference()
  if (!base || !outlet) throw new Error('Stanbic gateway or outlet not configured')

  const url = `${base}/transactions/outlets/${encodeURIComponent(outlet)}/orders/${encodeURIComponent(params.orderReference)}`
  const res = await fetch(url, stanbicFetchInit({
    method: 'GET',
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: 'application/vnd.ni-payment.v2+json',
    },
  }))

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    /* empty */
  }

  if (!res.ok) {
    const err = new Error(
      typeof data.message === 'string'
        ? data.message
        : `Retrieve order failed (${res.status}): ${text.slice(0, 300)}`,
    ) as Error & { retrieveHttpStatus?: number }
    err.retrieveHttpStatus = res.status
    throw err
  }

  const embedded = data._embedded as { payment?: Array<{ state?: string }> } | undefined
  const paymentStates =
    embedded?.payment?.map((p) => (typeof p.state === 'string' ? p.state : '')).filter(Boolean) || []

  return { raw: data, paymentStates, retrieveHttpStatus: res.status }
}

/** Treat these N-Genius payment states as successfully collected (PURCHASE / capture). */
const PAID_STATES = new Set(['CAPTURED', 'PURCHASED', 'AUTHORISED', 'AUTHORIZED'])

export function isOrderPaymentSuccessful(paymentStates: string[]): boolean {
  return paymentStates.some((s) => PAID_STATES.has(s))
}
