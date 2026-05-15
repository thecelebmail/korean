import Link from 'next/link'
import { MapPin } from 'lucide-react'

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
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-stone-900">
            Popular Cities
          </h2>

          <p className="mt-3 max-w-2xl text-stone-600">
            Browse Korean motor spares suppliers, Hyundai spares,
            Kia parts, scrapyards, and bumper-to-bumper listings
            in major South African cities.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/search?q=${encodeURIComponent(
                `Korean motor spares ${city}`
              )}`}
              className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-900 group-hover:text-orange-600">
                    {city}
                  </h3>

                  <p className="mt-1 text-sm text-stone-500">
                    View suppliers in {city}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                  Hyundai Spares
                </span>

                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                  Kia Parts
                </span>

                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
                  Korean Scrap Yards
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Extra SEO Internal Links */}
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-stone-900">
            Popular Searches
          </h3>

          <div className="mt-4 flex flex-wrap gap-3">
            {[
              'Korean motor spares Johannesburg',
              'Kia spares Pretoria',
              'Hyundai spares Durban',
              'Bumper to bumper Johannesburg',
              'Korean scrapyards Cape Town',
              'Korean used parts Polokwane',
            ].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-700 transition hover:bg-orange-100"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}