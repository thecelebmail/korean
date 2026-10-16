
import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Access Restricted',
  description: 'Access to this website is currently restricted.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function BlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
          <ShieldCheck
            className="h-8 w-8 text-orange-600"
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">
          Access Restricted
        </h1>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          Access to this website is currently restricted for your
          region. If you believe this is a mistake, please contact
          the website administrator.
        </p>

        <a
          href="mailto:SUPPORT_EMAIL"
          className="mt-6 inline-flex rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          Contact Support
        </a>

        <p className="mt-6 text-xs text-stone-400">
          Korean Motor Spares Directory
        </p>
      </section>
    </main>
  )
}
