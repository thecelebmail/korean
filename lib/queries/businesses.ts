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
    console.error('getNearbyBusinesses error:', error)
    return []
  }

  return data || []
}

export async function searchBusinesses({
  q,
}: {
  q?: string
}) {
  const supabase = await createClient()

  let query = supabase.from('businesses').select('*')

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

  const { data, error } = await query.order('rating', {
    ascending: false,
  })

  if (error) {
    console.error('searchBusinesses error:', error)

    return { data: [] }
  }

  return { data: data || [] }
}