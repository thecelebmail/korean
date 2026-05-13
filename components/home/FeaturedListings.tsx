import { getFeaturedBusinesses } from '@/lib/queries/businesses'
import BusinessCard from '@/components/listings/BusinessCard'

export default async function FeaturedListings() {
  const businesses = await getFeaturedBusinesses()

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Featured Listings
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
            />
          ))}
        </div>
      </div>
    </section>
  )
}