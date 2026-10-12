import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Edit3, Store, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ClaimRecord = {
  id: number
  business_id: string
  created_at: string
  status: string
  request_type: string
  rejection_reason: string | null
  businessName: string
  city: string
  province: string
  slug: string
}

type ManagedBusiness = {
  id: string
  name: string
  city: string
  province: string
  status: string
  claim_status: string
  slug: string
  is_primary: boolean
}

function StatusPill({ status }: { status: string }) {
  const style = status === 'approved' || status === 'claimed'
    ? 'bg-green-100 text-green-800'
    : status === 'pending'
      ? 'bg-amber-100 text-amber-800'
      : status === 'rejected'
        ? 'bg-red-100 text-red-800'
        : 'bg-gray-100 text-gray-700'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>{status}</span>
}

export default async function VendorDashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/auth?next=/dashboard')

  const admin = createAdminClient()
  const { data: owner, error: ownerError } = await admin
    .from('owners').select('id').eq('auth_user_id', user.id).maybeSingle()
  if (ownerError) {
    console.error('Dashboard owner lookup failed:', ownerError.message)
    throw new Error('Unable to load your owner profile.')
  }

  let claims: ClaimRecord[] = []
  let managed: ManagedBusiness[] = []

  if (owner) {
    const [claimsResult, relationshipsResult] = await Promise.all([
      admin.from('claim_requests').select('id, business_id, created_at, status, request_type, rejection_reason').eq('owner_id', owner.id).order('created_at', { ascending: false }).limit(100),
      admin.from('business_owners').select('business_id, is_primary').eq('owner_id', owner.id),
    ])
    if (claimsResult.error || relationshipsResult.error) {
      console.error('Dashboard records lookup failed:', claimsResult.error?.message, relationshipsResult.error?.message)
      throw new Error('Unable to load your claim history.')
    }

    const claimRows = claimsResult.data ?? []
    const relationshipRows = relationshipsResult.data ?? []
    const businessIds = [...new Set([...claimRows.map((claim) => claim.business_id), ...relationshipRows.map((relationship) => relationship.business_id)])]
    const { data: businessRows, error: businessError } = businessIds.length
      ? await admin.from('businesses').select('id, name, city, province, status, claim_status, slug').in('id', businessIds).is('deleted_at', null)
      : { data: [], error: null }
    if (businessError) throw new Error('Unable to load your businesses.')
    const businessMap = new Map((businessRows ?? []).map((business) => [business.id, business]))

    claims = claimRows.map((claim) => {
      const business = businessMap.get(claim.business_id)
      return {
        ...claim,
        businessName: business?.name ?? 'Business listing',
        city: business?.city ?? '',
        province: business?.province ?? '',
        slug: business?.slug ?? '',
      }
    })

    managed = relationshipRows.flatMap((relationship) => {
      const business = businessMap.get(relationship.business_id)
      return business ? [{ ...business, is_primary: relationship.is_primary }] : []
    })
  }

  const hasApprovedListing = managed.some((business) => business.claim_status === 'claimed')

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h1 className="text-3xl font-bold tracking-tight text-gray-900">Business Dashboard</h1><p className="mt-1 text-sm text-gray-600">Signed in as {user.email}</p></div>
          <div className={`inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-sm font-medium ${hasApprovedListing ? 'border-green-200 bg-green-50 text-green-800' : 'border-gray-200 bg-white text-gray-600'}`}><UserCheck className="h-4 w-4" />{hasApprovedListing ? 'Approved business access' : 'Account active'}</div>
        </header>

        <section className="mb-10 rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-gray-900">Your submissions and claims</h2><p className="mt-1 text-sm text-gray-500">Pending requests do not grant editing access.</p></div>
          {claims.length === 0 ? <div className="p-8 text-center"><p className="font-medium text-gray-900">No submissions or claims yet</p><p className="mt-1 text-sm text-gray-600">Add a new business or claim an existing listing to get started.</p><div className="mt-4 flex flex-wrap justify-center gap-3"><Link href="/add-business" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">Add a business <ArrowRight className="h-4 w-4" /></Link><Link href="/claim-business" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Claim a business</Link></div></div> : (
            <div className="divide-y">{claims.map((claim) => <article key={claim.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{claim.request_type === 'new_business' ? 'New business submission' : 'Claim request'}</p><h3 className="font-semibold text-gray-900">{claim.businessName}</h3><p className="mt-1 text-sm text-gray-500">{[claim.city, claim.province].filter(Boolean).join(', ') || 'Location not provided'}</p><p className="mt-2 text-xs text-gray-500">Submitted {new Date(claim.created_at).toLocaleDateString()}</p>{claim.status === 'rejected' && claim.rejection_reason && <p className="mt-2 max-w-2xl rounded-lg bg-red-50 p-3 text-sm text-red-800">Reason: {claim.rejection_reason}</p>}</div><StatusPill status={claim.status} /></article>)}</div>
          )}
        </section>

        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4 sm:px-6"><h2 className="text-lg font-semibold text-gray-900">Businesses you can manage</h2></div>
          {managed.length === 0 ? <div className="p-8 text-center"><Store className="mx-auto h-10 w-10 text-gray-300" /><p className="mt-3 font-medium text-gray-900">No approved businesses connected</p><p className="mt-1 text-sm text-gray-600">After your claim is approved, the business will appear here.</p><Link href="/claim-business" className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Find your business <ArrowRight className="h-4 w-4" /></Link></div> : (
            <div className="divide-y">{managed.map((business) => {
              const approved = business.claim_status === 'claimed' && business.status !== 'suspended'
              return <article key={business.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h3 className="text-lg font-semibold text-gray-900">{business.name}</h3><p className="mt-1 text-sm text-gray-500">{[business.city, business.province].filter(Boolean).join(', ')}</p><div className="mt-3 flex flex-wrap gap-2"><StatusPill status={business.claim_status} /><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">Listing: {business.status}</span></div></div>{approved ? <Link href={`/dashboard/edit/${business.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Edit3 className="h-4 w-4" /> Edit listing</Link> : <p className="text-sm text-gray-500">Editing is locked until the claim is approved and the listing is active.</p>}</article>
            })}</div>
          )}
        </section>
      </div>
    </main>
  )
}
