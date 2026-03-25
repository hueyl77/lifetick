'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PillGroup from '@/components/ui/PillGroup'
import { useStore } from '@/store/useStore'
import { DEFAULT_PROFILE } from '@/types'
import type { UserProfile } from '@/types'

const STEPS = 4

function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
      {Array.from({ length: STEPS }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6,
          borderRadius: 3,
          background: i === current ? '#5B9FE8' : 'var(--border-mid)',
          transition: 'width 0.3s, background 0.3s',
        }} />
      ))}
    </div>
  )
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 10, marginTop: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.03em' }}>
        {children}
      </div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

function NumberStepper({
  label, value, onChange, suffix, min, max, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void
  suffix?: string; min?: number; max?: number; step?: number
}) {
  const decimals = step < 1 ? String(step).split('.')[1]?.length ?? 1 : 0
  const display = decimals > 0 ? value.toFixed(decimals) : String(value)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--bg-card)', border: '0.5px solid var(--border)',
      borderRadius: 12, padding: '14px 16px', marginBottom: 10,
    }}>
      <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => onChange(Math.max(min ?? 0, parseFloat((value - step).toFixed(decimals))))}
          style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)', color: 'var(--text)',
            fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', minWidth: 60, textAlign: 'center' }}>
          {display}{suffix ? ` ${suffix}` : ''}
        </span>
        <button
          onClick={() => onChange(Math.min(max ?? 999, parseFloat((value + step).toFixed(decimals))))}
          style={{
            width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)',
            border: '0.5px solid var(--border)', color: 'var(--text)',
            fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >+</button>
      </div>
    </div>
  )
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function Step1({ data, update }: { data: UserProfile; update: (p: Partial<UserProfile>) => void }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const reset = useStore(s => s.reset)
  const router = useRouter()

  function handleDelete() {
    reset()
    setShowDeleteDialog(false)
    router.push('/onboarding')
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
        Tell us about you
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 24, lineHeight: 1.6 }}>
        No data collected. Everything is stored locally on your device and can be{' '}
        <a
          href="#"
          onClick={e => { e.preventDefault(); setShowDeleteDialog(true) }}
          style={{ color: 'var(--text-2)', textDecoration: 'underline', cursor: 'pointer' }}
        >
          deleted anytime
        </a>
        .
      </p>

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
                onClick={handleDelete}
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

      <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        This shapes your baseline life expectancy
      </p>

      <FieldLabel>Biological sex</FieldLabel>
      <PillGroup
        options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
        value={data.sex}
        onChange={v => update({ sex: v })}
      />

      <FieldLabel>Birthday</FieldLabel>
      <input
        type="date"
        value={data.birthday}
        max={new Date().toISOString().split('T')[0]}
        onChange={e => update({ birthday: e.target.value })}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 10,
          border: '0.5px solid var(--border)', background: 'var(--bg-card)',
          color: 'var(--text)', fontSize: 15, marginBottom: 4,
          colorScheme: 'dark',
        }}
      />

      <FieldLabel hint="Affects actuarial baseline. All data stays in your browser.">
        Ancestry / ethnicity
      </FieldLabel>
      <PillGroup
        multiple
        options={[
          { value: 'vietnamese', label: 'Vietnamese' },
          { value: 'chinese',    label: 'Chinese' },
          { value: 'japanese',   label: 'Japanese' },
          { value: 'korean',     label: 'Korean' },
          { value: 'filipino',   label: 'Filipino' },
          { value: 'indian',     label: 'Indian' },
          { value: 'white',      label: 'White' },
          { value: 'black',      label: 'Black' },
          { value: 'hispanic',   label: 'Hispanic' },
          { value: 'pacific',    label: 'Pacific Islander' },
          { value: 'mixed',      label: 'Mixed' },
          { value: 'other',      label: 'Other' },
        ]}
        value={data.ancestry}
        onChange={v => update({ ancestry: v })}
      />
    </div>
  )
}

