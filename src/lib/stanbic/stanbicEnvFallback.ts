/**
 * Central defaults when `.env` / Vercel omits Stanbic–N-Genius variables.
 * Edit here to match **one** environment (sandbox **or** live); mixing gateway + realm + key across envs yields auth **400**.
 *
 * **Sandbox pair (UAT)**  
 * - `STANBIC_API_GATEWAY_URL`: `https://api-gateway.sandbox.stanbicbank.co.zw`  
 * - `STANBIC_REALM_NAME`: `StanbicBankZimbabweSandbox`
 *
 * **Live pair (production paypage, e.g. paypage.stanbicbank.co.zw)** — confirm realm with Stanbic; if auth fails, try the sandbox realm string only while still on sandbox gateway/key.
 *
 * @see `.env.example`
 */

/** Toast / JSON `hint` when create-order gets an upstream client error (4xx). */
export const STANBIC_PAYMENT_SUPPORT_HINT =
  'If this repeats: check STANBIC_* secrets and gateway URL on Vercel, and that the payment return URL origin (NEXT_PUBLIC_SITE_URL) is allow-listed for your N-Genius outlet.'

export const STANBIC_ENV_FALLBACK = {
  /** Live API base (no `sandbox` segment). For UAT use `https://api-gateway.sandbox.stanbicbank.co.zw`. */
  STANBIC_API_GATEWAY_URL: 'https://api-gateway.stanbicbank.co.zw',

  /**
   * Leave empty to call `{gateway}/identity/auth/access-token`.
   * Set only if Stanbic’s pack gives a separate identity host (wrong host → HTML or 404).
   */
  STANBIC_IDENTITY_URL: '',

  /**
   * Must match the same environment as gateway + API key. If you get **400 Bad Request** on auth,
   * verify with Stanbic or switch the **sandbox** pair above (gateway + realm together).
   */
  STANBIC_REALM_NAME: 'StanbicBankZimbabwe',

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
