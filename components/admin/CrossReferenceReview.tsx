
// components/admin/CrossReferenceReview.tsx

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Database,
  ExternalLink,
  Search,
  AlertCircle,
} from 'lucide-react'

type Source = {
  id: number
  name: string
  source_url: string
} | null

type Part = {
  id: number
  brand: string | null
  part_number: string
  normalized_number: string | null
  description: string | null
  category_name: string | null
  status: string
  source: Source
}

type Variant = {
  id: number
  variant_name: string | null
  engine_code: string | null
  capacity_cc: number | null
  fuel_type: string | null
  transmission: string | null
  year_from: number | null
  year_to: number | null
  model_name: string
  make_name: string
  generation_code: string | null
} | null

type Fitment = {
  id: number
  evidence_reference: string | null
  status: string
  part: Part | null
  variant: Variant
  source: Source
}

type CrossReference = {
  id: number
  relationship_type: string
  evidence_reference: string | null
  status: string
  fromPart: Part | null
  toPart: Part | null
  source: Source
}

type QueueData = {
  counts: {
    parts: number
    fitments: number
    crossReferences: number
  }
  parts: Part[]
  fitments: Fitment[]
  crossReferences: CrossReference[]
}

type Tab = 'parts' | 'fitments' | 'crossReferences'
type ReviewAction = 'approve' | 'reject'

async function loadQueue(): Promise<QueueData> {
  const response = await fetch('/api/cross-reference/review', {
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Unable to load review queue.')
  }

  return data as QueueData
}

function SourceLink({ source }: { source: Source }) {
  if (!source) {
    return <span className="text-xs text-gray-400">No source recorded</span>
  }

  return (
    <a
      href={source.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline"
    >
      {source.name}
      <ExternalLink size={12} />
    </a>
  )
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
      Pending review
    </span>
  )
}

function PartDetails({ part }: { part: Part | null }) {
  if (!part) {
    return <p className="text-sm text-red-600">Part record not found.</p>
  }

  return (
    <div>
      <p className="font-semibold text-gray-900">
        {part.brand || 'Unknown brand'} —{' '}
        <span className="font-mono">{part.part_number}</span>
      </p>
      {part.description && (
        <p className="mt-1 text-sm text-gray-600">
          {part.description}
        </p>
      )}
      {part.category_name && (
        <p className="mt-1 text-xs text-gray-500">
          Category: {part.category_name}
        </p>
      )}
      <div className="mt-2">
        <SourceLink source={part.source} />
      </div>
    </div>
  )
}

function ReviewButtons({
  busy,
  onAction,
}: {
  busy: boolean
  onAction: (action: ReviewAction) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onAction('approve')}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <CheckCircle2 size={14} />
        )}
        Approve
      </button>

      <button
        type="button"
        onClick={() => onAction('reject')}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        <XCircle size={14} />
        Reject
      </button>
    </div>
  )
}

