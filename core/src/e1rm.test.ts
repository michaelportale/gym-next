import { describe, expect, it } from 'vitest'
import { bestE1RM, estimate1RM } from './e1rm.ts'
import type { Exercise } from './exercise.ts'
import { toKg } from './units.ts'
import type { SetLog } from './workout.ts'

describe('estimate1RM', () => {
  it('applies Epley', () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(116.667, 3)
  })

  it('applies Brzycki', () => {
    expect(estimate1RM(100, 5, null, { formula: 'brzycki' })).toBe(112.5)
  })

  it('returns the weight for a single', () => {
    expect(estimate1RM(140, 1)).toBe(140)
    expect(estimate1RM(140, 1, null, { formula: 'brzycki' })).toBe(140)
  })

  it('adds reps in reserve to reps', () => {
    expect(estimate1RM(100, 3, 2)).toBe(estimate1RM(100, 5))
  })

  it('returns null for invalid input', () => {
    expect(estimate1RM(100, 0)).toBeNull()
    expect(estimate1RM(100, 2.5)).toBeNull()
    expect(estimate1RM(0, 5)).toBeNull()
    expect(estimate1RM(Number.NaN, 5)).toBeNull()
    expect(estimate1RM(100, 5, -1)).toBeNull()
    expect(estimate1RM(100, 5, 1.5)).toBeNull()
  })

  it('returns null above the rep cap', () => {
    expect(estimate1RM(100, 13)).toBeNull()
    expect(estimate1RM(100, 10, 3)).toBeNull()
    expect(estimate1RM(100, 12)).not.toBeNull()
  })

  it('respects maxReps', () => {
    expect(estimate1RM(100, 15, null, { maxReps: 15 })).not.toBeNull()
    expect(estimate1RM(100, 6, null, { maxReps: 5 })).toBeNull()
  })
})

describe('bestE1RM', () => {
  const squat: Exercise = {
    id: 'squat',
    name: 'Squat',
    equipment: 'barbell',
    primary: ['quads'],
    secondary: [],
    mechanic: 'compound',
    loadKind: 'external',
    perSide: false,
    instructions: [],
    images: [],
    source: 'custom',
  }
  const done = '2026-11-17T10:00:00Z'
  const mk = (id: string, over: Partial<SetLog> = {}): SetLog => ({
    id,
    exerciseId: 'squat',
    kind: 'working',
    load: { value: 100, unit: 'kg' },
    reps: 5,
    rir: null,
    completedAt: done,
    ...over,
  })

  it('picks the highest estimate across mixed sets', () => {
    const sets = [
      mk('a'),
      mk('b', { load: { value: 120, unit: 'kg' }, reps: 3 }),
      mk('c', { reps: 8 }),
    ]
    expect(bestE1RM(sets, squat)).toEqual({ kg: 120 * (1 + 3 / 30), setId: 'b' })
  })

  it('ignores warmups, undone sets, other exercises and null loads', () => {
    const heavy = { load: { value: 300, unit: 'kg' as const } }
    const sets = [
      mk('w', { kind: 'warmup', ...heavy }),
      mk('u', { completedAt: null, ...heavy }),
      mk('o', { exerciseId: 'bench', ...heavy }),
      mk('n', { load: null }),
      mk('ok'),
    ]
    expect(bestE1RM(sets, squat)?.setId).toBe('ok')
  })

  it('returns null with no eligible sets', () => {
    expect(bestE1RM([], squat)).toBeNull()
  })

  it('returns null for a bodyweight exercise', () => {
    expect(bestE1RM([mk('a')], { ...squat, loadKind: 'bodyweight' })).toBeNull()
  })

  it('converts lb loads', () => {
    const sets = [mk('a', { load: { value: 225, unit: 'lb' } })]
    expect(bestE1RM(sets, squat)?.kg).toBe(toKg(225, 'lb') * (1 + 5 / 30))
  })

  it('keeps the first set on a tie', () => {
    expect(bestE1RM([mk('first'), mk('second')], squat)?.setId).toBe('first')
  })
})
