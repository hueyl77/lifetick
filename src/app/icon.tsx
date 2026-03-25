import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0A',
          borderRadius: 14,
        }}
      >
        <svg
          viewBox="0 0 64 64"
          width="64"
          height="64"
        >
          {/* Years ring (purple) */}
          <circle cx="32" cy="32" r="27" fill="none" stroke="#9B8FE0" stroke-width="3.5" opacity="0.15" />
          <circle cx="32" cy="32" r="27" fill="none" stroke="#9B8FE0" stroke-width="3.5" stroke-linecap="round"  />
          {/* Months ring (green) */}
          <circle cx="32" cy="32" r="22.5" fill="none" stroke="#5DCAA5" stroke-width="3.5" opacity="0.15" />
          <circle cx="32" cy="32" r="22.5" fill="none" stroke="#5DCAA5" stroke-width="3.5" stroke-linecap="round"  />
          {/* Days ring (orange) */}
          <circle cx="32" cy="32" r="18" fill="none" stroke="#E8A950" stroke-width="3.5" opacity="0.15" />
          <circle cx="32" cy="32" r="18" fill="none" stroke="#E8A950" stroke-width="3.5" stroke-linecap="round"  />
          {/* Minutes ring (pink) */}
          <circle cx="32" cy="32" r="13.5" fill="none" stroke="#D4537E" stroke-width="3.5" opacity="0.15" />
          <circle cx="32" cy="32" r="13.5" fill="none" stroke="#D4537E" stroke-width="3.5" stroke-linecap="round"  />
          {/* Seconds ring (blue) */}
          <circle cx="32" cy="32" r="9" fill="none" stroke="#5B9FE8" stroke-width="3.5" opacity="0.15" />
          <circle cx="32" cy="32" r="9" fill="none" stroke="#5B9FE8" stroke-width="3.5" stroke-linecap="round"  />
        </svg>
      </div>
    ),
    { ...size }
  )
}
