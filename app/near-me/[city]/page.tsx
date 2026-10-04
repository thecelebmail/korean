import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const revalidate = 86400;
export default async function NearMePage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params

  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .ilike('city', city)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        Motor Spares Near {city}
      </h1>

      <p className="mt-4 text-gray-600">
        Find trusted motor spares shops near you in {city}.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(businesses || []).map((b) => (
          <Link
            key={b.id}
            href={`/listings/${b.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h3 className="font-semibold">{b.name}</h3>
            <p className="text-sm text-gray-600">{b.address}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}