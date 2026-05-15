import SearchBar from '@/components/search/HeroSearch'
import Link from 'next/link'
import Image from 'next/image'
import { Menu } from 'lucide-react'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex items-center justify-center overflow-hidden rounded-lg">
            <Image
              src="/korean-logo.png"
              alt="Korean Motor Spares"
              width={200}
              height={100}
              className="h-auto w-auto object-cover"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/categories"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
          >
            Categories
          </Link>

          <Link
            href="/provinces"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
          >
            Provinces
          </Link>

          <Link
            href="/brands"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
          >
            Brands
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
          >
            Contact
          </Link>
        </nav>

        {/* Search */}
        <div className="hidden xl:block w-full max-w-md px-6">
          <SearchBar />
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/add-business"
            className="hidden rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 sm:inline-flex"
          >
            + Add Business
          </Link>

          <Link
            href="/claim-business"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Claim Listing
          </Link>

          {/* Mobile menu icon */}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 lg:hidden">
            <Menu className="h-5 w-5 text-stone-700" />
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-stone-100 px-4 py-3 xl:hidden">
        <SearchBar />
      </div>
    </header>
  )
}