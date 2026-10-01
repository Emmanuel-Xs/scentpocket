import { describe, expect, it } from 'vitest'
import { safeNext } from '#/features/auth/next'

describe('safeNext', () => {
  it('keeps relative paths with query and hash', () => {
    expect(safeNext('/checkout')).toBe('/checkout')
    expect(safeNext('/shop?tier=niche#top')).toBe('/shop?tier=niche#top')
  })

  it('falls back for missing or empty values', () => {
    expect(safeNext(undefined)).toBe('/')
    expect(safeNext('')).toBe('/')
    expect(safeNext(null, '/account/orders')).toBe('/account/orders')
  })

  it('rejects absolute, protocol relative and tricky urls', () => {
    expect(safeNext('https://evil.com')).toBe('/')
    expect(safeNext('//evil.com')).toBe('/')
    expect(safeNext('/\\evil.com')).toBe('/')
    expect(safeNext('javascript:alert(1)')).toBe('/')
    expect(safeNext('/ok\r\nSet-Cookie: x=1')).toBe('/')
  })
})
