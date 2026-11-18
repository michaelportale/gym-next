import { describe, expect, it } from 'vitest'
import { CATALOGUE, exerciseById } from './catalogue.ts'
import { EQUIPMENT, MUSCLES } from './exercise.ts'

describe('catalogue', () => {
  it('has the expected number of entries', () => {
    expect(CATALOGUE).toHaveLength(678)
  })

  it('has unique ids', () => {
    expect(new Set(CATALOGUE.map((e) => e.id)).size).toBe(CATALOGUE.length)
  })

  it('uses only known equipment and muscles', () => {
    for (const e of CATALOGUE) {
      expect(EQUIPMENT).toContain(e.equipment)
      for (const m of [...e.primary, ...e.secondary]) expect(MUSCLES).toContain(m)
    }
  })

  it('gives every entry at least one primary muscle', () => {
    expect(CATALOGUE.filter((e) => e.primary.length === 0)).toHaveLength(0)
  })

  it('looks entries up by id', () => {
    expect(exerciseById('Barbell_Bench_Press_-_Medium_Grip')).toMatchObject({
      equipment: 'barbell',
      primary: ['chest'],
      secondary: ['shoulders', 'triceps'],
      mechanic: 'compound',
      loadKind: 'external',
    })
    expect(exerciseById('nope')).toBeUndefined()
  })
})
