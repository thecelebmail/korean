
'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LoaderCircle, ShieldCheck, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'user' | 'admin'

interface AuthFormProps {
  mode: AuthMode
  nextPath?: string
  initialError?: string
  initialMessage?: string
}

export default function AuthForm({
  mode,
  nextPath = '/dashboard',
  initialError = '',
  initialMessage = '',
}: AuthFormProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const isAdmin = mode === 'admin'

  const [view, setView] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [message, setMessage] = useState(initialMessage)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()

      if (view === 'signup' && !isAdmin) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=%2Fdashboard`,
          },
        })

        if (signupError) {
          setError(signupError.message)
          return
        }

        if (data.session) {
          router.replace('/dashboard')
          router.refresh()
          return
        }

        setMessage(
          'Account registration received. Check your email for the confirmation link before signing in.',
        )
        setView('signin')
        setPassword('')
        return
      }

      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (signinError) {
        setError(signinError.message)
        return
      }

      router.replace(isAdmin ? nextPath : nextPath || '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-8 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            {isAdmin ? (
              <ShieldCheck className="h-7 w-7" />
            ) : (
              <Store className="h-7 w-7" />
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isAdmin
              ? 'Administrator sign in'
              : view === 'signup'
                ? 'Create your account'
                : 'Welcome back'}
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {isAdmin
              ? 'Sign in with your authorized administrator account.'
              : view === 'signup'
                ? 'Create an account to submit and manage business requests.'
                : 'Sign in to manage your business listings and requests.'}
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAdmin && view === 'signup' && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Your full name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  view === 'signup' ? 'new-password' : 'current-password'
                }
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your password"
              />
              {view === 'signup' && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Use at least 6 characters, or the stronger minimum configured
                  in Supabase Auth.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {loading
                ? 'Please wait...'
                : isAdmin
                  ? 'Sign in to admin'
                  : view === 'signup'
                    ? 'Create account'
                    : 'Sign in'}
            </button>
          </form>

          {!isAdmin && (
            <div className="text-center text-sm text-gray-600">
              {view === 'signup' ? (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('signin')
                      setError('')
                      setMessage('')
                    }}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView('signup')
                      setError('')
                      setMessage('')
                    }}
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Back to directory
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
