
import { createClient } from '@/lib/supabase/server'
import { generateBusinessDescription } from '@/lib/utils/generateBusinessDescription'
import { notFound } from 'next/navigation'
import { Globe, Mail, MapPin, MessageCircleMore } from 'lucide-react'
import { PhoneCall } from 'lucide-react'
import { Star } from 'lucide-react'

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) return notFound()
  const description = business.description || generateBusinessDescription(business)

     const mapQuery = encodeURIComponent(
    `${business.name}, ${business.address}, ${business.city}, ${business.province}, South Africa`
  )

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">{business.name}</h1>
      <p className="mt-6">{description}</p>

      <p className="mt-4 text-gray-600"><MapPin className="inline-block" /> {business.address}</p>

      <p className="mt-2"><Star className="inline-block fill-yellow-400 text-yellow-400" /> {business.rating}</p>
      <p className="mt-2"><Mail className="inline-block" /> {business.email}</p>
      <p className="mt-2"><Globe className="inline-block" /> <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {business.website}
      </a></p>
      <p className="mt-2">
        {business.whatsapp && (
          <a
            className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
            href={`wa.me/${business.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
      >
        <MessageCircleMore className="inline-block" /> WhatsApp
      </a>
      )} </p>
      <p className="mt-4">
       {business.phone && (
        <a
          href={`tel:${business.phone}`}
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
        >
          <PhoneCall className="inline-block" />Call Business
        </a>
      )}
      </p>
         {/* Google Map */}
      <div className="mt-8 overflow-hidden rounded-2xl border">
        <iframe
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        />
      </div>
    </main>
  )
}