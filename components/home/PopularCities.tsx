import Link from 'next/link'

const cities = [
  'Johannesburg',
  'Pretoria',
  'Durban',
  'Cape Town',
  'Polokwane',
  'Bloemfontein',
]

export default function PopularCities() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-8 text-3xl font-bold">
          Popular Cities
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city}
              href="/search"
              className="rounded-xl border bg-white p-6 hover:shadow-lg"
            >
              <h3 className="font-semibold">
                {city}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}