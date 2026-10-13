
import AuthForm from '@/components/auth/AuthForm'

interface AuthPageProps {
  searchParams: Promise<{
    next?: string
    error?: string
    message?: string
  }>
}

function safeInternalPath(value?: string): string {
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

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams
  const adminFlow = params.next?.startsWith('/admin') === true

  const nextPath = adminFlow
    ? params.next && params.next.startsWith('/') && !params.next.startsWith('//')
      ? params.next
      : '/admin'
    : safeInternalPath(params.next)

  const initialError =
    params.error === 'confirmation'
      ? 'We could not complete email confirmation. Please try signing in again or request a new confirmation email.'
      : undefined

  const initialMessage =
    params.message === 'signed-out'
      ? 'You have signed out successfully.'
      : undefined

  return (
    <AuthForm
      mode={adminFlow ? 'admin' : 'user'}
      nextPath={nextPath}
      initialError={initialError}
      initialMessage={initialMessage}
    />
  )
}
