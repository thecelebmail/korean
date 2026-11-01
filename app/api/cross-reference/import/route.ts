
// app/api/cross-reference/import/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { createClient as createSessionClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_ROWS = 1000

const ALLOWED_RELATIONSHIPS = [
  'oem_reference',
  'aftermarket_replacement',
  'manufacturer_equivalent',
  'supersedes',
  'catalogue_reference',
] as const

type AdminContext =
  | { db: SupabaseClient; response?: never }
  | { db?: never; response: NextResponse }

type CsvRecord = {
  row_number: number
  category_id: string
  brand: string
  part_number: string
  description: string
  variant_id: string
  relationship_type: string
  related_brand: string
  related_part_number: string
  evidence_reference: string
}

function csvToRows(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"' && field.length === 0) {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++

      row.push(field)
      if (row.some((value) => value.trim() !== '')) rows.push(row)

      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length || row.length) {
    row.push(field)
    if (row.some((value) => value.trim() !== '')) rows.push(row)
  }

  return rows
}

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

async function requireImportAdmin(): Promise<AdminContext> {
  const sessionClient = await createSessionClient()
  const {
    data: { user },
    error: authError,
  } = await sessionClient.auth.getUser()

  if (authError || !user?.email) {
    return {
      response: NextResponse.json(
        { error: 'Sign in to use the parts importer.' },
        { status: 401 }
      ),
    }
  }

  const allowedEmails = (process.env.XREF_IMPORT_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (
    allowedEmails.length === 0 ||
    !allowedEmails.includes(user.email.toLowerCase())
  ) {
    return {
      response: NextResponse.json(
        { error: 'Your account is not authorised to import parts.' },
        { status: 403 }
      ),
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return {
      response: NextResponse.json(
        { error: 'Server-side Supabase import credentials are missing.' },
        { status: 500 }
      ),
    }
  }

  const db = createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return { db }
}

export async function GET(request: NextRequest) {
  const context = await requireImportAdmin()
  if (!context.db) return context.response

  const action = request.nextUrl.searchParams.get('action')

  if (action === 'sources') {
    const { data, error } = await context.db
      .from('xref_sources')
      .select('id, name, source_url')
      .order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sources: data ?? [] })
  }

  if (action === 'batch') {
    const batchId = request.nextUrl.searchParams.get('batchId') ?? ''

    if (!isUuid(batchId)) {
      return NextResponse.json(
        { error: 'A valid batch ID is required.' },
        { status: 400 }
      )
    }

    const { data, error } = await context.db
      .from('xref_import_staging')
      .select(
        'id, batch_id, raw_data, validation_status, errors, created_at'
      )
      .eq('batch_id', batchId)
      .order('id')
      .limit(MAX_ROWS)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rows: data ?? [] })
  }

  return NextResponse.json(
    { error: 'Unknown import action.' },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  const context = await requireImportAdmin()
  if (!context.db) return context.response

  const db = context.db

  // -----------------------------------------------
  // COMMIT A VALIDATED BATCH
  // -----------------------------------------------

  const contentType = request.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    let body: { action?: string; batchId?: string }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request.' },
        { status: 400 }
      )
    }

    if (body.action !== 'commit' || !body.batchId || !isUuid(body.batchId)) {
      return NextResponse.json(
        { error: 'A valid commit action and batch ID are required.' },
        { status: 400 }
      )
    }

    const { data, error } = await db.rpc('xref_commit_import_batch', {
      p_batch_id: body.batchId,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, result: data })
  }

  // -----------------------------------------------
  // UPLOAD AND VALIDATE CSV
  // -----------------------------------------------

  let form: FormData

  try {
    form = await request.formData()
  } catch {
    return NextResponse.json(
      { error: 'Invalid multipart upload.' },
      { status: 400 }
    )
  }

  const file = form.get('file')
  const sourceId = parsePositiveInteger(String(form.get('sourceId') ?? ''))

  if (!(file instanceof File) || !sourceId) {
    return NextResponse.json(
      { error: 'Select a CSV file and a source.' },
      { status: 400 }
    )
  }

  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'CSV must be between 1 byte and 5 MB.' },
      { status: 400 }
    )
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json(
      { error: 'Only CSV files are supported.' },
      { status: 400 }
    )
  }

  const { data: source, error: sourceError } = await db
    .from('xref_sources')
    .select('id, source_url')
    .eq('id', sourceId)
    .maybeSingle()

  if (sourceError || !source) {
    return NextResponse.json(
      { error: 'The selected source does not exist.' },
      { status: 400 }
    )
  }

  const content = await file.text()
  const parsedRows = csvToRows(content)

  if (parsedRows.length < 2) {
    return NextResponse.json(
      { error: 'The CSV has a header but no data rows.' },
      { status: 400 }
    )
  }

  const headers = parsedRows[0].map((header, index) =>
    header
      .replace(/^\uFEFF/, '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
  )

  const requiredHeaders = [
    'category_id',
    'brand',
    'part_number',
    'variant_id',
    'relationship_type',
    'related_brand',
    'related_part_number',
    'description',
    'evidence_reference',
  ]

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  )

  if (missingHeaders.length > 0) {
    return NextResponse.json(
      {
        error: `Missing CSV columns: ${missingHeaders.join(', ')}`,
      },
      { status: 400 }
    )
  }

  const dataRows = parsedRows.slice(1)

  if (dataRows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `A maximum of ${MAX_ROWS} rows is allowed per batch.` },
      { status: 400 }
    )
  }

  const records: CsvRecord[] = dataRows.map((cells, index) => {
    const get = (name: string) => {
      const columnIndex = headers.indexOf(name)
      return columnIndex < 0 ? '' : (cells[columnIndex] ?? '').trim()
    }

    return {
      row_number: index + 2,
      category_id: get('category_id'),
      brand: get('brand'),
      part_number: get('part_number'),
      description: get('description'),
      variant_id: get('variant_id'),
      relationship_type: get('relationship_type'),
      related_brand: get('related_brand'),
      related_part_number: get('related_part_number'),
      evidence_reference: get('evidence_reference'),
    }
  })

  // Validate references against the actual database.
  const categoryIds = [
    ...new Set(
      records
        .map((row) => parsePositiveInteger(row.category_id))
        .filter((id): id is number => id !== null)
    ),
  ]

  const variantIds = [
    ...new Set(
      records
        .map((row) => parsePositiveInteger(row.variant_id))
        .filter((id): id is number => id !== null)
    ),
  ]

  const [categoryResult, variantResult] = await Promise.all([
    categoryIds.length
      ? db.from('xref_part_categories').select('id').in('id', categoryIds)
      : Promise.resolve({ data: [], error: null }),

    variantIds.length
      ? db.from('xref_variants').select('id').in('id', variantIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (categoryResult.error || variantResult.error) {
    return NextResponse.json(
      {
        error:
          categoryResult.error?.message ??
          variantResult.error?.message ??
          'Unable to validate categories and variants.',
      },
      { status: 500 }
    )
  }

  const validCategories = new Set(
    (categoryResult.data ?? []).map((row) => row.id)
  )

  const validVariants = new Set(
    (variantResult.data ?? []).map((row) => row.id)
  )

  const relationshipTypes = new Set<string>(ALLOWED_RELATIONSHIPS)

  const stagedRows = records.map((row) => {
    const errors: string[] = []

    const categoryId = parsePositiveInteger(row.category_id)
    const variantId = parsePositiveInteger(row.variant_id)

    if (!row.brand) errors.push('Brand is required.')
    if (!row.part_number) errors.push('Part number is required.')

    if (!categoryId || !validCategories.has(categoryId)) {
      errors.push('Category ID does not exist.')
    }

    if (!variantId || !validVariants.has(variantId)) {
      errors.push('Variant ID does not exist.')
    }

    const hasRelatedBrand = Boolean(row.related_brand)
    const hasRelatedNumber = Boolean(row.related_part_number)

    if (hasRelatedBrand !== hasRelatedNumber) {
      errors.push(
        'Related brand and related part number must both be provided.'
      )
    }

    if (hasRelatedBrand && !row.relationship_type) {
      errors.push('Relationship type is required for a related part.')
    }

    if (
      row.relationship_type &&
      !relationshipTypes.has(row.relationship_type)
    ) {
      errors.push('Relationship type is not supported.')
    }

    if (hasRelatedNumber && !row.part_number) {
      errors.push('A primary part number is required for a relationship.')
    }

    return {
      source_id: sourceId,
      raw_data: {
        ...row,
        category_id: categoryId ?? row.category_id,
        variant_id: variantId ?? row.variant_id,
        evidence_reference:
          row.evidence_reference || source.source_url || '',
      },
      validation_status: errors.length === 0 ? 'valid' : 'invalid',
      errors,
    }
  })

  const batchId = randomUUID()
  const chunkSize = 200

  try {
    for (let i = 0; i < stagedRows.length; i += chunkSize) {
      const chunk = stagedRows.slice(i, i + chunkSize).map((row) => ({
        ...row,
        batch_id: batchId,
      }))

      const { error } = await db
        .from('xref_import_staging')
        .insert(chunk)

      if (error) throw error
    }
  } catch (error) {
    // Remove partial batch if a chunk failed.
    await db
      .from('xref_import_staging')
      .delete()
      .eq('batch_id', batchId)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to save the staging batch.',
      },
      { status: 500 }
    )
  }

  const validCount = stagedRows.filter(
    (row) => row.validation_status === 'valid'
  ).length

  return NextResponse.json({
    success: true,
    batchId,
    totalRows: stagedRows.length,
    validCount,
    invalidCount: stagedRows.length - validCount,
    rows: stagedRows.map((row) => ({
      raw_data: row.raw_data,
      validation_status: row.validation_status,
      errors: row.errors,
    })),
  })
}
