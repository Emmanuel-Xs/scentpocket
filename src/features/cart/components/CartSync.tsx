import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { userQueryOptions } from '#/features/auth/queries'
import { useHydrated } from '#/lib/use-hydrated'
import { cartLinesQueryOptions } from '../queries'
import { reconcileCart } from '../reconcile'
import { getCart, mergeCart } from '../server/cart'
import { useCartStore } from '../store'
import {
  bindCartQueryClient,
  clearCartOnSignOut,
  hasPendingSaves,
  mirrorServerCart,
  SERVER_CART_KEY,
} from '../sync'
import { useCartUi } from '../ui-store'

/** How often the server cart is re-read while the cart is in front of the customer. */
const POLL_MS = 3000

/**
 * Keeps the cart honest.
 * - Signed out: the local cart is checked against the server (sold out, stock) and fixed with a notice.
 * - Signing in: the local lines are merged into the server cart once, then the server cart is the
 *   truth. It is re-read on window focus and every 3s while the drawer or /checkout is open, which
 *   is how changes made in the mobile app show up here.
 */
export function CartSync() {
  const queryClient = useQueryClient()
  useEffect(() => bindCartQueryClient(queryClient), [queryClient])
  const hydrated = useHydrated()
  const { data: user } = useQuery(userQueryOptions())
  const userId = user?.id ?? null
  const lines = useCartStore((s) => s.lines)
  const ownerId = useCartStore((s) => s.ownerId)
  const drawerOpen = useCartUi((s) => s.open)
  const onCheckout = useRouterState({
    select: (s) => s.location.pathname.startsWith('/checkout'),
  })
  const adopting = useRef(false)

  // Signed out (here or in another tab): forget the mirrored lines.
  useEffect(() => {
    if (hydrated && !userId && ownerId !== null) clearCartOnSignOut()
  }, [hydrated, userId, ownerId])

  // Signed in without a mirror yet: merge this device's own lines once, or start fresh when the
  // stored lines belonged to someone else.
  useEffect(() => {
    if (!hydrated || !userId || ownerId === userId || adopting.current) return
    adopting.current = true
    useCartUi.getState().setMerging(true)
    const own = ownerId === null ? useCartStore.getState().lines : []
    mergeCart({
      data: {
        items: own.map((l) => ({ variantId: l.variantId, quantity: l.qty })),
      },
    })
      .then((cart) => {
        queryClient.setQueryData(SERVER_CART_KEY, cart)
        useCartStore.getState().adopt(
          cart.lines.map((l) => ({ variantId: l.variantId, qty: l.quantity })),
          userId,
        )
      })
      .catch(() => {
        toast.error("We couldn't sync your cart", {
          description: 'It will sync next time. Your items are still here.',
        })
      })
      .finally(() => {
        adopting.current = false
        useCartUi.getState().setMerging(false)
      })
  }, [hydrated, userId, ownerId, queryClient])

  const { data: serverCart } = useQuery({
    queryKey: SERVER_CART_KEY,
    queryFn: () => getCart(),
    enabled: hydrated && userId !== null && ownerId === userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: drawerOpen || onCheckout ? POLL_MS : false,
  })

  useEffect(() => {
    // Not while a save is in flight: the optimistic lines are newer than this snapshot.
    if (serverCart && !hasPendingSaves()) mirrorServerCart(serverCart)
  }, [serverCart])

  // Signed out: check the local lines against the server.
  const signedOutSync = hydrated && !userId && ownerId === null
  const { data, isSuccess } = useQuery({
    ...cartLinesQueryOptions(lines.map((l) => l.variantId)),
    enabled: signedOutSync && lines.length > 0,
  })

  useEffect(() => {
    if (!signedOutSync || !isSuccess || lines.length === 0) return
    const { lines: next, messages } = reconcileCart(lines, data)
    if (messages.length === 0) return
    useCartStore.setState({ lines: next })
    const notice = messages.join(' ')
    useCartUi.getState().setNotice(notice)
    toast.info('We updated your cart', { description: notice })
  }, [data, isSuccess, lines, signedOutSync])

  return null
}
