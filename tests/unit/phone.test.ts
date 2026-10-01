import { describe, expect, it } from 'vitest'
import {
  deliverySchema,
  normalizeNigerianPhone,
  phoneSchema,
} from '#/features/checkout/schemas'

describe('normalizeNigerianPhone', () => {
  it.each([
    ['08031234567', '+2348031234567'],
    ['0803 123 4567', '+2348031234567'],
    ['+234 803 123 4567', '+2348031234567'],
    ['2348031234567', '+2348031234567'],
    ['+2340803 123 4567', '+2348031234567'],
    ['803-123-4567', '+2348031234567'],
    ['07012345678', '+2347012345678'],
    ['09012345678', '+2349012345678'],
  ])('accepts %s', (input, expected) => {
    expect(normalizeNigerianPhone(input)).toBe(expected)
  })

  it.each([
    '',
    '0803123456',
    '080312345678',
    '0603 123 4567',
    '+1 415 555 0100',
    'abc',
  ])('rejects %s', (input) => {
    expect(normalizeNigerianPhone(input)).toBeNull()
  })
})

describe('phoneSchema', () => {
  it('transforms valid input and reports a friendly error otherwise', () => {
    expect(phoneSchema.parse(' 0803 123 4567 ')).toBe('+2348031234567')
    const bad = phoneSchema.safeParse('12345')
    expect(bad.success).toBe(false)
    expect(bad.error?.issues[0]?.message).toContain('Nigerian number')
  })
})

describe('deliverySchema', () => {
  const valid = {
    fullName: 'Ada Obi',
    phone: '08031234567',
    addressLine: '12 Allen Avenue',
    city: 'Ikeja',
    state: 'Lagos',
    deliveryZone: 'lagos_mainland',
  }

  it('accepts a complete address and normalises the phone', () => {
    expect(deliverySchema.parse(valid).phone).toBe('+2348031234567')
  })

  it('keeps state and zone consistent', () => {
    expect(
      deliverySchema.safeParse({ ...valid, deliveryZone: 'outside_lagos' })
        .success,
    ).toBe(false)
    expect(deliverySchema.safeParse({ ...valid, state: 'Ogun' }).success).toBe(
      false,
    )
    expect(
      deliverySchema.safeParse({
        ...valid,
        state: 'Ogun',
        deliveryZone: 'outside_lagos',
      }).success,
    ).toBe(true)
    expect(
      deliverySchema.safeParse({ ...valid, deliveryZone: 'lagos_island' })
        .success,
    ).toBe(true)
  })

  it('rejects unknown states and zones', () => {
    expect(
      deliverySchema.safeParse({ ...valid, state: 'Narnia' }).success,
    ).toBe(false)
    expect(
      deliverySchema.safeParse({ ...valid, deliveryZone: 'mars' }).success,
    ).toBe(false)
  })
})
