// app/api/claim/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { businessId } = await request.json()

    // 1. Check if the business is already claimed
    const { data: business, error: findError } = await supabase
      .from('businesses')
      .select('claim_status')
      .eq('id', businessId)
      .single()

    if (findError || !business) {
      return NextResponse.json({ error: 'Listing entity not found' }, { status: 404 })
    }

    if (business.claim_status !== 'unclaimed') {
      return NextResponse.json({ error: 'This business has already been claimed' }, { status: 400 })
    }

    // 2. Mark the listing claim request status as pending verification
    // FIX: Chained .update() directly onto the query builder definition path
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ claim_status: 'pending' })
      .eq('id', businessId)

    if (updateError) throw updateError

    // 3. Link this user as a pending business owner manager profile entry
    const { error: ownerError } = await supabase
      .from('business_owners')
      .insert({
        business_id: businessId,
        owner_id: user.id,
        is_primary: true,
        assigned_at: new Date().toISOString()
      })

    if (ownerError) throw ownerError

    return NextResponse.json({ success: true, message: 'Claim request submitted for verification successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
