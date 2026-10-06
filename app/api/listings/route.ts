// app/api/listings/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorised transaction attempt' }, { status: 401 })
  }

  try {
    const { id, address, phone, alt_phone, email, website, description, facebook, instagram } = await request.json()

    // Enforce authorization bounds via transactional query matching context
    const { data: holdsOwnership } = await supabase
      .from('business_owners')
      .select('business_id')
      .eq('owner_id', user.id)
      .eq('business_id', id)
      .single()

    const isAdmin = user.email === 'your-admin-email@domain.co.za'

    if (!holdsOwnership && !isAdmin) {
      return NextResponse.json({ error: 'Permission denied to write to this listing entity' }, { status: 403 })
    }

    // Execute standard row cell updates across core properties
    const { error: mutationError } = await supabase
      .from('businesses')
      .update({
        address,
        phone,
        alt_phone,
        email,
        website,
        description,
        facebook,
        instagram,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (mutationError) throw mutationError

    return NextResponse.json({ success: true, message: 'Storefront details synchronized securely' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
