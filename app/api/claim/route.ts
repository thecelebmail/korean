import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const { businessId } = await request.json()

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 1. Find the business
    // --------------------------------------------------

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, claim_status')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Listing entity not found' },
        { status: 404 }
      )
    }

    if (business.claim_status === 'claimed') {
      return NextResponse.json(
        { error: 'This business has already been claimed.' },
        { status: 409 }
      )
    }

    if (business.claim_status === 'pending') {
      return NextResponse.json(
        { error: 'This business already has a pending claim.' },
        { status: 409 }
      )
    }

    // --------------------------------------------------
    // 2. Find or create the public owner profile
    // --------------------------------------------------

    let { data: owner, error: ownerLookupError } = await supabase
      .from('owners')
      .select('id, email, auth_user_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (ownerLookupError) {
      throw ownerLookupError
    }

    if (!owner) {
      const { data: newOwner, error: ownerCreateError } =
        await supabase
          .from('owners')
          .insert({
            auth_user_id: user.id,
            name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              user.email?.split('@')[0] ||
              'Business Owner',
            email: user.email,
          })
          .select('id, email, auth_user_id')
          .single()

      if (ownerCreateError) {
        throw ownerCreateError
      }

      owner = newOwner
    }

    // --------------------------------------------------
    // 3. Make sure this owner isn't already connected
    // --------------------------------------------------

    const { data: existingRelationship, error: relationshipError } =
      await supabase
        .from('business_owners')
        .select('business_id, owner_id')
        .eq('business_id', businessId)
        .eq('owner_id', owner.id)
        .maybeSingle()

    if (relationshipError) {
      throw relationshipError
    }

    if (existingRelationship) {
      return NextResponse.json(
        { error: 'You already submitted a claim for this listing.' },
        { status: 409 }
      )
    }

    // --------------------------------------------------
    // 4. Create owner/business relationship
    // --------------------------------------------------

    const { error: linkError } = await supabase
      .from('business_owners')
      .insert({
        business_id: businessId,
        owner_id: owner.id,
        is_primary: true,
        assigned_at: new Date().toISOString(),
      })

    if (linkError) {
      throw linkError
    }

    // --------------------------------------------------
    // 5. Mark business as pending
    // --------------------------------------------------

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        claim_status: 'pending',
      })
      .eq('id', businessId)
      .eq('claim_status', 'unclaimed')

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Claim request submitted for verification.',
    })
  } catch (error) {
    console.error('Claim submission error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to submit claim request.',
      },
      { status: 500 }
    )
  }
}