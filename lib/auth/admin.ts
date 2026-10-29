import 'server-only'

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!adminEmail) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Administrator access is not configured.' },
        { status: 503 },
      ),
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    }
  }

  if (user.email?.trim().toLowerCase() !== adminEmail) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Administrator access required.' },
        { status: 403 },
      ),
    }
  }

  return {
    authorized: true as const,
    supabase,
    user,
  }
}