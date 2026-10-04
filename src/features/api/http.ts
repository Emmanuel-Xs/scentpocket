import { isNotFound } from '@tanstack/react-router'
import { z } from 'zod'
import { CartError } from '#/features/cart/server/cart-core'

/** What every REST handler receives: the request and the path params of its route. */
export type ApiContext = { request: Request; params: Record<string, string> }
export type ApiHandler = (ctx: ApiContext) => Promise<Response>

export type ApiErrorBody = {
  error: { code: string; message: string; details?: unknown }
}

/** Thrown by handlers (and helpers) to answer with a specific status and error code. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown
  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const NO_STORE = { 'Cache-Control': 'no-store' }

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: NO_STORE })
}

export function errorResponse(error: ApiError): Response {
  const body: ApiErrorBody = {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
  }
  return Response.json(body, { status: error.status, headers: NO_STORE })
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new ApiError(
      400,
      'invalid_json',
      'The request body must be valid JSON.',
    )
  }
}

/** Validates with Zod; a failure is a 422 listing each field problem. */
export function parseInput<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.output<T> {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  throw new ApiError(422, 'validation_failed', 'Some fields are not valid.', {
    issues: result.error.issues.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    })),
  })
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  if (error instanceof CartError)
    return new ApiError(404, error.code, error.message)
  if (error instanceof z.ZodError)
    return new ApiError(422, 'validation_failed', 'Some fields are not valid.')
  // requireUser / requireAdmin throw a Response: 401 signed out, 404 not for you.
  if (error instanceof Response) {
    return error.status === 401
      ? new ApiError(401, 'unauthorized', 'Sign in required.')
      : new ApiError(404, 'not_found', 'Not found.')
  }
  if (isNotFound(error)) return new ApiError(404, 'not_found', 'Not found.')
  console.error('[api] unexpected error:', error)
  return new ApiError(500, 'internal_error', 'Something went wrong.')
}

/** Wraps a handler so every failure leaves as `{ error: { code, message } }` with the right status. */
export function handle(handler: ApiHandler): ApiHandler {
  return async (ctx) => {
    try {
      return await handler(ctx)
    } catch (error) {
      return errorResponse(toApiError(error))
    }
  }
}
