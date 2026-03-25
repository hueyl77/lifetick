'use client'

import { useState, useRef, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import Toast from '@/components/Toast'
import { useStore } from '@/store/useStore'
import { ACTIONS, formatDelta } from '@/lib/lifeExpectancy'
import type { LogEntry } from '@/types'

const CATEGORIES = ['All', 'exercise', 'diet', 'mind', 'sleep', 'smoking', 'alcohol'] as const
type Category = typeof CATEGORIES[number]

function ActionCard({
  action,
  onLog,
}: {
  action: typeof ACTIONS[0]
  onLog: (key: string) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isPos = action.deltaSeconds > 0

  function handleClick() {
    onLog(action.key)
    const el = cardRef.current
    if (!el) return
    el.classList.remove('flash-pos', 'flash-neg')
    void el.offsetWidth // force reflow
    el.classList.add(isPos ? 'flash-pos' : 'flash-neg')
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      style={{
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{action.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
          {action.label}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, marginTop: 2,
          color: isPos ? 'var(--pos)' : 'var(--neg)',
        }}>
          {formatDelta(action.deltaSeconds)}
        </div>
      </div>
    </div>
  )
}

export default function LogPage() {
  const { logAction, getTodayEntries, getTodayDelta, streak, totalPositiveSeconds } = useStore()
  const [category, setCategory] = useState<Category>('All')
  const [lastEntry, setLastEntry] = useState<LogEntry | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>()

  const todayEntries = getTodayEntries()
  const todayDelta   = getTodayDelta()

  const handleLog = useCallback((key: string) => {
    const entry = logAction(key)
    if (!entry) return
    setLastEntry(entry)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 3200)
  }, [logAction])

  const filtered = category === 'All'
    ? ACTIONS
    : ACTIONS.filter(a => a.category === category)

  const positive = filtered.filter(a => a.deltaSeconds > 0)
  const negative = filtered.filter(a => a.deltaSeconds < 0)

  return (
    <>
      <Toast entry={lastEntry} visible={toastVisible} />

      <main style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px 20px 100px',
      }}>
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { value: String(streak), label: 'day streak 🔥', color: 'var(--text)' },
            {
              value: formatDelta(todayDelta || 0),
              label: "today's change",
              color: todayDelta >= 0 ? 'var(--pos)' : 'var(--neg)',
            },
            {
              value: `+${Math.round(totalPositiveSeconds / 60)}m`,
              label: 'total gained',
              color: 'var(--pos)',
            },
          ].map(card => (
            <div key={card.label} style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: 14, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 20, fontWeight: 700, color: card.color,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div style={{
          display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4,
          marginBottom: 16, scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pill${category === cat ? ' selected' : ''}`}
              onClick={() => setCategory(cat)}
              style={{ flexShrink: 0 }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Positive actions */}
        {positive.length > 0 && (
          <>
            <div style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-3)', fontWeight: 500, marginBottom: 8,
            }}>
              Add time to your life
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              {positive.map(a => <ActionCard key={a.key} action={a} onLog={handleLog} />)}
            </div>
          </>
        )}

        {/* Negative actions */}
        {negative.length > 0 && (
          <>
            <div style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-3)', fontWeight: 500, marginBottom: 8,
            }}>
              Subtract time
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              {negative.map(a => <ActionCard key={a.key} action={a} onLog={handleLog} />)}
            </div>
          </>
        )}

        {/* Today's log */}
        {todayEntries.length > 0 && (
          <>
            <div style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-3)', fontWeight: 500, marginBottom: 8, marginTop: 8,
            }}>
              Today's log
            </div>
            <div>
              {todayEntries.map(entry => {
                const isPos = entry.deltaSeconds > 0
                return (
                  <div key={entry.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 0', borderBottom: '0.5px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <span>{entry.emoji}</span>
                    <span style={{ flex: 1, color: 'var(--text-2)' }}>{entry.label}</span>
                    <span style={{ fontWeight: 600, color: isPos ? 'var(--pos)' : 'var(--neg)' }}>
                      {formatDelta(entry.deltaSeconds)}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>
                      {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      <NavBar />
    </>
  )
}
