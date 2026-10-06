'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, ShieldCheck } from 'lucide-react'

type CrossReference = {
  make: string
  model: string
  yearFrom: number
  yearTo: number
  partType: string
  oemPart: string
  alternativeBrand: string
  alternativePart: string
  source: string
}

const VEHICLE_PARTS_DATABASE: CrossReference[] = [
  {
    make: 'Hyundai',
    model: 'Grand i10',
    yearFrom: 2014,
    yearTo: 2020,
    partType: 'Oil Filter',
    oemPart: '26300-02503',
    alternativeBrand: 'GUD',
    alternativePart: 'Z632',
    source: 'Reference data',
  },
  {
    make: 'Kia',
    model: 'Picanto TA',
    yearFrom: 2011,
    yearTo: 2017,
    partType: 'Front Brake Pads',
    oemPart: '58101-07A00',
    alternativeBrand: 'Ferodo',
    alternativePart: 'FDB4307',
    source: 'Reference data',
  },
  {
    make: 'Hyundai',
    model: 'i20 Hatch',
    yearFrom: 2015,
    yearTo: 2021,
    partType: 'Cabin Air Filter',
    oemPart: '97133-1C000',
    alternativeBrand: 'Fram',
    alternativePart: 'RCA208',
    source: 'Reference data',
  },
  {
    make: 'Kia',
    model: 'Rio UB',
    yearFrom: 2012,
    yearTo: 2017,
    partType: 'Spark Plug',
    oemPart: '18846-10060',
    alternativeBrand: 'NGK',
    alternativePart: 'SILZKR6B10E',
    source: 'Reference data',
  },
]

export default function VehicleCrossReference() {
  const [search, setSearch] = useState('')
  const [make, setMake] = useState('')
  const [partType, setPartType] = useState('')

  const makes = useMemo(() => {
    return [...new Set(VEHICLE_PARTS_DATABASE.map((item) => item.make))]
  }, [])

  const partTypes = useMemo(() => {
    return [...new Set(VEHICLE_PARTS_DATABASE.map((item) => item.partType))]
  }, [])

  const results = useMemo(() => {
    const term = search.trim().toLowerCase()

    return VEHICLE_PARTS_DATABASE.filter((item) => {
      const matchesMake =
        !make || item.make.toLowerCase() === make.toLowerCase()

      const matchesPartType =
        !partType ||
        item.partType.toLowerCase() === partType.toLowerCase()

      const matchesSearch =
        !term ||
        item.make.toLowerCase().includes(term) ||
        item.model.toLowerCase().includes(term) ||
        item.partType.toLowerCase().includes(term) ||
        item.oemPart.toLowerCase().includes(term) ||
        item.alternativeBrand.toLowerCase().includes(term) ||
        item.alternativePart.toLowerCase().includes(term)

      return matchesMake && matchesPartType && matchesSearch
    })
  }, [search, make, partType])

  return (
    <section className="border-y bg-gray-50 py-14">
      <div className="mx-auto max-w-6xl px-4">

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Parts Tool
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Find an Alternative Part
          </h2>

          <p className="mt-3 text-gray-600">
            Search Korean vehicle models, OEM part numbers and aftermarket
            references to help identify alternative parts.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto]">

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="OEM number, model or part..."
                className="w-full rounded-lg border px-10 py-3 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">All makes</option>

              {makes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={partType}
              onChange={(e) => setPartType(e.target.value)}
              className="rounded-lg border px-3 py-3 text-sm"
            >
              <option value="">All parts</option>

              {partTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <Link
              href="/cross-reference"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Full Tool
              <ArrowRight size={16} />
            </Link>
          </div>

          {search || make || partType ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-gray-500">
                {results.length} reference{results.length === 1 ? '' : 's'} found
              </p>

              {results.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                  No cross-reference found for that search.
                </div>
              ) : (
                results.map((item) => (
                  <div
                    key={`${item.oemPart}-${item.alternativePart}`}
                    className="rounded-xl border p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-4">

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Vehicle
                        </p>

                        <p className="font-semibold">
                          {item.make} {item.model}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.yearFrom}–{item.yearTo}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Part
                        </p>

                        <p className="font-semibold">
                          {item.partType}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          OEM
                        </p>

                        <p className="font-mono text-sm">
                          {item.oemPart}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Alternative
                        </p>

                        <p className="font-semibold">
                          {item.alternativeBrand}
                        </p>

                        <p className="font-mono text-sm">
                          {item.alternativePart}
                        </p>
                      </div>

                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="mt-5 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />

            <p>
              Cross-reference results are a starting point, not a fitment
              guarantee. Always verify the OEM number, vehicle year,
              engine specification and supplier catalogue before purchasing.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}