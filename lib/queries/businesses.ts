import { createClient } from '@/lib/supabase/server'

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
    console.error(error)
    return []
  }

  return data || []
}

export async function searchBusinesses({ q }: { q?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('businesses')
    .select('*')
    .order('rating', { ascending: false })

  if (q && q.trim()) {
    const term = q.trim()

    query = query.or(
      [
        `name.ilike.%${term}%`,
        `city.ilike.%${term}%`,
        `province.ilike.%${term}%`,
        `address.ilike.%${term}%`,
      ].join(',')
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('search error:', error)
    return { data: [] }
  }

  return { data: data || [] }
}