import { createClient } from '@/lib/supabase/server'

export default async function sitemap() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('slug, updated_at, city, province')

  const baseUrl = 'https://koreanmotorsparesnearme.co.za'

  // -----------------------------
  // 1. STATIC PAGES
  // -----------------------------
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/provinces`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), priority: 0.9 },
  ]

  // -----------------------------
  // 2. LISTINGS
  // -----------------------------
  const listingPages =
    businesses?.map((b) => ({
      url: `${baseUrl}/listing/${b.slug}`,
      lastModified: b.updated_at,
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    })) || []

  // -----------------------------
  // 3. PROVINCES (DEDUPED)
  // -----------------------------
  const provinces = [
    ...new Set((businesses || []).map((b) => b.province).filter(Boolean)),
  ]

  const provincePages = provinces.map((province) => ({
    url: `${baseUrl}/${encodeURIComponent(province)}`,
    lastModified: new Date(),
    priority: 0.8,
    changeFrequency: 'weekly' as const,
  }))

  // -----------------------------
  // 4. CITIES (DEDUPED)
  // -----------------------------
  const cityMap = new Map()

  businesses?.forEach((b) => {
    const key = `${b.province}-${b.city}`
    cityMap.set(
      `${baseUrl}/${encodeURIComponent(b.province)}/${encodeURIComponent(
        b.city
      )}`,
      {
        url: `${baseUrl}/${encodeURIComponent(b.province)}/${encodeURIComponent(
          b.city
        )}`,
        lastModified: b.updated_at,
        priority: 0.7,
        changeFrequency: 'weekly',
      }
    )
  })

  const cityPages = Array.from(cityMap.values())

  // -----------------------------
  // 5. NEAR ME PAGES
  // -----------------------------
  const nearMeMap = new Map()

  businesses?.forEach((b) => {
    nearMeMap.set(`${baseUrl}/near-me/${b.city}`, {
      url: `${baseUrl}/near-me/${encodeURIComponent(b.city)}`,
      lastModified: new Date(),
      priority: 0.6,
      changeFrequency: 'weekly',
    })
  })

  const nearMePages = Array.from(nearMeMap.values())

  // -----------------------------
  // 6. KEYWORD LANDING PAGES (SEO GOLD)
  // -----------------------------
  const keywords = [
    'korean-motor-spares',
    'kia-spares',
    'hyundai-spares',
    'bumper-to-bumper',
    'auto-parts',
  ]

  const keywordPages: any[] = []

  businesses?.forEach((b) => {
    keywords.forEach((kw) => {
      keywordPages.push({
        url: `${baseUrl}/spares/${kw}/${encodeURIComponent(b.city)}`,
        lastModified: new Date(),
        priority: 0.6,
        changeFrequency: 'weekly',
      })
    })
  })

  // remove duplicates
  const uniqueKeywordPages = Array.from(
    new Map(keywordPages.map((p) => [p.url, p])).values()
  )

  // -----------------------------
  // FINAL OUTPUT
  // -----------------------------
  return [
    ...staticPages,
    ...listingPages,
    ...provincePages,
    ...cityPages,
    ...nearMePages,
    ...uniqueKeywordPages,
  ]
}