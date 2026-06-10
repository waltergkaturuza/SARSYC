/** Turn Payload validation errors into a readable API message. */
export function formatPayloadError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Request failed'
  }

  const err = error as {
    message?: string
    data?: Array<{ message?: string; field?: string }>
    errors?: Array<{ message?: string; field?: string }>
  }

  const fieldErrors = err.data ?? err.errors
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors
      .map((e) => e.message || (e.field ? `${e.field} is invalid` : 'Validation failed'))
      .join('; ')
  }

  return err.message || 'Request failed'
}
