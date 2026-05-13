// app/provinces/page.tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProvincesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('businesses')
    .select('province, province_slug')
    .not('province_slug', 'is', null)

  const provinces = [
    ...new Map(
      (data || []).map(b => [b.province_slug, b.province])
    ).entries(),
  ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">Provinces</h1>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {provinces.map(([slug, name]) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            {name}
          </Link>
        ))}
      </div>
    </main>
  )
}