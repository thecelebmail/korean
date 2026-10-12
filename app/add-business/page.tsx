import Link from 'next/link'
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import AddBusinessForm from './AddBusinessForm'

export default async function AddBusinessPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Building2 className="h-9 w-9 text-orange-600" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Add Your Business</h1>
          </div>
          <p className="text-gray-600">Submit your motor spares business to the South African directory. New listings are reviewed by our administrator before they become publicly available.</p>
          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
            <p className="font-semibold text-orange-950">Sign in to submit a business</p>
            <p className="mt-1 text-sm text-orange-900">You can save and track your submission through your business dashboard after signing in.</p>
            <Link href="/auth?next=/add-business" className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700">Sign in or create an account</Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <section className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <Building2 className="h-9 w-9 text-orange-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Add Your Business</h1>
            <p className="mt-1 text-sm text-gray-500">Signed in as {user.email}</p>
          </div>
        </div>
        <p className="text-gray-600">List your motor spares business so customers can find your contact details and location. Every new listing is checked before publication.</p>

        <div className="mt-6 grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950 sm:grid-cols-2">
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Administrator review before publication</p>
          <p className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Owner editing access after approval</p>
        </div>

        <AddBusinessForm userEmail={user.email ?? ''} />
      </section>
    </main>
  )
}
