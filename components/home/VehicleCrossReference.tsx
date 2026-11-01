
'use client'

import { FormEvent, useEffect, useState } from 'react'
import {
  Search,
  ShieldCheck,
  Loader2,
  ChevronDown,
  Database,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

type Make = {
  id: number
  name: string
  slug: string
}

type Alias = {
  alias: string
  alias_type: string
  year_from: number | null
  year_to: number | null
}

type Model = {
  id: number
  name: string
  aliases: Alias[]
}

type Generation = {
  id: number
  generation_code: string
  year_from: number | null
  year_to: number | null
}

type Variant = {
  id: number
  variant_name: string | null
  engine_code: string | null
  capacity_cc: number | null
  fuel_type: string | null
  transmission: string | null
  body_style: string | null
  year_from: number | null
  year_to: number | null
}

type Category = {
  id: number
  name: string
  slug: string
}

type Part = {
  id: number
  brand: string | null
  part_number: string
  normalized_number: string | null
  description: string | null
  status: string | null
}

type Alternative = {
  part: Part
  category_name: string | null
  relationship_type: string
  relationship_status: string | null
  evidence_reference: string | null
  source_name: string | null
  source_url: string | null
  fitment_status: string | null
  fitment_verified_at: string | null
}

type SearchResult = {
  part: Part
  category_name: string | null
  source_name: string | null
  source_url: string | null
  fitment: {
    status: string | null
    verified_at: string | null
    evidence_reference: string | null
  } | null
  alternatives: Alternative[]
}

type Counts = {
  parts: number
  fitments: number
  crossReferences: number
}

async function apiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.')
  }

  return data as T
}

function yearRange(from: number | null, to: number | null) {
  if (!from && !to) return 'Years not specified'
  return `${from ?? 'Earlier'} – ${to ?? 'Present'}`
}

function VariantDescription({ variant }: { variant: Variant }) {
  return (
    <span>
      {[
        variant.engine_code,
        variant.capacity_cc ? `${variant.capacity_cc} cc` : null,
        variant.fuel_type,
        variant.transmission,
        variant.body_style,
        yearRange(variant.year_from, variant.year_to),
      ]
        .filter(Boolean)
        .join(' · ')}
    </span>
  )
}

