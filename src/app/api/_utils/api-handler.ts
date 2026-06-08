import { type NextRequest, NextResponse } from 'next/server'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiHandlerConfig {
  methods: HttpMethod[]
}

type RouteHandler = (req: NextRequest) => Promise<Response>

/**
 * Wraps a Next.js App Router handler with method validation and centralised
 * error handling. Inspired by ryos apiHandler — keeps every route DRY and
 * guarantees a consistent `{ error: "..." }` shape on failures.
 *
 * Usage:
 *   export const GET = apiHandler({ methods: ['GET'] }, async (req) => {
 *     return NextResponse.json({ data: ... })
 *   })
 */
export function apiHandler(config: ApiHandlerConfig, handler: RouteHandler) {
  return async (req: NextRequest): Promise<Response> => {
    if (!config.methods.includes(req.method as HttpMethod)) {
      return NextResponse.json(
        { error: `Method ${req.method} not allowed` },
        { status: 405, headers: { Allow: config.methods.join(', ') } }
      )
    }

    try {
      return await handler(req)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      console.error(`[api] ${req.method} ${req.nextUrl.pathname} — ${message}`)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
