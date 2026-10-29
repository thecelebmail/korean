
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { generateBreadcrumbJsonLd } from '@/lib/utils/generateBreadcrumbJsonLd'
import Script from 'next/script'

type Props = {
  params: Promise<{ province: string }>
}

function formatLocation(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province } = await params
  const provinceName = formatLocation(province)

  return {
    title: `Korean Motor Spares in ${provinceName}`,
    description: `Browse motor spares businesses by city in ${provinceName}, South Africa. View supplier locations and available contact details.`,
    alternates: {
      canonical: `https://koreanmotorsparesnearme.co.za/${province}`,
    },
    openGraph: {
      title: `Korean Motor Spares in ${provinceName}`,
      description: `Browse motor spares suppliers by city in ${provinceName}, South Africa.`,
      url: `https://koreanmotorsparesnearme.co.za/${province}`,
      type: 'website',
    },
  }
}

export default async function ProvincePage({ params }: Props) {
  const { province } = await params
  const provinceName = formatLocation(province)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('city, city_slug')
    .eq('province_slug', province)
    .eq('status', 'active')
    .is('deleted_at', null)
    .not('city_slug', 'is', null)
    .order('city')

  if (error) {
    console.error('Failed to load province cities:', error.message)
    throw new Error('Unable to load province locations.')
  }

  const cityMap = new Map<string, string>()

  for (const business of data ?? []) {
    if (business.city_slug && business.city) {
      cityMap.set(business.city_slug, business.city)
    }
  }

  const cities = [...cityMap.entries()].sort((a, b) =>
    a[1].localeCompare(b[1]),
  )

  if (cities.length === 0) notFound()

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: provinceName },
  ]

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(
    breadcrumbItems,
    'https://koreanmotorsparesnearme.co.za',
  )

  return (
    <>
      <Script
        id="province-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-4 py-12">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-bold md:text-4xl">
            Korean Motor Spares in {provinceName}
          </h1>
          <p className="mt-4 leading-7 text-gray-600">
            Browse cities in {provinceName} with active motor spares directory
            listings. Open a city to see the businesses listed there and check
            their available contact information.
          </p>
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Cities with active listings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {cities.length} {cities.length === 1 ? 'city' : 'cities'}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map(([slug, name]) => (
              <Link
                key={slug}
                href={`/${province}/${slug}`}
                className="rounded-xl border p-5 transition hover:border-gray-400 hover:shadow-sm"
              >
                <h3 className="font-semibold">{name}</h3>
                <p className="mt-2 text-sm text-blue-700">
                  Browse local listings
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
