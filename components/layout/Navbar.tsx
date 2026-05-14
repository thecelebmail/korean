import  SearchBar  from "@/components/search/HeroSearch";
import Link from "next/link";


export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">KMS</span>
            </div>
            <span className="font-bold text-stone-900 text-lg leading-tight">
              Korean<span className="text-orange-600">MotorSpares</span>NearMe
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link href="/categories" className="hover:text-orange-600 transition-colors">
              Categories
            </Link>
            <Link href="/provinces" className="hover:text-orange-600 transition-colors">
              Provinces
            </Link>
            <Link href="/brands" className="hover:text-orange-600 transition-colors">
              Brands
            </Link>
            <SearchBar />
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/add-business"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              + Add Business
            </Link>
            <Link
              href="/claim-business"
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Claim Listing
            </Link>
             <Link
              href="/contact-us"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}