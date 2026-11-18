export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'ez_bar'
  | 'other'

export type Muscle =
  | 'abs'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower_back'
  | 'middle_back'
  | 'neck'
  | 'quads'
  | 'shoulders'
  | 'traps'
  | 'triceps'

export type LoadKind = 'external' | 'bodyweight' | 'assisted'

export interface Exercise {
  id: string
  name: string
  equipment: Equipment
  primary: Muscle[]
  secondary: Muscle[]
  mechanic: 'compound' | 'isolation' | null
  loadKind: LoadKind
  perSide: boolean
  instructions: string[]
  images: string[]
  source: 'catalogue' | 'custom'
}

export const EQUIPMENT: readonly Equipment[] = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'band',
  'ez_bar',
  'other',
]

export const MUSCLES: readonly Muscle[] = [
  'abs',
  'abductors',
  'adductors',
  'biceps',
  'calves',
  'chest',
  'forearms',
  'glutes',
  'hamstrings',
  'lats',
  'lower_back',
  'middle_back',
  'neck',
  'quads',
  'shoulders',
  'traps',
  'triceps',
]
