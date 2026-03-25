'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function RootPage() {
  const router = useRouter()
  const onboardingComplete = useStore(s => s.onboardingComplete)

  useEffect(() => {
    if (onboardingComplete) {
      router.replace('/clock')
    } else {
      router.replace('/onboarding')
    }
  }, [onboardingComplete, router])

  // Splash while redirecting
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 32,
        color: 'var(--text)',
        letterSpacing: '2px',
      }}>
        LifeTick
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
        YOUR LIFE, TICKING
      </div>
    </div>
  )
}
