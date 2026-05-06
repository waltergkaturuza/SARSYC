/**
 * Central fallbacks when `.env` / Vercel omits Stanbic–N-Genius variables.
 * Prefer environment variables in production; edit this file for known sandbox defaults.
 *
 * If `STANBIC_OUTLET_REFERENCE` is empty here and in env, hosted payment stays disabled.
 *
 * Auth `400 Bad Request` often means wrong pair of (gateway host, realm name, API key) or
 * using the identity URL that your merchant pack documents — try `STANBIC_IDENTITY_URL`
 * below or in Vercel when the token endpoint on the main gateway rejects the request.
 *
 * @see `.env.example`
 */
export const STANBIC_ENV_FALLBACK = {
  STANBIC_API_GATEWAY_URL: 'https://api-gateway.sandbox.stanbicbank.co.zw',

  /**
   * Dedicated identity host (Stanbic sandbox portal often lists it separately).
   * When non-empty, access tokens use `${this}/identity/auth/access-token` instead of the gateway host.
   * Example when the gateway returns auth 400: `https://identity.sandbox.stanbicbank.co.zw`
   */
  STANBIC_IDENTITY_URL: '',

  STANBIC_REALM_NAME: 'StanbicBankZimbabweSandbox',

  /**
   * Service account credential: Base64(`clientId:clientSecret`) exactly as shown in the portal.
   * Sent as `Authorization: Basic <credential>` (no extra encoding).
   */
  STANBIC_MERCHANT_API_KEY:
    'M2ZiZGQwMTgtYWU2OS00NTYyLWE3OWMtZWU1OThkOTdiMzQ4OjBiOWRkNWVkLWQ3OTItNGI2Yi05NzRiLTVjMTVmYzMxZjlhOQ==',

  /** Outlet reference UUID: N-Genius portal → Settings → Organization hierarchy → Outlet */
  STANBIC_OUTLET_REFERENCE: '',

  /**
   * Used in `publicSiteOrigin()` only when `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SERVER_URL`,
   * and `VERCEL_URL` are all unset (e.g. local `next start`). Set `NEXT_PUBLIC_SITE_URL`
   * on Vercel for production payment return URLs.
   */
  PUBLIC_SITE_ORIGIN_FALLBACK: 'https://www.sarsyc.org',
} as const
