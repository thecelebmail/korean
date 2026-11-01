
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CarFront } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Car Brands and Motor Spares Suppliers in South Africa',
  description:
    'Browse Hyundai, Kia, BMW, Ford, Toyota and other vehicle brand spares suppliers in South Africa. Find motor parts and local businesses.',
  alternates: {
    canonical: '/brands',
  },
}

export default async function BrandsPage() {
  const supabase = await createClient()

 
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name, slug')
    .order('name')

  const { data: relationships, error: relationshipsError } =
    await supabase
      .from('business_brands')
      .select(`
        brand_id,
        business:businesses!business_brands_business_id_fkey(
          id,
          status,
          deleted_at
        )
      `)

console.log('BRANDS JSON:', JSON.stringify(brands, null, 2))
console.log('BRANDS COUNT:', brands?.length)

console.log(
  'RELATIONSHIPS JSON:',
  JSON.stringify(relationships, null, 2)
)
console.log('RELATIONSHIPS COUNT:', relationships?.length)

  const activeBrands = (brands || [])
    .map((brand) => {
      const count = (relationships || []).filter((item: any) => {
        const business = item.business

        return (
          item.brand_id === brand.id &&
          business &&
          business.status === 'active' &&
          business.deleted_at === null
        )
      }).length

      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        count,
      }
    })
    .filter((brand) => brand.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  const totalListings = activeBrands.reduce(
    (total, brand) => total + brand.count,
    0
  )

  return (
    <main className="min-h-screen bg-stone-50">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700">
            <CarFront className="h-4 w-4" />
            Vehicle brand directory
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Find Motor Spares by Brand
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
            Browse motor spares suppliers by vehicle make.
            Find businesses dealing in replacement parts,
            used spares and components for popular vehicle brands.
          </p>

          <p className="mt-5 text-sm font-medium text-stone-500">
            {activeBrands.length} brands · {totalListings} brand listings
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {activeBrands.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-stone-900">
              No brand listings available
            </h2>
            <p className="mt-2 text-stone-600">
              Please check back as our directory grows.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-7">
              <h2 className="text-xl font-semibold text-stone-900">
                Browse available brands
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Select a brand to view its listed spares suppliers.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900 group-hover:text-orange-700">
                      {brand.name} Spares
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {brand.count} {brand.count === 1 ? 'listing' : 'listings'}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition group-hover:bg-orange-100 group-hover:text-orange-700">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
