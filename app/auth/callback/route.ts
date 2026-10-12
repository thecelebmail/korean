
// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const requestedNext = requestUrl.searchParams.get('next')

  // Accept only local relative paths to prevent open redirects.
  const safeNext =
    requestedNext?.startsWith('/') &&
    !requestedNext.startsWith('//') &&
    !requestedNext.startsWith('/\\')
      ? requestedNext
      : '/dashboard'

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth?error=auth_callback_failed', requestUrl.origin)
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Supabase auth callback failed:', error.message)

    return NextResponse.redirect(
      new URL('/auth?error=auth_callback_failed', requestUrl.origin)
    )
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin))
}

