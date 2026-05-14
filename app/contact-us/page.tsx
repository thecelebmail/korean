import {
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
} from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        {/* Header */}
        <h1 className="text-4xl font-bold">
          Contact Us
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Need to claim a business, add a listing,
          report incorrect information, or contact
          our team? Reach out and we’ll assist you.
        </p>

        {/* Contact Cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Email */}
          <div className="rounded-xl border p-5">
            <Mail className="h-8 w-8 text-blue-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Email
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Send listing requests, claims,
              corrections, or partnership enquiries.
            </p>

            <a
              href="mailto:info@elifdigital.co.za"
              className="mt-4 block text-blue-600 underline"
            >
              info@elifdigital.co.za
            </a>
          </div>

          {/* Phone */}
          <div className="rounded-xl border p-5">
            <Phone className="h-8 w-8 text-green-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Phone / WhatsApp
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Contact us directly for urgent
              listing corrections or claims.
            </p>

            <a
              href="tel:+27733819701"
              className="mt-4 block text-blue-600 underline"
            >
              +27 73 381 9701
            </a>
          </div>

          {/* Coverage */}
          <div className="rounded-xl border p-5">
            <MapPin className="h-8 w-8 text-red-600" />

            <h2 className="mt-4 text-xl font-semibold">
              Coverage
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              We cover Korean motor spares and
              auto parts suppliers across
              South Africa.
            </p>
          </div>
        </div>

        {/* Manual Requests */}
        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-yellow-700" />

            <h2 className="text-2xl font-bold text-yellow-800">
              Manual Listing Requests
            </h2>
          </div>

          <p className="mt-4 text-gray-700">
            While automated claiming and business
            submissions are still under development,
            we currently process requests manually.
          </p>

          <div className="mt-6 space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">
                Claim A Business
              </h3>

              <p className="text-sm text-gray-600">
                Send your business name, phone
                number, and proof of ownership.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Add A Business
              </h3>

              <p className="text-sm text-gray-600">
                Send your business details,
                address, city, and contact
                information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">
                Report Incorrect Information
              </h3>

              <p className="text-sm text-gray-600">
                Let us know about outdated
                phone numbers, addresses,
                or duplicate listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}