import { describe, expect, it } from 'vitest'
import { cartSubtotalKobo, reconcileCart } from '#/features/cart/reconcile'
import type { CartLineData } from '#/features/cart/types'

const info = (over: Partial<CartLineData>): CartLineData => ({
  variantId: 'v1',
  productSlug: 's',
  productName: 'Yara',
  brand: 'Lattafa',
  tier: 'arabian_gems',
  variantLabel: '100ml EDP',
  sizeMl: 100,
  priceKobo: 2800000,
  stock: 5,
  image: null,
  ...over,
})

describe('reconcileCart', () => {
  it('leaves a healthy cart alone', () => {
    const lines = [{ variantId: 'v1', qty: 2 }]
    const res = reconcileCart(lines, [info({})])
    expect(res.messages).toEqual([])
    expect(res.lines).toBe(lines)
  })

  it('drops sold out and unknown variants with messages', () => {
    const res = reconcileCart(
      [
        { variantId: 'v1', qty: 1 },
        { variantId: 'gone', qty: 1 },
      ],
      [info({ stock: 0 })],
    )
    expect(res.lines).toEqual([])
    expect(res.messages).toEqual([
      'Yara 100ml sold out and was removed.',
      'An item is no longer available and was removed.',
    ])
  })

  it('clamps quantity to stock and to 10', () => {
    expect(
      reconcileCart([{ variantId: 'v1', qty: 4 }], [info({ stock: 1 })]).lines,
    ).toEqual([{ variantId: 'v1', qty: 1 }])
    expect(
      reconcileCart([{ variantId: 'v1', qty: 12 }], [info({ stock: 50 })])
        .lines,
    ).toEqual([{ variantId: 'v1', qty: 10 }])
  })
})

describe('cartSubtotalKobo', () => {
  it('sums server prices times quantity', () => {
    expect(
      cartSubtotalKobo(
        [{ variantId: 'v1', qty: 3 }],
        [info({ priceKobo: 100 })],
      ),
    ).toBe(300)
  })

  it('ignores lines without server data', () => {
    expect(cartSubtotalKobo([{ variantId: 'x', qty: 3 }], [])).toBe(0)
  })
})
