import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const EDITABLE_FIELDS = ['name', 'phone', 'alt_phone', 'whatsapp', 'email', 'website', 'address', 'description'] as const

type EditableField = (typeof EDITABLE_FIELDS)[number]

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid request body is required.' }, { status: 400 })
    }
    const input = body as Record<string, unknown>
    const businessId = input.id
    if (typeof businessId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)) {
      return NextResponse.json({ error: 'A valid business ID is required.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: owner, error: ownerError } = await admin
      .from('owners').select('id').eq('auth_user_id', user.id).maybeSingle()
    if (ownerError) throw ownerError
    if (!owner) return NextResponse.json({ error: 'Your account is not linked to a business owner profile.' }, { status: 403 })

    const { data: relationship, error: relationshipError } = await admin
      .from('business_owners')
      .select('business_id')
      .eq('business_id', businessId)
      .eq('owner_id', owner.id)
      .maybeSingle()
    if (relationshipError) throw relationshipError
    if (!relationship) return NextResponse.json({ error: 'You do not have permission to edit this business.' }, { status: 403 })

    const { data: business, error: businessError } = await admin
      .from('businesses')
      .select('id, claim_status, status')
      .eq('id', businessId)
      .is('deleted_at', null)
      .maybeSingle()
    if (businessError) throw businessError
    if (!business) return NextResponse.json({ error: 'Business not found.' }, { status: 404 })
    if (business.claim_status !== 'claimed' || business.status === 'suspended') {
      return NextResponse.json({ error: 'Editing is available only for approved, active business claims.' }, { status: 403 })
    }

    const updates: Partial<Record<EditableField, string | null>> = {}
    for (const field of EDITABLE_FIELDS) {
      if (input[field] === undefined) continue
      if (input[field] !== null && typeof input[field] !== 'string') {
        return NextResponse.json({ error: `Invalid value for ${field}.` }, { status: 400 })
      }
      const value = typeof input[field] === 'string' ? input[field].trim() : null
      const maxLength = field === 'description' || field === 'address' ? 5000 : field === 'website' ? 500 : 300
      if (value && value.length > maxLength) return NextResponse.json({ error: `${field} is too long.` }, { status: 400 })
      updates[field] = value || null
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No editable fields were supplied.' }, { status: 400 })
    if (updates.website && !/^https?:\/\//i.test(updates.website)) {
      return NextResponse.json({ error: 'Website must begin with http:// or https://.' }, { status: 400 })
    }
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return NextResponse.json({ error: 'Please enter a valid public email address.' }, { status: 400 })
    }

    const { data: updated, error: updateError } = await admin
      .from('businesses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', businessId)
      .eq('claim_status', 'claimed')
      .neq('status', 'suspended')
      .select('id')
      .maybeSingle()
    if (updateError) throw updateError
    if (!updated) return NextResponse.json({ error: 'Editing is no longer permitted for this listing.' }, { status: 403 })

    return NextResponse.json({ success: true, message: 'Listing updated successfully.' })
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 })
    console.error('Vendor listing update failed:', error)
    return NextResponse.json({ error: 'Unable to update this listing right now.' }, { status: 500 })
  }
}
