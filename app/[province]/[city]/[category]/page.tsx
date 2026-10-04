export const revalidate = 86400;
export default async function CategoryCityPage({
  params,
}: {
  params: Promise<{
    province: string
    city: string
    category: string
  }>
}) {
  const { city, category } = await params

  return (
    <main>
      <h1>
        {category} in {city}
      </h1>
    </main>
  )
}