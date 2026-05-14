import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FlagTriangleRight } from 'lucide-react'
import { Star } from 'lucide-react'

export default function BusinessCard({ business }: any) {
  return (
    <div>
      <Link href={`/listings/${business.slug}`}>
        <h3>{business.name}</h3>
      </Link>

      <p><FlagTriangleRight className="inline-block" /> {business.address}</p>

      <p> <Star className="inline-block fill-yellow-400 text-yellow-400" /> {business.rating}</p>
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