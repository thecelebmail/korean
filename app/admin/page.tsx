import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlertCircle, Building2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminClaimReview from './AdminClaimReview'

type ClaimRow = {
  id: number
  business_id: string
  owner_id: string
  created_at: string
  status: string
  request_type: string
  rejection_reason: string | null
  businessName: string
  city: string
  province: string
  ownerName: string
  ownerEmail: string
}

export default async function AdminDashboardPage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  if (!adminEmail) throw new Error('ADMIN_EMAIL is not configured.')

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/auth?next=/admin')
  if (user.email?.trim().toLowerCase() !== adminEmail) redirect('/')

  const admin = createAdminClient()
  const [totalResult, pendingResult, listingsResult, claimsResult] = await Promise.all([
    admin.from('businesses').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    admin.from('claim_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('businesses').select('id, name, city, province, status, claim_status, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(10),
    admin.from('claim_requests').select('id, business_id, owner_id, created_at, status, request_type, rejection_reason').eq('status', 'pending').order('created_at', { ascending: true }).limit(100),
  ])

  if (totalResult.error || pendingResult.error || listingsResult.error || claimsResult.error) {
    console.error('Admin dashboard query failed:', totalResult.error?.message, pendingResult.error?.message, listingsResult.error?.message, claimsResult.error?.message)
    throw new Error('Unable to load the admin dashboard. Check server logs and Supabase permissions.')
  }

  const claimRows = claimsResult.data ?? []
  const businessIds = [...new Set(claimRows.map((claim) => claim.business_id))]
  const ownerIds = [...new Set(claimRows.map((claim) => claim.owner_id))]
  const [businessesResult, ownersResult] = await Promise.all([
    businessIds.length ? admin.from('businesses').select('id, name, city, province').in('id', businessIds) : Promise.resolve({ data: [], error: null }),
    ownerIds.length ? admin.from('owners').select('id, name, email').in('id', ownerIds) : Promise.resolve({ data: [], error: null }),
  ])
  if (businessesResult.error || ownersResult.error) throw new Error('Unable to load claim details.')

  const businesses = new Map((businessesResult.data ?? []).map((business) => [business.id, business]))
  const owners = new Map((ownersResult.data ?? []).map((owner) => [owner.id, owner]))
  const claims: ClaimRow[] = claimRows.map((claim) => {
    const business = businesses.get(claim.business_id)
    const owner = owners.get(claim.owner_id)
    return {
      ...claim,
      businessName: business?.name ?? 'Unknown business',
      city: business?.city ?? '',
      province: business?.province ?? '',
      ownerName: owner?.name ?? 'Unnamed claimant',
      ownerEmail: owner?.email ?? 'No email provided',
    }
  })

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-3 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Directory Control Panel</h1>
              <p className="mt-1 text-sm text-gray-500">Business listings and claim moderation</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Administrator: {user.email}</p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600"><Building2 className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium uppercase tracking-wider text-gray-500">Total listings</p><p className="text-2xl font-bold text-gray-900">{totalResult.count ?? 0}</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600"><AlertCircle className="h-6 w-6" /></div>
            <div><p className="text-sm font-medium uppercase tracking-wider text-gray-500">Pending requests</p><p className="text-2xl font-bold text-gray-900">{pendingResult.count ?? 0}</p></div>
          </div>
        </section>

        <section className="mb-10 overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-gray-900">Business submissions and claims awaiting review</h2><p className="mt-1 text-sm text-gray-500">Approving a new listing publishes it and grants the submitter owner access. Claim approvals grant access to an existing listing.</p></div>
          {claims.length === 0 ? (
            <div className="p-10 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-green-600" /><p className="mt-3 font-medium text-gray-900">No pending requests</p><p className="mt-1 text-sm text-gray-500">New business submissions and claims will appear here.</p></div>
          ) : (
            <div className="divide-y">
              {claims.map((claim) => <AdminClaimReview key={claim.id} claim={claim} />)}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-6 py-4"><h2 className="text-lg font-semibold text-gray-900">Recent database listings</h2></div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-3">Business</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Listing status</th><th className="px-5 py-3">Claim status</th><th className="px-5 py-3">Manage</th></tr></thead>
            <tbody className="divide-y divide-gray-200">{(listingsResult.data ?? []).map((listing) => <tr key={listing.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-medium text-gray-900">{listing.name}</td><td className="px-5 py-4 text-gray-600">{[listing.city, listing.province].filter(Boolean).join(', ') || 'Not provided'}</td><td className="px-5 py-4">{listing.status}</td><td className="px-5 py-4">{listing.claim_status}</td><td className="px-5 py-4"><Link href={`/admin/edit/${listing.id}`} className="font-medium text-blue-600 hover:text-blue-800">Manage</Link></td></tr>)}
              {(!listingsResult.data || listingsResult.data.length === 0) && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No business listings were found.</td></tr>}
            </tbody>
          </table></div>
        </section>
      </div>
    </main>
  )
}
