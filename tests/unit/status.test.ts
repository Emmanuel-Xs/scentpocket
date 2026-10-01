import { describe, expect, it } from 'vitest'
import {
  canCancel,
  canTransition,
  ORDER_STATUSES,
  TRANSITIONS,
} from '#/features/orders/status'

describe('order status transitions', () => {
  it('follows placed, confirmed, shipped, delivered', () => {
    expect(canTransition('placed', 'confirmed')).toBe(true)
    expect(canTransition('confirmed', 'shipped')).toBe(true)
    expect(canTransition('shipped', 'delivered')).toBe(true)
  })

  it('does not skip steps or go backwards', () => {
    expect(canTransition('placed', 'shipped')).toBe(false)
    expect(canTransition('shipped', 'confirmed')).toBe(false)
    expect(canTransition('delivered', 'placed')).toBe(false)
  })

  it('treats delivered and cancelled as final', () => {
    expect(TRANSITIONS.delivered).toEqual([])
    expect(TRANSITIONS.cancelled).toEqual([])
  })

  it('allows cancelling only before shipping', () => {
    expect(ORDER_STATUSES.filter(canCancel)).toEqual(['placed', 'confirmed'])
  })
})
