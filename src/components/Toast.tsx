'use client'

import { useEffect, useState } from 'react'
import type { LogEntry } from '@/types'
import { formatDelta } from '@/lib/lifeExpectancy'

interface ToastProps {
  entry: LogEntry | null
  visible: boolean
}

export default function Toast({ entry, visible }: ToastProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      setMounted(true)
    } else {
      const t = setTimeout(() => setMounted(false), 350)
      return () => clearTimeout(t)
    }
  }, [visible])

  if (!mounted || !entry) return null

  const isPos = entry.deltaSeconds > 0
  const color = isPos ? 'var(--pos)' : 'var(--neg)'
  const bg    = isPos ? 'var(--pos-bg)' : 'var(--neg-bg)'

  return (
    <div style={{
      position: 'fixed',
      top: 'max(60px, env(safe-area-inset-top, 60px))',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(calc(100% - 32px), 448px)',
      zIndex: 200,
      background: bg,
      border: `0.5px solid ${color}`,
      borderRadius: 12,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: `${visible ? 'slideDown' : 'slideUp'} 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
    }}>
      <span style={{ fontSize: 22 }}>{entry.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color }}>
          {formatDelta(entry.deltaSeconds)}{' '}
          {isPos ? 'added to your life' : 'removed from your life'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
          {entry.label} logged
        </div>
      </div>
    </div>
  )
}
