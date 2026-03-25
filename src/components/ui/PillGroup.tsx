'use client'

interface Option<T> {
  value: T
  label: string
}

interface SingleProps<T> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  multiple?: false
}

interface MultiProps<T> {
  options: Option<T>[]
  value: T[]
  onChange: (value: T[]) => void
  multiple: true
}

type PillGroupProps<T> = SingleProps<T> | MultiProps<T>

export default function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  multiple,
}: PillGroupProps<T>) {
  function isSelected(optValue: T) {
    if (multiple) return (value as T[]).includes(optValue)
    return value === optValue
  }

  function handleClick(optValue: T) {
    if (multiple) {
      const arr = value as T[]
      const onChangeMulti = onChange as (v: T[]) => void
      if (arr.includes(optValue)) {
        onChangeMulti(arr.filter(v => v !== optValue))
      } else {
        onChangeMulti([...arr, optValue])
      }
    } else {
      ;(onChange as (v: T) => void)(optValue)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <button
          key={String(opt.value)}
          className={`pill${isSelected(opt.value) ? ' selected' : ''}`}
          onClick={() => handleClick(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
