type Business = {
  name: string
  city: string
  province: string
  address?: string
  rating?: number
  review_count?: number
  services?: string[] // e.g. ["Hyundai spares", "Kia spares", "engine parts"]
  years_established?: number
  price_range?: string // "$" | "$$" | "$$$"
  payment_methods?: string[]
  opening_hours?: Record<string, string>
  service_area?: string[] // nearby suburbs served
  website?: string
}

// Deterministic "random" pick based on business id/slug so the same
// business always renders the same template (good for caching + consistency)
// but different businesses get different phrasing.
function pick<T>(arr: T[], seed: string): T {
  const hash = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0)
  return arr[hash % arr.length]
}

export function generateBusinessDescription(business: Business) {
  const seed = business.name + business.city
  const parts: string[] = []

  const openers = [
    `${business.name} is a motor spares supplier serving the ${business.city} area of ${business.province}.`,
    `Based in ${business.city}, ${business.name} supplies Korean motor spares to customers across ${business.province}.`,
    `${business.name} operates as a motor spares business in ${business.city}, ${business.province}, specialising in Korean vehicle parts.`,
  ]
  parts.push(pick(openers, seed))

  if (business.years_established) {
    const age = new Date().getFullYear() - business.years_established
    parts.push(
      `The business has been operating in the area for ${age > 0 ? age : 'under a'} year${age > 1 ? 's' : ''}, since ${business.years_established}.`
    )
  }

  if (business.services?.length) {
    const list = business.services.slice(0, 5).join(', ')
    parts.push(`Their stock and services cover ${list}.`)
  }

  if (business.rating && business.review_count) {
    parts.push(
      `${business.name} holds a ${business.rating}-star rating from ${business.review_count} customer review${business.review_count === 1 ? '' : 's'}.`
    )
  } else if (business.rating) {
    parts.push(`Customer feedback currently averages ${business.rating} stars.`)
  }

  if (business.service_area?.length) {
    parts.push(
      `In addition to ${business.city}, they serve nearby areas including ${business.service_area.slice(0, 4).join(', ')}.`
    )
  }

  if (business.price_range) {
    const priceLabel = { $: 'budget-friendly', $$: 'mid-range', $$$: 'premium' }[business.price_range] ?? ''
    if (priceLabel) parts.push(`Pricing is generally ${priceLabel} compared to other suppliers in the area.`)
  }

  if (business.payment_methods?.length) {
    parts.push(`Accepted payment methods include ${business.payment_methods.join(', ')}.`)
  }

  if (business.address) {
    const locators = [
      `You'll find them at ${business.address}.`,
      `The premises are located at ${business.address}.`,
    ]
    parts.push(pick(locators, seed + 'addr'))
  }

  return parts.join(' ')
}