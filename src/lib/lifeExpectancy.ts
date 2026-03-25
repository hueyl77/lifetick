/**
 * LifeTick — Life Expectancy Engine (TypeScript)
 *
 * Actuarial model based on:
 * - CDC National Vital Statistics (2022)
 * - Duke/NIH Asian ethnic subgroup study (2012-2016)
 * - WHO life tables
 * - Published lifestyle modifier meta-analyses
 *
 * DISCLAIMER: Entertainment purposes only. Not medical advice.
 */

import type {
  UserProfile, LEResult, LifeFactor, Action, Countdown,
  Sex, Ancestry, Region, SmokingStatus, AlcoholLevel,
  ExerciseLevel, FamilyLongevity, MaritalStatus, EducationLevel,
} from '@/types'

// ─── Base LE by sex (CDC NVSS 2022) ─────────────────────────────────────────
const BASE_LE: Record<Sex, number> = { male: 74.8, female: 80.2 }

// ─── Ancestry adjustments ────────────────────────────────────────────────────
const ANCESTRY_DELTA: Record<Ancestry, Record<Sex, number>> = {
  chinese:    { male: 11.5, female: 11.1 },
  japanese:   { male:  8.0, female:  8.8 },
  korean:     { male:  7.2, female:  8.0 },
  indian:     { male:  8.5, female:  9.0 },
  filipino:   { male:  5.5, female:  6.5 },
  vietnamese: { male:  2.7, female:  0.0 },
  hispanic:   { male:  5.2, female:  4.8 },
  white:      { male:  0.3, female:  0.1 },
  black:      { male: -5.7, female: -3.7 },
  native:     { male:-10.3, female: -9.0 },
  pacific:    { male:  3.0, female:  2.5 },
  mixed:      { male:  1.5, female:  1.0 },
  other:      { male:  0.0, female:  0.0 },
}

// ─── Region adjustments (delta vs US baseline, WHO/UN 2022-2023) ──────────────
const REGION_DELTA: Record<Region, number> = {
  // East Asia & Pacific — among the world's longest-lived populations
  japan:        5.0,   // ~84.5
  hongkong:     7.0,   // ~85.5 (world's highest)
  macau:        6.5,   // ~85.0
  singapore:    5.5,   // ~84.0
  korea:        4.2,   // ~83.7
  taiwan:       3.5,   // ~81.0
  china_tier1: -0.5,   // ~78.0 (Shanghai/Beijing/Shenzhen)
  china_other: -2.0,   // ~76.5

  // Oceania
  australia:    4.5,   // ~83.0
  new_zealand:  3.8,   // ~82.3

  // Western Europe
  switzerland:  5.2,   // ~83.7
  spain:        5.0,   // ~83.5
  italy:        4.8,   // ~83.3
  france:       4.2,   // ~82.7
  sweden:       4.5,   // ~83.0
  norway:       4.3,   // ~82.8
  iceland:      4.7,   // ~83.2
  ireland:      3.8,   // ~82.3
  netherlands:  3.5,   // ~82.0
  austria:      3.3,   // ~81.8
  belgium:      3.0,   // ~81.5
  germany:      2.8,   // ~81.3
  finland:      3.2,   // ~81.7
  denmark:      3.0,   // ~81.5
  portugal:     3.2,   // ~81.7
  greece:       3.0,   // ~81.5
  uk:           2.5,   // ~81.0

  // Eastern / Central Europe
  czechia:      0.5,   // ~79.0
  poland:      -0.5,   // ~78.0
  croatia:      0.3,   // ~78.8
  hungary:     -1.5,   // ~77.0
  romania:     -2.5,   // ~76.0
  bulgaria:    -3.0,   // ~75.5
  russia:      -5.5,   // ~73.0
  ukraine:     -6.5,   // ~72.0

  // North America
  canada:       3.5,   // ~82.0
  us:           0,     // ~78.5 (baseline)

  // Latin America & Caribbean
  chile:        2.0,   // ~80.5
  costa_rica:   2.5,   // ~81.0
  cuba:         1.5,   // ~80.0
  mexico:      -2.5,   // ~76.0
  colombia:    -1.0,   // ~77.5
  brazil:      -2.0,   // ~76.5
  argentina:   -1.5,   // ~77.0
  peru:        -2.0,   // ~76.5
  ecuador:     -1.5,   // ~77.0

  // Middle East & North Africa
  israel:       4.5,   // ~83.0
  uae:          1.0,   // ~79.5
  qatar:        1.5,   // ~80.0
  saudi_arabia: 0.0,   // ~78.5
  turkey:      -1.0,   // ~77.5
  iran:        -2.0,   // ~76.5
  egypt:       -6.5,   // ~72.0

  // South Asia
  india:       -8.0,   // ~70.5
  bangladesh:  -5.5,   // ~73.0
  pakistan:    -11.0,   // ~67.5
  nepal:       -7.5,   // ~71.0
  sri_lanka:   -1.5,   // ~77.0

  // Southeast Asia
  thailand:    -0.5,   // ~78.0
  vietnam:     -3.0,   // ~75.5
  malaysia:    -1.5,   // ~77.0
  philippines: -7.5,   // ~71.0
  indonesia:   -7.0,   // ~71.5
  cambodia:    -8.5,   // ~70.0
  myanmar:    -11.0,   // ~67.5

  // Sub-Saharan Africa
  south_africa: -12.5, // ~66.0
  kenya:       -15.0,  // ~63.5
  ethiopia:    -12.0,  // ~66.5
  ghana:       -14.5,  // ~64.0
  nigeria:     -24.0,  // ~54.5
  tanzania:    -12.5,  // ~66.0
  uganda:      -15.5,  // ~63.0
  congo_dr:    -18.0,  // ~60.5

  // Catch-all
  other:       -1.0,
}

