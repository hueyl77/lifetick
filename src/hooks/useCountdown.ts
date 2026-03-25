'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatCountdown } from '@/lib/lifeExpectancy'
import type { Countdown } from '@/types'

interface UseCountdownOptions {
  lifeExpectancy: number | null
  birthday: string | null
  bonusSeconds: number
}

interface UseCountdownReturn {
  countdown: Countdown
  lifeProgressPct: number
  monthProgressPct: number
  dayProgressPct: number
  minuteProgressPct: number
  secondProgressPct: number
  ageExact: number
  deathDate: Date | null
}

const EMPTY: Countdown = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }

export function useCountdown({
  lifeExpectancy,
  birthday,
  bonusSeconds,
}: UseCountdownOptions): UseCountdownReturn {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  const compute = useCallback(() => {
    if (!lifeExpectancy || !birthday) {
      return {
        countdown: EMPTY,
        lifeProgressPct: 0.5,
        monthProgressPct: 0.5,
        dayProgressPct: 0.5,
        minuteProgressPct: 0.5,
        secondProgressPct: 0.5,
        ageExact: 0,
        deathDate: null,
      }
    }

    const now = new Date()
    const birthDate = new Date(birthday)
    const totalSec = lifeExpectancy * 365.25 * 86400 + bonusSeconds
    const livedSec = (now.getTime() - birthDate.getTime()) / 1000
    const remainSec = Math.max(0, totalSec - livedSec)
    const ageExact = livedSec / (365.25 * 86400)

    const month = now.getMonth() + 1
    const day = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), month, 0).getDate()
    const minSec = now.getMinutes() * 60 + now.getSeconds()
    const sec = now.getSeconds()

    const deathDate = new Date(now.getTime() + remainSec * 1000)

    return {
      countdown: formatCountdown(remainSec),
      lifeProgressPct: Math.min(1, livedSec / totalSec),
      monthProgressPct: month / 12,
      dayProgressPct: day / daysInMonth,
      minuteProgressPct: minSec / 3600,
      secondProgressPct: sec / 60,
      ageExact,
      deathDate,
    }
  }, [lifeExpectancy, birthday, bonusSeconds, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return compute()
}
