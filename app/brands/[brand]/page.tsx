import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ brand: string }>
}

type Business = {
  id: string
  name: string
  slug: string
  address: string | null
  city: string
  province: string
  phone: string | null
  website: string | null
}

export const revalidate = 3600

const SITE_URL = 'https://koreanmotorsparesnearme.co.za'
const PAGE_SIZE = 100

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { brand } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', brand)
    .maybeSingle()

  if (!data) {
    return {
      title: 'Brand Not Found | Korean Motor Spares',
      robots: { index: false, follow: true },
    }
  }

  const title = `${data.name} Spares Suppliers in South Africa`
  const description = `Browse businesses listed for ${data.name} motor spares in South Africa. Check supplier locations and contact details to confirm parts availability.`
  const canonical = `${SITE_URL}/brands/${brand}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const { brand } = await params
  const supabase = await createClient()

  const { data: brandData, error: brandError } = await supabase
    .from('brands')
    .select('id, name, slug')
    .eq('slug', brand)
    .maybeSingle()

  if (brandError) {
    console.error('Failed to load brand:', brandError.message)
    throw new Error('Unable to load this brand.')
  }

  if (!brandData) notFound()

  const { data: links, error: linksError } = await supabase
    .from('business_brands')
    .select('business_id')
    .eq('brand_id', brandData.id)

  if (linksError) {
    console.error('Failed to load brand links:', linksError.message)
    throw new Error('Unable to load brand listings.')
  }

  const businessIds = [
    ...new Set(
      (links ?? [])
        .map((link) => link.business_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ]

  let businesses: Business[] = []

  if (businessIds.length > 0) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, address, city, province, phone, website')
      .in('id', businessIds)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name')
      .limit(PAGE_SIZE)

    if (error) {
      console.error('Failed to load brand businesses:', error.message)
      throw new Error('Unable to load brand listings.')
    }

    businesses = (data ?? []) as Business[]
  }

  const limitReached = businesses.length === PAGE_SIZE

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {' / '}
        <Link href="/brands" className="hover:underline">
          Brands
        </Link>
        {' / '}
        <span>{brandData.name}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">
          {brandData.name} Spares Suppliers
        </h1>

        <p className="mt-4 leading-7 text-gray-600">
          Browse businesses associated with {brandData.name} spares. Contact
          a supplier to check availability, vehicle compatibility, condition,
          pricing, and any delivery options before travelling or ordering.
        </p>
      </header>

      <p className="mt-6 text-sm text-gray-500">
        Showing {businesses.length}{' '}
        {businesses.length === 1 ? 'listing' : 'listings'}
        {limitReached ? ' (display limit reached)' : ''}.
      </p>

      {businesses.length === 0 ? (
        <section className="mt-8 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">No active listings found</h2>

          <p className="mt-2 text-gray-600">
            There are currently no active businesses associated with this
            brand.
          </p>

          <Link
            href="/brands"
            className="mt-4 inline-block text-blue-700 underline"
          >
            Browse other brands
          </Link>
        </section>
      ) : (
        <section
          aria-label={`${brandData.name} suppliers`}
          className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {businesses.map((business) => (
            <article key={business.id} className="rounded-xl border p-5">
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/listings/${business.slug}`}
                  className="hover:text-blue-700 hover:underline"
                >
                  {business.name}
                </Link>
              </h2>

              <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {business.address && <>{business.address}, </>}
                  {business.city}, {business.province}
                </span>
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">

                <Link
                  href={`/listings/${business.slug}`}
                  className="font-medium text-blue-700 hover:underline"
                >
                  View details
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="mt-10 border-t pt-6">
        <Link
          href="/brands"
          className="text-sm font-medium text-blue-700 hover:underline"
        >
          ← All vehicle brands
        </Link>
      </div>
    </main>
  )
}