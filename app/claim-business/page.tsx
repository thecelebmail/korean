import { ShieldCheck, Wrench } from 'lucide-react'

export default function ClaimBusinessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-green-600" />

          <h1 className="text-4xl font-bold">
            Claim Your Business
          </h1>
        </div>

        <p className="text-lg text-gray-600">
          Own a motor spares business listed on our
          directory? Claim your listing to update
          contact details, add photos, improve SEO,
          and manage your business profile.
        </p>

        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-yellow-700" />

            <p className="font-semibold text-yellow-800">
              Feature Not Yet Functional, however you can reach out to us via the contact page to get your business claimed early.
            </p>
          </div>

          <p className="mt-2 text-sm text-yellow-700">
            Business claiming is currently under
            development and will be available soon.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold">
            Benefits of Claiming
          </h2>

          <ul className="mt-4 space-y-3 text-gray-700">
            <li>• Update business information</li>

            <li>• Add WhatsApp and website links</li>

            <li>• Upload logos and business photos</li>

            <li>• Improve visibility in search results</li>

            <li>• Respond to customer enquiries</li>
          </ul>
        </div>
      </div>
    </main>
  )
}