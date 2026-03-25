'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/clock',  label: 'Clock',  icon: '⏱' },
  { href: '/log',    label: 'Log',    icon: '📝' },
  { href: '/stats',  label: 'Stats',  icon: '📊' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      display: 'flex',
      background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid var(--border)',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {TABS.map(tab => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '10px 0 8px',
              textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}
          >
            <div style={{
              width: 28, height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              background: active ? 'rgba(91,159,232,0.15)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              {tab.icon}
            </div>
            <span style={{
              fontSize: 10,
              color: active ? '#5B9FE8' : 'var(--text-3)',
              fontWeight: active ? 500 : 400,
              letterSpacing: '0.04em',
              transition: 'color 0.15s',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
