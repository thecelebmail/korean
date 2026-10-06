'use client'

import { useState } from 'react'
import { Check, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminListingActionsProps {
  businessId: string
  claimStatus: string
}

export default function AdminListingActions({
  businessId,
  claimStatus,
}: AdminListingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function performAction(action: string) {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          action,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Administrative action failed.')
        return
      }

      alert(result.message || 'Action completed.')
      router.refresh()
    } catch {
      alert('Unable to complete administrative action.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">
        Administrative Workflow Tasks
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        {claimStatus === 'pending' && (
          <>
            <button
              disabled={loading}
              onClick={() => performAction('approve_claim')}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 p-3 font-semibold text-white shadow hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              Approve Claim
            </button>

            <button
              disabled={loading}
              onClick={() => performAction('reject_claim')}
              className="flex items-center justify-center gap-2 rounded-lg bg-red-600 p-3 font-semibold text-white shadow hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              Reject Claim
            </button>
          </>
        )}

        <button
          disabled={loading}
          onClick={() => performAction('suspend_listing')}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-white p-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Suspend Listing
        </button>
      </div>
    </div>
  )
}