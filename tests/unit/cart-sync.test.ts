import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setCartItem } from '#/features/cart/server/cart'
import { useCartStore } from '#/features/cart/store'
import {
  cartActions,
  hasPendingSaves,
  mirrorServerCart,
  sameLines,
} from '#/features/cart/sync'
import type { ServerCart } from '#/features/cart/types'
import { useCartUi } from '#/features/cart/ui-store'

vi.mock('#/features/cart/server/cart', () => ({ setCartItem: vi.fn() }))
const toast = vi.hoisted(() => ({ error: vi.fn(), info: vi.fn() }))
vi.mock('sonner', () => ({ toast }))

const save = vi.mocked(setCartItem)

const cartOf = (
  lines: [string, number][],
  messages: string[] = [],
): ServerCart => ({
  lines: lines.map(([variantId, quantity]) => ({
    variantId,
    quantity,
    changed: false,
    productSlug: 's',
    productName: 'Yara',
    brand: 'Lattafa',
    tier: 'arabian_gems',
    variantLabel: '100ml',
    sizeMl: 100,
    priceKobo: 100,
    stock: 10,
    image: null,
  })),
  itemCount: lines.reduce((n, [, q]) => n + q, 0),
  subtotalKobo: 0,
  changed: messages.length > 0,
  messages,
})

/** A promise we resolve by hand, to hold a request in flight. */
function deferred<T>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0))

beforeEach(() => {
  save.mockReset()
  toast.error.mockReset()
  toast.info.mockReset()
  useCartStore.setState({ lines: [], ownerId: null })
  useCartUi.setState({ notice: null })
})

describe('signed out', () => {
  it('only changes the local cart', () => {
    cartActions.add('v1', 2)
    expect(useCartStore.getState().lines).toEqual([{ variantId: 'v1', qty: 2 }])
    expect(save).not.toHaveBeenCalled()
  })
})

describe('signed in', () => {
  beforeEach(() => useCartStore.setState({ ownerId: 'user-1' }))

  it('updates the store first and saves the absolute quantity', async () => {
    const d = deferred<ServerCart>()
    save.mockReturnValueOnce(d.promise)
    cartActions.add('v1', 2)
    // Optimistic: already there while the request is still in flight.
    expect(useCartStore.getState().lines).toEqual([{ variantId: 'v1', qty: 2 }])
    expect(hasPendingSaves()).toBe(true)
    expect(save).toHaveBeenCalledWith({
      data: { variantId: 'v1', quantity: 2 },
    })
    d.resolve(cartOf([['v1', 2]]))
    await flushMicrotasks()
    expect(hasPendingSaves()).toBe(false)
  })

  it('removing saves quantity 0', async () => {
    useCartStore.setState({ lines: [{ variantId: 'v1', qty: 2 }] })
    save.mockResolvedValueOnce(cartOf([]))
    cartActions.remove('v1')
    expect(useCartStore.getState().lines).toEqual([])
    expect(save).toHaveBeenCalledWith({
      data: { variantId: 'v1', quantity: 0 },
    })
    await flushMicrotasks()
  })

  it('rolls back to the last confirmed quantity and toasts on error', async () => {
    useCartStore.setState({ lines: [{ variantId: 'v1', qty: 2 }] })
    save.mockRejectedValueOnce(new Error('offline'))
    cartActions.setQty('v1', 5)
    expect(useCartStore.getState().lines[0]?.qty).toBe(5)
    await flushMicrotasks()
    expect(useCartStore.getState().lines).toEqual([{ variantId: 'v1', qty: 2 }])
    expect(toast.error).toHaveBeenCalledOnce()
    expect(hasPendingSaves()).toBe(false)
  })

  it('rolls a failed add back to not being in the cart', async () => {
    save.mockRejectedValueOnce(new Error('offline'))
    cartActions.add('v1', 1)
    await flushMicrotasks()
    expect(useCartStore.getState().lines).toEqual([])
  })

  it('never overlaps saves for a variant and ends on the newest value', async () => {
    useCartStore.setState({ lines: [{ variantId: 'v1', qty: 1 }] })
    const first = deferred<ServerCart>()
    save
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(cartOf([['v1', 4]]))
    cartActions.setQty('v1', 2)
    cartActions.setQty('v1', 3)
    cartActions.setQty('v1', 4)
    expect(save).toHaveBeenCalledTimes(1) // the rest wait
    first.resolve(cartOf([['v1', 2]]))
    await flushMicrotasks()
    expect(save).toHaveBeenCalledTimes(2)
    expect(save).toHaveBeenLastCalledWith({
      data: { variantId: 'v1', quantity: 4 },
    })
    expect(useCartStore.getState().lines[0]?.qty).toBe(4)
    expect(hasPendingSaves()).toBe(false)
  })
})

describe('mirrorServerCart', () => {
  it('adopts the server lines silently when another device changed the cart', () => {
    useCartStore.setState({
      ownerId: 'user-1',
      lines: [{ variantId: 'v1', qty: 1 }],
    })
    mirrorServerCart(
      cartOf([
        ['v1', 3],
        ['v2', 1],
      ]),
    )
    expect(useCartStore.getState().lines).toEqual([
      { variantId: 'v1', qty: 3 },
      { variantId: 'v2', qty: 1 },
    ])
    expect(toast.info).not.toHaveBeenCalled()
  })

  it('explains what the server changed itself', () => {
    useCartStore.setState({
      ownerId: 'user-1',
      lines: [{ variantId: 'v1', qty: 5 }],
    })
    mirrorServerCart(cartOf([['v1', 2]], ['Yara 100ml is down to 2.']))
    expect(useCartStore.getState().lines[0]?.qty).toBe(2)
    expect(useCartUi.getState().notice).toBe('Yara 100ml is down to 2.')
    expect(toast.info).toHaveBeenCalledOnce()
  })

  it('does not touch a cart that is not a mirror', () => {
    useCartStore.setState({
      ownerId: null,
      lines: [{ variantId: 'v1', qty: 1 }],
    })
    mirrorServerCart(cartOf([['v9', 1]]))
    expect(useCartStore.getState().lines).toEqual([{ variantId: 'v1', qty: 1 }])
  })
})

describe('sameLines', () => {
  it('ignores order', () => {
    expect(
      sameLines(
        [
          { variantId: 'a', qty: 1 },
          { variantId: 'b', qty: 2 },
        ],
        [
          { variantId: 'b', qty: 2 },
          { variantId: 'a', qty: 1 },
        ],
      ),
    ).toBe(true)
    expect(
      sameLines([{ variantId: 'a', qty: 1 }], [{ variantId: 'a', qty: 2 }]),
    ).toBe(false)
  })
})
