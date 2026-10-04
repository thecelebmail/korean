// app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldCheck, LayoutDashboard, Building2, AlertCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verify access privileges using Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    // Redirect to login or fallback if unauthenticated
    redirect('/login?callbackUrl=/admin')
  }

  // Fetch directory baseline metrics
  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  const { count: pendingClaims } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('claim_status', 'pending')

  // Fetch recent profiles requiring verification
  const { data: recentListings } = await supabase
    .from('businesses')
    .select('id, name, city, province, status, claim_status, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between border-b pb-6 mb-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Directory Control Panel</h1>
        </div>
        <div className="text-sm text-gray-500">Logged in as: {user.email}</div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Listings</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalBusinesses || 0}</h3>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Claims</p>
            <h3 className="text-2xl font-bold text-gray-900">{pendingClaims || 0}</h3>
          </div>
        </div>
      </div>

      {/* Directory Audit Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Database Listings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3">Business Name</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Claim Profile</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700 bg-white">
              {(recentListings || []).map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{listing.name}</td>
                  <td className="px-6 py-4">{listing.city}, {listing.province}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-xs font-medium text-gray-500">{listing.claim_status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/edit/${listing.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
