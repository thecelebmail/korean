import Hero from '@/components/home/Hero'
//import FeaturedListings from '@/components/home/FeaturedListings'
import PopularCategories from '@/components/home/PopularCategories'
import PopularCities from '@/components/home/PopularCities'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PopularCategories />
      <PopularCities />
      { /* <FeaturedListings /> */ }
    </main>
  )
}