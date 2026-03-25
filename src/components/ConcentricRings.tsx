'use client'

import { useCountdown } from '@/hooks/useCountdown'

const RINGS = [
  { key: 'year',   color: '#9B8FE0', r: 138, label: 'Years'   },
  { key: 'month',  color: '#5DCAA5', r: 121, label: 'Months'  },
  { key: 'day',    color: '#E8A950', r: 104, label: 'Days'    },
  { key: 'minute', color: '#D4537E', r:  87, label: 'Minutes' },
  { key: 'second', color: '#5B9FE8', r:  70, label: 'Seconds' },
]

const STROKE = 11
const SIZE = 300
const CX = SIZE / 2

function arc(r: number, pct: number) {
  const circ = 2 * Math.PI * r
  const used = circ * Math.min(1, Math.max(0, pct))
  return `${used} ${circ - used}`
}

interface Props {
  lifeExpectancy: number | null
  birthday: string | null
  bonusSeconds: number
  size?: number
}

export default function ConcentricRings({
  lifeExpectancy,
  birthday,
  bonusSeconds,
  size = 300,
}: Props) {
  const scale = size / SIZE

  const {
    lifeProgressPct,
    monthProgressPct,
    dayProgressPct,
    minuteProgressPct,
    secondProgressPct,
    ageExact,
  } = useCountdown({ lifeExpectancy, birthday, bonusSeconds })

  const progresses = {
    year:   lifeProgressPct,
    month:  monthProgressPct,
    day:    dayProgressPct,
    minute: minuteProgressPct,
    second: secondProgressPct,
  } as Record<string, number>

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0 }}
      >
        {RINGS.map(ring => (
          <g key={ring.key}>
            {/* Background track */}
            <circle
              cx={CX} cy={CX} r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={STROKE}
              opacity={0.12}
            />
            {/* Progress arc */}
            <circle
              cx={CX} cy={CX} r={ring.r}
              fill="none"
              stroke={ring.color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={arc(ring.r, progresses[ring.key])}
              transform={`rotate(-90 ${CX} ${CX})`}
              className="ring-arc"
            />
          </g>
        ))}
      </svg>

      {/* Center overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: Math.round(52 * scale),
          color: 'var(--text)',
          lineHeight: 1,
          letterSpacing: '-2px',
        }}>
          {Math.max(0, (lifeExpectancy ?? 0) - ageExact).toFixed(1)}
        </div>
        <div style={{
          fontSize: Math.round(10 * scale),
          color: 'var(--text-3)',
          marginTop: 4,
          letterSpacing: '0.04em',
        }}>
          yrs remain
        </div>
        <div style={{
          fontSize: Math.round(11 * scale),
          color: 'var(--text-3)',
          marginTop: 6,
        }}>
          {ageExact.toFixed(1)}y lived
        </div>
      </div>
    </div>
  )
}

// Reusable ring legend
export function RingLegend() {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      flexWrap: 'wrap',
      justifyContent: 'center',
    }}>
      {RINGS.map(r => (
        <div key={r.key} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: 'var(--text-2)',
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: r.color,
          }} />
          {r.label}
        </div>
      ))}
    </div>
  )
}
