import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getDb } from '#/db/client'
import { requireOwner } from '#/features/auth/server/session'
import type { TeamMember } from '../types'
import { addAdmin, listTeam, removeAdmin, TeamError } from './team-core'

export type TeamActionResult = { ok: true } | { ok: false; error: string }

export const listTeamMembers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<TeamMember[]> => {
    await requireOwner()
    return listTeam(getDb())
  },
)

export const makeAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ email: z.email('Enter a valid email').max(200) }))
  .handler(async ({ data }): Promise<TeamActionResult> => {
    await requireOwner()
    try {
      await addAdmin(getDb(), data.email)
      return { ok: true }
    } catch (error) {
      if (error instanceof TeamError) return { ok: false, error: error.message }
      throw error
    }
  })

export const demoteAdmin = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }): Promise<TeamActionResult> => {
    await requireOwner()
    try {
      await removeAdmin(getDb(), data.id)
      return { ok: true }
    } catch (error) {
      if (error instanceof TeamError) return { ok: false, error: error.message }
      throw error
    }
  })
