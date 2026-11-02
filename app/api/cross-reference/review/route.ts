

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getAdminDb(): Promise<{
  db: SupabaseClient | null
  response: NextResponse | null
}> {
  const session = await createSessionClient()
  const { data: { user }, error } = await session.auth.getUser()

  if (error || !user?.email) {
    return {
      db: null,
      response: NextResponse.json(
        { error: 'Please sign in.' },
        { status: 401 }
      ),
    }
  }

  const allowed = (process.env.XREF_IMPORT_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!allowed.includes(user.email.toLowerCase())) {
    return {
      db: null,
      response: NextResponse.json(
        { error: 'Not authorised.' },
        { status: 403 }
      ),
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return {
      db: null,
      response: NextResponse.json(
        { error: 'Server database credentials are missing.' },
        { status: 500 }
      ),
    }
  }

  return {
    db: createSupabaseClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
    response: null,
  }
}

type PartRow = {
  id: number
  category_id: number | null
  brand: string | null
  part_number: string
  normalized_number: string | null
  description: string | null
  source_id: number | null
  status: string
  created_at: string
}

type FitmentRow = {
  id: number
  part_id: number
  variant_id: number
  source_id: number | null
  evidence_reference: string | null
  status: string
  verified_at: string | null
  created_at: string
}

type ReferenceRow = {
  id: number
  from_part_id: number
  to_part_id: number
  relationship_type: string
  source_id: number | null
  evidence_reference: string | null
  status: string
  verified_at: string | null
  created_at: string
}

export async function GET() {
  const { db, response } = await getAdminDb()
  if (!db) return response!

  try {
    const [partResult, fitmentResult, referenceResult] = await Promise.all([
      db
        .from('xref_parts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(500),

      db
        .from('xref_fitments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(500),

      db
        .from('xref_cross_references')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(500),
    ])

    if (
      partResult.error ||
      fitmentResult.error ||
      referenceResult.error
    ) {
      throw new Error(
        partResult.error?.message ??
        fitmentResult.error?.message ??
        referenceResult.error?.message
      )
    }

    const pendingParts = (partResult.data ?? []) as PartRow[]
    const pendingFitments = (fitmentResult.data ?? []) as FitmentRow[]
    const pendingReferences = (referenceResult.data ?? []) as ReferenceRow[]

    // Collect all part IDs needed for displaying the queues.
    const partIds = [...new Set([
      ...pendingParts.map((p) => p.id),
      ...pendingFitments.map((f) => f.part_id),
      ...pendingReferences.flatMap((r) => [
        r.from_part_id,
        r.to_part_id,
      ]),
    ])]

    const variantIds = [...new Set(
      pendingFitments.map((f) => f.variant_id)
    )]

    const categoryIds = [...new Set(
      pendingParts
        .map((p) => p.category_id)
        .filter((id): id is number => id !== null)
    )]

    const sourceIds = [...new Set([
      ...pendingParts.map((p) => p.source_id),
      ...pendingFitments.map((f) => f.source_id),
      ...pendingReferences.map((r) => r.source_id),
    ].filter((id): id is number => id !== null))]

    const [allPartsResult, variantsResult, categoriesResult, sourcesResult] =
      await Promise.all([
        partIds.length
          ? db.from('xref_parts').select('*').in('id', partIds)
          : Promise.resolve({ data: [], error: null }),

        variantIds.length
          ? db
              .from('xref_variants')
              .select(
                'id, model_id, generation_id, variant_name, engine_code, capacity_cc, fuel_type, transmission, year_from, year_to'
              )
              .in('id', variantIds)
          : Promise.resolve({ data: [], error: null }),

        categoryIds.length
          ? db
              .from('xref_part_categories')
              .select('id, name')
              .in('id', categoryIds)
          : Promise.resolve({ data: [], error: null }),

        sourceIds.length
          ? db
              .from('xref_sources')
              .select('id, name, source_url')
              .in('id', sourceIds)
          : Promise.resolve({ data: [], error: null }),
      ])

    if (
      allPartsResult.error ||
      variantsResult.error ||
      categoriesResult.error ||
      sourcesResult.error
    ) {
      throw new Error(
        allPartsResult.error?.message ??
        variantsResult.error?.message ??
        categoriesResult.error?.message ??
        sourcesResult.error?.message
      )
    }

    const allParts = (allPartsResult.data ?? []) as PartRow[]
    const variants = variantsResult.data ?? []

    const modelIds = [...new Set(variants.map((v) => v.model_id))]
    const generationIds = [...new Set(
      variants
        .map((v) => v.generation_id)
        .filter((id): id is number => id !== null)
    )]

    const [modelsResult, generationsResult] = await Promise.all([
      modelIds.length
        ? db
            .from('xref_models')
            .select('id, name, make_id')
            .in('id', modelIds)
        : Promise.resolve({ data: [], error: null }),

      generationIds.length
        ? db
            .from('xref_generations')
            .select('id, generation_code')
            .in('id', generationIds)
        : Promise.resolve({ data: [], error: null }),
    ])

    if (modelsResult.error || generationsResult.error) {
      throw new Error(
        modelsResult.error?.message ??
        generationsResult.error?.message
      )
    }

    const models = modelsResult.data ?? []
    const makeIds = [...new Set(models.map((m) => m.make_id))]

    const makesResult = makeIds.length
      ? await db
          .from('xref_makes')
          .select('id, name')
          .in('id', makeIds)
      : { data: [], error: null }

    if (makesResult.error) throw makesResult.error

     const categoryMap = new Map(
      (categoriesResult.data ?? []).map((c) => [c.id, c.name])
    )
    const sourceMap = new Map(
      (sourcesResult.data ?? []).map((s) => [s.id, s])
    )
    

 // 2. Enrich parts only after both maps exist.
const enrichedParts = allParts.map((part) => ({
  ...part,
  category_name: part.category_id
    ? categoryMap.get(part.category_id) ?? null
    : null,
  source: part.source_id
    ? sourceMap.get(part.source_id) ?? null
    : null,
}))

// 3. Build the part lookup from the enriched records.
const partMap = new Map(
  enrichedParts.map((part) => [part.id, part])
)
    const variantMap = new Map(variants.map((v) => [v.id, v]))
    const modelMap = new Map(models.map((m) => [m.id, m]))
    const generationMap = new Map(
      (generationsResult.data ?? []).map((g) => [g.id, g])
    )
    const makeMap = new Map(
      (makesResult.data ?? []).map((m) => [m.id, m.name])
    )
   
    function displayVariant(variantId: number) {
      const variant = variantMap.get(variantId)
      if (!variant) return null

      const model = modelMap.get(variant.model_id)
      const generation = variant.generation_id
        ? generationMap.get(variant.generation_id)
        : null

      return {
        ...variant,
        model_name: model?.name ?? 'Unknown model',
        make_name: model ? makeMap.get(model.make_id) ?? 'Unknown make' : '',
        generation_code: generation?.generation_code ?? null,
      }
    }

    return NextResponse.json({
      counts: {
        parts: pendingParts.length,
        fitments: pendingFitments.length,
        crossReferences: pendingReferences.length,
      },

      parts: pendingParts.map((part) => ({
        ...part,
        category_name: part.category_id
          ? categoryMap.get(part.category_id) ?? null
          : null,
        source: part.source_id
          ? sourceMap.get(part.source_id) ?? null
          : null,
      })),

      fitments: pendingFitments.map((fitment) => ({
        ...fitment,
        part: partMap.get(fitment.part_id) ?? null,
        variant: displayVariant(fitment.variant_id),
        source: fitment.source_id
          ? sourceMap.get(fitment.source_id) ?? null
          : null,
      })),

      crossReferences: pendingReferences.map((reference) => ({
        ...reference,
        fromPart: partMap.get(reference.from_part_id) ?? null,
        toPart: partMap.get(reference.to_part_id) ?? null,
        source: reference.source_id
          ? sourceMap.get(reference.source_id) ?? null
          : null,
      })),
    })
  } catch (error) {
    console.error('Cross-reference review GET error:', error)

    return NextResponse.json(
      { error: 'Unable to load the review queue.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { db, response } = await getAdminDb()
  if (!db) return response!

  try {
    const body = await request.json()

    const recordId = Number(body.recordId)
    const recordType = body.recordType
    const action = body.action

    if (
      !Number.isSafeInteger(recordId) ||
      recordId <= 0 ||
      !['part', 'fitment', 'cross_reference'].includes(recordType) ||
      !['approve', 'reject'].includes(action)
    ) {
      return NextResponse.json(
        { error: 'Invalid review request.' },
        { status: 400 }
      )
    }

    const nextStatus = action === 'approve' ? 'approved' : 'rejected'

    if (recordType === 'part') {
      const { data, error } = await db
        .from('xref_parts')
        .update({ status: nextStatus })
        .eq('id', recordId)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return NextResponse.json(
          { error: 'Part not found or already reviewed.' },
          { status: 409 }
        )
      }
    }

    if (recordType === 'fitment') {
      const { data: fitment, error: fitmentError } = await db
        .from('xref_fitments')
        .select('id, part_id')
        .eq('id', recordId)
        .eq('status', 'pending')
        .maybeSingle()

      if (fitmentError) throw fitmentError

      if (!fitment) {
        return NextResponse.json(
          { error: 'Fitment not found or already reviewed.' },
          { status: 409 }
        )
      }

      if (action === 'approve') {
        const { data: part, error: partError } = await db
          .from('xref_parts')
          .select('id')
          .eq('id', fitment.part_id)
          .eq('status', 'approved')
          .maybeSingle()

        if (partError) throw partError

        if (!part) {
          return NextResponse.json(
            { error: 'Approve the associated part before approving its fitment.' },
            { status: 409 }
          )
        }
      }

      const { data, error } = await db
        .from('xref_fitments')
        .update({
          status: nextStatus,
          verified_at: action === 'approve'
            ? new Date().toISOString()
            : null,
        })
        .eq('id', recordId)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return NextResponse.json(
          { error: 'Fitment was already reviewed.' },
          { status: 409 }
        )
      }
    }

    if (recordType === 'cross_reference') {
      const { data: reference, error: referenceError } = await db
        .from('xref_cross_references')
        .select('id, from_part_id, to_part_id')
        .eq('id', recordId)
        .eq('status', 'pending')
        .maybeSingle()

      if (referenceError) throw referenceError

      if (!reference) {
        return NextResponse.json(
          { error: 'Cross-reference not found or already reviewed.' },
          { status: 409 }
        )
      }

      if (action === 'approve') {
        const { data: approvedParts, error: partsError } = await db
          .from('xref_parts')
          .select('id')
          .in('id', [
            reference.from_part_id,
            reference.to_part_id,
          ])
          .eq('status', 'approved')

        if (partsError) throw partsError

        if ((approvedParts ?? []).length !== 2) {
          return NextResponse.json(
            { error: 'Approve both associated part records first.' },
            { status: 409 }
          )
        }

        const { data: fromFitments, error: fromError } = await db
          .from('xref_fitments')
          .select('variant_id')
          .eq('part_id', reference.from_part_id)
          .eq('status', 'approved')

        if (fromError) throw fromError

        const { data: toFitments, error: toError } = await db
          .from('xref_fitments')
          .select('variant_id')
          .eq('part_id', reference.to_part_id)
          .eq('status', 'approved')

        if (toError) throw toError

        const fromVariants = new Set(
          (fromFitments ?? []).map((f) => f.variant_id)
        )

        const hasSharedFitment = (toFitments ?? []).some(
          (fitment) => fromVariants.has(fitment.variant_id)
        )

        if (!hasSharedFitment) {
          return NextResponse.json(
            {
              error:
                'Both parts need approved fitments for at least one same vehicle variant.',
            },
            { status: 409 }
          )
        }
      }

      const { data, error } = await db
        .from('xref_cross_references')
        .update({
          status: nextStatus,
          verified_at: action === 'approve'
            ? new Date().toISOString()
            : null,
        })
        .eq('id', recordId)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return NextResponse.json(
          { error: 'Cross-reference was already reviewed.' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      recordType,
      recordId,
      status: nextStatus,
    })
  } catch (error) {
    console.error('Cross-reference review POST error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to update this record.',
      },
      { status: 500 }
    )
  }
}
