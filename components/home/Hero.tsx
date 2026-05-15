// components/home/hero.tsx
import Link from 'next/link'
import {
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'

import SearchBar from '@/components/search/HeroSearch'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white py-20 lg:py-28">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-yellow-100 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
            <ShieldCheck className="h-4 w-4" />
            South African Korean Motor Spares Directory
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-stone-900 md:text-6xl lg:text-7xl">
            Korean Motor Spares Near Me
          </h1>

          {/* Supporting SEO Copy */}
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-stone-600 md:text-xl">
            Find trusted Korean motor spares suppliers, Hyundai spares,
            Kia spares, Korean scrapyards, engines, body parts,
            suspension parts, and bumper-to-bumper spares across
            Johannesburg, Pretoria, Durban, Cape Town, and South Africa.
          </p>

          {/* Search */}
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
          </div>

          {/* SEO Search Suggestions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[
              'Korean motor spares Johannesburg',
              'Hyundai spares Pretoria',
              'Kia spares Durban',
              'Bumper to bumper Johannesburg',
              'Korean scrapyards Gauteng',
              'Korean engines Cape Town',
            ].map((item) => (
              <Link
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 hover:shadow"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Trust Stats */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>

              <p className="mt-4 text-3xl font-bold text-stone-900">
                1000+
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Listings Across South Africa
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Wrench className="h-6 w-6 text-orange-600" />
              </div>

              <p className="mt-4 text-3xl font-bold text-stone-900">
                500k+
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Korean Vehicle Parts
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>

              <p className="mt-4 text-3xl font-bold text-stone-900">
                Nationwide
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Delivery & Courier Support
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Star className="h-6 w-6 text-orange-600" />
              </div>

              <p className="mt-4 text-3xl font-bold text-stone-900">
                Trusted
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Suppliers & Scrap Yards
              </p>
            </div>
          </div>

          {/* Keyword Rich Content */}
          <div className="mx-auto mt-16 max-w-5xl rounded-3xl border border-stone-200 bg-white p-8 text-left shadow-sm">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-600" />

              <h2 className="text-2xl font-bold text-stone-900">
                Find Korean Car Parts Fast
              </h2>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="leading-7 text-stone-600">
                  Search for Korean motor spares near you including
                  Hyundai, Kia, Daewoo, SsangYong, and Chevrolet parts.
                  Browse suppliers by city, province, category, or brand.
                </p>

                <ul className="mt-5 space-y-3 text-sm text-stone-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-600">✓</span>
                    Hyundai engines, gearboxes & body parts
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-600">✓</span>
                    Kia Picanto, Rio & Sportage spares
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-600">✓</span>
                    Korean scrapyards & used parts suppliers
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-600">✓</span>
                    Bumper to bumper spares Johannesburg
                  </li>
                </ul>
              </div>

              <div>
                <p className="leading-7 text-stone-600">
                  Whether you need suspension parts, brake pads,
                  headlights, mirrors, radiators, engines, or complete
                  Korean vehicle stripping services, compare suppliers
                  across South Africa from one directory.
                </p>

                <div className="mt-5 rounded-2xl bg-orange-50 p-5">
                  <p className="font-semibold text-orange-700">
                    Popular Searches
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm">
                    {[
                      'Korean motor spares near me',
                      'Bumper to bumper Jules Street',
                      'Kia scrapyard Johannesburg',
                      'Hyundai spares Gauteng',
                      'Korean used parts Pretoria',
                    ].map((item) => (
                      <Link
                        key={item}
                        href={`/search?q=${encodeURIComponent(item)}`}
                        className="rounded-full bg-white px-3 py-1.5 text-stone-700 shadow-sm hover:text-orange-600"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-14">
            <Link
              href="/add-business"
              className="inline-flex items-center rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Add Your Business
            </Link>

            <p className="mt-4 text-sm text-stone-500">
              Own a Korean spares shop or scrapyard? List your business
              and reach customers searching daily for Korean auto parts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}