// lib/queries/businesses.ts
import { createClient } from '@/lib/supabase/server'

/**
 * Fetches nearby alternative listings for individual directory pages.
 * Preserved exactly as needed by app/listings/[slug]/page.tsx
 */
export async function getNearbyBusinesses(
  city: string,
  province: string,
  currentSlug: string,
  limit = 6
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      address,
      city,
      province,
      rating
    `)
    .eq('city', city)
    .eq('province', province)
    .neq('slug', currentSlug)
    .limit(limit)

  if (error) {
    console.error('getNearbyBusinesses error:', error)
    return []
  }

  return data || []
}

/**
 * Handles text-based discovery matching. 
 * Optimized to select required view properties only and enforces a strict structural limit.
 */
export async function searchBusinesses({
  q,
}: {
  q?: string
}) {
  const supabase = await createClient()

  // OPTIMIZATION: Only request required rendering properties, never select('*')
  let query = supabase.from('businesses').select(`
    id,
    name,
    slug,
    address,
    city,
    province,
    rating,
    tier,
    image_url
  `)

  if (q && q.trim() !== '') {
    const terms = q
      .toLowerCase()
      .split(/\s+/) // split by spaces
      .filter(Boolean)

    const orParts: string[] = []

    terms.forEach((term) => {
      orParts.push(
        `name.ilike.%${term}%`,
        `address.ilike.%${term}%`,
        `city.ilike.%${term}%`,
        `province.ilike.%${term}%`,
        `slug.ilike.%${term}%`
      )
    })

    query = query.or(orParts.join(','))
  }

  // OPTIMIZATION: Order listings by priority score, limiting response depth to 20 profiles per query page
  const { data, error } = await query
    .order('rating', {
      ascending: false,
    })
    .limit(20)

  if (error) {
    console.error('searchBusinesses error:', error)
    return { data: [] }
  }

  return { data: data || [] }
}
