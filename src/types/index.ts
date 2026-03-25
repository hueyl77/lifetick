// ─── Profile ────────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female'

export type Ancestry =
  | 'chinese' | 'japanese' | 'korean' | 'indian' | 'filipino' | 'vietnamese'
  | 'hispanic' | 'white' | 'black' | 'native' | 'pacific' | 'mixed' | 'other'

export type Region =
  // East Asia & Pacific
  | 'japan' | 'hongkong' | 'macau' | 'singapore' | 'korea' | 'taiwan'
  | 'china_tier1' | 'china_other'
  // Oceania
  | 'australia' | 'new_zealand'
  // Western Europe
  | 'switzerland' | 'spain' | 'italy' | 'france' | 'sweden' | 'norway'
  | 'iceland' | 'ireland' | 'netherlands' | 'austria' | 'belgium'
  | 'germany' | 'finland' | 'denmark' | 'portugal' | 'greece' | 'uk'
  // Eastern / Central Europe
  | 'czechia' | 'poland' | 'croatia' | 'hungary' | 'romania' | 'bulgaria'
  | 'russia' | 'ukraine'
  // North America
  | 'canada' | 'us'
  // Latin America & Caribbean
  | 'chile' | 'costa_rica' | 'cuba' | 'mexico' | 'colombia' | 'brazil'
  | 'argentina' | 'peru' | 'ecuador'
  // Middle East & North Africa
  | 'israel' | 'uae' | 'qatar' | 'saudi_arabia' | 'turkey' | 'iran' | 'egypt'
  // South Asia
  | 'india' | 'bangladesh' | 'pakistan' | 'nepal' | 'sri_lanka'
  // Southeast Asia
  | 'thailand' | 'vietnam' | 'malaysia' | 'philippines' | 'indonesia' | 'cambodia' | 'myanmar'
  // Sub-Saharan Africa
  | 'south_africa' | 'kenya' | 'ethiopia' | 'ghana' | 'nigeria'
  | 'tanzania' | 'uganda' | 'congo_dr'
  // Catch-all
  | 'other'

export type SmokingStatus = 'never' | 'quit' | 'social' | 'light' | 'daily' | 'heavy'
export type AlcoholLevel  = 'none' | 'light' | 'moderate' | 'heavy'
export type ExerciseLevel = 'none' | 'light' | 'moderate' | 'active' | 'athlete'
export type FamilyLongevity = 'very_long' | 'long' | 'average' | 'short' | 'very_short'
export type MaritalStatus = 'married' | 'partnered' | 'single' | 'divorced' | 'widowed'
export type EducationLevel =
  | 'less_than_hs' | 'high_school' | 'some_college' | 'bachelors' | 'graduate'

export interface UserProfile {
  birthday: string
  sex: Sex
  ancestry: Ancestry[]
  region: Region
  smoke: SmokingStatus
  alcohol: AlcoholLevel
  exercise: ExerciseLevel
  dietScore: number
  heightCm: number
  weightKg: number
  sleepHours: number
  stressLevel: number
  familyLongevity: FamilyLongevity
  maritalStatus: MaritalStatus
  children: number
  education: EducationLevel
}

export const DEFAULT_PROFILE: UserProfile = {
  birthday: '1990-01-01',
  sex: 'male',
  ancestry: [],
  region: 'us',
  smoke: 'never',
  alcohol: 'light',
  exercise: 'moderate',
  dietScore: 5,
  heightCm: 175,
  weightKg: 75,
  sleepHours: 7,
  stressLevel: 5,
  familyLongevity: 'average',
  maritalStatus: 'single',
  children: 0,
  education: 'bachelors',
}

export interface LifeFactor {
  category: string
  label: string
  delta: number
  detail: string
}

export interface LEResult {
  lifeExpectancy: number
  currentAge: number
  currentAgeExact: number
  yearsRemaining: number
  secondsRemaining: number
  deathDate: string
  bmi: number
  factors: LifeFactor[]
}

export interface Action {
  key: string
  label: string
  deltaSeconds: number
  category: 'exercise' | 'diet' | 'mind' | 'sleep' | 'smoking' | 'alcohol'
  emoji: string
}

export interface LogEntry {
  id: string
  actionKey: string
  label: string
  deltaSeconds: number
  emoji: string
  timestamp: string
}

export interface Countdown {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface AppState {
  onboardingComplete: boolean
  profile: UserProfile
  result: LEResult | null
  bonusSeconds: number
  logEntries: LogEntry[]
  streak: number
  lastLogDate: string | null
  totalPositiveSeconds: number
  totalNegativeSeconds: number
}
