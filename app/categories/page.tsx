// app/categories/page.tsx

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">
        Categories
      </h1>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {(categories || []).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="rounded-xl border p-4 hover:shadow"
          >
            <h2 className="font-semibold">
              {category.name}
            </h2>
          </Link>
        ))}
      </div>
    </main>
  )
}