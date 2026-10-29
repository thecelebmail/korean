
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', category)
    .maybeSingle()

  if (!data) {
    return {
      title: 'Category Not Found | Korean Motor Spares',
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `${data.name} Suppliers in South Africa`,
    description: `Browse motor spares businesses listed under ${data.name} in South Africa. Check available business details and contact suppliers directly.`,
    alternates: {
      canonical: `https://koreanmotorsparesnearme.co.za/categories/${category}`,
    },
    openGraph: {
      title: `${data.name} Suppliers in South Africa`,
      description: `Browse businesses listed under ${data.name} in South Africa.`,
      url: `https://koreanmotorsparesnearme.co.za/categories/${category}`,
      type: 'website',
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params
  const supabase = await createClient()

  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', category)
    .maybeSingle()

  if (categoryError) {
    console.error('Failed to load category:', categoryError.message)
    throw new Error('Unable to load this category.')
  }

  if (!categoryData) notFound()

  const { data: links, error: linksError } = await supabase
    .from('business_categories')
    .select('business_id')
    .eq('category_id', categoryData.id)

  if (linksError) {
    console.error('Failed to load category links:', linksError.message)
    throw new Error('Unable to load category listings.')
  }

  const businessIds = [
    ...new Set((links ?? []).map((link) => link.business_id).filter(Boolean)),
  ]

  let businesses: {
    id: string
    name: string
    slug: string
    address: string | null
    city: string
    province: string
    phone: string | null
    website: string | null
  }[] = []

  if (businessIds.length > 0) {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, slug, address, city, province, phone, website')
      .in('id', businessIds)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name')
      .limit(100)

    if (error) {
      console.error('Failed to load businesses:', error.message)
      throw new Error('Unable to load category listings.')
    }

    businesses = data ?? []
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href="/categories" className="hover:underline">Categories</Link>
        {' / '}
        <span>{categoryData.name}</span>
      </nav>

      <header className="max-w-3xl">
        <h1 className="text-3xl font-bold md:text-4xl">
          {categoryData.name}
        </h1>
        <p className="mt-4 leading-7 text-gray-600">
          Browse South African motor spares businesses associated with{' '}
          {categoryData.name}. Check each listing for its available location
          and contact details, then confirm stock and compatibility directly
          with the supplier.
        </p>
      </header>

      <p className="mt-6 text-sm text-gray-500">
        {businesses.length} {businesses.length === 1 ? 'listing' : 'listings'} shown
        {businesses.length === 100 ? ' (maximum displayed on this page)' : ''}.
      </p>

      {businesses.length === 0 ? (
        <section className="mt-8 rounded-xl border p-6">
          <h2 className="text-lg font-semibold">No active listings found</h2>
          <p className="mt-2 text-gray-600">
            There are currently no active businesses listed in this category.
            You can browse other categories or search the directory.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/categories" className="text-blue-700 underline">
              Browse categories
            </Link>
            <Link href="/search" className="text-blue-700 underline">
              Search businesses
            </Link>
          </div>
        </section>
      ) : (
        <section
          aria-label={`${categoryData.name} businesses`}
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
      )}
    </main>
  )
}
