import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'LifeTick — Your life, ticking.',
  description:
    'A real-time life expectancy countdown where your daily choices visibly move the clock. ' +
    'For entertainment purposes only.',
  keywords: ['life expectancy', 'countdown', 'longevity', 'health', 'gamification'],
  openGraph: {
    title: 'LifeTick — Your life, ticking.',
    description: 'Watch your life tick away in real time. Log healthy habits to add time back.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
