import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at')

  const listingPages =
    businesses?.map((business) => ({
      url: `https://koreanmotorsparesnearme.co.za/listing/${business.slug}`,
      lastModified: business.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

  return [
    {
      url: 'https://koreanmotorsparesnearme.co.za',
      lastModified: new Date(),
      priority: 1,
    },

    {
      url: 'https://koreanmotorsparesnearme.co.za/provinces',
      lastModified: new Date(),
      priority: 0.9,
    },

    ...listingPages,
  ]
}