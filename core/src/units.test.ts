import { describe, expect, it } from 'vitest'
import { convert, fromKg, KG_PER_LB, roundToIncrement, toKg } from './units.ts'

describe('toKg / fromKg / convert', () => {
  it('converts lb to kg exactly', () => {
    expect(toKg(1, 'lb')).toBe(KG_PER_LB)
  })

  it('leaves kg untouched', () => {
    expect(toKg(5, 'kg')).toBe(5)
    expect(fromKg(5, 'kg')).toBe(5)
  })

  it('round-trips kg to lb and back', () => {
    const back = convert(convert(100, 'kg', 'lb'), 'lb', 'kg')
    expect(Math.abs(back - 100)).toBeLessThan(1e-9)
  })

  it('is the identity for the same unit', () => {
    expect(convert(42.5, 'lb', 'lb')).toBe(42.5)
  })
})

describe('roundToIncrement', () => {
  it('rounds to the nearest multiple', () => {
    expect(roundToIncrement(101.2, 2.5)).toBe(100)
  })

  it('rounds halves away from zero', () => {
    expect(roundToIncrement(101.25, 2.5)).toBe(102.5)
    expect(roundToIncrement(-101.25, 2.5)).toBe(-102.5)
  })

  it('carries no float noise', () => {
    expect(roundToIncrement(7.3, 0.1)).toBe(7.3)
  })

  it('keeps zero as positive zero', () => {
    expect(Object.is(roundToIncrement(0, 5), 0)).toBe(true)
    expect(Object.is(roundToIncrement(-0.4, 5), 0)).toBe(true)
  })

  it('rejects invalid increments', () => {
    expect(() => roundToIncrement(10, 0)).toThrow(RangeError)
    expect(() => roundToIncrement(10, -1)).toThrow(RangeError)
    expect(() => roundToIncrement(10, Number.NaN)).toThrow(RangeError)
  })
})
