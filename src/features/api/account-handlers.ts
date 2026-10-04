import { requireUser } from '#/features/auth/server/session'
import { json } from './http'
import type { ApiHandler } from './http'

export const getMe: ApiHandler = async ({ request }) =>
  json({ user: await requireUser(request) })
