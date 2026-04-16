/**
 * Normalize Payload/Postgres document IDs for comparisons.
 * Mixing number (e.g. user.id) with string (e.g. from .toString() on relations) breaks Array.includes.
 */
export function normalizePayloadId(id: unknown): string {
  if (id == null || id === '') return ''
  if (typeof id === 'bigint') return id.toString()
  if (typeof id === 'object' && id !== null && 'id' in id) {
    return normalizePayloadId((id as { id: unknown }).id)
  }
  return String(id).trim()
}

export function payloadIdsEqual(a: unknown, b: unknown): boolean {
  const sa = normalizePayloadId(a)
  const sb = normalizePayloadId(b)
  return sa !== '' && sb !== '' && sa === sb
}

/** Prefer numeric FK when the string is a safe integer. */
export function toRelationshipId(normalized: string): number | string {
  if (!normalized) return normalized
  const n = Number(normalized)
  return Number.isInteger(n) && n > 0 ? n : normalized
}
