import { NextRequest, NextResponse } from 'next/server'
import { calculateLifeExpectancy } from '@/lib/lifeExpectancy'
import type { UserProfile } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const profile = (await req.json()) as UserProfile

    // Basic validation
    if (!profile.birthday || !profile.sex) {
      return NextResponse.json(
        { error: 'birthday and sex are required' },
        { status: 400 }
      )
    }

    const result = calculateLifeExpectancy(profile)

    return NextResponse.json(result)
  } catch (err) {
    console.error('LE calculation error:', err)
    return NextResponse.json(
      { error: 'Calculation failed' },
      { status: 500 }
    )
  }
}
