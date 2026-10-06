// app/admin/edit/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldAlert, Check, XCircle } from 'lucide-react'

interface AdminPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminManagementProfilePage({ params }: AdminPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Strict administrative identity gate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'your-admin-email@domain.co.za') {
    redirect('/')
  }

  const { data: shop } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (!shop) notFound()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" /> System Control Desk
      </Link>

      <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8 border-red-100">
        <div className="flex items-center gap-3 border-b pb-4 mb-6">
          <ShieldAlert className="h-6 w-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">System Override: {shop.name}</h1>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border space-y-2 text-sm mb-6">
          <p><strong>Current Visibility Status:</strong> <span className="text-blue-600 font-semibold uppercase">{shop.status}</span></p>
          <p><strong>Verification State:</strong> <span className="text-amber-600 font-semibold uppercase">{shop.claim_status}</span></p>
          <p><strong>Location Coordinates:</strong> {shop.latitude || '0.00'}, {shop.longitude || '0.00'}</p>
        </div>

        {/* Global Administrative State Modifiers */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Administrative Workflow Tasks</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <button className="flex items-center justify-center gap-2 rounded-lg bg-green-600 p-3 font-semibold text-white shadow hover:bg-green-700 transition">
              <Check className="h-5 w-5" /> Approve Profile Claim
            </button>
            <button className="flex items-center justify-center gap-2 rounded-lg bg-red-600 p-3 font-semibold text-white shadow hover:bg-red-700 transition">
              <XCircle className="h-5 w-5" /> Suspend Storefront Listing
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
