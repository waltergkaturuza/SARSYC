/**
 * Central defaults when `.env` / Vercel omits Stanbic–N-Genius variables.
 * Edit here to match **one** environment (sandbox **or** live); mixing gateway + realm + key across envs yields auth **400**.
 *
 * N-Genius identity spec: POST `{gateway}/identity/auth/access-token`, body `{"realmName":"..."}`,
 * headers `Authorization: Basic <service-account-api-key>` and `Content-Type: application/vnd.ni-identity.v1+json`.
 * Generic NI sandbox uses realm `ni`; **Stanbic UAT** uses `StanbicBankZimbabweSandbox` (not `ni`).
 * Docs: https://docs.ngenius-payments.com/reference/request-an-access-token-paypage
 *
 * **Sandbox (UAT)** — typical with Stanbic test portal / sandbox service account
 * | STANBIC_API_GATEWAY_URL | https://api-gateway.sandbox.stanbicbank.co.zw |
 * | STANBIC_REALM_NAME     | StanbicBankZimbabweSandbox |
 *
 * **Live** — must match Stanbic’s production pack (all three together)
 * | STANBIC_API_GATEWAY_URL | https://api-gateway.stanbicbank.co.zw |
 * | STANBIC_REALM_NAME     | Exact string from Stanbic (often ≠ sandbox name) |
 *
 * @see `.env.example`
 */

/** Toast / JSON `hint` when create-order gets an upstream client error (4xx). */
export const STANBIC_PAYMENT_SUPPORT_HINT =
  'Auth 400 is almost always wrong realm or mixed environments: use sandbox gateway + StanbicBankZimbabweSandbox + sandbox key together, OR live gateway + live realm (from Stanbic) + live key — never mix. On Vercel, align every STANBIC_* or remove them to use src/lib/stanbic/stanbicEnvFallback.ts. Allow-list NEXT_PUBLIC_SITE_URL only affects order/redirect, not this token call.'

export const STANBIC_ENV_FALLBACK = {
  /**
   * Default = **sandbox** trio (matches most Stanbic merchant-portal onboarding keys).
   * For live accepting real cards on paypage.stanbicbank.co.zw, switch both gateway AND realm AND key per Stanbic.
   */
  STANBIC_API_GATEWAY_URL: 'https://api-gateway.sandbox.stanbicbank.co.zw',

  /**
   * Leave empty to call `{gateway}/identity/auth/access-token`.
   * Set only if Stanbic’s pack gives a separate identity host (wrong host → HTML or 404).
   */
  STANBIC_IDENTITY_URL: '',

  /** Stanbic sandbox/UAT realm (do not use NI generic `ni` here). Live: get exact value from Stanbic. */
  STANBIC_REALM_NAME: 'StanbicBankZimbabweSandbox',

  /**
   * Service account API key: Base64(`clientId:clientSecret`) from Integrations → Service account.
   */
  STANBIC_MERCHANT_API_KEY:
    'M2ZiZGQwMTgtYWU2OS00NTYyLWE3OWMtZWU1OThkOTdiMzQ4OjBiOWRkNWVkLWQ3OTItNGI2Yi05NzRiLTVjMTVmYzMxZjlhOQ==',

  /** Outlet REFERENCE from Organisational hierarchy (Saywat outlet). */
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
