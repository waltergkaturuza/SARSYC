import {
  stanbicAccessToken,
  stanbicRetrieveOrder,
  formatStanbicOutboundError,
} from '@/lib/stanbic/ngenius'
import {
  parseStanbicOrderVerification,
  type ParsedStanbicVerification,
} from '@/lib/stanbic/stanbicCertification'

export type StanbicOrderVerificationResult = {
  retrieveHttpStatus: number
  raw: Record<string, unknown>
  paymentStates: string[]
  parsed: ParsedStanbicVerification
}

export async function verifyStanbicOrderReference(
  orderReference: string,
): Promise<StanbicOrderVerificationResult> {
  const { access_token } = await stanbicAccessToken()
  const retrieved = await stanbicRetrieveOrder({
    accessToken: access_token,
    orderReference,
  })
  const parsed = parseStanbicOrderVerification({
    raw: retrieved.raw,
    paymentStates: retrieved.paymentStates,
  })
  return {
    retrieveHttpStatus: retrieved.retrieveHttpStatus,
    raw: retrieved.raw,
    paymentStates: retrieved.paymentStates,
    parsed,
  }
}

export function retrieveHttpFromStanbicError(e: unknown): number | null {
  if (typeof e === 'object' && e !== null && 'retrieveHttpStatus' in e) {
    const n = (e as { retrieveHttpStatus?: unknown }).retrieveHttpStatus
    return typeof n === 'number' ? n : null
  }
  return null
}

export function stanbicVerificationErrorMessage(e: unknown): string {
  return formatStanbicOutboundError(e)
}
