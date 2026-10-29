
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { generateBreadcrumbJsonLd } from '@/lib/utils/generateBreadcrumbJsonLd'
import Script from 'next/script'

type Props = {
  params: Promise<{ province: string; city: string }>
}

function formatLocation(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province, city } = await params
  const cityName = formatLocation(city)
  const provinceName = formatLocation(province)
  const url = `https://koreanmotorsparesnearme.co.za/${province}/${city}`

  return {
    title: `Korean Motor Spares in ${cityName}, ${provinceName}`,
    description: `Browse motor spares businesses listed in ${cityName}, ${provinceName}. Check supplier addresses and available contact details before enquiring about parts.`,
    alternates: { canonical: url },
    openGraph: {
      title: `Korean Motor Spares in ${cityName}, ${provinceName}`,
      description: `Browse motor spares directory listings in ${cityName}, ${provinceName}.`,
      url,
      type: 'website',
    },
  }
}

export default async function CityPage({ params }: Props) {
  const { province, city } = await params
  const cityName = formatLocation(city)
  const provinceName = formatLocation(province)
  const supabase = await createClient()

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, slug, address, phone, website')
    .eq('province_slug', province)
    .eq('city_slug', city)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('name')
    .limit(100)

  if (error) {
    console.error('Failed to load city businesses:', error.message)
    throw new Error('Unable to load city listings.')
  }

  if (!businesses || businesses.length === 0) notFound()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: provinceName, href: `/${province}` },
    { label: cityName },
  ]

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems,
    'https://koreanmotorsparesnearme.co.za',
  )

  return (
    <>
      <Script
        id="city-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-bold md:text-4xl">
            Korean Motor Spares in {cityName}
          </h1>
          <p className="mt-4 leading-7 text-gray-600">
            Browse motor spares businesses listed in {cityName}, {provinceName}.
            Check the information on each listing and contact the supplier to
            confirm parts availability, compatibility, and pricing.
          </p>
        </header>

        <p className="mt-6 text-sm text-gray-500">
          {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} shown
          {businesses.length === 100 ? ' (maximum displayed on this page)' : ''}.
        </p>

        <section
          aria-label={`Motor spares businesses in ${cityName}`}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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

              {business.address && (
                <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{business.address}</span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    Call business
                  </a>
                )}
                {business.website && (
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-700 hover:underline"
                  >
                    Website
                  </a>
                )}
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
      </main>
    </>
  )
}
