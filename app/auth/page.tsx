'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export default function AuthPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const callbackError = params.get('error')

    if (callbackError === 'auth_callback_failed') {
      setError(
        'Email confirmation could not be completed. Please try signing in again or request a new confirmation email.'
      )
    }

    let active = true

    async function checkSession() {
      const { data, error: sessionError } = await supabase.auth.getUser()

      if (!active) return

      if (!sessionError && data.user) {
        const requestedNext = params.get('next')
        const safeNext =
          requestedNext?.startsWith('/') &&
          !requestedNext.startsWith('//') &&
          !requestedNext.startsWith('/\\')
            ? requestedNext
            : '/dashboard'

        router.replace(safeNext)
        router.refresh()
        return
      }

      setCheckingSession(false)
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [router, supabase])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Enter your email address and password.')
      return
    }

    if (mode === 'signup' && password.length < 8) {
      setError('Choose a password with at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        if (data.session) {
          router.replace('/dashboard')
          router.refresh()
          return
        }

        setMessage(
          'Account registration started. Check your email for the confirmation link before signing in.'
        )
        setMode('signin')
        setPassword('')
        return
      }

      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        })

      if (signInError) {
        setError(signInError.message)
        return
      }

      const params = new URLSearchParams(window.location.search)
      const requestedNext = params.get('next')
      const safeNext =
        requestedNext?.startsWith('/') &&
        !requestedNext.startsWith('//') &&
        !requestedNext.startsWith('/\\')
          ? requestedNext
          : '/dashboard'

      router.replace(safeNext)
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    setLoading(true)
    setError('')
    setMessage('')

    const { error: signOutError } = await supabase.auth.signOut()

    setLoading(false)

    if (signOutError) {
      setError(signOutError.message)
      return
    }

    router.replace('/auth')
    router.refresh()
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <span className="ml-3 text-sm text-gray-600">
          Checking your session...
        </span>
      </main>
    )
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/"
          className="text-sm font-medium text-orange-700 hover:text-orange-800"
        >
          ← Back to directory
        </Link>

        <div className="mt-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            {mode === 'signin' ? (
              <LogIn className="h-7 w-7" />
            ) : (
              <UserPlus className="h-7 w-7" />
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin'
              ? 'Sign in to manage your directory activity.'
              : 'Register to get started with your account.'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="mt-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={
                  mode === 'signin' ? 'current-password' : 'new-password'
                }
                required
                minLength={mode === 'signup' ? 8 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  mode === 'signup'
                    ? 'At least 8 characters'
                    : 'Enter your password'
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 hover:text-gray-800"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'signin'
              ? "Don't have an account?"
              : 'Already have an account?'}
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setMode((current) =>
                current === 'signin' ? 'signup' : 'signin'
              )
              setError('')
              setMessage('')
              setPassword('')
            }}
            className="mt-2 font-semibold text-orange-700 hover:text-orange-800 disabled:opacity-50"
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in instead'}
          </button>
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Creating an account does not automatically grant business ownership
          or administrator access. Those permissions remain governed by the
          directory's existing approval process.
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="mt-5 w-full text-sm text-gray-500 underline hover:text-gray-800 disabled:opacity-50"
        >
          Sign out of this browser
        </button>
      </section>
    </main>
  )
}

