import AuthForm from '@/components/auth/AuthForm'

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams

  return (
    <AuthForm
      mode="admin"
      nextPath="/admin"
      initialError={
        params.error === 'not-admin'
          ? 'This account is not authorized to access the administrator dashboard.'
          : ''
      }
    />
  )
}