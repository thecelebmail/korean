import { createClient } from '@/lib/supabase/server'

/**
 * Fetches nearby alternative listings for individual directory pages.
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
    console.error('getNearbyBusinesses error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    return []
  }

  return data || []
}

/**
 * Searches businesses by name, address, city, province, or slug.
 */
export async function searchBusinesses({
  q,
}: {
  q?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('businesses')
    .select(`
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

  const searchTerm = q?.trim()

  if (searchTerm) {
    const terms = searchTerm
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)

    const orParts = terms.flatMap((term) => {
      const safeTerm = term.replace(/[%_,()]/g, '')

      if (!safeTerm) {
        return []
      }

      return [
        `name.ilike.%${safeTerm}%`,
        `address.ilike.%${safeTerm}%`,
        `city.ilike.%${safeTerm}%`,
        `province.ilike.%${safeTerm}%`,
        `slug.ilike.%${safeTerm}%`,
      ]
    })

    if (orParts.length > 0) {
      query = query.or(orParts.join(','))
    }
  }

  const { data, error } = await query
    .order('rating', {
      ascending: false,
      nullsFirst: false,
    })
    .limit(20)

  if (error) {
    console.error('searchBusinesses error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })

    return { data: [] }
  }

  return {
    data: data || [],
  }
}