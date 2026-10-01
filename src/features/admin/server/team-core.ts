import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import type { Db } from '#/db/client'
import { profiles } from '#/db/schema'
import type { TeamMember } from '../types'

export class TeamError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'not_signed_in'
      | 'already_admin'
      | 'is_owner'
      | 'not_found'
      | 'not_admin',
  ) {
    super(message)
    this.name = 'TeamError'
  }
}

export async function listTeam(db: Db): Promise<TeamMember[]> {
  const rows = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.role, ['admin', 'owner']))
    // The role enum is customer < admin < owner, so descending puts the owner first.
    .orderBy(desc(profiles.role), asc(profiles.createdAt))
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.fullName,
    avatarUrl: r.avatarUrl,
    role: r.role === 'owner' ? 'owner' : 'admin',
  }))
}

/** Promotes someone who has already signed in. Emails are matched case-insensitively. */
export async function addAdmin(db: Db, email: string): Promise<void> {
  const clean = email.trim().toLowerCase()
  const found = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, clean))
    .limit(1)
  const person = found.at(0)
  if (!person) {
    throw new TeamError(
      'No one has signed in with this email yet. Ask them to sign in once, then try again.',
      'not_signed_in',
    )
  }
  if (person.role !== 'customer') {
    throw new TeamError(
      person.role === 'owner'
        ? 'That person is the owner.'
        : 'That person is already an admin.',
      'already_admin',
    )
  }
  await db
    .update(profiles)
    .set({ role: 'admin' })
    .where(eq(profiles.id, person.id))
}

/** Back to customer. The owner can never be demoted from here. */
export async function removeAdmin(db: Db, id: string): Promise<void> {
  const found = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1)
  const person = found.at(0)
  if (!person) throw new TeamError('Person not found', 'not_found')
  if (person.role === 'owner')
    throw new TeamError('The owner cannot be removed.', 'is_owner')
  if (person.role !== 'admin')
    throw new TeamError('That person is not an admin.', 'not_admin')
  // Guard the write itself too, so a concurrent change to owner can never be overwritten.
  await db
    .update(profiles)
    .set({ role: 'customer' })
    .where(and(eq(profiles.id, id), eq(profiles.role, 'admin')))
}