function Step2({ data, update }: { data: UserProfile; update: (p: Partial<UserProfile>) => void }) {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
        Where you live
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        Air quality, healthcare access, and diet culture all affect longevity
      </p>

      <FieldLabel>Country / region</FieldLabel>
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>North America</div>
      <PillGroup
        options={[
          { value: 'us',      label: '🇺🇸 US' },
          { value: 'canada',  label: '🇨🇦 Canada' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>East Asia & Pacific</div>
      <PillGroup
        options={[
          { value: 'japan',       label: '🇯🇵 Japan' },
          { value: 'korea',       label: '🇰🇷 Korea' },
          { value: 'hongkong',    label: '🇭🇰 Hong Kong' },
          { value: 'macau',       label: '�🇴 Macau' },
          { value: 'singapore',   label: '🇸🇬 Singapore' },
          { value: 'taiwan',      label: '🇹🇼 Taiwan' },
          { value: 'china_tier1', label: '🇨🇳 China (major city)' },
          { value: 'china_other', label: '🇨� China (other)' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Oceania</div>
      <PillGroup
        options={[
          { value: 'australia',    label: '�🇦🇺 Australia' },
          { value: 'new_zealand',  label: '🇳🇿 New Zealand' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Western Europe</div>
      <PillGroup
        options={[
          { value: 'uk',           label: '🇬🇧 UK' },
          { value: 'france',       label: '🇫🇷 France' },
          { value: 'germany',      label: '🇩🇪 Germany' },
          { value: 'spain',        label: '🇪🇸 Spain' },
          { value: 'italy',        label: '�� Italy' },
          { value: 'switzerland',  label: '🇨🇭 Switzerland' },
          { value: 'netherlands',  label: '🇳🇱 Netherlands' },
          { value: 'sweden',       label: '�� Sweden' },
          { value: 'norway',       label: '🇳🇴 Norway' },
          { value: 'denmark',      label: '��🇰 Denmark' },
          { value: 'finland',      label: '�🇮 Finland' },
          { value: 'iceland',      label: '🇮🇸 Iceland' },
          { value: 'ireland',      label: '🇮🇪 Ireland' },
          { value: 'austria',      label: '🇦🇹 Austria' },
          { value: 'belgium',      label: '🇧🇪 Belgium' },
          { value: 'portugal',     label: '🇵🇹 Portugal' },
          { value: 'greece',       label: '�� Greece' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Eastern / Central Europe</div>
      <PillGroup
        options={[
          { value: 'czechia',  label: '🇨🇿 Czechia' },
          { value: 'poland',   label: '🇵🇱 Poland' },
          { value: 'croatia',  label: '🇭🇷 Croatia' },
          { value: 'hungary',  label: '🇭� Hungary' },
          { value: 'romania',  label: '🇷🇴 Romania' },
          { value: 'bulgaria', label: '🇧🇬 Bulgaria' },
          { value: 'russia',   label: '🇷🇺 Russia' },
          { value: 'ukraine',  label: '�� Ukraine' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Latin America & Caribbean</div>
      <PillGroup
        options={[
          { value: 'mexico',     label: '🇲🇽 Mexico' },
          { value: 'brazil',     label: '🇧🇷 Brazil' },
          { value: 'argentina',  label: '🇦🇷 Argentina' },
          { value: 'colombia',   label: '🇨� Colombia' },
          { value: 'chile',      label: '🇨🇱 Chile' },
          { value: 'peru',       label: '🇵🇪 Peru' },
          { value: 'ecuador',    label: '🇪🇨 Ecuador' },
          { value: 'costa_rica', label: '🇨🇷 Costa Rica' },
          { value: 'cuba',       label: '�🇺 Cuba' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Middle East & North Africa</div>
      <PillGroup
        options={[
          { value: 'israel',        label: '🇮🇱 Israel' },
          { value: 'uae',           label: '🇦🇪 UAE' },
          { value: 'qatar',         label: '🇶🇦 Qatar' },
          { value: 'saudi_arabia',  label: '🇸� Saudi Arabia' },
          { value: 'turkey',        label: '🇹🇷 Turkey' },
          { value: 'iran',          label: '🇮🇷 Iran' },
          { value: 'egypt',         label: '🇪🇬 Egypt' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>South Asia</div>
      <PillGroup
        options={[
          { value: 'india',      label: '🇮🇳 India' },
          { value: 'bangladesh', label: '🇧🇩 Bangladesh' },
          { value: 'pakistan',   label: '🇵🇰 Pakistan' },
          { value: 'nepal',      label: '🇳🇵 Nepal' },
          { value: 'sri_lanka',  label: '�🇰 Sri Lanka' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Southeast Asia</div>
      <PillGroup
        options={[
          { value: 'thailand',    label: '🇹🇭 Thailand' },
          { value: 'vietnam',     label: '🇻🇳 Vietnam' },
          { value: 'malaysia',    label: '�🇾 Malaysia' },
          { value: 'philippines', label: '🇵🇭 Philippines' },
          { value: 'indonesia',   label: '🇮🇩 Indonesia' },
          { value: 'cambodia',    label: '🇰🇭 Cambodia' },
          { value: 'myanmar',     label: '🇲🇲 Myanmar' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6, marginTop: 14 }}>Sub-Saharan Africa</div>
      <PillGroup
        options={[
          { value: 'south_africa', label: '🇿� South Africa' },
          { value: 'kenya',        label: '🇰🇪 Kenya' },
          { value: 'ethiopia',     label: '🇪🇹 Ethiopia' },
          { value: 'ghana',        label: '🇬🇭 Ghana' },
          { value: 'nigeria',      label: '🇳🇬 Nigeria' },
          { value: 'tanzania',     label: '🇹🇿 Tanzania' },
          { value: 'uganda',       label: '🇺🇬 Uganda' },
          { value: 'congo_dr',     label: '🇨🇩 DR Congo' },
        ]}
        value={data.region}
        onChange={v => update({ region: v })}
      />
      <div style={{ marginTop: 14 }}>
        <PillGroup
          options={[{ value: 'other', label: 'Other' }]}
          value={data.region}
          onChange={v => update({ region: v })}
        />
      </div>
    </div>
  )
}

function UnitToggle({ imperial, onToggle }: { imperial: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <span style={{
        fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: '8px 0 0 8px',
        background: imperial ? 'var(--bg-elevated)' : 'transparent',
        color: imperial ? 'var(--text-3)' : 'var(--text-3)',
        border: '0.5px solid var(--border)',
        cursor: imperial ? 'default' : 'pointer',
        opacity: imperial ? 1 : 0.55,
      }}
        onClick={imperial ? undefined : onToggle}
      >Ft / Lb</span>
      <span style={{
        fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: '0 8px 8px 0',
        background: !imperial ? 'var(--bg-elevated)' : 'transparent',
        color: !imperial ? 'var(--text-3)' : 'var(--text-3)',
        border: '0.5px solid var(--border)',
        borderLeft: 'none',
        cursor: !imperial ? 'default' : 'pointer',
        opacity: !imperial ? 1 : 0.55,
      }}
        onClick={!imperial ? undefined : onToggle}
      >M / Kg</span>
    </div>
  )
}

function Step3({ data, update }: { data: UserProfile; update: (p: Partial<UserProfile>) => void }) {
  const [imperial, setImperial] = useState(false)
  const heightM = data.heightCm / 100
  const bmi = data.weightKg / (heightM * heightM)
  const bmiLabel =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Healthy ✓' :
    bmi < 30   ? 'Overweight' : 'Obese'

  const heightFeet = parseFloat((data.heightCm / 30.48).toFixed(1))
  const heightMeters = parseFloat((data.heightCm / 100).toFixed(2))
  const weightLb = Math.round(data.weightKg * 2.20462)

  const displayHeight = imperial ? heightFeet : heightMeters
  const heightSuffix = imperial ? 'ft' : 'm'
  const heightStep = imperial ? 0.1 : 0.01

  const displayWeight = imperial ? weightLb : data.weightKg
  const weightSuffix = imperial ? 'lb' : 'kg'

  function onHeightChange(v: number) {
    if (imperial) {
      update({ heightCm: Math.round(v * 30.48) })
    } else {
      update({ heightCm: Math.round(v * 100) })
    }
  }

  function onWeightChange(v: number) {
    if (imperial) {
      const newKg = v / 2.20462
      update({ weightKg: parseFloat(newKg.toFixed(1)) })
    } else {
      update({ weightKg: v })
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
        Your body & habits
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        Honest answers give you the most accurate result
      </p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <UnitToggle imperial={imperial} onToggle={() => setImperial(v => !v)} />
      </div>

      <NumberStepper label="Height" value={displayHeight} onChange={onHeightChange} suffix={heightSuffix} step={heightStep} min={imperial ? 4.0 : 1.30} max={imperial ? 8.0 : 2.30} />
      <NumberStepper label="Weight" value={displayWeight} onChange={onWeightChange} suffix={weightSuffix} min={imperial ? 66 : 30} max={imperial ? 550 : 250} />
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20, marginTop: -6 }}>
        BMI: {bmi.toFixed(1)} — {bmiLabel}
      </div>

      <FieldLabel>Smoking</FieldLabel>
      <PillGroup
        options={[
          { value: 'never',  label: 'Never' },
          { value: 'quit',   label: 'Quit' },
          { value: 'social', label: 'Occasional' },
          { value: 'light',  label: 'Light' },
          { value: 'daily',  label: 'Daily' },
          { value: 'heavy',  label: 'Heavy' },
        ]}
        value={data.smoke}
        onChange={v => update({ smoke: v })}
      />

      <FieldLabel>Alcohol</FieldLabel>
      <PillGroup
        options={[
          { value: 'none',     label: 'None' },
          { value: 'light',    label: 'Light (1–2/day)' },
          { value: 'moderate', label: 'Moderate (3–4)' },
          { value: 'heavy',    label: 'Heavy (5+)' },
        ]}
        value={data.alcohol}
        onChange={v => update({ alcohol: v })}
      />

      <FieldLabel>Exercise</FieldLabel>
      <PillGroup
        options={[
          { value: 'none',     label: 'None' },
          { value: 'light',    label: '1–2×/wk' },
          { value: 'moderate', label: '3–4×/wk' },
          { value: 'active',   label: '5+×/wk' },
        ]}
        value={data.exercise}
        onChange={v => update({ exercise: v })}
      />

      <FieldLabel>Diet quality — {data.dietScore}/10</FieldLabel>
      <PillGroup
        options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ value: n, label: String(n) }))}
        value={data.dietScore}
        onChange={v => update({ dietScore: v })}
      />
    </div>
  )
}

function Step4({ data, update }: { data: UserProfile; update: (p: Partial<UserProfile>) => void }) {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--text)', marginBottom: 6 }}>
        Life &amp; relationships
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
        Social connection is one of the strongest longevity predictors
      </p>

      <FieldLabel>Sleep — avg hours/night</FieldLabel>
      <PillGroup
        options={[
          { value: 4, label: '≤4h' },
          { value: 5, label: '5h' },
          { value: 6, label: '6h' },
          { value: 7, label: '7h' },
          { value: 8, label: '8h' },
          { value: 9, label: '9h+' },
        ]}
        value={data.sleepHours}
        onChange={v => update({ sleepHours: v })}
      />

      <FieldLabel>Daily stress — {data.stressLevel}/10</FieldLabel>
      <PillGroup
        options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ value: n, label: String(n) }))}
        value={data.stressLevel}
        onChange={v => update({ stressLevel: v })}
      />

      <FieldLabel>Relationship status</FieldLabel>
      <PillGroup
        options={[
          { value: 'married',   label: 'Married' },
          { value: 'partnered', label: 'Partnered' },
          { value: 'single',    label: 'Single' },
          { value: 'divorced',  label: 'Divorced' },
          { value: 'widowed',   label: 'Widowed' },
        ]}
        value={data.maritalStatus}
        onChange={v => update({ maritalStatus: v })}
      />

      <NumberStepper label="Children" value={data.children} onChange={v => update({ children: v })} min={0} max={12} />

      <FieldLabel>Family longevity</FieldLabel>
      <PillGroup
        options={[
          { value: 'very_long',  label: 'Long-lived (90+)' },
          { value: 'long',       label: 'Above avg (80+)' },
          { value: 'average',    label: 'Average' },
          { value: 'short',      label: 'Below avg (<70)' },
          { value: 'very_short', label: 'Short-lived (<60)' },
        ]}
        value={data.familyLongevity}
        onChange={v => update({ familyLongevity: v })}
      />

      <FieldLabel>Education</FieldLabel>
      <PillGroup
        options={[
          { value: 'less_than_hs', label: '< High school' },
          { value: 'high_school',  label: 'High school' },
          { value: 'some_college', label: 'Some college' },
          { value: 'bachelors',    label: "Bachelor's" },
          { value: 'graduate',     label: 'Graduate' },
        ]}
        value={data.education}
        onChange={v => update({ education: v })}
      />
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const [step, setStep] = useState(0)
  const [data, setData] = useState<UserProfile>({ ...DEFAULT_PROFILE })

  function update(patch: Partial<UserProfile>) {
    setData(d => ({ ...d, ...patch }))
  }

  function next() {
    if (step < STEPS - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      completeOnboarding(data)
      router.push('/clock')
    }
  }

  function back() {
    if (step > 0) setStep(s => s - 1)
  }

  const stepContent = [
    <Step1 key={0} data={data} update={update} />,
    <Step2 key={1} data={data} update={update} />,
    <Step3 key={2} data={data} update={update} />,
    <Step4 key={3} data={data} update={update} />,
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
      padding: '0 20px',
    }}>
      {/* Progress bar */}
      <div style={{
        height: 2, background: 'var(--border)',
        borderRadius: 2, margin: '16px 0 0',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${((step + 1) / STEPS) * 100}%`,
          background: '#5B9FE8',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Dots + back */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0',
      }}>
        {step > 0 ? (
          <button
            onClick={back}
            style={{ background: 'none', border: 'none', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}
          >
            ← Back
          </button>
        ) : <div />}
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{step + 1} of {STEPS}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 120 }}>
        {stepContent[step]}
      </div>

      {/* Footer CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'linear-gradient(to top, var(--bg) 80%, transparent)',
        padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <button className="btn-primary" onClick={next}>
          {step === STEPS - 1 ? 'Start my clock →' : 'Continue →'}
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 10 }}>
          Data stays in your browser. Not medical advice.
        </p>
      </div>
    </div>
  )
}
