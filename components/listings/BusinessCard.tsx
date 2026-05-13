import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
export default function BusinessCard({ business }: any) {
  return (
    <div>
      <Link href={`/listings/${business.slug}`}>
        <h3>{business.name}</h3>
      </Link>

      <p>{business.address}</p>

      <p>{business.rating}</p>
    </div>
  )
}

export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('getBusinessBySlug error:', error)
    return null
  }

  return data
}