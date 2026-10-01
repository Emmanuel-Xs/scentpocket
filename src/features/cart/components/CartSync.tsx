import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { cartLinesQueryOptions } from '../queries'
import { reconcileCart } from '../reconcile'
import { useCartStore } from '../store'
import { useCartUi } from '../ui-store'

/** Keeps the stored cart honest: when the server says something changed, fix it and say why. */
export function CartSync() {
  const lines = useCartStore((s) => s.lines)
  const { data, isSuccess } = useQuery(
    cartLinesQueryOptions(lines.map((l) => l.variantId)),
  )

  useEffect(() => {
    if (!isSuccess || lines.length === 0) return
    const { lines: next, messages } = reconcileCart(lines, data)
    if (messages.length === 0) return
    useCartStore.setState({ lines: next })
    const notice = messages.join(' ')
    useCartUi.getState().setNotice(notice)
    toast.info('We updated your cart', { description: notice })
  }, [data, isSuccess, lines])

  return null
}
