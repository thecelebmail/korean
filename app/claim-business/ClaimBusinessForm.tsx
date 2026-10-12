'use client'

import { useMemo, useState } from 'react'
import { Loader2, SearchCheck } from 'lucide-react'

type Business = { id: string; name: string; city: string; province: string; claim_status: string }

export default function ClaimBusinessForm({ businesses }: { businesses: Business[] }) {
  const [search, setSearch] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return businesses.slice(0, 30)
    return businesses.filter((business) => `${business.name} ${business.city} ${business.province}`.toLowerCase().includes(query)).slice(0, 50)
  }, [businesses, search])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!businessId || busy) return
    setBusy(true)
    setMessage('')
    setSuccess(false)
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      })
      const result: { success?: boolean; message?: string; error?: string } = await response.json()
      if (!response.ok || !result.success) {
        setMessage(result.error || 'Unable to submit your claim. Please try again.')
        return
      }
      setSuccess(true)
      setMessage(result.message || 'Your claim has been submitted for review.')
      setBusinessId('')
    } catch {
      setMessage('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="business-search" className="mb-2 block text-sm font-semibold text-gray-800">Find your business</label>
        <input id="business-search" value={search} onChange={(event) => { setSearch(event.target.value); setBusinessId('') }} className="w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="Search business, city or province" autoComplete="off" />
      </div>
      <div>
        <label htmlFor="business-select" className="mb-2 block text-sm font-semibold text-gray-800">Available listings</label>
        <select id="business-select" value={businessId} onChange={(event) => setBusinessId(event.target.value)} required className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm">
          <option value="">Select your business</option>
          {filtered.map((business) => <option key={business.id} value={business.id}>{business.name} — {[business.city, business.province].filter(Boolean).join(', ')}</option>)}
        </select>
        <p className="mt-2 text-xs text-gray-500">{filtered.length === 0 ? 'No matching unclaimed listings. Try another search.' : `${filtered.length} matching listing${filtered.length === 1 ? '' : 's'} shown. Search to narrow the list.`}</p>
      </div>
      <button type="submit" disabled={!businessId || busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
        {busy ? 'Submitting claim…' : 'Submit claim for review'}
      </button>
      {message && <p role="status" className={`rounded-lg border p-3 text-sm ${success ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>{message}</p>}
      <p className="text-xs leading-5 text-gray-500">Submitting a request does not grant access. The administrator may contact you to verify that you represent the business.</p>
    </form>
  )
}
