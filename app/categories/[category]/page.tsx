
import { createClient } from '@/lib/supabase/server'
import { MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  const supabase = await createClient()

  // Get category
  const { data: categoryData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', category)
    .single()

  if (!categoryData) {
    return notFound()
  }

  // Get linked businesses
  const { data: businessLinks } = await supabase
    .from('business_categories')
    .select(`
      business:businesses(*)
    `)
    .eq('category_id', categoryData.id)

  const businesses =
    businessLinks?.map((item: any) => item.business) || []

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        {categoryData.name}
      </h1>

      <p className="mt-4 text-gray-600">
        Browse businesses under {categoryData.name}
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

            <p className="text-sm text-gray-600"><MapPin className="inline-block w-4 h-4 text-gray-400"  />
              {business.address}
            </p>

            <p className="mt-2 text-sm"><Star className="inline-block w-4 h-4 text-yellow-400"  />
               {business.rating ?? 'No rating'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}