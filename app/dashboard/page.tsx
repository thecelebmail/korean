// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, Edit3, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react'

export default async function VendorDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?callbackUrl=/dashboard')
  }

  // Fetch all businesses linked to this authenticated user account identity
  const { data: managedListings, error } = await supabase
    .from('business_owners')
    .select(`
      business_id,
      is_primary,
      business:businesses(id, name, city, province, status, claim_status)
    `)
    .eq('owner_id', user.id)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 min-h-screen bg-gray-50">
      <div className="mb-8 border-b pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Spares Vendor Workspace</h1>
          <p className="text-gray-500 mt-1">Manage your active commercial directory listings in South Africa.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium border border-blue-100">
          <UserCheck className="h-4 w-4" />
          Verified Merchant
        </div>
      </div>

      {(!managedListings || managedListings.length === 0) ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-2xl max-w-xl mx-auto p-6 shadow-sm">
          <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No managed storefront profiles found</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Locate your commercial parts business listing via our main location pages to initiate verification and data access privileges.
          </p>
          <Link href="/provinces" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700">
            Browse Directory Listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          <h2 className="text-xl font-bold text-gray-800">Your Connected Storefronts</h2>
          {managedListings.map((item: any) => {
            const shop = item.business
            if (!shop) return null
            return (
              <div key={shop.id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{shop.city}, {shop.province}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      shop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      Status: {shop.status}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      shop.claim_status === 'claimed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Verification: {shop.claim_status}
                    </span>
                  </div>
                </div>

                {shop.claim_status === 'pending' ? (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-100 p-3 rounded-lg max-w-xs">
                    <ShieldAlert className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <p className="text-xs">Your claim is being reviewed by our administration panel. Profile modifications are locked during verification.</p>
                  </div>
                ) : (
                  <Link href={`/dashboard/edit/${shop.id}`} className="flex items-center justify-center gap-2 w-full md:w-auto rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition">
                    <Edit3 className="h-4 w-4" />
                    Modify Listing Details
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
