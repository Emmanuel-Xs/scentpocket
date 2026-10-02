import { useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '#/components/ui/ConfirmDialog'
import { FormField, inputClass } from '#/features/checkout/components/FormField'
import { cn } from '#/lib/utils'
import { demoteAdmin, makeAdmin } from '../server/team'
import type { TeamMember } from '../types'

function initials(m: TeamMember) {
  return (m.name ?? m.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

function Avatar({ member }: { member: TeamMember }) {
  return member.avatarUrl ? (
    <img
      src={member.avatarUrl}
      alt=""
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="size-10 shrink-0 rounded-full"
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-cream',
        member.role === 'owner' ? 'bg-designer' : 'bg-pocket',
      )}
    >
      {initials(member)}
    </span>
  )
}

export function TeamPage({ members }: { members: TeamMember[] }) {
  const queryClient = useQueryClient()
  const add = useServerFn(makeAdmin)
  const demote = useServerFn(demoteAdmin)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<TeamMember | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'team'] })

  const submit = async () => {
    setError('')
    setAdding(true)
    try {
      const res = await add({ data: { email } })
      if (res.ok) {
        toast.success(`${email.trim()} is now an admin`)
        setEmail('')
        await refresh()
      } else setError(res.error)
    } catch {
      setError('Enter a valid email address.')
    } finally {
      setAdding(false)
    }
  }

  const confirmRemove = async () => {
    if (!removing) return
    setBusy(true)
    try {
      const res = await demote({ data: { id: removing.id } })
      if (res.ok) {
        toast.success(
          `${removing.name ?? removing.email} is no longer an admin`,
        )
        await refresh()
      } else toast.error(res.error)
    } catch {
      toast.error('Could not remove that admin. Please try again.')
    } finally {
      setBusy(false)
      setRemoving(null)
    }
  }

  return (
    <>
      <h1 className="text-5xl">Team</h1>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-start gap-5">
        <section className="rounded-3xl border border-border bg-surface p-5.5">
          <h2 className="font-serif text-[22px] leading-none">
            People with admin access
          </h2>
          <ul className="m-0 mt-2 list-none p-0">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center gap-3.5 border-b border-border py-4 last:border-b-0"
              >
                <Avatar member={m} />
                <div className="flex min-w-50 flex-[1_1_200px] flex-col">
                  <span className="font-semibold">{m.name ?? m.email}</span>
                  <span className="text-[13px] text-muted">{m.email}</span>
                </div>
                {m.role === 'owner' ? (
                  <>
                    <span className="rounded-pill bg-niche px-2.75 py-1.25 text-xs font-semibold text-gold">
                      Owner
                    </span>
                    <span className="text-[13px] text-muted">
                      Set by ADMIN_EMAILS
                    </span>
                  </>
                ) : (
                  <>
                    <span className="rounded-pill border border-border bg-surface px-2.75 py-1.25 text-xs font-medium">
                      Admin
                    </span>
                    <button
                      type="button"
                      onClick={() => setRemoving(m)}
                      className="min-h-10 rounded-pill border border-ink px-4 text-sm font-semibold transition-transform duration-150 active:scale-[0.97]"
                    >
                      Remove admin
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>

        <form
          noValidate
          className="flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5.5"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <h2 className="font-serif text-[22px] leading-none">Add an admin</h2>
          <p className="text-sm text-text-2">
            They need to have signed in to Scentpocket once with Google. Admins
            can manage products and orders. Only the owner can manage the team.
          </p>
          <FormField id="admin-email" label="Email" error={error || undefined}>
            <input
              id="admin-email"
              type="email"
              inputMode="email"
              autoComplete="off"
              placeholder="name@gmail.com"
              className={inputClass}
              value={email}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'admin-email-msg' : undefined}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
            />
          </FormField>
          <button
            type="submit"
            disabled={adding || email.trim() === ''}
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-pill border border-ink bg-ink px-6 text-[15px] font-semibold text-cream transition-transform duration-150 ease-(--ease-out) active:scale-[0.97] disabled:cursor-not-allowed disabled:border-border disabled:bg-border disabled:text-disabled disabled:active:scale-100"
          >
            {adding ? 'Adding…' : 'Make admin'}
          </button>
          {error ? (
            <span className="sr-only" role="alert">
              <TriangleAlert aria-hidden="true" /> {error}
            </span>
          ) : null}
        </form>
      </div>

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Remove admin access?"
        description={`${removing?.name ?? removing?.email ?? 'This person'} will go back to being a regular customer and lose access to orders and products straight away. They can be added again later.`}
        confirmLabel="Remove admin"
        cancelLabel="Keep admin"
        danger
        pending={busy}
        onConfirm={() => void confirmRemove()}
      />
    </>
  )
}
