// components/layout/Footer.tsx
import Link from "next/link";
import { POPULAR_CITIES, ALL_PROVINCES } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">MS</span>
              </div>
              <span className="font-bold text-white text-base">
                MotorSpares SA
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              South Africa&apos;s largest directory of motor spares suppliers.
              Find Kia, Hyndai, VW, Toyota and many more spares near you.
            </p>
          </div>

          {/* Popular Cities */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Popular Cities
            </h3>
            <ul className="space-y-2">
              {POPULAR_CITIES.slice(0, 6).map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/${city.province}/${city.slug}`}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Provinces */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Provinces
            </h3>
            <ul className="space-y-2">
              {ALL_PROVINCES.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Add a Business", href: "/add-business" },
                { label: "Claim a Listing", href: "/claim-business" },
                { label: "All Categories", href: "/categories" },
                { label: "All Brands", href: "/brands" },
                { label: "Search", href: "/search" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} MotorSpares SA. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-stone-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-stone-300">Terms of Use</Link>
            <Link href="/contact" className="hover:text-stone-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}