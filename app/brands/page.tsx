import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function BrandsPage() {
  const supabase = await createClient()

  const { data: brands } = await supabase
    .from('brands')
    .select('*')
    .order('name')

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        Car Brands
      </h1>

      <p className="mt-4 text-gray-600">
        Browse motor spares suppliers by vehicle brand.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(brands || []).map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h2 className="font-semibold">
              {brand.name}
            </h2>
          </Link>
        ))}
      </div>
    </main>
  )
}