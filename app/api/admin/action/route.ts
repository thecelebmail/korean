// app/api/admin/action/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Set your master administrative account gate parameter choice here
  if (!user || user.email !== 'your-admin-email@domain.co.za') {
    return NextResponse.json({ error: 'System Access Violations' }, { status: 403 })
  }

  try {
    const { businessId, action, targetOwnerId } = await request.json()

    if (action === 'approve_claim') {
      // 1. Finalize directory state adjustments
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({ claim_status: 'claimed', is_verified: true, status: 'active' })
        .eq('id', businessId)
      if (bizErr) throw bizErr

      // 2. Insert authorization rows into public.business_owners to grant dashboard access
      const { error: ownerErr } = await supabase
        .from('business_owners')
        .insert({
          business_id: businessId,
          owner_id: targetOwnerId,
          is_primary: true,
          assigned_at: new Date().toISOString()
        })
      if (ownerErr) throw ownerErr

      // 3. Clean up outstanding lookup logs
      await supabase.from('claim_requests').delete().eq('business_id', businessId)
    } 
    
    else if (action === 'suspend_listing') {
      const { error: suspendErr } = await supabase
        .from('businesses')
        .update({ status: 'suspended' })
        .eq('id', businessId)
      if (suspendErr) throw suspendErr
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
