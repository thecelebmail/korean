import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Motor Spares Categories in South Africa | Korean Motor Spares',
  description:
    'Browse Korean motor spares and automotive parts suppliers by category in South Africa. Find engines, bumpers, suspension parts, gearboxes, lights and more.',
  alternates: {
    canonical: 'https://koreanmotorsparesnearme.co.za/categories',
  },
}

const popularSearches = [
  'Korean Motor Spares',
  'Korean Motor Spares Near Me',
  'Hyundai Spares',
  'Kia Spares',
  'Bumper To Bumper Spares',
  'Engine Parts',
  'Auto Body Parts',
  'Gearbox Spares',
  'Replacement Parts',
]

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (categoriesError) {
    console.error('Failed to load categories:', categoriesError.message)
    throw new Error('Unable to load categories.')
  }

  const { data: links, error: linksError } = await supabase
    .from('business_categories')
    .select('category_id, business_id')

  if (linksError) {
    console.error('Failed to load category associations:', linksError.message)
    throw new Error('Unable to load category listings.')
  }

  const businessIds = [
    ...new Set((links ?? []).map((link) => link.business_id).filter(Boolean)),
  ]

  let activeBusinessIds = new Set<string>()

  if (businessIds.length > 0) {
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('id')
      .in('id', businessIds)
      .eq('status', 'active')
      .is('deleted_at', null)

    if (businessesError) {
      console.error('Failed to load active businesses:', businessesError.message)
      throw new Error('Unable to load category listings.')
    }

    activeBusinessIds = new Set((businesses ?? []).map((business) => business.id))
  }

  const activeCategories = (categories ?? [])
    .map((category) => {
      const count = (links ?? []).filter(
        (link) =>
          link.category_id === category.id &&
          activeBusinessIds.has(link.business_id),
      ).length

      return {
        ...category,
        count,
      }
    })
    .filter((category) => category.count > 0)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="max-w-3xl">
        <h1 className="text-4xl font-bold md:text-5xl">
          Motor Spares Categories
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          Browse Korean motor spares, auto parts, replacement components,
          and automotive suppliers across South Africa by category. Find
          businesses supplying engines, bumpers, service kits, suspension
          parts, body panels, gearboxes, lights, and more.
        </p>
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Browse Categories</h2>
          <p className="mt-2 text-sm text-gray-600">
            Explore {activeCategories.length} categories with active business
            listings.
          </p>
        </div>

        {activeCategories.length === 0 ? (
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold">No categories available</h3>
            <p className="mt-2 text-sm text-gray-600">
              There are currently no categories with active business listings.
              Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Browse businesses supplying {category.name.toLowerCase()} and
                  related motor spares across South Africa.
                </p>

                <p className="mt-5 text-sm font-medium text-blue-600">
                  {category.count} {category.count === 1 ? 'listing' : 'listings'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-20 rounded-3xl bg-gray-100 p-8">
        <h2 className="text-3xl font-bold">
          Korean Motor Spares Directory
        </h2>

        <p className="mt-5 leading-8 text-gray-700">
          Our directory helps drivers and workshops discover Korean motor
          spares suppliers throughout South Africa. Search for Hyundai, Kia,
          Daewoo, SsangYong, and aftermarket replacement parts suppliers.
        </p>

        <p className="mt-5 leading-8 text-gray-700">
          Whether you need bumpers, engines, suspension components, headlights,
          service kits, radiators, or body parts, browse businesses by category
          and location to find potential suppliers. Contact each business to
          confirm stock, compatibility, and pricing.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Popular Searches</h2>

        <div className="mt-6 flex flex-wrap gap-3">
          {popularSearches.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}