// app/api/vendor/edit/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Access denied' }, { status: 401 })

  try {
    const payload = await request.json()
    const { id, address, phone, alt_number, whatsapp, email, website, description } = payload

    // Verify ownership permissions against the intermediate public.business_owners mapping table
    const { data: isLinked } = await supabase
      .from('business_owners')
      .select('business_id, owners!inner(auth_user_id)')
      .eq('business_id', id)
      .eq('owners.auth_user_id', user.id)
      .maybeSingle()

    if (!isLinked) {
      return NextResponse.json({ error: 'Unauthorized modification attempt' }, { status: 403 })
    }

    // Synchronize modifications safely against your column keys
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        address,
        phone,
        alt_number,
        whatsapp,
        email,
        website,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, message: 'Storefront details synchronized securely.' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
