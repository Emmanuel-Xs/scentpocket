import * as Menu from '@radix-ui/react-dropdown-menu'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { LogOut, Receipt, ShieldCheck, User } from 'lucide-react'
import { toast } from 'sonner'
import { clearCartOnSignOut } from '#/features/cart/sync'
import { userQueryOptions } from '../queries'
import { signOut } from '../server/actions'
import { isAdminRole } from '../types'
import type { SessionUser } from '../types'

const item =
  'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none data-highlighted:bg-blush'

function initials(user: SessionUser) {
  const source = user.name ?? user.email
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

function Avatar({ user, size }: { user: SessionUser; size: number }) {
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-designer text-sm font-semibold text-cream"
      style={{ width: size, height: size }}
    >
      {initials(user)}
    </span>
  )
}

/** Header account control: sign in link when signed out, avatar menu when signed in. */
export function AccountMenu() {
  const { data: user } = useQuery(userQueryOptions())
  const queryClient = useQueryClient()
  const router = useRouter()
  const navigate = useNavigate()
  const doSignOut = useServerFn(signOut)

  if (!user) {
    return (
      <Link
        to="/sign-in"
        aria-label="Sign in"
        className="inline-flex size-11 items-center justify-center rounded-pill transition-transform duration-150 ease-(--ease-out) active:scale-[0.97]"
      >
        <User size={22} strokeWidth={1.5} aria-hidden="true" />
      </Link>
    )
  }

  const onSignOut = async () => {
    try {
      await doSignOut()
      clearCartOnSignOut()
      queryClient.setQueryData(userQueryOptions().queryKey, null)
      await router.invalidate()
      await navigate({ to: '/' })
      toast.success('Signed out. Your cart is saved to your account.')
    } catch {
      toast.error('Could not sign out. Please try again.')
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Account menu"
        className="inline-flex size-11 items-center justify-center rounded-pill transition-transform duration-150 ease-(--ease-out) outline-none active:scale-[0.97]"
      >
        <Avatar user={user} size={36} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content
          align="end"
          sideOffset={8}
          className="z-(--z-dialog) w-65 origin-(--radix-dropdown-menu-content-transform-origin) animate-pop rounded-xl border border-border bg-surface p-1.5 shadow-md"
        >
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar user={user} size={40} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">
                {user.name ?? 'Your account'}
              </span>
              <span className="truncate text-[13px] text-muted">
                {user.email}
              </span>
            </div>
          </div>
          <Menu.Separator className="my-1 h-px bg-border" />
          <Menu.Item asChild className={item}>
            <Link to="/account/orders">
              <Receipt size={18} strokeWidth={1.5} aria-hidden="true" /> My
              orders
            </Link>
          </Menu.Item>
          {isAdminRole(user.role) ? (
            <Menu.Item asChild className={item}>
              <Link to="/admin">
                <ShieldCheck size={18} strokeWidth={1.5} aria-hidden="true" />{' '}
                Admin
              </Link>
            </Menu.Item>
          ) : null}
          <Menu.Item className={item} onSelect={() => void onSignOut()}>
            <LogOut size={18} strokeWidth={1.5} aria-hidden="true" /> Sign out
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  )
}
