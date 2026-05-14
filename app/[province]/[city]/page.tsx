// app/[province]/[city]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { FlagTriangleRight } from 'lucide-react'
import { Star } from 'lucide-react'
import Link from 'next/link'

export default async function CityPage({
  params,
}: {
  params: Promise<{ province: string; city: string }>
}) {
  const { province, city } = await params

  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('province_slug', province)
    .eq('city_slug', city)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        Motor Spares in {city.replace(/-/g, ' ')}
      </h1>

      <p className="mt-4 text-gray-600">
        Suppliers in {city.replace(/-/g, ' ')}, {province.replace(/-/g, ' ')}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(businesses || []).map((b) => (
          <Link
            key={b.id}
            href={`/listings/${b.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h3 className="font-bold">{b.name}</h3>
            <p className="text-sm text-gray-600"><FlagTriangleRight className="inline-block" /> {b.address}</p>
            <p className="text-sm"><Star className="inline-block fill-yellow-400 text-yellow-400" /> {b.rating}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}