
'use client'

import { useEffect, useState } from 'react'
import {
  Upload,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react'

type Source = {
  id: number
  name: string
  source_url: string
}

type PreviewRow = {
  raw_data: {
    row_number: number
    brand: string
    part_number: string
    variant_id: number | string
    related_brand: string
    related_part_number: string
  }
  validation_status: 'valid' | 'invalid'
  errors: string[]
}

type StageResult = {
  batchId: string
  totalRows: number
  validCount: number
  invalidCount: number
  rows: PreviewRow[]
}

const CSV_TEMPLATE =
  'category_id,brand,part_number,description,variant_id,relationship_type,related_brand,related_part_number,evidence_reference\r\n'

export default function CrossReferenceImporter() {
  const [sources, setSources] = useState<Source[]>([])
  const [sourceId, setSourceId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [stage, setStage] = useState<StageResult | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadingSources, setLoadingSources] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [committing, setCommitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSources() {
      try {
        const response = await fetch(
          '/api/cross-reference/import?action=sources',
          { cache: 'no-store' }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load sources.')
        }

        if (active) setSources(data.sources ?? [])
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load sources.'
          )
        }
      } finally {
        if (active) setLoadingSources(false)
      }
    }

    loadSources()

    return () => {
      active = false
    }
  }, [])

  async function uploadCsv(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setStage(null)

    if (!file || !sourceId) {
      setError('Choose a CSV file and select its source.')
      return
    }

    const form = new FormData()
    form.set('file', file)
    form.set('sourceId', sourceId)

    setUploading(true)

    try {
      const response = await fetch('/api/cross-reference/import', {
        method: 'POST',
        body: form,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'CSV upload failed.')
      }

      setStage({
        batchId: data.batchId,
        totalRows: data.totalRows,
        validCount: data.validCount,
        invalidCount: data.invalidCount,
        rows: data.rows ?? [],
      })

      setMessage('CSV staged successfully. Review the rows before importing.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function commitBatch() {
    if (!stage || stage.validCount === 0) return

    setError('')
    setMessage('')
    setCommitting(true)

    try {
      const response = await fetch('/api/cross-reference/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'commit',
          batchId: stage.batchId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed.')
      }

      setMessage(
        `Import complete: ${data.result.imported_rows} rows processed. Parts and fitments remain pending approval.`
      )

      setStage((current) =>
        current
          ? {
              ...current,
              validCount: 0,
              rows: current.rows.map((row) =>
                row.validation_status === 'valid'
                  ? { ...row, validation_status: 'valid' }
                  : row
              ),
            }
          : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setCommitting(false)
    }
  }

  const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(
    CSV_TEMPLATE
  )}`

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Parts Catalogue Import
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-gray-600">
          Import OEM and aftermarket part numbers, vehicle fitments and
          cross-reference relationships from a CSV file. Records enter the
          catalogue as pending until reviewed.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <FileSpreadsheet className="h-6 w-6 text-green-700" />
            <h2 className="text-xl font-bold">Upload CSV</h2>
          </div>

          <form onSubmit={uploadCsv} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                Data source
              </span>

              <select
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                disabled={loadingSources}
                className="w-full rounded-lg border bg-white px-3 py-3 text-sm"
              >
                <option value="">
                  {loadingSources ? 'Loading sources...' : 'Select source'}
                </option>

                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">
                CSV file
              </span>

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) =>
                  setFile(event.target.files?.[0] ?? null)
                }
                className="block w-full rounded-lg border p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold"
              />

              {file && (
                <p className="mt-2 text-xs text-gray-500">
                  {file.name} · {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={uploading || loadingSources}
                className="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Validating...' : 'Upload and validate'}
              </button>

              <a
                href={templateHref}
                download="korean-motor-spares-import-template.csv"
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                CSV template
              </a>
            </div>
          </form>

          {error && (
            <div className="mt-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="mt-5 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {message}
            </div>
          )}

          {stage && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold">Import preview</h3>

              <p className="mt-1 break-all text-xs text-gray-500">
                Batch: {stage.batchId}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Total rows</p>
                  <p className="mt-1 text-2xl font-bold">
                    {stage.totalRows}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-xs text-green-700">Valid</p>
                  <p className="mt-1 text-2xl font-bold text-green-800">
                    {stage.validCount}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-xs text-red-700">Invalid</p>
                  <p className="mt-1 text-2xl font-bold text-red-800">
                    {stage.invalidCount}
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-gray-500">
                      <th className="px-3 py-3">CSV row</th>
                      <th className="px-3 py-3">Brand</th>
                      <th className="px-3 py-3">Part number</th>
                      <th className="px-3 py-3">Variant ID</th>
                      <th className="px-3 py-3">Validation</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stage.rows.slice(0, 50).map((row) => (
                      <tr
                        key={row.raw_data.row_number}
                        className="border-b align-top"
                      >
                        <td className="px-3 py-3">
                          {row.raw_data.row_number}
                        </td>
                        <td className="px-3 py-3">
                          {row.raw_data.brand}
                        </td>
                        <td className="px-3 py-3 font-mono">
                          {row.raw_data.part_number}
                        </td>
                        <td className="px-3 py-3">
                          {row.raw_data.variant_id}
                        </td>
                        <td className="px-3 py-3">
                          {row.validation_status === 'valid' ? (
                            <span className="text-xs font-semibold text-green-700">
                              Valid
                            </span>
                          ) : (
                            <div className="text-xs text-red-700">
                              {row.errors.join(' ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stage.rows.length > 50 && (
                <p className="mt-2 text-xs text-gray-500">
                  Showing the first 50 rows. All {stage.totalRows} rows were
                  validated.
                </p>
              )}

              <button
                type="button"
                onClick={commitBatch}
                disabled={committing || stage.validCount === 0}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
              >
                {committing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {committing
                  ? 'Importing...'
                  : `Import ${stage.validCount} valid rows`}
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-bold">CSV columns</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Each row needs a category ID, brand, part number and variant
              ID. Related part fields are optional.
            </p>

            <div className="mt-3 space-y-2 text-xs text-gray-700">
              {[
                'category_id',
                'brand',
                'part_number',
                'description',
                'variant_id',
                'relationship_type',
                'related_brand',
                'related_part_number',
                'evidence_reference',
              ].map((field) => (
                <code
                  key={field}
                  className="block rounded bg-gray-50 px-2 py-1.5"
                >
                  {field}
                </code>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-bold text-amber-900">Important</h3>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Imported parts, fitments and cross-references are stored as
              pending. They are not presented as verified matches until
              reviewed and approved.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-bold">Relationship types</h3>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li><code>oem_reference</code></li>
              <li><code>aftermarket_replacement</code></li>
              <li><code>manufacturer_equivalent</code></li>
              <li><code>supersedes</code></li>
              <li><code>catalogue_reference</code></li>
            </ul>
          </div>
        </aside>
      </div>
    </main> 
  )
}
