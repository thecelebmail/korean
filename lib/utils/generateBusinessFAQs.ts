// Minimal Business type used by this utility
type Business = {
  name: string
  address?: string
  city: string
  province?: string
  services?: string[]
  opening_hours?: Record<string, string>
}

export function generateBusinessFAQs(business: Business) {
  const faqs = [
    {
      q: `Where is ${business.name} located?`,
      a: `${business.name} is located at ${business.address || `in ${business.city}`}, ${business.city}, ${business.province}.`,
    },
    {
      q: `What services does ${business.name} offer?`,
      a: business.services?.length
        ? `${business.name} offers ${business.services.join(', ')}.`
        : `${business.name} supplies Korean motor spares and automotive parts to customers in ${business.city}.`,
    },
    {
      q: `Does ${business.name} deliver Hyundai and Kia parts in ${business.city}?`,
      a: `Yes, ${business.name} serves customers looking for Hyundai and Kia spares throughout ${business.city} and surrounding areas.`,
    },
  ]

  if (business.opening_hours) {
    faqs.push({
      q: `What are the opening hours for ${business.name}?`,
      a: Object.entries(business.opening_hours)
        .map(([day, hrs]) => `${day}: ${hrs}`)
        .join(', '),
    })
  }

  return faqs
}