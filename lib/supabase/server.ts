// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Environment variable verification guard
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Your project's URL and Key are missing from the server environment runtime. " +
      "Please verify that your configuration parameters exist inside an exact .env.local file."
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe fallback catch: Server Components are read-only and 
            // will naturally log an exception if middleware hasn't pre-routed state.
          }
        },
      },
    }
  )
}
