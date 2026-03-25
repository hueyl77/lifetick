'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/components/NavBar'
import { useStore } from '@/store/useStore'

const IMPROVEMENTS = [
  { action: 'Exercise 3–4× per week (vs 1×)', gain: '+1.5 yrs' },
  { action: 'Improve diet to 6/10 quality',   gain: '+1.0 yr'  },
  { action: 'Quit occasional smoking',         gain: '+0.5 yr'  },
  { action: 'Air filtration indoors (Xi\'an)', gain: '+0.8 yr'  },
  { action: 'Reach healthy BMI (~25)',         gain: '+1.0 yr'  },
]

export default function StatsPage() {
  const router = useRouter()
  const {
    result, bonusSeconds, profile, onboardingComplete,
    totalPositiveSeconds, streak, logEntries,
    reset,
  } = useStore()

  useEffect(() => {
    if (!onboardingComplete) router.replace('/onboarding')
  }, [onboardingComplete, router])

  if (!result) return null

  const netBonus = bonusSeconds
  const totalEntries = logEntries.length

  return (
    <>
      <main style={{
        minHeight: '100dvh',
        maxWidth: 480,
        margin: '0 auto',
        padding: '16px 20px 100px',
      }}>

        {/* Top stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            { value: String(result.lifeExpectancy), label: 'life exp.', color: 'var(--text)' },
            {
              value: netBonus >= 0
                ? `+${Math.round(netBonus / 60)}m` 
                : `-${Math.round(Math.abs(netBonus) / 60)}m`,
              label: 'net bonus',
              color: netBonus >= 0 ? 'var(--pos)' : 'var(--neg)',
            },
            { value: String(result.currentAge), label: 'age now', color: 'var(--text)' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color, lineHeight: 1 }}>
                {c.value}
              </div>
              <div style={{
                fontSize: 9, color: 'var(--text-3)', marginTop: 4,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Activity stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {[
            { value: String(streak),       label: 'day streak',   color: 'var(--warn)' },
            { value: String(totalEntries), label: 'total actions', color: 'var(--text)' },
            {
              value: `+${Math.round(totalPositiveSeconds / 60)}m`,
              label: 'total gained',
              color: 'var(--pos)',
            },
          ].map(c => (
            <div key={c.label} style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color, lineHeight: 1 }}>
                {c.value}
              </div>
              <div style={{
                fontSize: 9, color: 'var(--text-3)', marginTop: 4,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Factor breakdown */}
        <div style={{
          fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', fontWeight: 500, marginBottom: 12,
        }}>
          Your factors
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 16, padding: '4px 16px', marginBottom: 20,
        }}>
          {result.factors.map((f, i) => {
            const isPos = f.delta >= 0
            const color = isPos ? 'var(--pos)' : 'var(--neg)'
            const barPct = Math.min(100, Math.abs(f.delta) / 15 * 100)
            const barColor = isPos ? '#4CAF7D' : '#E05252'

            return (
              <div
                key={f.category}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 0',
                  borderBottom: i < result.factors.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{f.detail}</div>
                </div>
                <div style={{ width: 72 }}>
                  <div style={{
                    height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${barPct}%`,
                      background: barColor, borderRadius: 2,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, color,
                  minWidth: 52, textAlign: 'right',
                }}>
                  {f.delta > 0 ? '+' : ''}{f.delta.toFixed(1)}y
                </div>
              </div>
            )
          })}
        </div>

        {/* BMI */}
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>BMI</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              {profile.weightKg}kg / {profile.heightCm}cm
            </div>
          </div>
          <div style={{
            fontSize: 24, fontWeight: 700,
            color: result.bmi < 25 ? 'var(--pos)' : result.bmi < 30 ? 'var(--warn)' : 'var(--neg)',
          }}>
            {result.bmi}
          </div>
        </div>

        {/* Improvements */}
        <div style={{
          fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', fontWeight: 500, marginBottom: 12,
        }}>
          How to gain more time
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 16, padding: '4px 16px', marginBottom: 24,
        }}>
          {IMPROVEMENTS.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 0', fontSize: 13,
              borderBottom: i < IMPROVEMENTS.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-2)', flex: 1, paddingRight: 12 }}>{item.action}</span>
              <span style={{ fontWeight: 600, color: 'var(--pos)', flexShrink: 0 }}>{item.gain}</span>
            </div>
          ))}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '11px 0',
            borderTop: '0.5px solid var(--border)',
            fontSize: 13,
          }}>
            <span style={{ color: 'var(--text-2)' }}>Total potential</span>
            <span style={{ fontWeight: 700, color: 'var(--pos)' }}>
              +4.8 yrs → {(result.lifeExpectancy + 4.8).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Profile summary */}
        <div style={{
          fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--text-3)', fontWeight: 500, marginBottom: 12,
        }}>
          Your profile
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 16, padding: '4px 16px', marginBottom: 24,
        }}>
          {[
            { label: 'Birthday',    value: new Date(profile.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: 'Sex',         value: profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) },
            { label: 'Ancestry',    value: profile.ancestry.length > 0 ? profile.ancestry.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : 'Not specified' },
            { label: 'Region',      value: profile.region.replace(/_/g, ' ') },
            { label: 'Smoking',     value: profile.smoke },
            { label: 'Alcohol',     value: profile.alcohol },
            { label: 'Exercise',    value: profile.exercise },
            { label: 'Diet',        value: `${profile.dietScore}/10` },
            { label: 'Sleep',       value: `${profile.sleepHours}h` },
            { label: 'Stress',      value: `${profile.stressLevel}/10` },
            { label: 'Status',      value: profile.maritalStatus },
            { label: 'Children',    value: String(profile.children) },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '9px 0', fontSize: 13,
              borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-3)' }}>{row.label}</span>
              <span style={{ color: 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm('Reset all data and start over?')) {
              reset()
              router.replace('/onboarding')
            }
          }}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            border: '0.5px solid var(--border)', background: 'none',
            color: 'var(--text-3)', fontSize: 13, cursor: 'pointer',
          }}
        >
          Reset &amp; start over
        </button>
      </main>

      <NavBar />
    </>
  )
}
