
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PART_COLUMNS =
  'id, category_id, brand, part_number, normalized_number, description, source_id, status'

function getId(value: string | null): number | null {
  if (!value) return null

  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

type PartRow = {
  id: number
  category_id: number | null
  brand: string | null
  part_number: string
  normalized_number: string | null
  description: string | null
  source_id: number | null
  status: string | null
}

type FitmentRow = {
  id: number
  part_id: number
  variant_id: number
  source_id: number | null
  evidence_reference: string | null
  status: string | null
  verified_at: string | null
}

type CrossReferenceRow = {
  id: number
  from_part_id: number
  to_part_id: number
  relationship_type: string
  source_id: number | null
  evidence_reference: string | null
  status: string | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const params = request.nextUrl.searchParams
    const action = params.get('action')

    // --------------------------------------------------
    // INITIAL OPTIONS
    // --------------------------------------------------

    if (action === 'options') {
      const [
        makesResult,
        categoriesResult,
        partsCount,
        fitmentsCount,
        referencesCount,
      ] = await Promise.all([
        supabase
          .from('xref_makes')
          .select('id, name, slug')
          .order('name'),

        supabase
          .from('xref_part_categories')
          .select('id, name, slug')
          .order('name'),

        supabase
          .from('xref_parts')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('xref_fitments')
          .select('id', { count: 'exact', head: true }),

        supabase
          .from('xref_cross_references')
          .select('id', { count: 'exact', head: true }),
      ])

      const error =
        makesResult.error ||
        categoriesResult.error ||
        partsCount.error ||
        fitmentsCount.error ||
        referencesCount.error

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        makes: makesResult.data ?? [],
        categories: categoriesResult.data ?? [],
        counts: {
          parts: partsCount.count ?? 0,
          fitments: fitmentsCount.count ?? 0,
          crossReferences: referencesCount.count ?? 0,
        },
      })
    }

    // --------------------------------------------------
    // MODELS BY MAKE
    // --------------------------------------------------

    if (action === 'models') {
      const makeId = getId(params.get('makeId'))

      if (!makeId) {
        return NextResponse.json(
          { error: 'A valid make ID is required.' },
          { status: 400 }
        )
      }

      const { data: models, error } = await supabase
        .from('xref_models')
        .select('id, make_id, name, market')
        .eq('make_id', makeId)
        .eq('market', 'ZA')
        .order('name')

      if (error) throw error

      const modelIds = (models ?? []).map((model) => model.id)

      let aliases: {
        model_id: number
        alias: string
        alias_type: string
        year_from: number | null
        year_to: number | null
      }[] = []

      if (modelIds.length > 0) {
        const result = await supabase
          .from('xref_model_aliases')
          .select('model_id, alias, alias_type, year_from, year_to')
          .eq('market', 'ZA')
          .in('model_id', modelIds)

        if (result.error) throw result.error
        aliases = result.data ?? []
      }

      const result = (models ?? []).map((model) => ({
        ...model,
        aliases: aliases.filter(
          (alias) => alias.model_id === model.id
        ),
      }))

      return NextResponse.json({ models: result })
    }

    // --------------------------------------------------
    // GENERATIONS BY MODEL
    // --------------------------------------------------

    if (action === 'generations') {
      const modelId = getId(params.get('modelId'))

      if (!modelId) {
        return NextResponse.json(
          { error: 'A valid model ID is required.' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('xref_generations')
        .select('id, model_id, generation_code, year_from, year_to')
        .eq('model_id', modelId)
        .order('year_from')

      if (error) throw error

      return NextResponse.json({ generations: data ?? [] })
    }

    // --------------------------------------------------
    // VARIANTS BY GENERATION
    // --------------------------------------------------

    if (action === 'variants') {
      const generationId = getId(params.get('generationId'))

      if (!generationId) {
        return NextResponse.json(
          { error: 'A valid generation ID is required.' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('xref_variants')
        .select(
          'id, model_id, generation_id, variant_name, engine_code, capacity_cc, fuel_type, transmission, body_style, year_from, year_to'
        )
        .eq('generation_id', generationId)
        .order('capacity_cc')

      if (error) throw error

      return NextResponse.json({ variants: data ?? [] })
    }

    // --------------------------------------------------
    // PART AND CROSS-REFERENCE SEARCH
    // --------------------------------------------------

    if (action === 'search') {
      const term = (params.get('q') ?? '').trim().slice(0, 100)
      const variantId = getId(params.get('variantId'))
      const categoryId = getId(params.get('categoryId'))

      if (!term && !variantId) {
        return NextResponse.json(
          { error: 'Enter a part number or select a vehicle variant.' },
          { status: 400 }
        )
      }

      let baseParts: PartRow[] = []

      // Search part number, normalized number, description and brand.
      if (term) {
        const pattern = `%${term}%`
        const normalized = term.replace(/[^a-zA-Z0-9]/g, '')

        const [numberResult, normalizedResult, descriptionResult, brandResult] =
          await Promise.all([
            supabase
              .from('xref_parts')
              .select(PART_COLUMNS)
              .ilike('part_number', pattern)
              .limit(40),

            supabase
              .from('xref_parts')
              .select(PART_COLUMNS)
              .ilike('normalized_number', `%${normalized}%`)
              .limit(40),

            supabase
              .from('xref_parts')
              .select(PART_COLUMNS)
              .ilike('description', pattern)
              .limit(40),

            supabase
              .from('xref_parts')
              .select(PART_COLUMNS)
              .ilike('brand', pattern)
              .limit(40),
          ])

        const searchError =
          numberResult.error ||
          normalizedResult.error ||
          descriptionResult.error ||
          brandResult.error

        if (searchError) throw searchError

        const unique = new Map<number, PartRow>()

        for (const row of [
          ...(numberResult.data ?? []),
          ...(normalizedResult.data ?? []),
          ...(descriptionResult.data ?? []),
          ...(brandResult.data ?? []),
        ] as PartRow[]) {
          unique.set(row.id, row)
        }

        baseParts = [...unique.values()]
      }

      // When searching by vehicle only, start with its fitments.
      if (!term && variantId) {
        const { data, error } = await supabase
          .from('xref_fitments')
          .select('part_id')
          .eq('variant_id', variantId)
          .limit(100)

        if (error) throw error

        const partIds = [...new Set((data ?? []).map((row) => row.part_id))]

        if (partIds.length > 0) {
          let query = supabase
            .from('xref_parts')
            .select(PART_COLUMNS)
            .in('id', partIds)

          if (categoryId) {
            query = query.eq('category_id', categoryId)
          }

          const result = await query.limit(100)
          if (result.error) throw result.error
          baseParts = (result.data ?? []) as PartRow[]
        }
      }

      if (categoryId && term) {
        baseParts = baseParts.filter(
          (part) => part.category_id === categoryId
        )
      }

      const baseIds = baseParts.map((part) => part.id)

      if (baseIds.length === 0) {
        return NextResponse.json({ results: [] })
      }

      // Fetch fitments for selected variant.
      let fitments: FitmentRow[] = []

      if (variantId) {
        const { data, error } = await supabase
          .from('xref_fitments')
          .select(
            'id, part_id, variant_id, source_id, evidence_reference, status, verified_at'
          )
          .eq('variant_id', variantId)
          .in('part_id', baseIds)

        if (error) throw error
        fitments = (data ?? []) as FitmentRow[]

        const fittedIds = new Set(
          fitments.map((fitment) => fitment.part_id)
        )

        baseParts = baseParts.filter((part) => fittedIds.has(part.id))
      }

      if (baseParts.length === 0) {
        return NextResponse.json({ results: [] })
      }

      // Find linked cross-reference records in both directions.
      const filteredBaseIds = baseParts.map((part) => part.id)

      const [fromResult, toResult] = await Promise.all([
        supabase
          .from('xref_cross_references')
          .select(
            'id, from_part_id, to_part_id, relationship_type, source_id, evidence_reference, status'
          )
          .in('from_part_id', filteredBaseIds),

        supabase
          .from('xref_cross_references')
          .select(
            'id, from_part_id, to_part_id, relationship_type, source_id, evidence_reference, status'
          )
          .in('to_part_id', filteredBaseIds),
      ])

      if (fromResult.error) throw fromResult.error
      if (toResult.error) throw toResult.error

      const edges: {
        baseId: number
        alternativeId: number
        reference: CrossReferenceRow
      }[] = []

      const edgeKeys = new Set<string>()

      for (const ref of [
        ...(fromResult.data ?? []),
        ...(toResult.data ?? []),
      ] as CrossReferenceRow[]) {
        const isFrom = filteredBaseIds.includes(ref.from_part_id)

        const baseId = isFrom ? ref.from_part_id : ref.to_part_id
        const alternativeId = isFrom ? ref.to_part_id : ref.from_part_id
        const key = `${baseId}:${alternativeId}:${ref.id}`

        if (
          baseId === alternativeId ||
          edgeKeys.has(key)
        ) {
          continue
        }

        edgeKeys.add(key)
        edges.push({ baseId, alternativeId, reference: ref })
      }

      const alternativeIds = [
        ...new Set(edges.map((edge) => edge.alternativeId)),
      ]

      let alternativeParts: PartRow[] = []

      if (alternativeIds.length > 0) {
        const { data, error } = await supabase
          .from('xref_parts')
          .select(PART_COLUMNS)
          .in('id', alternativeIds)

        if (error) throw error
        alternativeParts = (data ?? []) as PartRow[]
      }

      // An alternative also needs a fitment record for the selected variant.
      let alternativeFitments: FitmentRow[] = []

      if (variantId && alternativeIds.length > 0) {
        const { data, error } = await supabase
          .from('xref_fitments')
          .select(
            'id, part_id, variant_id, source_id, evidence_reference, status, verified_at'
          )
          .eq('variant_id', variantId)
          .in('part_id', alternativeIds)

        if (error) throw error
        alternativeFitments = (data ?? []) as FitmentRow[]

        const fittedIds = new Set(
          alternativeFitments.map((fitment) => fitment.part_id)
        )

        alternativeParts = alternativeParts.filter(
          (part) => fittedIds.has(part.id)
        )
      }

      const allFitments = [...fitments, ...alternativeFitments]
      const fitmentByPart = new Map<number, FitmentRow>()

      for (const fitment of allFitments) {
        fitmentByPart.set(fitment.part_id, fitment)
      }

      const allParts = [...baseParts, ...alternativeParts]

      const categoryIds = [
        ...new Set(
          allParts
            .map((part) => part.category_id)
            .filter((id): id is number => id !== null)
        ),
      ]

      const sourceIds = [
        ...new Set(
          [
            ...allParts.map((part) => part.source_id),
            ...allFitments.map((fitment) => fitment.source_id),
            ...edges.map((edge) => edge.reference.source_id),
          ].filter((id): id is number => id !== null)
        ),
      ]

      const [categoriesResult, sourcesResult] = await Promise.all([
        categoryIds.length
          ? supabase
              .from('xref_part_categories')
              .select('id, name')
              .in('id', categoryIds)
          : Promise.resolve({ data: [], error: null }),

        sourceIds.length
          ? supabase
              .from('xref_sources')
              .select('id, name, source_url')
              .in('id', sourceIds)
          : Promise.resolve({ data: [], error: null }),
      ])

      if (categoriesResult.error) throw categoriesResult.error
      if (sourcesResult.error) throw sourcesResult.error

      const categoryMap = new Map(
        (categoriesResult.data ?? []).map((row) => [row.id, row.name])
      )

      const sourceMap = new Map(
        (sourcesResult.data ?? []).map((row) => [row.id, row])
      )

      const results = baseParts.map((part) => {
        const fitment = fitmentByPart.get(part.id) ?? null
        const partSource = part.source_id
          ? sourceMap.get(part.source_id)
          : null

        const alternatives = edges
          .filter((edge) => edge.baseId === part.id)
          .map((edge) => {
            const alternative = alternativeParts.find(
              (item) => item.id === edge.alternativeId
            )

            if (!alternative) return null

            const alternativeFitment =
              fitmentByPart.get(alternative.id) ?? null

            const refSource = edge.reference.source_id
              ? sourceMap.get(edge.reference.source_id)
              : null

            const alternativeSource = alternative.source_id
              ? sourceMap.get(alternative.source_id)
              : null

            return {
              part: alternative,
              category_name: alternative.category_id
                ? categoryMap.get(alternative.category_id) ?? null
                : null,
              relationship_type: edge.reference.relationship_type,
              relationship_status: edge.reference.status,
              evidence_reference: edge.reference.evidence_reference,
              source_name:
                refSource?.name ?? alternativeSource?.name ?? null,
              source_url:
                refSource?.source_url ?? alternativeSource?.source_url ?? null,
              fitment_status: alternativeFitment?.status ?? null,
              fitment_verified_at:
                alternativeFitment?.verified_at ?? null,
            }
          })
          .filter((item) => item !== null)

        return {
          part,
          category_name: part.category_id
            ? categoryMap.get(part.category_id) ?? null
            : null,
          source_name: partSource?.name ?? null,
          source_url: partSource?.source_url ?? null,
          fitment: fitment
            ? {
                status: fitment.status,
                verified_at: fitment.verified_at,
                evidence_reference: fitment.evidence_reference,
              }
            : null,
          alternatives,
        }
      })

      return NextResponse.json({ results })
    }

    return NextResponse.json(
      { error: 'Unknown cross-reference action.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Cross-reference API error:', error)

    return NextResponse.json(
      { error: 'Unable to load cross-reference data. Check database access and try again.' },
      { status: 500 }
    )
  }
}
