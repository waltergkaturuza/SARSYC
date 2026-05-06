/**
 * Central defaults when `.env` / Vercel omits Stanbic–N-Genius variables.
 * Edit here to match **one** environment (sandbox **or** live); mixing gateway + realm + key across envs yields auth **400**.
 *
 * N-Genius identity spec: POST `{gateway}/identity/auth/access-token`, body `{"realmName":"..."}`,
 * headers `Authorization: Basic <service-account-api-key>` and `Content-Type: application/vnd.ni-identity.v1+json`.
 * Generic NI sandbox uses realm `ni`; **Stanbic UAT** uses `StanbicBankZimbabweSandbox` (not `ni`).
 * Docs: https://docs.ngenius-payments.com/reference/request-an-access-token-paypage
 *
 * **Vercel sandbox checklist (set all, then redeploy)**  
 * - `STANBIC_GATEWAY_URL` or `STANBIC_API_GATEWAY_URL` = `https://api-gateway.sandbox.stanbicbank.co.zw` (**not** portal)  
 * - `STANBIC_REALM` or `STANBIC_REALM_NAME` = `StanbicBankZimbabweSandbox`  
 * - `STANBIC_API_KEY` or `STANBIC_MERCHANT_API_KEY` = Service account API key from sandbox portal  
 * - `STANBIC_OUTLET_REF` or `STANBIC_OUTLET_REFERENCE` = outlet REFERENCE UUID  
 * - `STANBIC_API_KEY_AUTHORIZATION_RAW` = `true` (typical for portal Base64 key)  
 *
 * **Optional:** `STANBIC_DISABLE_CODE_FALLBACK=true` → never read defaults from this file (forces explicit env).
 *
 * **Live** — must match Stanbic’s production pack (all three together)
 * | STANBIC_API_GATEWAY_URL | https://api-gateway.stanbicbank.co.zw |
 * | STANBIC_REALM_NAME     | Exact string from Stanbic (often ≠ sandbox name) |
 *
 * @see `.env.example`
 */

/** Short hint on create-order failures; alignment details are in the file header & Vercel function logs. */
export const STANBIC_PAYMENT_SUPPORT_HINT =
  'Use api-gateway URL (not portal), matching realm + API key + outlet. Env aliases: STANBIC_GATEWAY_URL, STANBIC_REALM, STANBIC_API_KEY, STANBIC_OUTLET_REF. Set STANBIC_DISABLE_CODE_FALLBACK=true to require all values on Vercel (no repo defaults). Redeploy after env changes.'

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
