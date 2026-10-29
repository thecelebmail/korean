import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const MAX_TEXT: Record<string, number> = {
  name: 160,
  address: 500,
  city: 120,
  province: 80,
  phone: 40,
  alt_phone: 40,
  whatsapp: 40,
  email: 254,
  website: 500,
  description: 3000,
  facebook: 500,
  instagram: 500,
  twitter: 500,
  youtube: 500,
  linkedin: 500,
  tiktok: 500,
}

const PROVINCES = new Set([
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
])

function cleanText(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null
  if (typeof value !== 'string') throw new Error(`${field} must be text.`)
  const cleaned = value.trim()
  if (cleaned.length > (MAX_TEXT[field] ?? 500)) throw new Error(`${field} is too long.`)
  return cleaned || null
}

function validUrl(value: string | null, field: string): string | null {
  if (!value) return null
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error()
    return parsed.toString()
  } catch {
    throw new Error(`${field} must be a valid http:// or https:// URL.`)
  }
}

function makeSlugPart(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in before submitting a business.' }, { status: 401 })
  }
  if (!user.email) {
    return NextResponse.json({ error: 'Your account needs an email address to submit a business.' }, { status: 400 })
  }

  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'A valid form submission is required.' }, { status: 400 })
    }
    const input = body as Record<string, unknown>
    const values = {
      name: cleanText(input.name, 'name'),
      address: cleanText(input.address, 'address'),
      city: cleanText(input.city, 'city'),
      province: cleanText(input.province, 'province'),
      phone: cleanText(input.phone, 'phone'),
      alt_phone: cleanText(input.alt_phone, 'alt_phone'),
      whatsapp: cleanText(input.whatsapp, 'whatsapp'),
      email: cleanText(input.email, 'email'),
      website: validUrl(cleanText(input.website, 'website'), 'Website'),
      description: cleanText(input.description, 'description'),
      facebook: validUrl(cleanText(input.facebook, 'facebook'), 'Facebook URL'),
      instagram: validUrl(cleanText(input.instagram, 'instagram'), 'Instagram URL'),
      twitter: validUrl(cleanText(input.twitter, 'twitter'), 'X / Twitter URL'),
      youtube: validUrl(cleanText(input.youtube, 'youtube'), 'YouTube URL'),
      linkedin: validUrl(cleanText(input.linkedin, 'linkedin'), 'LinkedIn URL'),
      tiktok: validUrl(cleanText(input.tiktok, 'tiktok'), 'TikTok URL'),
    }

    if (!values.name || !values.city || !values.province) {
      return NextResponse.json({ error: 'Business name, city and province are required.' }, { status: 400 })
    }
    if (!PROVINCES.has(values.province)) {
      return NextResponse.json({ error: 'Select a valid South African province.' }, { status: 400 })
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return NextResponse.json({ error: 'Enter a valid business email address.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: existingOwner, error: ownerLookupError } = await admin
      .from('owners').select('id, auth_user_id').eq('auth_user_id', user.id).maybeSingle()
    if (ownerLookupError) throw ownerLookupError

    let ownerId = existingOwner?.id
    if (!ownerId) {
      const { data: emailOwner, error: emailOwnerError } = await admin
        .from('owners').select('id, auth_user_id').ilike('email', user.email).maybeSingle()
      if (emailOwnerError) throw emailOwnerError

      if (emailOwner && emailOwner.auth_user_id && emailOwner.auth_user_id !== user.id) {
        return NextResponse.json({ error: 'This email is already associated with another account. Please contact support.' }, { status: 409 })
      }
      if (emailOwner) {
        const { data: updatedOwner, error: updateOwnerError } = await admin
          .from('owners')
          .update({ auth_user_id: user.id, name: String(user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]).slice(0, 200), last_login_at: new Date().toISOString() })
          .eq('id', emailOwner.id).select('id').single()
        if (updateOwnerError) throw updateOwnerError
        ownerId = updatedOwner.id
      } else {
        const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]
        const { data: createdOwner, error: createOwnerError } = await admin
          .from('owners')
          .insert({ auth_user_id: user.id, email: user.email, name: String(displayName).slice(0, 200), last_login_at: new Date().toISOString() })
          .select('id').single()
        if (createOwnerError) throw createOwnerError
        ownerId = createdOwner.id
      }
    }

    const slugBase = [values.name, values.city, values.province].map((part) => makeSlugPart(part ?? '')).filter(Boolean).join('-').slice(0, 120)
    const slug = `${slugBase || 'business'}-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
    const { data: result, error: submitError } = await admin.rpc('submit_new_business_request', {
      p_owner_id: ownerId,
      p_name: values.name,
      p_slug: slug,
      p_address: values.address,
      p_city: values.city,
      p_province: values.province,
      p_phone: values.phone,
      p_alt_phone: values.alt_phone,
      p_whatsapp: values.whatsapp,
      p_email: values.email,
      p_website: values.website,
      p_description: values.description,
      p_facebook: values.facebook,
      p_instagram: values.instagram,
      p_twitter: values.twitter,
      p_youtube: values.youtube,
      p_linkedin: values.linkedin,
      p_tiktok: values.tiktok,
    })

   
if (submitError) {
  // Log the actual database error on the server, not in the browser.
  console.error('New business submission RPC failed:', {
    code: submitError.code,
    message: submitError.message,
    details: submitError.details,
    hint: submitError.hint,
  })

  const errorText = [
    submitError.message,
    submitError.details ?? '',
  ].join(' ')

  const conflict =
    /similar business|already exists|duplicate key/i.test(errorText) ||
    submitError.code === '23505'

  if (conflict) {
    return NextResponse.json(
      {
        error:
          'A business with a similar name and location already exists. Please use “Claim a business” if it is already listed, or contact us if the listing is incorrect.',
      },
      { status: 409 },
    )
  }

  return NextResponse.json(
    {
      error:
        'The submission could not be saved. Please try again or contact support.',
    },
    { status: 500 },
  )
}


    return NextResponse.json({ success: true, message: 'Your business was submitted for administrator review. You can track the request in your dashboard.', businessId: result?.business_id, requestId: result?.claim_id }, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Request body must contain valid JSON.' }, { status: 400 })
    }
    if (error instanceof Error && !error.message.includes('fetch')) {
      const validationFields = ['must be text', 'is too long', 'must be a valid http', 'must be a valid http://']
      if (validationFields.some((message) => error.message.includes(message))) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
    }
    console.error('New business submission failed:', error)
    return NextResponse.json({ error: 'Unable to submit your business right now.' }, { status: 500 })
  }
}
