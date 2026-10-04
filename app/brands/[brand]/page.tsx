import { createClient } from '@/lib/supabase/server'
import { MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'


export const revalidate = 86400;

export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>
}) {
  const { brand } = await params

  const supabase = await createClient()

  // Get brand
  const { data: brandData } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', brand)
    .single()

  if (!brandData) {
    return notFound()
  }

  // Get businesses linked to brand
  const { data: linkedBusinesses } = await supabase
    .from('business_brands')
    .select(`
      business:businesses(*)
    `)
    .eq('brand_id', brandData.id)

  const businesses =
    linkedBusinesses?.map((item: any) => item.business) || []

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        {brandData.name} Spares
      </h1>

      <p className="mt-4 text-gray-600">
        Find trusted {brandData.name} spares suppliers across South Africa.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {businesses.map((business: any) => (
          <Link
            key={business.id}
            href={`/listing/${business.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h2 className="font-semibold">
              {business.name}
            </h2>

            <p className="text-sm text-gray-600">
              <MapPin className="inline-block" /> 
              {business.address}
            </p>

            <p className="mt-2 text-sm">
              <Star className="inline-block fill-yellow-400 text-yellow-400" /> {business.rating ?? 'No rating'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}