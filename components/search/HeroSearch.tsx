'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()

  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!query.trim()) return

    router.push(
      `/search?q=${encodeURIComponent(query)}`
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
    >
      {/* Input Wrapper */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search Korean motor spares..."
          className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {/* Button */}
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
      >
        <Search className="h-4 w-4" />
        Search
      </button>
    </form>
  )
}