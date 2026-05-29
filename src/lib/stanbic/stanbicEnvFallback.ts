/**
 * Central defaults when `.env` / Vercel omits Stanbic–N-Genius variables.
 * Edit here to match **one** environment (sandbox **or** live); mixing gateway + realm + key across envs yields auth **400**.
 *
 * N-Genius identity spec: POST `{identity}/identity/auth/access-token`, body `{"realmName":"..."}`,
 * headers `Authorization: Basic <service-account-api-key>` and `Content-Type: application/vnd.ni-identity.v1+json`.
 * Stanbic live uses a separate identity host (identity.stanbicbank.co.zw) distinct from the gateway.
 * Docs: https://docs.ngenius-payments.com/reference/request-an-access-token-paypage
 *
 * **Live checklist (set all env vars, then redeploy)**
 * - `STANBIC_GATEWAY_URL` or `STANBIC_API_GATEWAY_URL` = `https://api-gateway.stanbicbank.co.zw`
 * - `STANBIC_IDENTITY_URL`                              = `https://identity.stanbicbank.co.zw`
 * - `STANBIC_REALM` or `STANBIC_REALM_NAME`            = `StanbicBankZimbabwe` (confirm with Stanbic if 401)
 * - `STANBIC_API_KEY` or `STANBIC_MERCHANT_API_KEY`    = Service account API key from live portal
 * - `STANBIC_OUTLET_REF` or `STANBIC_OUTLET_REFERENCE` = Outlet REFERENCE UUID from live portal
 * - `STANBIC_API_KEY_AUTHORIZATION_RAW`                = `true` (portal shows pre-encoded Base64 key)
 *
 * **Optional:** `STANBIC_DISABLE_CODE_FALLBACK=true` → never read defaults from this file (forces explicit env).
 *
 * Payment page URL (paypage.stanbicbank.co.zw) is returned automatically in the order creation response —
 * it is never hardcoded. Portal URL (portal.stanbicbank.co.zw) is merchant admin-only, not used in code.
 *
 * @see `.env.example`
 */

/** Short hint on create-order failures; alignment details are in the file header & Vercel function logs. */
export const STANBIC_PAYMENT_SUPPORT_HINT =
  'Use api-gateway URL (not portal), matching realm + API key + outlet. Env aliases: STANBIC_GATEWAY_URL, STANBIC_REALM, STANBIC_API_KEY, STANBIC_OUTLET_REF. Set STANBIC_DISABLE_CODE_FALLBACK=true to require all values on Vercel (no repo defaults). Redeploy after env changes.'

export const STANBIC_ENV_FALLBACK = {
  /**
   * LIVE production gateway — no "sandbox." prefix.
   * Payment page (paypage.stanbicbank.co.zw) is returned automatically in the API order response.
   * Portal (portal.stanbicbank.co.zw) is admin-only and never called by the app.
   */
  STANBIC_API_GATEWAY_URL: 'https://api-gateway.stanbicbank.co.zw',

  /**
   * Live identity service — separate host from gateway on production.
   * Used for POST {identity}/identity/auth/access-token to obtain the bearer token.
   * Leave empty to fall back to {gateway}/identity/auth/access-token (sandbox pattern).
   */
  STANBIC_IDENTITY_URL: 'https://identity.stanbicbank.co.zw',

  /**
   * Live realm name. Stanbic convention: sandbox = "StanbicBankZimbabweSandbox", live = "StanbicBankZimbabwe".
   * ⚠️  If token requests return a 401 or realm-not-found error, confirm the exact realm string from
   *     Stanbic support and update STANBIC_REALM_NAME env var (no code redeploy needed).
   */
  STANBIC_REALM_NAME: 'StanbicBankZimbabwe',

  /**
   * Live service-account API key (Base64 of clientId:clientSecret) — SAYWHAT / Saywat outlet.
   * Source: portal.stanbicbank.co.zw → Integrations → Service accounts → SARSYC website.
   */
  STANBIC_MERCHANT_API_KEY:
    'M2ZiZGQwMTgtYWU2OS00NTYyLWE3OWMlZWU1OThkOTdiMzQ4OjBiOWRkNWVkLWQ3OTItNGI2Yi05NzRiLTVjMTVmYzMxZjlhOQ==',

  /** Outlet REFERENCE from Organisational hierarchy — Saywat outlet, live portal. */
  STANBIC_OUTLET_REFERENCE: '2f347678-cf5a-4599-bb25-8c8a5648ac7f',

  /** Mirrors `STANBIC_API_KEY_AUTHORIZATION_RAW=true` when env unset. */
  STANBIC_API_KEY_AUTHORIZATION_RAW: true,

  STANBIC_ORDER_ACTION: 'PURCHASE',

  /** Default outbound timeout when `STANBIC_FETCH_TIMEOUT_MS` is unset (ms). */
  STANBIC_FETCH_TIMEOUT_MS: 60000,

  /**
   * Used in `publicSiteOrigin()` when `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SERVER_URL`,
   * and `VERCEL_URL` are all unset.
   */
  PUBLIC_SITE_ORIGIN_FALLBACK: 'https://www.sarsyc.org',
} as const
