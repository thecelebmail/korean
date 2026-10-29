
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function safeRedirectPath(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/auth')
  ) {
    return '/dashboard'
  }

  return value
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextPath = safeRedirectPath(url.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth?error=confirmation', url.origin),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Email confirmation callback failed:', error.message)

    return NextResponse.redirect(
      new URL('/auth?error=confirmation', url.origin),
    )
  }

  return NextResponse.redirect(new URL(nextPath, url.origin))
}
