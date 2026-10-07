// app/sitemap.ts
import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      slug,
      updated_at,
      city,
      province,
      city_slug,
      province_slug
    `)

  const baseUrl =
    'https://koreanmotorsparesnearme.co.za'

  // -----------------------------
  // STATIC PAGES
  // -----------------------------
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      priority: 1,
    },

    {
      url: `${baseUrl}/provinces`,
      lastModified: new Date(),
      priority: 0.9,
    },

    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      priority: 0.9,
    },

    {
      url: `${baseUrl}/brands`,
      lastModified: new Date(),
      priority: 0.9,
    },

    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      priority: 0.7,
    },

    {
      url: `${baseUrl}/claim-business`,
      lastModified: new Date(),
      priority: 0.7,
    },

    {
      url: `${baseUrl}/add-business`,
      lastModified: new Date(),
      priority: 0.7,
    },
       {
      url: `${baseUrl}/cross-reference`,
      lastModified: new Date(),
      priority: 0.7,
    },
    
  ]

  // -----------------------------
  // LISTINGS
  // -----------------------------
  const listingPages =
    businesses?.map((b) => ({
      url: `${baseUrl}/listings/${b.slug}`,
      lastModified: b.updated_at,
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    })) || []

  // -----------------------------
  // PROVINCES
  // -----------------------------
  const provinceMap = new Map()

  businesses?.forEach((b) => {
    if (!b.province_slug) return

    provinceMap.set(
      b.province_slug,
      {
        url: `${baseUrl}/${b.province_slug}`,
        lastModified: b.updated_at,
        priority: 0.8,
        changeFrequency: 'weekly',
      }
    )
  })

  const provincePages = Array.from(
    provinceMap.values()
  )

  // -----------------------------
  // CITY PAGES
  // -----------------------------
  const cityMap = new Map()

  businesses?.forEach((b) => {
    if (
      !b.province_slug ||
      !b.city_slug
    )
      return

    const url = `${baseUrl}/${b.province_slug}/${b.city_slug}`

    cityMap.set(url, {
      url,
      lastModified: b.updated_at,
      priority: 0.8,
      changeFrequency: 'weekly',
    })
  })

  const cityPages = Array.from(
    cityMap.values()
  )

  // -----------------------------
  // NEAR ME PAGES
  // -----------------------------
  const nearMeMap = new Map()

  businesses?.forEach((b) => {
    if (!b.city_slug) return

    const url = `${baseUrl}/near-me/${b.city_slug}`

    nearMeMap.set(url, {
      url,
      lastModified: b.updated_at,
      priority: 0.7,
      changeFrequency: 'weekly',
    })
  })

  const nearMePages = Array.from(
    nearMeMap.values()
  )

  // -----------------------------
  // SEO LANDING PAGES
  // -----------------------------
  const keywords = [
    'korean-motor-spares',
    'kia-spares',
    'hyundai-spares',
    'bumper-to-bumper',
    'auto-parts',
  ]

  const seoMap = new Map()

  businesses?.forEach((b) => {
    if (!b.city_slug) return

    keywords.forEach((keyword) => {
      const url = `${baseUrl}/spares/${keyword}/${b.city_slug}`

      seoMap.set(url, {
        url,
        lastModified: b.updated_at,
        priority: 0.7,
        changeFrequency: 'weekly',
      })
    })
  })

  const seoPages = Array.from(
    seoMap.values()
  )

  return [
    ...staticPages,
    ...listingPages,
    ...provincePages,
    ...cityPages,
    ...nearMePages,
    ...seoPages,
  ]
}