
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import AdminListingActions from '@/components/admin/AdminListingActions'

interface AdminPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminManagementProfilePage({
  params,
}: AdminPageProps) {
  const { id } = await params
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL is not configured.')
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/auth?next=${encodeURIComponent(`/admin/edit/${id}`)}`)
  }

  if (user.email?.trim().toLowerCase() !== adminEmail) {
    redirect('/')
  }

  const { data: shop, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load business: ${error.message}`)
  }

  if (!shop) notFound()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        System Control Desk
      </Link>

      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b pb-4">
          <ShieldAlert className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            System Override: {shop.name}
          </h1>
        </div>

        <div className="mb-6 space-y-2 rounded-xl border bg-gray-50 p-4 text-sm">
          <p>
            <strong>Visibility:</strong> {shop.status ?? 'Unknown'}
          </p>
          <p>
            <strong>Claim:</strong> {shop.claim_status ?? 'Unknown'}
          </p>
          <p>
            <strong>Coordinates:</strong>{' '}
            {shop.latitude ?? 'N/A'}, {shop.longitude ?? 'N/A'}
          </p>
        </div>

        <h2 className="mb-4 text-lg font-bold text-gray-800">
          Administrative Workflow
        </h2>

        <AdminListingActions
          businessId={shop.id}
          claimStatus={shop.claim_status}
        />
      </div>
    </main>
  )
}