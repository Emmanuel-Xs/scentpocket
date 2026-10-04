import { describe, expect, it } from 'vitest'
import { deliveryFeeKobo, formatKobo, orderTotals } from '#/lib/money'

describe('formatKobo', () => {
  it('formats whole naira without decimals', () => {
    expect(formatKobo(350000)).toBe('₦3,500')
    expect(formatKobo(100000000)).toBe('₦1,000,000')
    expect(formatKobo(0)).toBe('₦0')
  })

  it('shows kobo when present', () => {
    expect(formatKobo(125050)).toBe('₦1,250.50')
  })
})

describe('delivery fee and totals', () => {
  it('charges the flat zone fee', () => {
    expect(deliveryFeeKobo('lagos_mainland')).toBe(300_000)
    expect(deliveryFeeKobo('lagos_island')).toBe(450_000)
    expect(deliveryFeeKobo('outside_lagos')).toBe(700_000)
  })

  it('adds the fee to the subtotal', () => {
    expect(orderTotals(1_150_000, 'lagos_island')).toEqual({
      subtotalKobo: 1_150_000,
      deliveryFeeKobo: 450_000,
      totalKobo: 1_600_000,
    })
    expect(orderTotals(68_000_000, 'outside_lagos').totalKobo).toBe(68_700_000)
  })
})
