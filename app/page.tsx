import Hero from '@/components/home/Hero'
import VehicleCrossReference from '@/components/home/VehicleCrossReference'
import PopularCategories from '@/components/home/PopularCategories'
import PopularCities from '@/components/home/PopularCities'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <VehicleCrossReference />
      <PopularCategories />
      <PopularCities />
    </main>
  )
}