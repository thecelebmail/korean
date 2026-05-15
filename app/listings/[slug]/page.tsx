import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { generateBusinessDescription } from '@/lib/utils/generateBusinessDescription'
import { getNearbyBusinesses } from '@/lib/queries/businesses'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Globe, Mail, MapPin, MessageCircleMore } from 'lucide-react'
import { PhoneCall } from 'lucide-react'
import { Star } from 'lucide-react'

// ✅ Enhanced metadata function
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const supabase = await createClient()
  
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) {
    return {
      title: 'Business Not Found | Korean Motor Spares',
      description: 'The requested motor spares business could not be found.',
      robots: { index: false },
    }
  }

  const description = business.description || 
    `Find ${business.name} at ${business.address} in ${business.city}, ${business.province}. Quality Korean motor spares and auto parts.`

  return {
    title: `${business.name} | Korean Motor Spares in ${business.city}`,
    description: description,
    
    keywords: `${business.name}, ${business.city} motor spares, Korean auto parts, ${business.city} car parts, ${business.province} spares`,
    
    alternates: {
      canonical: `https://koreanmotorsparesnearme.co.za/listings/${business.slug}`,
    },
    
    openGraph: {
      title: business.name,
      description: description,
      url: `https://koreanmotorsparesnearme.co.za/listings/${business.slug}`,
      type: 'website',
      images: business.image_url ? [business.image_url] : [],
      locale: 'en_ZA',
    },
    
    twitter: {
      card: 'summary',
      title: business.name,
      description: description,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

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

  // Add JSON-LD structured data for better SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.province,
      addressCountry: 'ZA',
    },
    telephone: business.phone,
    email: business.email,
    url: `https://koreanmotorsparesnearme.co.za/listings/${business.slug}`,
    aggregateRating: business.rating ? {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.review_count || 1,
    } : undefined,
  }

  const nearbyBusinesses = await getNearbyBusinesses(
  business.city,
  business.province,
  business.slug
)


const searchSuggestions = [
  `Hyundai spares ${business.city}`,
  `Kia spares ${business.city}`,
  `Korean scrapyards ${business.city}`,
  `Bumper to bumper ${business.city}`,
  `Korean motor spares ${business.city}`,
  `Korean motor spares near ${business.city}`,
]


  return (
    <>
      {/* Add JSON-LD script for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <main className="mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-4xl font-bold">{business.name}</h1>
          <p className="mt-6">{description}</p>

          <p className="mt-4 text-gray-600"><MapPin className="inline-block" /> {business.address}</p>

          <p className="mt-2"><Star className="inline-block fill-yellow-400 text-yellow-400" /> {business.rating || 'No ratings yet'}</p>
          {business.email && (
            <p className="mt-2"><Mail className="inline-block" /> {business.email}</p>
          )}
          {business.website && (
            <p className="mt-2"><Globe className="inline-block" /> <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {business.website}
            </a></p>
          )}
          <p className="mt-2">
            {business.whatsapp && (
              <a
                className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
                href={`https://wa.me/${business.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircleMore className="inline-block" /> WhatsApp
              </a>
            )} 
          </p>
          <p className="mt-4">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
              >
                <PhoneCall className="inline-block" /> Call Business
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

        {/* Nearby Listings */}
  <section className="mt-16">
    <h2 className="text-2xl font-bold">
      Nearby Motor Spares
    </h2>

    <p className="mt-2 text-gray-600">
      More motor spares suppliers in{' '}
      {business.city}.
    </p>

    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nearbyBusinesses.map((item) => (
        <Link
          key={item.id}
          href={`/listings/${item.slug}`}
          className="rounded-xl border p-4 transition hover:shadow"
        >
          <h3 className="font-semibold">
            {item.name}
          </h3>

          <p className="mt-2 text-sm text-gray-600"><MapPin className="inline-block" />{' '}
            {item.address}
          </p>

          <p className="mt-2 text-sm"><Star className="inline-block fill-yellow-400 text-yellow-400" />{' '}
            {item.rating || 'No rating'}
          </p>
        </Link>
      ))}
    </div>
  </section>


  {/* People Also Searched For */}
  <section className="mt-16">
    <h2 className="text-2xl font-bold">
      People Also Searched For
    </h2>

    <p className="mt-2 text-gray-600">
      Popular Korean motor spares searches in{' '}
      {business.city}.
    </p>

    <div className="mt-6 flex flex-wrap gap-3">
      {searchSuggestions.map((term) => (
        <a
          key={term}
          href={`/search?q=${encodeURIComponent(term)}`}
          className="rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
        >
          {term}
        </a>
      ))}
    </div>
  </section>
  {/* Related Searches */}
      <div className="mt-10 text-sm">
        <h3 className="font-semibold">Related Searches</h3>

        <ul className="mt-2 space-y-1">
          <li><a href={`/near-me/${business.city}`}>Motor spares near {business.city}</a></li>
          <li><a href={`/spares/kia/${business.city}`}>Kia spares {business.city}</a></li>
          <li><a href={`/spares/korean-motor-spares/${business.city}`}>Korean motor spares {business.city}</a></li>
          <li><a href={`/spares/bumper-to-bumper/${business.city}`}>Bumper to bumper spares {business.city}</a></li>
        </ul>
      </div>
    </>
  )
}