export default function CrossReferenceReview() {
  const [queue, setQueue] = useState<QueueData | null>(null)
  const [tab, setTab] = useState<Tab>('parts')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setQueue(await loadQueue())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load review queue.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function review(
    recordType: 'part' | 'fitment' | 'cross_reference',
    recordId: number,
    action: ReviewAction
  ) {
    const key = `${recordType}:${recordId}`

    if (
      action === 'reject' &&
      !window.confirm('Reject this record? It will not appear in public search.')
    ) {
      return
    }

    setWorking(key)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/cross-reference/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordType, recordId, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update record.')
      }

      setMessage(
        `${recordType.replace('_', ' ')} #${recordId} ${action}d successfully.`
      )

      await refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update record.'
      )
    } finally {
      setWorking(null)
    }
  }

  const visibleParts = useMemo(() => {
    if (!queue) return []

    const term = search.trim().toLowerCase()
    if (!term) return queue.parts

    return queue.parts.filter((part) =>
      [
        part.brand,
        part.part_number,
        part.normalized_number,
        part.description,
        part.category_name,
        part.source?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [queue, search])

  const visibleFitments = useMemo(() => {
    if (!queue) return []

    const term = search.trim().toLowerCase()
    if (!term) return queue.fitments

    return queue.fitments.filter((item) =>
      [
        item.part?.brand,
        item.part?.part_number,
        item.part?.description,
        item.variant?.make_name,
        item.variant?.model_name,
        item.variant?.variant_name,
        item.variant?.generation_code,
        item.variant?.engine_code,
        item.source?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [queue, search])

  const visibleReferences = useMemo(() => {
    if (!queue) return []

    const term = search.trim().toLowerCase()
    if (!term) return queue.crossReferences

    return queue.crossReferences.filter((item) =>
      [
        item.fromPart?.brand,
        item.fromPart?.part_number,
        item.toPart?.brand,
        item.toPart?.part_number,
        item.relationship_type,
        item.source?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [queue, search])

  const totalPending =
    (queue?.counts.parts ?? 0) +
    (queue?.counts.fitments ?? 0) +
    (queue?.counts.crossReferences ?? 0)

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Administration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Cross-Reference Review
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Review imported part numbers, vehicle applications and
            aftermarket relationships before publishing them.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </header>

      {queue && (
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setTab('parts')}
            className={`rounded-xl border p-4 text-left ${
              tab === 'parts'
                ? 'border-black bg-gray-50'
                : 'bg-white'
            }`}
          >
            <p className="text-xs text-gray-500">Pending parts</p>
            <p className="mt-1 text-2xl font-bold">
              {queue.counts.parts}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('fitments')}
            className={`rounded-xl border p-4 text-left ${
              tab === 'fitments'
                ? 'border-black bg-gray-50'
                : 'bg-white'
            }`}
          >
            <p className="text-xs text-gray-500">Pending fitments</p>
            <p className="mt-1 text-2xl font-bold">
              {queue.counts.fitments}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setTab('crossReferences')}
            className={`rounded-xl border p-4 text-left ${
              tab === 'crossReferences'
                ? 'border-black bg-gray-50'
                : 'bg-white'
            }`}
          >
            <p className="text-xs text-gray-500">Pending references</p>
            <p className="mt-1 text-2xl font-bold">
              {queue.counts.crossReferences}
            </p>
          </button>
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['parts', 'Parts'],
                ['fitments', 'Fitments'],
                ['crossReferences', 'Cross-references'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  tab === value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter this queue..."
              className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 flex gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={18} className="shrink-0" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading review queue...
        </div>
      ) : !queue || totalPending === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-10 text-center">
          <Database className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 font-semibold text-gray-800">
            No pending records
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            New imported records will appear here for review.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {tab === 'parts' && (
            visibleParts.length ? (
              visibleParts.map((part) => (
                <article
                  key={part.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Part #{part.id}
                        </span>
                        <StatusBadge />
                      </div>
                      <PartDetails part={part} />
                    </div>

                    <ReviewButtons
                      busy={working === `part:${part.id}`}
                      onAction={(action) =>
                        void review('part', part.id, action)
                      }
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                No matching pending parts.
              </p>
            )
          )}

          {tab === 'fitments' && (
            visibleFitments.length ? (
              visibleFitments.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Fitment #{item.id}
                        </span>
                        <StatusBadge />
                      </div>

                      <PartDetails part={item.part} />

                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Vehicle application
                        </p>
                        {item.variant ? (
                          <>
                            <p className="mt-1 font-semibold text-gray-900">
                              {item.variant.make_name}{' '}
                              {item.variant.model_name}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {item.variant.generation_code || 'Generation unspecified'}
                              {' · '}
                              {item.variant.variant_name || 'Variant unspecified'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {[
                                item.variant.engine_code,
                                item.variant.capacity_cc
                                  ? `${item.variant.capacity_cc} cc`
                                  : null,
                                item.variant.fuel_type,
                                item.variant.transmission,
                                item.variant.year_from
                                  ? `${item.variant.year_from}–${item.variant.year_to ?? 'present'}`
                                  : null,
                              ].filter(Boolean).join(' · ')}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-sm text-red-600">
                            Variant record not found.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <SourceLink source={item.source} />
                        {item.evidence_reference && (
                          <p>
                            <a
                              href={item.evidence_reference}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-700 underline"
                            >
                              Open fitment evidence
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <ReviewButtons
                      busy={working === `fitment:${item.id}`}
                      onAction={(action) =>
                        void review('fitment', item.id, action)
                      }
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                No matching pending fitments.
              </p>
            )
          )}

          {tab === 'crossReferences' && (
            visibleReferences.length ? (
              visibleReferences.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">
                          Reference #{item.id}
                        </span>
                        <StatusBadge />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                            Original / primary part
                          </p>
                          <PartDetails part={item.fromPart} />
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                          <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                            Alternative / related part
                          </p>
                          <PartDetails part={item.toPart} />
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        Relationship:{' '}
                        <strong>{item.relationship_type}</strong>
                      </p>

                      <div className="space-y-1">
                        <SourceLink source={item.source} />
                        {item.evidence_reference && (
                          <p>
                            <a
                              href={item.evidence_reference}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-700 underline"
                            >
                              Open relationship evidence
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <ReviewButtons
                      busy={working === `cross_reference:${item.id}`}
                      onAction={(action) =>
                        void review('cross_reference', item.id, action)
                      }
                    />
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-gray-500">
                No matching pending cross-references.
              </p>
            )
          )}
        </div>
      )}

      <div className="mt-6 rounded-lg bg-amber-50 p-4 text-xs leading-5 text-amber-900">
        Review the original source and exact vehicle application before
        approving. Rejected records remain in the database for auditing
        but are excluded from public search.
      </div>
    </main>
  )
}
