import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import type { Equipment, Exercise, Muscle } from '../core/src/exercise.ts'

const SOURCE_COMMIT = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5'
const SOURCE_URL = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${SOURCE_COMMIT}/dist/exercises.json`
const SOURCE_SHA256 = '5bb747e3fc658f095a60dcbf6d53c96627acdcc6ffb6fffde86f7e26995d40bf'
const EXPECTED_COUNT = 678
const OUTPUT = new URL('../core/src/catalogue.json', import.meta.url)

const CATEGORIES = new Set(['strength', 'powerlifting', 'olympic weightlifting', 'strongman'])

const EQUIPMENT: Record<string, Equipment> = {
  barbell: 'barbell',
  dumbbell: 'dumbbell',
  machine: 'machine',
  cable: 'cable',
  'body only': 'bodyweight',
  kettlebells: 'kettlebell',
  bands: 'band',
  'e-z curl bar': 'ez_bar',
  'medicine ball': 'other',
  'exercise ball': 'other',
  'foam roll': 'other',
  other: 'other',
}

const MUSCLES: Record<string, Muscle> = {
  abdominals: 'abs',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  'lower back': 'lower_back',
  'middle back': 'middle_back',
  neck: 'neck',
  quadriceps: 'quads',
  shoulders: 'shoulders',
  traps: 'traps',
  triceps: 'triceps',
}

interface RawExercise {
  id: string
  name: string
  category: string
  equipment: string | null
  mechanic: 'compound' | 'isolation' | null
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  images: string[]
}

function mapEquipment(raw: string | null): Equipment {
  if (raw === null) return 'other'
  const mapped = EQUIPMENT[raw]
  if (!mapped) throw new Error(`unknown equipment: ${raw}`)
  return mapped
}

function mapMuscle(raw: string): Muscle {
  const mapped = MUSCLES[raw]
  if (!mapped) throw new Error(`unknown muscle: ${raw}`)
  return mapped
}

function mapExercise(raw: RawExercise): Exercise {
  const equipment = mapEquipment(raw.equipment)
  return {
    id: raw.id,
    name: raw.name,
    equipment,
    primary: raw.primaryMuscles.map(mapMuscle),
    secondary: raw.secondaryMuscles.map(mapMuscle),
    mechanic: raw.mechanic,
    loadKind: equipment === 'bodyweight' ? 'bodyweight' : 'external',
    perSide: false,
    instructions: raw.instructions,
    images: raw.images,
    source: 'catalogue',
  }
}

const response = await fetch(SOURCE_URL)
if (!response.ok) throw new Error(`download failed: ${response.status}`)
const body = Buffer.from(await response.arrayBuffer())
const sha256 = createHash('sha256').update(body).digest('hex')
console.log(`source sha256: ${sha256}`)
if (sha256 !== SOURCE_SHA256) throw new Error(`sha256 mismatch, expected ${SOURCE_SHA256}`)

const raw = JSON.parse(body.toString('utf8')) as RawExercise[]
const catalogue = raw
  .filter((entry) => CATEGORIES.has(entry.category))
  .map(mapExercise)
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

if (catalogue.length !== EXPECTED_COUNT) {
  throw new Error(`expected ${EXPECTED_COUNT} exercises, got ${catalogue.length}`)
}

writeFileSync(OUTPUT, `${JSON.stringify(catalogue, null, 2)}\n`)
console.log(`wrote ${catalogue.length} exercises`)
