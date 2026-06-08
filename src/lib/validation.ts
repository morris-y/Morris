/**
 * Lightweight validation helpers — adapted from ryos _validation.ts.
 * Used at API boundaries to sanitise and coerce untrusted input.
 */

/** Strip whitespace and enforce a max length */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') throw new TypeError('Expected string')
  return input.trim().slice(0, maxLength)
}

/** Assert a value is a non-empty string */
export function requireString(input: unknown, field: string): string {
  const s = sanitizeString(input)
  if (!s) throw new TypeError(`${field} is required`)
  return s
}

/** Extract a query param as a trimmed string; returns null if absent */
export function queryString(
  params: URLSearchParams,
  key: string,
  opts: { maxLength?: number } = {}
): string | null {
  const val = params.get(key)
  if (val === null) return null
  return val.trim().slice(0, opts.maxLength ?? 500) || null
}

/** Extract a query param as a positive integer; returns null if absent or invalid */
export function queryPositiveInt(params: URLSearchParams, key: string): number | null {
  const val = params.get(key)
  if (!val) return null
  const n = parseInt(val, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}
