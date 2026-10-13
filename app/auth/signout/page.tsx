
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import SignOutButton from '@/components/auth/SignOutButton'

export default function SignOutPage() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
          <LogOut className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Sign out</h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Sign out of your current account on this device.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          <SignOutButton />

          <Link
            href="/"
            className="text-sm font-medium text-gray-500 hover:text-gray-800"
          >
            Cancel and return to the directory
          </Link>
        </div>
      </section>
    </main>
  )
}
