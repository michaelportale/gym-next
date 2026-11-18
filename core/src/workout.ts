import { toKg, type Unit } from './units.ts'

export interface Load {
  value: number
  unit: Unit
}

export type SetKind = 'warmup' | 'working'

export interface SetLog {
  id: string
  exerciseId: string
  kind: SetKind
  load: Load | null
  reps: number | null
  rir: number | null
  completedAt: string | null
}

export interface Workout {
  id: string
  startedAt: string
  endedAt: string | null
  name: string | null
  note: string | null
  sets: SetLog[]
}

export function loadKg(load: Load | null): number | null {
  return load === null ? null : toKg(load.value, load.unit)
}

export function isDone(set: SetLog): boolean {
  return set.completedAt !== null
}
