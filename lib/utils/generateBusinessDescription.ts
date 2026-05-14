export function generateBusinessDescription(
  business: any
) {
  const parts = []

  parts.push(
    `${business.name} is a motor spares supplier based in ${business.city}, ${business.province}.`
  )

  if (business.rating) {
    parts.push(
      `The business currently has a ${business.rating} star customer rating.`
    )
  }

  if (business.address) {
    parts.push(
      `It is located at ${business.address}.`
    )
  }

  parts.push(
    `Customers can contact ${business.name} for vehicle parts, replacement spares, and automotive accessories.`
  )

  return parts.join(' ')
}