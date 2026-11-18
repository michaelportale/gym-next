import data from './catalogue.json' with { type: 'json' }
import type { Exercise } from './exercise.ts'

export const CATALOGUE: readonly Exercise[] = data as Exercise[]

const byId = new Map<string, Exercise>(CATALOGUE.map((exercise) => [exercise.id, exercise]))

export function exerciseById(id: string): Exercise | undefined {
  return byId.get(id)
}
