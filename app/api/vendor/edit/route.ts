import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // --------------------------------------------------
    // 1. Make sure the user is authenticated
    // --------------------------------------------------
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in.' },
        { status: 401 }
      )
    }

    // --------------------------------------------------
    // 2. Read request body
    // --------------------------------------------------
    const body = await request.json()

    const {
      id,
      name,
      address,
      phone,
      alt_phone,
      email,
      website,
      description,
      city,
      province,
      image_url,
      logo_url,
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Business ID is required.' },
        { status: 400 }
      )
    }

    // --------------------------------------------------
    // 3. Find the owner record belonging to this
    //    authenticated Supabase user
    // --------------------------------------------------
    const { data: owner, error: ownerError } = await supabase
      .from('owners')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (ownerError) {
      console.error('Owner lookup error:', ownerError)

      return NextResponse.json(
        { error: 'Unable to verify ownership.' },
        { status: 500 }
      )
    }

    if (!owner) {
      return NextResponse.json(
        { error: 'You are not registered as a business owner.' },
        { status: 403 }
      )
    }

    // --------------------------------------------------
    // 4. Verify that this owner actually owns the
    //    business AND that the claim was approved
    // --------------------------------------------------
    const { data: ownership, error: ownershipError } = await supabase
      .from('business_owners')
      .select(`
        business_id,
        is_primary,
        business:businesses!inner(
          id,
          claim_status,
          status
        )
      `)
      .eq('business_id', id)
      .eq('owner_id', owner.id)
      .maybeSingle()

    if (ownershipError) {
      console.error('Ownership lookup error:', ownershipError)

      return NextResponse.json(
        { error: 'Unable to verify business ownership.' },
        { status: 500 }
      )
    }

    if (!ownership) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this business.' },
        { status: 403 }
      )
    }

    const business = Array.isArray(ownership.business)
      ? ownership.business[0]
      : ownership.business

    // --------------------------------------------------
    // 5. IMPORTANT:
    //    A pending claim is NOT enough to edit.
    // --------------------------------------------------
    if (business?.claim_status !== 'claimed') {
      return NextResponse.json(
        {
          error:
            'Your claim has not been approved yet. You can edit this listing after approval.',
        },
        { status: 403 }
      )
    }

    // --------------------------------------------------
    // 6. Only update fields we explicitly allow
    // --------------------------------------------------
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof name === 'string') updates.name = name.trim()
    if (typeof address === 'string') updates.address = address.trim()
    if (typeof phone === 'string') updates.phone = phone.trim()
    if (typeof alt_phone === 'string') updates.alt_phone = alt_phone.trim()
    if (typeof email === 'string') updates.email = email.trim()
    if (typeof website === 'string') updates.website = website.trim()
    if (typeof description === 'string') {
      updates.description = description.trim()
    }
    if (typeof city === 'string') updates.city = city.trim()
    if (typeof province === 'string') updates.province = province.trim()
    if (typeof image_url === 'string') updates.image_url = image_url.trim()
    if (typeof logo_url === 'string') updates.logo_url = logo_url.trim()

    // --------------------------------------------------
    // 7. Update only the verified owner's business
    // --------------------------------------------------
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .eq('claim_status', 'claimed')
      .select('*')
      .single()

    if (updateError) {
      console.error('Business update error:', updateError)

      return NextResponse.json(
        { error: 'Failed to update business.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      business: updatedBusiness,
    })
  } catch (error) {
    console.error('Vendor edit API error:', error)

    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    )
  }
}