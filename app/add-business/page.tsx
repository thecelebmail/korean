import { PlusCircle, Wrench } from 'lucide-react'

export default function AddBusinessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <PlusCircle className="h-10 w-10 text-blue-600" />

          <h1 className="text-4xl font-bold">
            Add Your Business
          </h1>
        </div>

        <p className="text-lg text-gray-600">
          Submit your motor spares business to our
          South African directory and reach customers
          searching for auto parts, Korean spares,
          replacement parts, and accessories near them.
        </p>

        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-700" />

            <p className="font-semibold text-yellow-800">
              Submissions Not Yet Open, however you can reach out to us via the contact page to get your business added early.
            </p>
          </div>

          <p className="mt-2 text-sm text-yellow-700">
            Business submissions are currently being
            prepared and will launch soon.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold">
            What You’ll Be Able To Add
          </h2>

          <ul className="mt-4 space-y-3 text-gray-700">
            <li>• Business contact details</li>

            <li>• Google Maps location</li>

            <li>• Brands you supply</li>

            <li>• Photos and logos</li>

            <li>• WhatsApp and social media links</li>

            <li>• SEO-optimized business listings</li>
          </ul>
        </div>
      </div>
    </main>
  )
}