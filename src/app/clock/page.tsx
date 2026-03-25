'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import ConcentricRings, { RingLegend } from '@/components/ConcentricRings'
import NavBar from '@/components/NavBar'
import { useStore } from '@/store/useStore'
import { useCountdown } from '@/hooks/useCountdown'
import { formatDelta, ACTIONS } from '@/lib/lifeExpectancy'

function CountdownTile({
  value,
  label,
  color,
  flash,
}: {
  value: number
  label: string
  color: string
  flash?: boolean
}) {
  return (
    <div
      className={flash ? 'tile-flash' : ''}
      style={{
        flex: 1,
        background: 'var(--bg-card)',
        border: '0.5px solid var(--border)',
        borderRadius: 8,
        padding: '10px 4px',
        textAlign: 'center',
      }}
    >
      <div style={{
        fontSize: 16, fontWeight: 700, color,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 8, color: 'var(--text-3)', marginTop: 3,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        {label}
      </div>
    </div>
  )
}

export default function ClockPage() {
  const router = useRouter()
  const { result, bonusSeconds, profile, getTodayDelta, onboardingComplete, reset } = useStore()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const todayDelta = getTodayDelta()
  const prevSecRef = useRef(-1)

  const {
    countdown,
    ageExact,
    deathDate,
  } = useCountdown({
    lifeExpectancy: result?.lifeExpectancy ?? null,
    birthday: profile.birthday,
    bonusSeconds,
  })

  // Redirect if not onboarded
  useEffect(() => {
    if (!onboardingComplete) router.replace('/onboarding')
  }, [onboardingComplete, router])

  const secFlash = countdown.seconds !== prevSecRef.current
  if (secFlash) prevSecRef.current = countdown.seconds

  if (!result) return null

  const deathDateStr = deathDate
    ? deathDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <>
      <main style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        padding: '0 20px 100px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 0 8px',
        }}>
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 18, letterSpacing: '1px', color: 'var(--text)',
          }}>
            LifeTick
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowDeleteDialog(true)}
              style={{
                padding: '6px 14px', border: '0.5px solid var(--border-mid)',
                borderRadius: 20, fontSize: 12, color: 'var(--neg, #e53e3e)',
                background: 'none', cursor: 'pointer',
              }}
            >
              Delete data
            </button>
            <button
              onClick={() => {
                const text = `My LifeTick: ${Math.floor(ageExact)} yrs lived, ${countdown.years} yrs remain. Life expectancy: ${result.lifeExpectancy} yrs.\n\nlifetick.app`
                if (navigator.share) {
                  navigator.share({ title: 'My LifeTick', text })
                } else {
                  navigator.clipboard.writeText(text)
                }
              }}
              style={{
                padding: '6px 14px', border: '0.5px solid var(--border-mid)',
                borderRadius: 20, fontSize: 12, color: 'var(--text-2)',
                background: 'none', cursor: 'pointer',
              }}
            >
              Share
            </button>
          </div>
        </div>

        {/* LE banner */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            est. life expectancy
          </span>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--text)' }}>
            {result.lifeExpectancy}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>years</span>
        </div>

        {/* Rings */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <ConcentricRings
            lifeExpectancy={result.lifeExpectancy}
            birthday={profile.birthday}
            bonusSeconds={bonusSeconds}
            size={300}
          />
        </div>

        {/* Legend */}
        <div style={{ marginBottom: 16 }}>
          <RingLegend />
        </div>

        {/* Countdown tiles */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
          <CountdownTile value={countdown.years}   label="yrs"  color="#9B8FE0" />
          <CountdownTile value={countdown.months}  label="mo"   color="#5DCAA5" />
          <CountdownTile value={countdown.days}    label="days" color="#E8A950" />
          <CountdownTile value={countdown.hours}   label="hrs"  color="#D4537E" />
          <CountdownTile value={countdown.minutes} label="min"  color="#D4537E" />
          <CountdownTile value={countdown.seconds} label="sec"  color="#5B9FE8" flash={secFlash} />
        </div>

        {/* Today delta */}
        {todayDelta !== 0 && (
          <div style={{
            borderRadius: 12, padding: '14px', textAlign: 'center', marginBottom: 16,
            background: todayDelta > 0 ? 'var(--pos-bg)' : 'var(--neg-bg)',
          }}>
            <div style={{
              fontSize: 22, fontWeight: 700,
              color: todayDelta > 0 ? 'var(--pos)' : 'var(--neg)',
            }}>
              {formatDelta(todayDelta)} today
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
              from your logged actions
            </div>
          </div>
        )}

        {/* Death date */}
        <div style={{
          textAlign: 'center', paddingTop: 16,
          borderTop: '0.5px solid var(--border)',
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: 6,
          }}>
            estimated end date
          </div>
          <div style={{
            fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--text)', marginBottom: 8,
          }}>
            {deathDateStr}
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
            Entertainment only. Log healthy habits to push this date forward.
          </p>
        </div>

        {/* Factors breakdown */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: 12,
          }}>
            How your estimate is calculated
          </div>
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            {result.factors.map((f, i) => (
              <div key={f.category} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px',
                borderTop: i > 0 ? '0.5px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {f.detail}
                  </div>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
                  color: f.delta > 0 ? 'var(--pos, #5DCAA5)' : f.delta < 0 ? 'var(--neg, #e53e3e)' : 'var(--text-3)',
                  whiteSpace: 'nowrap', marginLeft: 12,
                }}>
                  {f.delta > 0 ? '+' : ''}{f.delta.toFixed(1)} yr
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips to earn LifeTicks */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-3)', marginBottom: 12,
          }}>
            Earn more LifeTicks
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
          }}>
            {ACTIONS.filter(a => a.deltaSeconds > 0).map(a => (
              <div key={a.key} style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: 10, padding: '12px',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{a.emoji}</div>
                <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                  {a.label}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--pos, #5DCAA5)', fontWeight: 600, marginTop: 4,
                }}>
                  +{formatDelta(a.deltaSeconds)}
                </div>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 11, color: 'var(--text-3)', textAlign: 'center',
            marginTop: 16, lineHeight: 1.5,
          }}>
            Log these actions daily to push your clock forward
          </p>
        </div>
      </main>

      {showDeleteDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: '28px 24px',
            maxWidth: 340, width: '90%', textAlign: 'center',
            border: '0.5px solid var(--border)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              Delete all data?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.5 }}>
              This will permanently erase all your data stored on this device. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteDialog(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: 'var(--bg-elevated)', border: '0.5px solid var(--border)',
                  color: 'var(--text)', fontSize: 14, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { reset(); setShowDeleteDialog(false); router.push('/onboarding') }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: '#e53e3e', border: 'none',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      <NavBar />
    </>
  )
}
