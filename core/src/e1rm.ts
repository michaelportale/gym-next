import type { Exercise } from './exercise.ts'
import { isDone, loadKg, type SetLog } from './workout.ts'

export type E1rmFormula = 'epley' | 'brzycki'

export interface E1rmOptions {
  formula?: E1rmFormula
  maxReps?: number
}

const DEFAULT_MAX_REPS = 12

export function estimate1RM(
  weightKg: number,
  reps: number,
  rir?: number | null,
  options?: E1rmOptions,
): number | null {
  const formula = options?.formula ?? 'epley'
  const maxReps = options?.maxReps ?? DEFAULT_MAX_REPS
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null
  if (!Number.isInteger(reps) || reps < 1) return null
  if (rir !== undefined && rir !== null && (!Number.isInteger(rir) || rir < 0)) return null
  const repsToFailure = reps + (rir ?? 0)
  if (repsToFailure > maxReps) return null
  if (repsToFailure === 1) return weightKg
  return formula === 'epley'
    ? weightKg * (1 + repsToFailure / 30)
    : (weightKg * 36) / (37 - repsToFailure)
}

export function bestE1RM(
  sets: readonly SetLog[],
  exercise: Exercise,
  options?: E1rmOptions,
): { kg: number; setId: string } | null {
  if (exercise.loadKind !== 'external') return null
  let best: { kg: number; setId: string } | null = null
  for (const set of sets) {
    if (!isDone(set) || set.kind !== 'working' || set.exerciseId !== exercise.id) continue
    const weightKg = loadKg(set.load)
    if (weightKg === null || set.reps === null) continue
    const kg = estimate1RM(weightKg, set.reps, set.rir, options)
    if (kg !== null && (best === null || kg > best.kg)) best = { kg, setId: set.id }
  }
  return best
}
