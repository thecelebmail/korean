
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, LoaderCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SignOutButtonProps {
  redirectTo?: string
  label?: string
}

export default function SignOutButton({
  redirectTo = '/auth?message=signed-out',
  label = 'Sign out',
}: SignOutButtonProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignOut() {
    setLoading(true)
    setError('')

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setError('Unable to sign out. Please try again.')
        return
      }

      router.replace(redirectTo)
      router.refresh()
    } catch {
      setError('A network error prevented sign out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        {loading ? 'Signing out...' : label}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
