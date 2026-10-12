'use client'

import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'

type Claim = {
  id: number
  businessName: string
  city: string
  province: string
  ownerName: string
  ownerEmail: string
  created_at: string
  request_type: string
}

export default function AdminClaimReview({ claim }: { claim: Claim }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reason, setReason] = useState('')

  async function review(action: 'approve' | 'reject') {
    if (busy) return
    if (action === 'reject' && !reason.trim() && !window.confirm('Reject this claim without a reason?')) return
    if (action === 'approve' && !window.confirm(claim.request_type === 'new_business' ? `Approve and publish the new listing for ${claim.businessName}? This grants editing access to the submitter.` : `Approve the claim for ${claim.businessName}? This grants editing access.`)) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id, action, rejectionReason: reason.trim() || undefined }),
      })
      const result: { success?: boolean; error?: string } = await response.json()
      if (!response.ok || !result.success) {
        setMessage(result.error || 'Review failed. Refresh and try again.')
        return
      }
      setMessage(action === 'approve' ? (claim.request_type === 'new_business' ? 'Business listing approved and published.' : 'Claim approved.') : (claim.request_type === 'new_business' ? 'Business submission rejected.' : 'Claim rejected.'))
      window.location.reload()
    } catch {
      setMessage('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{claim.request_type === 'new_business' ? 'New business submission' : 'Claim request'} #{claim.id} · Pending</p>
          <h3 className="mt-1 text-lg font-semibold text-gray-900">{claim.businessName}</h3>
          <p className="text-sm text-gray-600">{[claim.city, claim.province].filter(Boolean).join(', ') || 'Location not provided'}</p>
          <p className="mt-3 text-sm text-gray-800"><span className="font-medium">Claimant:</span> {claim.ownerName}</p>
          <p className="text-sm text-gray-600">{claim.ownerEmail}</p>
          <p className="mt-1 text-xs text-gray-500">Submitted {new Date(claim.created_at).toLocaleString()}</p>
        </div>
        <div className="w-full space-y-3 lg:max-w-sm">
          <label className="block text-sm font-medium text-gray-700" htmlFor={`reason-${claim.id}`}>Rejection reason (optional)</label>
          <textarea id={`reason-${claim.id}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={2000} rows={2} className="w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Explain what needs to be corrected or verified…" />
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => void review('approve')} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
            <button type="button" disabled={busy} onClick={() => void review('reject')} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
            {busy && <Loader2 className="h-5 w-5 animate-spin text-gray-500" />}
          </div>
          {message && <p role="status" className="text-sm text-gray-600">{message}</p>}
        </div>
      </div>
    </article>
  )
}
