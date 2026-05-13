import { createClient } from '@/lib/supabase/server'

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