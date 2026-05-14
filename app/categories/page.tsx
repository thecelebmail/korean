// app/categories/page.tsx

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

return (
  <main className="mx-auto max-w-6xl px-4 py-12">
    {/* Hero */}
    <section className="max-w-3xl">
      <h1 className="text-4xl font-bold md:text-5xl">
        Motor Spares Categories
      </h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Browse Korean motor spares, auto parts,
        replacement components, and automotive
        suppliers across South Africa by category.

        Find trusted businesses supplying
        engines, bumpers, service kits,
        suspension parts, body panels,
        gearboxes, lights, and more.
      </p>
    </section>

    {/* Categories Grid */}
    <section className="mt-12">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(categories || []).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold group-hover:text-blue-600">
              {category.name}
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Browse businesses supplying{' '}
              {category.name.toLowerCase()} and
              related motor spares across South Africa.
            </p>

            <div className="mt-5 text-sm font-medium text-blue-600">
              View Listings →
            </div>
          </Link>
        ))}
      </div>
    </section>

    {/* SEO Content */}
    <section className="mt-20 rounded-3xl bg-gray-100 p-8">
      <h2 className="text-3xl font-bold">
        Korean Motor Spares Directory
      </h2>

      <p className="mt-5 leading-8 text-gray-700">
        Our directory helps drivers and workshops
        discover trusted Korean motor spares
        suppliers throughout South Africa.

        Search for Hyundai, Kia, Daewoo,
        SsangYong, and aftermarket replacement
        parts suppliers near you.
      </p>

      <p className="mt-5 leading-8 text-gray-700">
        Whether you need bumpers, engines,
        suspension components, headlights,
        service kits, radiators, or body parts,
        browse businesses by category and location
        to find the right supplier quickly.
      </p>
    </section>

    {/* Popular Searches */}
    <section className="mt-16">
      <h2 className="text-2xl font-bold">
        Popular Searches
      </h2>

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          'Korean Motor Spares',
          'Korean Motor Spares Near Me',
          'Hyundai Spares',
          'Kia Spares',
          'Bumper To Bumper Spares',
          'Engine Parts',
          'Auto Body Parts',
          'Gearbox Spares',
          'Replacement Parts',
        ].map((keyword) => (
          <h1
            key={keyword}
            className="rounded-full border bg-white px-4 py-2 text-sm text-gray-700"
          >
            {keyword}
          </h1>
        ))}
      </div>
    </section>
  </main>
)
}