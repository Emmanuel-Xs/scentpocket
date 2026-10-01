import { describe, expect, it } from 'vitest'
import { formatKobo } from '#/lib/money'

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
