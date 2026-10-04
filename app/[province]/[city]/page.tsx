import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Star, MapPin } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 86400;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ province: string; city: string }>
}): Promise<Metadata> {
  const { province, city } = await params
  
  const cityName = city.replace(/-/g, ' ')
  const provinceName = province.replace(/-/g, ' ')

  return {
    title: `Korean Motor Spares in ${cityName}, ${provinceName} | Best Auto Parts`,
    description: `Discover ${cityName}'s top Korean motor spares suppliers. Quality Hyundai, Kia, and Korean auto parts in ${cityName}, ${provinceName}. Get quotes and directions.`,
    keywords: `${cityName} Korean spares, motor parts ${cityName}, auto spares ${cityName}, ${provinceName} car parts, Korean auto parts near me`,
    alternates: {
      canonical: `https://koreanmotorsparesnearme.co.za/${province}/${city}`,
    },
    openGraph: {
      title: `Korean Motor Spares in ${cityName}, ${provinceName}`,
      description: `Find trusted motor spares suppliers in ${cityName}. Compare prices and read customer reviews.`,
      url: `https://koreanmotorspares.co.za/${province}/${city}`,
      type: 'website',
    },
  }
}

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
        Korean Motor Spares {city.replace(/-/g, ' ')}
      </h1>

      <p className="mt-4 text-gray-600">
        Korean Motor Spares and other spare suppliers in {city.replace(/-/g, ' ')}, {province.replace(/-/g, ' ')}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {(businesses || []).map((b) => (
          <Link
            key={b.id}
            href={`/listings/${b.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h3 className="font-bold">{b.name}</h3>
            <p className="text-sm text-gray-600"><MapPin className="inline-block" /> {b.address}</p>
            <p className="text-sm"><Star className="inline-block fill-yellow-400 text-yellow-400" /> {b.rating || 0}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}