// ─── Lifestyle modifiers ──────────────────────────────────────────────────────
function smokingDelta(s: SmokingStatus): number {
  const map: Record<SmokingStatus, number> = {
    never: 2.0, quit: 1.5, social: -1.5, light: -4.0, daily: -8.0, heavy: -12.0,
  }
  return map[s] ?? 0
}

function alcoholDelta(a: AlcoholLevel): number {
  const map: Record<AlcoholLevel, number> = {
    none: 0.5, light: 1.0, moderate: -1.0, heavy: -5.0,
  }
  return map[a] ?? 0
}

function exerciseDelta(e: ExerciseLevel): number {
  const map: Record<ExerciseLevel, number> = {
    none: -2.5, light: 0.5, moderate: 3.0, active: 4.5, athlete: 4.0,
  }
  return map[e] ?? 0
}

function dietDelta(score: number): number {
  return ((score - 5) / 5) * 3.5
}

function bmiDelta(bmi: number): number {
  if (bmi < 17)   return -5.0
  if (bmi < 18.5) return -2.0
  if (bmi < 25)   return  1.5
  if (bmi < 27.5) return  0.5
  if (bmi < 30)   return -1.0
  if (bmi < 35)   return -3.0
  if (bmi < 40)   return -6.0
  return -9.0
}

function sleepDelta(h: number): number {
  if (h < 5)    return -3.0
  if (h < 6)    return -1.5
  if (h < 7)    return -0.5
  if (h <= 8)   return  1.0
  if (h <= 9)   return  0.5
  return -1.0
}

function stressDelta(level: number): number {
  return -(Math.max(0, level - 4) * 0.4)
}

function familyDelta(f: FamilyLongevity): number {
  const map: Record<FamilyLongevity, number> = {
    very_long: 3.5, long: 2.0, average: 0, short: -2.5, very_short: -4.0,
  }
  return map[f] ?? 0
}

function marriageDelta(status: MaritalStatus, sex: Sex): number {
  if (status === 'married')   return sex === 'male' ? 2.7 : 1.5
  if (status === 'partnered') return sex === 'male' ? 1.5 : 0.8
  if (status === 'divorced')  return -0.5
  if (status === 'widowed')   return -1.0
  return 0
}

