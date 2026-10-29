import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

const EDITABLE_FIELDS = [
  'address',
  'phone',
  'alt_phone',
  'email',
  'website',
  'description',
  'facebook',
  'instagram',
] as const

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Request body must contain valid JSON.' },
        { status: 400 },
      )
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'A valid request body is required.' },
        { status: 400 },
      )
    }

    const input = body as Record<string, unknown>
    const id = input.id

    if (typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { error: 'Business ID is required.' },
        { status: 400 },
      )
    }

    const admin = await requireAdmin()
    const isAdmin = admin.authorized

    if (!isAdmin) {
      // Resolve auth.users.id to the public owners.id.
      const { data: owner, error: ownerError } = await supabase
        .from('owners')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      if (ownerError) {
        console.error('Owner lookup failed:', ownerError.message)

        return NextResponse.json(
          { error: 'Unable to verify business ownership.' },
          { status: 500 },
        )
      }

      if (!owner) {
        return NextResponse.json(
          { error: 'Your account is not registered as a business owner.' },
          { status: 403 },
        )
      }

      const { data: relationship, error: relationshipError } =
        await supabase
          .from('business_owners')
          .select('business_id')
          .eq('owner_id', owner.id)
          .eq('business_id', id)
          .maybeSingle()

      if (relationshipError) {
        console.error(
          'Business ownership lookup failed:',
          relationshipError.message,
        )

        return NextResponse.json(
          { error: 'Unable to verify business access.' },
          { status: 500 },
        )
      }

      if (!relationship) {
        return NextResponse.json(
          { error: 'You do not have permission to edit this listing.' },
          { status: 403 },
        )
      }

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id, claim_status')
        .eq('id', id)
        .maybeSingle()

      if (businessError || !business) {
        return NextResponse.json(
          { error: 'Business not found.' },
          { status: 404 },
        )
      }

      if (business.claim_status !== 'claimed') {
        return NextResponse.json(
          { error: 'The business claim must be approved before editing.' },
          { status: 403 },
        )
      }
    }

    const updates: Record<string, string> = {}

    for (const field of EDITABLE_FIELDS) {
      const value = input[field]

      if (value === undefined) continue

      if (typeof value !== 'string') {
        return NextResponse.json(
          { error: `Invalid value for ${field}.` },
          { status: 400 },
        )
      }

      updates[field] = value.trim()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No editable fields were supplied.' },
        { status: 400 },
      )
    }

    updates.updated_at = new Date().toISOString()

    const { data: updated, error: updateError } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (updateError) {
      console.error('Listing update failed:', updateError.message)

      return NextResponse.json(
        { error: 'Unable to update this listing.' },
        { status: 500 },
      )
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'The listing was not updated.' },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Listing updated successfully.',
    })
  } catch (error) {
    console.error('Listings API error:', error)

    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 },
    )
  }
}