// components/home/hero.tsx
import SearchBar from '@/components/search/HeroSearch'

export default function Hero() {
  return (
    <section className="bg-gray-100 py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h1 className="text-4xl font-bold md:text-6xl">
          Korean Motor Spares Near Me
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Search trusted auto spares suppliers across South Africa.
        </p>

        <div className="mt-10">
          <SearchBar />
        </div>
      </div>
    </section>
  )
}