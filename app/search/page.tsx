// app/search/page.tsx

import { searchBusinesses } from '@/lib/queries/businesses'
import { Search } from 'lucide-react'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams

  const q = params.q

  const results = await searchBusinesses({ q })

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-2">
        <Search className="h-6 w-6 text-gray-600" />

        <h1 className="text-3xl font-bold">
          Search Results
        </h1>
      </div>

      {/* Query */}
      {q && (
        <p className="mb-6 text-gray-600">
          Results for:{' '}
          <span className="font-semibold">
            {q}
          </span>
        </p>
      )}

      {/* Empty */}
      {results.data.length === 0 ? (
        <p className="text-gray-500">
          No businesses found.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.data.map((business) => (
            <div
              key={business.id}
              className="rounded-xl border p-4 transition hover:shadow"
            >
              <h2 className="text-lg font-semibold">
                {business.name}
              </h2>

              <p className="text-sm text-gray-600">
                {business.address}
              </p>

              <p className="mt-2 text-sm">
                ⭐ {business.rating ?? 'No rating'}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}