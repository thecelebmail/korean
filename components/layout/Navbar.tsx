'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Menu,
  X,
  ChevronRight,
  MapPin,
  Tags,
  Award,
  Phone,
  Plus,
  Search,
  Binoculars,
} from 'lucide-react'

import SearchBar from '@/components/search/HeroSearch'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/korean-logo.png"
            alt="Korean Motor Spares"
            width={180}
            height={70}
            className="h-auto max-h-12 w-auto object-contain"
            priority
          />
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
            href="/contact-us"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
          >
            Contact
          </Link>
          <Link 
            href="/cross-reference"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-orange-600"
            >
              Part Tool
            </Link>
        </nav>

        {/* Desktop Search */}
        <div className="hidden min-w-0 flex-1 px-4 xl:block">
          <SearchBar />
        </div>

        {/* Desktop CTA + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/add-business"
            className="hidden rounded-lg border border-orange-200 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 sm:inline-flex"
          >
            + Add Business
          </Link>

          <Link
            href="/claim-business"
            className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 sm:inline-flex"
          >
            Claim Listing
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 lg:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-stone-100 bg-stone-50 px-4 py-3 lg:hidden">
        <SearchBar />
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-stone-200 bg-white shadow-lg lg:hidden"
        >
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <Link
              href="/categories"
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-stone-100 py-4 text-sm font-medium text-stone-700 hover:text-orange-600"
            >
              <span className="flex items-center gap-3">
                <Tags className="h-5 w-5 text-orange-600" />
                Categories
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/provinces"
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-stone-100 py-4 text-sm font-medium text-stone-700 hover:text-orange-600"
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-orange-600" />
                Provinces
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/brands"
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-stone-100 py-4 text-sm font-medium text-stone-700 hover:text-orange-600"
            >
              <span className="flex items-center gap-3">
                <Award className="h-5 w-5 text-orange-600" />
                Brands
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

            <Link
              href="/contact-us"
              onClick={closeMenu}
              className="flex items-center justify-between border-b border-stone-100 py-4 text-sm font-medium text-stone-700 hover:text-orange-600"
            >
              <span className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-orange-600" />
                Contact
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>

             <Link 
            href="/cross-reference"
            onClick={closeMenu}
              className="flex items-center justify-between border-b border-stone-100 py-4 text-sm font-medium text-stone-700 hover:text-orange-600"
            >
              <span className="flex items-center gap-3">
                <Binoculars className="h-5 w-5 text-orange-600" />
              Part Tool
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>           
            
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/add-business"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" />
                Add Business
              </Link>

              <Link
                href="/claim-business"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                <Search className="h-4 w-4" />
                Claim Listing
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}