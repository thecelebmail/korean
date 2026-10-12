import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in before claiming a business.' }, { status: 401 })
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Your account needs a verified email address to submit a claim.' }, { status: 400 })
  }

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid request body is required.' }, { status: 400 })
    }
    const businessId = (body as Record<string, unknown>).businessId
    if (typeof businessId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)) {
      return NextResponse.json({ error: 'A valid business ID is required.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: existingOwner, error: ownerLookupError } = await admin
      .from('owners')
      .select('id, auth_user_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (ownerLookupError) throw ownerLookupError

    let ownerId = existingOwner?.id
    if (!ownerId) {
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]
      const { data: owner, error: ownerInsertError } = await admin
        .from('owners')
        .upsert({ auth_user_id: user.id, email: user.email, name: String(displayName).slice(0, 200) }, { onConflict: 'auth_user_id' })
        .select('id')
        .single()
      if (ownerInsertError) throw ownerInsertError
      ownerId = owner.id
    }

    const { data, error } = await admin.rpc('submit_claim_request', {
      p_business_id: businessId,
      p_owner_id: ownerId,
    })

    if (error) {
      const message = error.message || 'Unable to submit claim.'
      const conflict = /already been claimed|pending claim|already has a pending|duplicate key/i.test(message)
      return NextResponse.json({ error: conflict ? message : 'Unable to submit the claim right now.' }, { status: conflict ? 409 : 500 })
    }

    return NextResponse.json({ success: true, message: 'Your claim has been submitted for administrator review.', claim: data }, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 })
    }
    console.error('Claim submission failed:', error)
    return NextResponse.json({ error: 'Unable to submit the claim right now.' }, { status: 500 })
  }
}
