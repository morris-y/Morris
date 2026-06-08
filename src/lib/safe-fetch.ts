/**
 * SSRF-safe fetch wrapper. Guards against requests to localhost and private IP
 * ranges — relevant whenever a URL comes from user input or an untrusted source.
 * For hardcoded URLs this is a no-op safety net, not a meaningful check.
 *
 * Pattern from ryos _ssrf.ts — adapted for this project without the redirect
 * chain validation since we don't have user-supplied URLs yet.
 */

const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '127.0.0.1', '::1'])

export async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS URLs are allowed')
  }

  if (BLOCKED_HOSTNAMES.has(parsed.hostname)) {
    throw new Error('Requests to localhost are not allowed')
  }

  if (isPrivateIp(parsed.hostname)) {
    throw new Error('Requests to private IP ranges are not allowed')
  }

  return fetch(url, init)
}

function isPrivateIp(hostname: string): boolean {
  const parts = hostname.split('.').map(Number)
  if (parts.length !== 4 || parts.some((n) => isNaN(n))) return false
  const [a, b] = parts
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) // link-local
  )
}
