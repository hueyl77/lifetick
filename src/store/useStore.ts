'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculateLifeExpectancy, ACTIONS } from '@/lib/lifeExpectancy'
import type { AppState, UserProfile, LogEntry, LEResult } from '@/types'
import { DEFAULT_PROFILE } from '@/types'

interface Store extends AppState {
  // Actions
  setProfile: (updates: Partial<UserProfile>) => void
  completeOnboarding: (profile: UserProfile) => void
  recalculate: () => void
  logAction: (actionKey: string) => LogEntry | null
  getTodayEntries: () => LogEntry[]
  getTodayDelta: () => number
  getEffectiveSecondsRemaining: () => number
  reset: () => void
}

const initialState: AppState = {
  onboardingComplete: false,
  profile: DEFAULT_PROFILE,
  result: null,
  bonusSeconds: 0,
  logEntries: [],
  streak: 0,
  lastLogDate: null,
  totalPositiveSeconds: 0,
  totalNegativeSeconds: 0,
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile(updates) {
        set(state => ({ profile: { ...state.profile, ...updates } }))
      },

      completeOnboarding(profile) {
        const result = calculateLifeExpectancy(profile)
        // Convert Date to string for serialization
        const resultSerializable: LEResult = {
          ...result,
          deathDate: result.deathDate,
        }
        set({ profile, result: resultSerializable, onboardingComplete: true })
      },

      recalculate() {
        const { profile } = get()
        if (!profile.birthday) return
        const result = calculateLifeExpectancy(profile)
        set({ result })
      },

      logAction(actionKey) {
        const action = ACTIONS.find(a => a.key === actionKey)
        if (!action) return null

        const now = new Date()
        const today = now.toDateString()
        const { lastLogDate, streak } = get()

        let newStreak = streak
        if (lastLogDate !== today) {
          const yesterday = new Date(now.getTime() - 86400000).toDateString()
          newStreak = lastLogDate === yesterday ? streak + 1 : 1
        }

        const entry: LogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          actionKey,
          label: action.label,
          deltaSeconds: action.deltaSeconds,
          emoji: action.emoji,
          timestamp: now.toISOString(),
        }

        set(state => ({
          bonusSeconds: state.bonusSeconds + action.deltaSeconds,
          logEntries: [entry, ...state.logEntries].slice(0, 500),
          streak: newStreak,
          lastLogDate: today,
          totalPositiveSeconds: action.deltaSeconds > 0
            ? state.totalPositiveSeconds + action.deltaSeconds
            : state.totalPositiveSeconds,
          totalNegativeSeconds: action.deltaSeconds < 0
            ? state.totalNegativeSeconds + Math.abs(action.deltaSeconds)
            : state.totalNegativeSeconds,
        }))

        return entry
      },

      getTodayEntries() {
        const today = new Date().toDateString()
        return get().logEntries.filter(e =>
          new Date(e.timestamp).toDateString() === today
        )
      },

      getTodayDelta() {
        return get().getTodayEntries().reduce((sum, e) => sum + e.deltaSeconds, 0)
      },

      getEffectiveSecondsRemaining() {
        const { result, bonusSeconds } = get()
        if (!result) return 0
        const livedSec = (Date.now() - new Date(get().profile.birthday).getTime()) / 1000
        return result.secondsRemaining - (Date.now() / 1000 - livedSec) + bonusSeconds
      },

      reset() {
        set(initialState)
      },
    }),
    {
      name: 'lifetick-storage',
      // Only persist these keys
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        profile: state.profile,
        result: state.result,
        bonusSeconds: state.bonusSeconds,
        logEntries: state.logEntries,
        streak: state.streak,
        lastLogDate: state.lastLogDate,
        totalPositiveSeconds: state.totalPositiveSeconds,
        totalNegativeSeconds: state.totalNegativeSeconds,
      }),
    }
  )
)
