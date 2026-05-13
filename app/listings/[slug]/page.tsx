// app/listing/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) return notFound()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">{business.name}</h1>

      <p className="mt-4 text-gray-600">{business.address}</p>

      <p className="mt-2">⭐ {business.rating}</p>

      <a
        className="mt-6 inline-block text-blue-600"
        href={`tel:${business.phone}`}
      >
        Call Now
      </a>
    </main>
  )
}