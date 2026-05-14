// app/[province]/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProvincePage({
  params,
}: {
  params: Promise<{ province: string }>
}) {
  const { province } = await params

  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .eq('province_slug', province)

  const cities = [
    ...new Map(
      (data || [])
        .filter(b => b.city_slug)
        .map(b => [b.city_slug, b.city])
    ).entries(),
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        Korean Motor Spares {province.replace(/-/g, ' ')}
      </h1>

      <p className="mt-4 text-gray-600">
        Find motor spares suppliers in {province.replace(/-/g, ' ')}
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {cities.map(([slug, name]) => (
          <Link
            key={slug}
            href={`/${province}/${slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            {name}
          </Link>
        ))}
      </div>
    </main>
  )
}