function StatusLabel({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="text-xs text-gray-500">
        Not confirmed
      </span>
    )
  }

  const verified = status.toLowerCase() === 'verified'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        verified
          ? 'bg-green-50 text-green-700'
          : 'bg-amber-50 text-amber-800'
      }`}
    >
      {verified ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
      {status}
    </span>
  )
}

export default function VehicleCrossReference() {
  const [makes, setMakes] = useState<Make[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [counts, setCounts] = useState<Counts>({
    parts: 0,
    fitments: 0,
    crossReferences: 0,
  })

  const [models, setModels] = useState<Model[]>([])
  const [generations, setGenerations] = useState<Generation[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  const [makeId, setMakeId] = useState('')
  const [modelId, setModelId] = useState('')
  const [generationId, setGenerationId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')

  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingGenerations, setLoadingGenerations] = useState(false)
  const [loadingVariants, setLoadingVariants] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  // Initial makes, categories and catalogue counts.
  useEffect(() => {
    let active = true

    async function loadOptions() {
      try {
        const data = await apiRequest<{
          makes: Make[]
          categories: Category[]
          counts: Counts
        }>('/api/cross-reference?action=options')

        if (!active) return

        setMakes(data.makes)
        setCategories(data.categories)
        setCounts(data.counts)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load options.'
          )
        }
      } finally {
        if (active) setLoadingOptions(false)
      }
    }

    loadOptions()

    return () => {
      active = false
    }
  }, [])

  // Load models when make changes.
  useEffect(() => {
    let active = true

    setModels([])
    setModelId('')
    setGenerationId('')
    setVariantId('')
    setGenerations([])
    setVariants([])
    setResults(null)

    if (!makeId) {
      setLoadingModels(false)
      return
    }

    async function loadModels() {
      setLoadingModels(true)

      try {
        const data = await apiRequest<{ models: Model[] }>(
          `/api/cross-reference?action=models&makeId=${makeId}`
        )

        if (active) setModels(data.models)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load models.'
          )
        }
      } finally {
        if (active) setLoadingModels(false)
      }
    }

    loadModels()

    return () => {
      active = false
    }
  }, [makeId])

  // Load generations when model changes.
  useEffect(() => {
    let active = true

    setGenerations([])
    setGenerationId('')
    setVariantId('')
    setVariants([])
    setResults(null)

    if (!modelId) {
      setLoadingGenerations(false)
      return
    }

    async function loadGenerations() {
      setLoadingGenerations(true)

      try {
        const data = await apiRequest<{
          generations: Generation[]
        }>(
          `/api/cross-reference?action=generations&modelId=${modelId}`
        )

        if (active) setGenerations(data.generations)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load generations.'
          )
        }
      } finally {
        if (active) setLoadingGenerations(false)
      }
    }

    loadGenerations()

    return () => {
      active = false
    }
  }, [modelId])

  // Load variants when generation changes.
  useEffect(() => {
    let active = true

    setVariants([])
    setVariantId('')
    setResults(null)

    if (!generationId) {
      setLoadingVariants(false)
      return
    }

    async function loadVariants() {
      setLoadingVariants(true)

      try {
        const data = await apiRequest<{ variants: Variant[] }>(
          `/api/cross-reference?action=variants&generationId=${generationId}`
        )

        if (active) setVariants(data.variants)
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load variants.'
          )
        }
      } finally {
        if (active) setLoadingVariants(false)
      }
    }

    loadVariants()

    return () => {
      active = false
    }
  }, [generationId])

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResults(null)

    if (!search.trim() && !variantId) {
      setError('Enter a part number or select a vehicle variant.')
      return
    }

    setSearching(true)

    try {
      const params = new URLSearchParams({
        action: 'search',
      })

      if (search.trim()) params.set('q', search.trim())
      if (variantId) params.set('variantId', variantId)
      if (categoryId) params.set('categoryId', categoryId)

      const data = await apiRequest<{ results: SearchResult[] }>(
        `/api/cross-reference?${params.toString()}`
      )

      setResults(data.results)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to search the parts catalogue.'
      )
    } finally {
      setSearching(false)
    }
  }

  function resetFilters() {
    setMakeId('')
    setModelId('')
    setGenerationId('')
    setVariantId('')
    setCategoryId('')
    setSearch('')
    setResults(null)
    setError('')
  }

  const selectedModel = models.find(
    (model) => String(model.id) === modelId
  )

  const selectedGeneration = generations.find(
    (generation) => String(generation.id) === generationId
  )

  const selectedVariant = variants.find(
    (variant) => String(variant.id) === variantId
  )

  return (
    <section className="border-y bg-gray-50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            Korean Motor Spares
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            OEM and Aftermarket Parts Cross Reference
          </h2>

          <p className="mt-3 leading-7 text-gray-600">
            Find Korean vehicle parts using OEM numbers, aftermarket
            references, vehicle generations and engine specifications.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border bg-white p-5 shadow-sm md:p-7">
          {/* Catalogue status */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Database size={19} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">
                Live database catalogue
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-gray-600">
              <span>
                Parts: <strong>{counts.parts}</strong>
              </span>
              <span>
                Fitments: <strong>{counts.fitments}</strong>
              </span>
              <span>
                Cross-references: <strong>{counts.crossReferences}</strong>
              </span>
            </div>
          </div>

          {loadingOptions ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              Loading vehicle database...
            </div>
          ) : (
            <form onSubmit={handleSearch} className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  1. Select your vehicle
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Make
                    </span>

                    <select
                      value={makeId}
                      onChange={(e) => setMakeId(e.target.value)}
                      className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-red-600"
                    >
                      <option value="">Select make</option>
                      {makes.map((make) => (
                        <option key={make.id} value={make.id}>
                          {make.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Model
                    </span>

                    <select
                      value={modelId}
                      onChange={(e) => setModelId(e.target.value)}
                      disabled={!makeId || loadingModels}
                      className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none disabled:bg-gray-100 focus:border-red-600"
                    >
                      <option value="">
                        {loadingModels ? 'Loading models...' : 'Select model'}
                      </option>

                      {models.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                          {model.aliases.length
                            ? ` (also ${model.aliases.map((a) => a.alias).join(', ')})`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Generation
                    </span>

                    <select
                      value={generationId}
                      onChange={(e) => setGenerationId(e.target.value)}
                      disabled={!modelId || loadingGenerations}
                      className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none disabled:bg-gray-100 focus:border-red-600"
                    >
                      <option value="">
                        {loadingGenerations
                          ? 'Loading generations...'
                          : 'Select generation'}
                      </option>

                      {generations.map((generation) => (
                        <option key={generation.id} value={generation.id}>
                          {generation.generation_code} (
                          {yearRange(
                            generation.year_from,
                            generation.year_to
                          )}
                          )
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
                      Engine / Variant
                    </span>

                    <select
                      value={variantId}
                      onChange={(e) => setVariantId(e.target.value)}
                      disabled={!generationId || loadingVariants}
                      className="w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none disabled:bg-gray-100 focus:border-red-600"
                    >
                      <option value="">
                        {loadingVariants
                          ? 'Loading variants...'
                          : variants.length
                            ? 'All variants'
                            : generationId
                              ? 'No variants loaded'
                              : 'Select generation first'}
                      </option>

                      {variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.variant_name || 'Unnamed variant'}
                          {variant.capacity_cc
                            ? ` — ${variant.capacity_cc} cc`
                            : ''}
                          {variant.engine_code
                            ? ` (${variant.engine_code})`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedVariant && (
                  <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-900">
                    <strong>Selected specification:</strong>{' '}
                    <VariantDescription variant={selectedVariant} />
                  </div>
                )}
              </div>

              <div className="border-t pt-5">
                <h3 className="text-sm font-bold text-gray-900">
                  2. Search for a part
                </h3>

                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px_auto]">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="OEM or alternative part number..."
                      className="w-full rounded-lg border px-10 py-3 text-sm outline-none focus:border-red-600"
                    />
                  </div>

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-red-600"
                  >
                    <option value="">All part categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={searching}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {searching ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Search size={17} />
                    )}
                    {searching ? 'Searching...' : 'Search parts'}
                  </button>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Results */}
          {results !== null && (
            <div className="mt-7 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900">
                Search results
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {results.length} matching part record
                {results.length === 1 ? '' : 's'}
              </p>

              {results.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed p-7 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-300" />

                  <p className="mt-3 font-semibold text-gray-800">
                    No matching parts found
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    Check the part number or vehicle selection. Parts must
                    be imported and linked to verified vehicle fitments
                    before alternatives can be displayed.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {results.map((result) => (
                    <article
                      key={result.part.id}
                      className="rounded-xl border p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {result.category_name || 'Part'}
                          </p>

                          <h4 className="mt-1 text-lg font-bold text-gray-900">
                            {result.part.brand || 'Part'} —{' '}
                            <span className="font-mono">
                              {result.part.part_number}
                            </span>
                          </h4>

                          {result.part.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {result.part.description}
                            </p>
                          )}
                        </div>

                        <StatusLabel status={result.fitment?.status ?? null} />
                      </div>

                      {result.fitment?.evidence_reference && (
                        <a
                          href={result.fitment.evidence_reference}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-blue-700 underline"
                        >
                          View fitment evidence
                        </a>
                      )}

                      <div className="mt-4 border-t pt-4">
                        <h5 className="text-sm font-bold text-gray-800">
                          Alternative references
                        </h5>

                        {result.alternatives.length === 0 ? (
                          <p className="mt-2 text-sm text-gray-500">
                            No linked alternative references are available.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-3">
                            {result.alternatives.map((alternative) => (
                              <div
                                key={`${result.part.id}-${alternative.part.id}`}
                                className="rounded-lg bg-gray-50 p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-semibold text-gray-900">
                                    {alternative.part.brand || 'Alternative'}{' '}
                                    <span className="font-mono">
                                      {alternative.part.part_number}
                                    </span>
                                  </p>

                                  <StatusLabel
                                    status={
                                      alternative.fitment_status ??
                                      alternative.relationship_status
                                    }
                                  />
                                </div>

                                {alternative.part.description && (
                                  <p className="mt-1 text-sm text-gray-600">
                                    {alternative.part.description}
                                  </p>
                                )}

                                <p className="mt-1 text-xs text-gray-500">
                                  Relationship:{' '}
                                  {alternative.relationship_type}
                                </p>

                                {alternative.evidence_reference && (
                                  <a
                                    href={alternative.evidence_reference}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block text-xs text-blue-700 underline"
                                  >
                                    View supporting evidence
                                  </a>
                                )}

                                {alternative.source_name && (
                                  <p className="mt-1 text-xs text-gray-400">
                                    Source: {alternative.source_name}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {result.source_name && (
                        <p className="mt-3 text-xs text-gray-400">
                          Part source: {result.source_name}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Important notice */}
          <div className="mt-6 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />

            <p>
              A matching part number or cross-reference does not by itself
              guarantee fitment. Confirm the vehicle year, engine code,
              transmission and OEM number. A fitment marked verified should
              have supporting evidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
