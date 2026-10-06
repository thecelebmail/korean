import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  try {
    const { businessId, action } = await request.json()

    if (!businessId || !action) {
      return NextResponse.json(
        { error: 'businessId and action are required.' },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // APPROVE CLAIM
    // --------------------------------------------------

    if (action === 'approve_claim') {
      const { data: business, error: businessError } =
        await supabase
          .from('businesses')
          .select('id, claim_status')
          .eq('id', businessId)
          .single()

      if (businessError || !business) {
        return NextResponse.json(
          { error: 'Business not found.' },
          { status: 404 }
        )
      }

      if (business.claim_status !== 'pending') {
        return NextResponse.json(
          {
            error:
              'This listing does not have a pending claim.',
          },
          { status: 400 }
        )
      }

      const { data: relationship, error: relationshipError } =
        await supabase
          .from('business_owners')
          .select('owner_id, is_primary')
          .eq('business_id', businessId)
          .eq('is_primary', true)
          .maybeSingle()

      if (relationshipError) {
        throw relationshipError
      }

      if (!relationship) {
        return NextResponse.json(
          {
            error:
              'No owner relationship exists for this claim.',
          },
          { status: 400 }
        )
      }

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          claim_status: 'claimed',
          is_verified: true,
          status: 'active',
          claimed_at: new Date().toISOString(),
        })
        .eq('id', businessId)
        .eq('claim_status', 'pending')

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Claim approved successfully.',
      })
    }

    // --------------------------------------------------
    // SUSPEND LISTING
    // --------------------------------------------------

    if (action === 'suspend_listing') {
      const { error } = await supabase
        .from('businesses')
        .update({
          status: 'suspended',
        })
        .eq('id', businessId)

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Listing suspended.',
      })
    }

    // --------------------------------------------------
    // REJECT CLAIM
    // --------------------------------------------------

    if (action === 'reject_claim') {
      const { data: business, error: businessError } =
        await supabase
          .from('businesses')
          .select('id, claim_status')
          .eq('id', businessId)
          .single()

      if (businessError || !business) {
        return NextResponse.json(
          { error: 'Business not found.' },
          { status: 404 }
        )
      }

      if (business.claim_status !== 'pending') {
        return NextResponse.json(
          {
            error:
              'This listing does not have a pending claim.',
          },
          { status: 400 }
        )
      }

      await supabase
        .from('business_owners')
        .delete()
        .eq('business_id', businessId)

      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          claim_status: 'unclaimed',
          is_verified: false,
        })
        .eq('id', businessId)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        success: true,
        message: 'Claim rejected.',
      })
    }

    return NextResponse.json(
      { error: 'Unsupported administrative action.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Admin action error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Administrative operation failed.',
      },
      { status: 500 }
    )
  }
}