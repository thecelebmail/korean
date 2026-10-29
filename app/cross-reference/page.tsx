import type { Metadata } from 'next'
import VehicleCrossReference from '@/components/home/VehicleCrossReference'

export const metadata: Metadata = {
  title: 'Korean Motor Spares Cross Reference | OEM & Alternative Parts',
  description:
    'Cross-reference Korean vehicle OEM part numbers with alternative aftermarket parts for Hyundai, Kia and other Korean vehicles in South Africa.',
  keywords: [
    'Korean motor spares cross reference',
    'Hyundai parts cross reference',
    'Kia parts cross reference',
    'OEM part number cross reference',
    'Korean car parts',
    'aftermarket parts South Africa',
    'motor spares cross reference',
  ],
  alternates: {
    canonical: '/cross-reference',
  },
  openGraph: {
    title: 'Korean Motor Spares Cross Reference',
    description:
      'Find alternative aftermarket references for Korean vehicle parts and OEM numbers.',
    url: 'https://koreanmotorsparesnearme.co.za/cross-reference',
    type: 'website',
  },
}

export default function CrossReferencePage() {
  return (
    <main>
      <section className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Parts Reference Tool
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              Korean Motor Spares Cross Reference
            </h1>

            <p className="mt-5 text-lg leading-8 text-gray-600">
              Search Korean vehicle models, OEM part numbers and aftermarket
              references to help identify alternative motor-spares parts.
            </p>
          </div>
        </div>
      </section>

      <VehicleCrossReference />

      <section className="border-t bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-2xl font-bold">
            How the cross-reference tool works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border p-5">
              <div className="text-lg font-bold">1. Search</div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Search using a vehicle model, part type or OEM part number.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="text-lg font-bold">2. Compare</div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Review available aftermarket brand and part-number references.
              </p>
            </div>

            <div className="rounded-xl border p-5">
              <div className="text-lg font-bold">3. Verify</div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Confirm the part number and vehicle fitment with the supplier
                before purchasing.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            <strong>Important:</strong> Cross-reference information is provided
            as a starting point and does not guarantee vehicle fitment. Always
            verify the OEM number, vehicle year, engine specification and
            supplier catalogue before purchasing a part.
          </div>
        </div>
      </section>
    </main>
  )
}