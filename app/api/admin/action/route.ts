import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

type AdminAction = 'approve_claim' | 'reject_claim' | 'suspend_listing'

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return auth.response

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid request body is required.' }, { status: 400 })
    }
    const input = body as Record<string, unknown>
    const businessId = input.businessId
    const action = input.action
    if (typeof businessId !== 'string' || !businessId.trim()) {
      return NextResponse.json({ error: 'businessId is required.' }, { status: 400 })
    }
    if (action !== 'approve_claim' && action !== 'reject_claim' && action !== 'suspend_listing') {
      return NextResponse.json({ error: 'Unsupported administrative action.' }, { status: 400 })
    }

    const { data: { user }, error: userError } = await auth.supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Administrator session expired.' }, { status: 401 })

    const admin = createAdminClient()
    if (action === 'approve_claim' || action === 'reject_claim') {
      const { data: pendingClaims, error: claimsError } = await admin
        .from('claim_requests')
        .select('id')
        .eq('business_id', businessId)
        .eq('status', 'pending')
        .limit(2)
      if (claimsError) {
        console.error('Pending claim lookup failed:', claimsError.message)
        return NextResponse.json({ error: 'Unable to find a pending claim for this business.' }, { status: 500 })
      }
      if (!pendingClaims || pendingClaims.length === 0) {
        return NextResponse.json({ error: 'No pending claim request exists for this business. Review legacy pending records separately.' }, { status: 409 })
      }
      if (pendingClaims.length > 1) {
        return NextResponse.json({ error: 'More than one claim is pending for this business. Review the individual requests from the admin dashboard.' }, { status: 409 })
      }
      const { data, error } = await admin.rpc('review_claim_request', {
        p_claim_id: pendingClaims[0].id,
        p_action: action === 'approve_claim' ? 'approve' : 'reject',
        p_reviewer_id: user.id,
        p_rejection_reason: null,
      })
      if (error) {
        const conflict = /already been reviewed|already claimed|not found|changed/i.test(error.message || '')
        return NextResponse.json({ error: conflict ? error.message : 'Unable to review this claim right now.' }, { status: conflict ? 409 : 500 })
      }
      return NextResponse.json({ success: true, message: action === 'approve_claim' ? 'Claim approved successfully.' : 'Claim rejected successfully.', result: data })
    }

    const { data, error } = await admin
      .from('businesses')
      .update({ status: 'suspended', updated_at: new Date().toISOString() })
      .eq('id', businessId)
      .select('id')
      .maybeSingle()
    if (error) {
      console.error('Listing suspension failed:', error.message)
      return NextResponse.json({ error: 'Unable to suspend listing.' }, { status: 500 })
    }
    if (!data) return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    return NextResponse.json({ success: true, message: 'Listing suspended successfully.' })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 })
    console.error('Admin action failed:', error)
    return NextResponse.json({ error: 'Unexpected administrative error.' }, { status: 500 })
  }
}
