/**
 * GET /api/admin/stanbic-test?secret=sarsyc-stanbic-diag-2026
 *
 * Diagnostic endpoint — tests the Stanbic gateway connection from the server and returns
 * the exact error so you can identify whether it is a timeout, DNS, credential, realm, or
 * IP-whitelist problem without looking at server logs.
 *
 * Protected by STANBIC_DIAG_TOKEN env var (falls back to fixed token below).
 */
import { NextRequest, NextResponse } from 'next/server'
import { STANBIC_ENV_FALLBACK } from '@/lib/stanbic/stanbicEnvFallback'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const FALLBACK_DIAG_TOKEN = 'sarsyc-stanbic-diag-2026'

function readEnv(key: string): string {
  return process.env[key]?.trim() ?? ''
}

function stripSlash(u: string) {
  return u.replace(/\/$/, '')
}

export async function GET(req: NextRequest) {
  // Simple secret-based auth — override via STANBIC_DIAG_TOKEN env var if needed
  const secret = req.nextUrl.searchParams.get('secret') ?? ''
  const expected = readEnv('STANBIC_DIAG_TOKEN') || FALLBACK_DIAG_TOKEN
  if (!secret || secret !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const gateway = stripSlash(
    readEnv('STANBIC_API_GATEWAY_URL') ||
      readEnv('STANBIC_GATEWAY_URL') ||
      STANBIC_ENV_FALLBACK.STANBIC_API_GATEWAY_URL,
  )
  const identityBase = stripSlash(
    readEnv('STANBIC_IDENTITY_URL') || STANBIC_ENV_FALLBACK.STANBIC_IDENTITY_URL || gateway,
  )
  const realm =
    readEnv('STANBIC_REALM_NAME') ||
    readEnv('STANBIC_REALM') ||
    STANBIC_ENV_FALLBACK.STANBIC_REALM_NAME
  const apiKey =
    readEnv('STANBIC_MERCHANT_API_KEY') ||
    readEnv('STANBIC_API_KEY') ||
    STANBIC_ENV_FALLBACK.STANBIC_MERCHANT_API_KEY
  const outlet =
    readEnv('STANBIC_OUTLET_REFERENCE') ||
    readEnv('STANBIC_OUTLET_REF') ||
    STANBIC_ENV_FALLBACK.STANBIC_OUTLET_REFERENCE

  const tokenUrl = `${identityBase}/identity/auth/access-token`

  const info = {
    gateway,
    identityBase,
    tokenUrl,
    realm,
    outlet,
    apiKeyLength: apiKey.length,
    apiKeyPrefix: apiKey.slice(0, 12) + '…',
  }

  // Step 1: token request
  let tokenStatus: number | null = null
  let tokenBody = ''
  let tokenError = ''
  let accessToken = ''

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: 'application/vnd.ni-identity.v1+json',
        'Content-Type': 'application/vnd.ni-identity.v1+json',
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify({ realmName: realm }),
    })
    tokenStatus = res.status
    tokenBody = (await res.text()).slice(0, 800)
    if (res.ok) {
      try {
        accessToken = (JSON.parse(tokenBody) as { access_token?: string }).access_token ?? ''
      } catch {
        /* ignore */
      }
    }
  } catch (e: unknown) {
    tokenError = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
  }

  // Step 2: if token succeeded, check outlet
  let outletStatus: number | null = null
  let outletBody = ''
  let outletError = ''

  if (accessToken) {
    const outletUrl = `${gateway}/api/outlets/${outlet}`
    try {
      const res = await fetch(outletUrl, {
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.ni-payment.v2+json',
        },
      })
      outletStatus = res.status
      outletBody = (await res.text()).slice(0, 400)
    } catch (e: unknown) {
      outletError = e instanceof Error ? `${e.name}: ${e.message}` : String(e)
    }
  }

  const ok = tokenStatus === 200 && !!accessToken && outletStatus === 200

  return NextResponse.json(
    {
      ok,
      config: info,
      token: {
        url: tokenUrl,
        status: tokenStatus,
        error: tokenError || null,
        responsePreview: tokenBody,
        gotToken: !!accessToken,
      },
      outlet: accessToken
        ? { status: outletStatus, error: outletError || null, responsePreview: outletBody }
        : { skipped: 'token step failed' },
      diagnosis: ok
        ? '✅ Gateway reachable, credentials valid, outlet confirmed.'
        : tokenError.includes('ENOTFOUND') || tokenError.includes('EAI_AGAIN')
          ? '❌ DNS failure — identity.stanbicbank.co.zw could not be resolved from this server. Try clearing STANBIC_IDENTITY_URL so the gateway host is used instead.'
          : tokenError.includes('ECONNREFUSED')
            ? '❌ Connection refused — the server actively rejected the connection. Server IP may need whitelisting by Stanbic.'
            : tokenError.includes('AbortError') || tokenError.includes('TimeoutError')
              ? '❌ Timeout — the identity server did not respond within 15 s. Server IP may need whitelisting or the URL is unreachable.'
              : tokenStatus === 401 || tokenStatus === 403
                ? '❌ Auth failed (401/403) — wrong API key, realm name, or credentials do not belong to this environment.'
                : tokenStatus === 404
                  ? '❌ 404 — token URL path may be wrong. Try clearing STANBIC_IDENTITY_URL to use gateway as base, or confirm the exact token path with Stanbic.'
                  : tokenStatus && tokenStatus >= 500
                    ? '❌ Stanbic server error — gateway returned 5xx. May be temporary.'
                    : '❌ Unknown error — see token.error and token.responsePreview above.',
    },
    { status: ok ? 200 : 502 },
  )
}
