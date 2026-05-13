export interface Province {
  id: number
  name: string
  slug: string
}

export interface City {
  id: number
  name: string
  slug: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Brand {
  id: number
  name: string
  slug: string
}

export interface Business {
  id: string
  name: string
  slug: string
  description?: string
  address?: string
  phone?: string
  whatsapp?: string
  website?: string
  image_url?: string
  logo_url?: string
  rating?: number
  review_count?: number
  is_verified: boolean
  is_featured?: boolean
  featured_score?: number

  city?: City
  province?: Province
}