function childrenDelta(n: number): number {
  if (n === 0) return  0.0
  if (n === 1) return  0.5
  if (n === 2) return  1.0
  if (n === 3) return  0.5
  return -0.5
}

function educationDelta(e: EducationLevel): number {
  const map: Record<EducationLevel, number> = {
    less_than_hs: -2.5, high_school: -0.5, some_college: 0.5,
    bachelors: 2.0, graduate: 3.0,
  }
  return map[e] ?? 0
}

function survivalBonus(age: number): number {
  if (age < 10) return  0
  if (age < 20) return  1.5
  if (age < 30) return  2.5
  if (age < 40) return  3.5
  if (age < 50) return  5.0
  if (age < 60) return  7.0
  if (age < 70) return  9.0
  if (age < 80) return 12.0
  return 15.0
}

// ─── Main calculation ─────────────────────────────────────────────────────────
export function calculateLifeExpectancy(profile: UserProfile): LEResult {
  const {
    birthday, sex, ancestry, region, smoke, alcohol, exercise,
    dietScore, heightCm, weightKg, sleepHours, stressLevel,
    familyLongevity, maritalStatus, children, education,
  } = profile

  const birthDate = new Date(birthday)
  const now = new Date()
  const ageMs = now.getTime() - birthDate.getTime()
  const currentAgeExact = ageMs / (365.25 * 24 * 3600 * 1000)
  const currentAge = Math.floor(currentAgeExact)

  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)

  let le = BASE_LE[sex]
  const ancestryDelta = ancestry.length > 0
    ? ancestry.reduce((sum, a) => sum + ANCESTRY_DELTA[a][sex], 0) / ancestry.length
    : 0
  le += ancestryDelta
  le += REGION_DELTA[region]
  le += smokingDelta(smoke)
  le += alcoholDelta(alcohol)
  le += exerciseDelta(exercise)
  le += dietDelta(dietScore)
  le += bmiDelta(bmi)
  le += sleepDelta(sleepHours)
  le += stressDelta(stressLevel)
  le += familyDelta(familyLongevity)
  le += marriageDelta(maritalStatus, sex)
  le += childrenDelta(children)
  le += educationDelta(education)
  le += survivalBonus(currentAgeExact)

  le = Math.max(le, currentAgeExact + 1)
  le = Math.round(le * 10) / 10

  const yearsRemaining = Math.max(0, le - currentAgeExact)
  const secondsRemaining = yearsRemaining * 365.25 * 86400
  const deathDate = new Date(now.getTime() + secondsRemaining * 1000)

  const factors = buildFactors(profile, sex, bmi)

  return {
    lifeExpectancy: le,
    currentAge,
    currentAgeExact,
    yearsRemaining,
    secondsRemaining,
    deathDate: deathDate.toISOString(),
    bmi: Math.round(bmi * 10) / 10,
    factors,
  }
}

