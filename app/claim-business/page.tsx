import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ClaimBusinessForm from './ClaimBusinessForm'

export default async function ClaimBusinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth?next=/claim-business')

  const admin = createAdminClient()
  const businesses: Array<{ id: string; name: string; city: string; province: string; claim_status: string }> = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from('businesses')
      .select('id, name, city, province, claim_status')
      .eq('status', 'active')
      .is('deleted_at', null)
      .eq('claim_status', 'unclaimed')
      .order('name', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) {
      console.error('Claim page business lookup failed:', error.message)
      throw new Error('Unable to load claimable businesses.')
    }
    businesses.push(...(data ?? []))
    if (!data || data.length < pageSize) break
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Business ownership</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Claim your business</h1>
        <p className="mt-3 text-gray-600">Choose your listing and submit a request for administrator review. You will only be able to edit the listing after approval.</p>
        <ClaimBusinessForm businesses={businesses} />
      </div>
    </main>
  )
}
