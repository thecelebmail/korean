'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'

interface ClaimListingButtonProps {
  businessId: string
  currentClaimStatus: string
}

export function ClaimListingButton({
  businessId,
  currentClaimStatus,
}: ClaimListingButtonProps) {
  const [status, setStatus] = useState(currentClaimStatus)
  const [submitting, setSubmitting] = useState(false)

  const processClaimSubmission = async () => {
    if (status !== 'unclaimed') return

    setSubmitting(true)

    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus('pending')
      } else {
        alert(data.error || 'Authentication sequence failed.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'claimed') {
    return null
  }

  return (
    <button
      disabled={submitting || status === 'pending'}
      onClick={processClaimSubmission}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
        status === 'pending'
          ? 'cursor-not-allowed border-yellow-200 bg-yellow-50 text-yellow-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {submitting ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : (
        <ShieldCheck
          className={`h-4 w-4 ${
            status === 'pending'
              ? 'text-yellow-600'
              : 'text-blue-600'
          }`}
        />
      )}

      {status === 'pending'
        ? 'Verification Review Pending'
        : 'Own this spares shop? Claim Listing'}
    </button>
  )
}