function buildFactors(
  profile: UserProfile,
  sex: Sex,
  bmi: number,
): LifeFactor[] {
  const {
    smoke, alcohol, exercise, dietScore, sleepHours, stressLevel,
    familyLongevity, maritalStatus, children, education, ancestry, region,
  } = profile

  return [
    {
      category: 'genetics',
      label: 'Ancestry & genetics',
      delta: (ancestry.length > 0
        ? ancestry.reduce((sum, a) => sum + ANCESTRY_DELTA[a][sex], 0) / ancestry.length
        : 0) + familyDelta(familyLongevity),
      detail: `${ancestry.length > 0 ? ancestry.join(', ') : 'not specified'} + ${familyLongevity.replace('_', ' ')} family`,
    },
    {
      category: 'location',
      label: 'Geographic location',
      delta: REGION_DELTA[region],
      detail: region.replace('_', ' '),
    },
    {
      category: 'smoking',
      label: 'Smoking',
      delta: smokingDelta(smoke),
      detail: smoke,
    },
    {
      category: 'alcohol',
      label: 'Alcohol',
      delta: alcoholDelta(alcohol),
      detail: `${alcohol} consumption`,
    },
    {
      category: 'exercise',
      label: 'Exercise',
      delta: exerciseDelta(exercise),
      detail: `${exercise} activity`,
    },
    {
      category: 'diet',
      label: 'Diet quality',
      delta: dietDelta(dietScore),
      detail: `${dietScore}/10 diet score`,
    },
    {
      category: 'weight',
      label: 'Body weight',
      delta: bmiDelta(bmi),
      detail: `BMI ${Math.round(bmi * 10) / 10}`,
    },
    {
      category: 'sleep',
      label: 'Sleep',
      delta: sleepDelta(sleepHours),
      detail: `${sleepHours}h average`,
    },
    {
      category: 'stress',
      label: 'Stress level',
      delta: stressDelta(stressLevel),
      detail: `${stressLevel}/10`,
    },
    {
      category: 'social',
      label: 'Relationships',
      delta: marriageDelta(maritalStatus, sex) + childrenDelta(children),
      detail: `${maritalStatus}, ${children} child${children !== 1 ? 'ren' : ''}`,
    },
    {
      category: 'education',
      label: 'Education',
      delta: educationDelta(education),
      detail: education.replace(/_/g, ' '),
    },
  ].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

// ─── Gamification actions ─────────────────────────────────────────────────────
export const ACTIONS: Action[] = [
  { key: 'workout',         label: 'Workout',          deltaSeconds:  3600, category: 'exercise', emoji: '💪' },
  { key: 'healthy_meal',    label: 'Healthy meal',     deltaSeconds:  1800, category: 'diet',     emoji: '🥗' },
  { key: 'meditation',      label: 'Meditation',       deltaSeconds:  1200, category: 'mind',     emoji: '🧘' },
  { key: 'great_sleep',     label: '8h sleep',         deltaSeconds:   600, category: 'sleep',    emoji: '😴' },
  { key: 'quit_smoking',    label: 'Quit smoking',     deltaSeconds:   900, category: 'smoking',  emoji: '🚭' },
  { key: 'no_alcohol',      label: 'Alcohol-free day', deltaSeconds:   300, category: 'alcohol',  emoji: '💧' },
  { key: 'walk_10k',        label: '10k steps',        deltaSeconds:  1500, category: 'exercise', emoji: '🚶' },
  { key: 'veggies',         label: '5 portions veg',   deltaSeconds:   900, category: 'diet',     emoji: '🥦' },
  { key: 'smoked',          label: 'Smoked',           deltaSeconds: -7200, category: 'smoking',  emoji: '🚬' },
  { key: 'heavy_drinking',  label: 'Heavy drinking',   deltaSeconds: -1800, category: 'alcohol',  emoji: '🍺' },
  { key: 'junk_food',       label: 'Junk food',        deltaSeconds: -1200, category: 'diet',     emoji: '🍔' },
  { key: 'no_sleep',        label: '<5h sleep',        deltaSeconds: -2700, category: 'sleep',    emoji: '😵' },
  { key: 'skipped_workout', label: 'Skipped workout',  deltaSeconds:  -600, category: 'exercise', emoji: '🛋️' },
  { key: 'high_stress',     label: 'High stress day',  deltaSeconds:  -900, category: 'mind',     emoji: '😤' },
]

// ─── Formatting helpers ───────────────────────────────────────────────────────
export function formatDelta(seconds: number): string {
  const abs = Math.abs(seconds)
  const sign = seconds >= 0 ? '+' : '−'
  if (abs < 60)    return `${sign}${abs}s` 
  if (abs < 3600)  return `${sign}${Math.floor(abs / 60)}m` 
  if (abs < 86400) return `${sign}${Math.floor(abs / 3600)}h ${Math.floor((abs % 3600) / 60)}m` 
  return `${sign}${(abs / 86400).toFixed(1)}d` 
}

export function formatCountdown(totalSeconds: number): Countdown {
  const s = Math.max(0, Math.floor(totalSeconds))
  return {
    years:   Math.floor(s / (365.25 * 86400)),
    months:  Math.floor((s % (365.25 * 86400)) / (30.44 * 86400)),
    days:    Math.floor((s % (30.44 * 86400)) / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}
