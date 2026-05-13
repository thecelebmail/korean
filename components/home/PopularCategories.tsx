import Link from 'next/link'

const categories = [
  'Toyota Spares',
  'BMW Spares',
  'Used Auto Parts',
  'Truck Spares',
  'Gearbox Specialists',
  'Engine Spares',
]

export default function PopularCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-8 text-3xl font-bold">
          Popular Categories
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category}
              href="/search"
              className="rounded-xl border p-6 hover:shadow-lg"
            >
              <h3 className="font-semibold">
                {category}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}