import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

// ✅ Add this metadata function
export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string }>
}): Promise<Metadata> {
  const { province } = await params
  const provinceName = province.replace(/-/g, ' ')
  
  return {
    title: `Korean Motor Spares in ${provinceName} | Find Quality Auto Parts`,
    description: `Find top-rated Korean motor spares and auto parts suppliers in ${provinceName}, South Africa. Compare prices, read reviews, and get contact details.`,
    keywords: `${provinceName} Korean motor spares, auto parts ${provinceName}, car spares ${provinceName}, Hyundai parts ${provinceName}, Kia parts ${provinceName}`,
    alternates: {
      canonical: `https://koreanmotorsparesnearme.co.za/${province}`,
    },
    openGraph: {
      title: `Korean Motor Spares in ${provinceName}`,
      description: `Browse trusted motor spares suppliers in ${provinceName}. Get quality Korean auto parts today.`,
      url: `https://koreanmotorsparesnearme.co.za/${province}`,
      type: 'website',
    },
  }
}

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