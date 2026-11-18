import { describe, expect, it } from 'vitest'
import { KG_PER_LB } from './units.ts'
import { isDone, loadKg, type SetLog } from './workout.ts'

const set = (completedAt: string | null): SetLog => ({
  id: 's1',
  exerciseId: 'x',
  kind: 'working',
  load: { value: 100, unit: 'kg' },
  reps: 5,
  rir: null,
  completedAt,
})

describe('loadKg', () => {
  it('passes kg through', () => {
    expect(loadKg({ value: 100, unit: 'kg' })).toBe(100)
  })

  it('converts lb', () => {
    expect(loadKg({ value: 225, unit: 'lb' })).toBe(225 * KG_PER_LB)
  })

  it('keeps null as null', () => {
    expect(loadKg(null)).toBeNull()
  })
})

describe('isDone', () => {
  it('is true once completedAt is set', () => {
    expect(isDone(set('2026-11-17T10:00:00Z'))).toBe(true)
  })

  it('is false while planned', () => {
    expect(isDone(set(null))).toBe(false)
  })
})
