import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid request body is required.' }, { status: 400 })
    }
    const input = body as Record<string, unknown>
    const claimId = input.claimId
    const action = input.action
    const rejectionReason = input.rejectionReason

    if (typeof claimId !== 'number' || !Number.isInteger(claimId) || claimId < 1) {
      return NextResponse.json({ error: 'A valid claim ID is required.' }, { status: 400 })
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Action must be approve or reject.' }, { status: 400 })
    }
    if (action === 'reject' && rejectionReason !== undefined && typeof rejectionReason !== 'string') {
      return NextResponse.json({ error: 'Rejection reason must be text.' }, { status: 400 })
    }

    const { data: { user }, error: userError } = await auth.supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Administrator session expired.' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin.rpc('review_claim_request', {
      p_claim_id: claimId,
      p_action: action,
      p_reviewer_id: user.id,
      p_rejection_reason: action === 'reject' && typeof rejectionReason === 'string' ? rejectionReason.slice(0, 2000) : null,
    })

    if (error) {
      const message = error.message || 'Unable to review this claim.'
      const conflict = /already been reviewed|already claimed|not found|changed/i.test(message)
      return NextResponse.json({ error: conflict ? message : 'Unable to review this claim right now.' }, { status: conflict ? 409 : 500 })
    }

    return NextResponse.json({ success: true, result: data })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 })
    }
    console.error('Admin claim review failed:', error)
    return NextResponse.json({ error: 'Unexpected claim review error.' }, { status: 500 })
  }
}
