
'use strict'
'use client'

import React, { useState } from 'react'
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react'

// Lightweight, static regional compatibility matrix mapping component specs
const VEHICLE_PARTS_DATABASE = [
  { id: 1, make: 'Hyundai', model: 'Grand i10 (2014-2020)', partType: 'Oil Filter', oemPart: '26300-02503', altBrand: 'GUD', altPart: 'Z632', fitmentNotes: 'Identical thread length configuration; highly recommended aftermarket replacement.' },
  { id: 2, make: 'Kia', model: 'Picanto TA (2011-2017)', partType: 'Front Brake Pads', oemPart: '58101-07A00', altBrand: 'Ferodo', altPart: 'FDB4307', fitmentNotes: 'Direct match for standard ventilated front brake discs.' },
  { id: 3, make: 'Hyundai', model: 'i20 Hatch (2015-2021)', partType: 'Cabin Air Filter', oemPart: '97133-1C000', altBrand: 'Fram', altPart: 'RCA208', fitmentNotes: 'Verify dimension tolerances before sliding plastic housing assembly.' },
  { id: 4, make: 'Kia', model: 'Rio UB (2012-2017)', partType: 'Spark Plug Set', oemPart: '18846-10060', altBrand: 'NGK Iris', altPart: 'SILZKR6B10E', fitmentNotes: 'Pre-gapped long-life laser iridium variant.' }
]

export default function PartCrossReference() {
  const [selectedMake, setSelectedMake] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [matchedResults, setMatchedResults] = useState<typeof VEHICLE_PARTS_DATABASE>([])

  const handleSearchLookup = (e: React.FormEvent) => {
    e.preventDefault()
    const filtered = VEHICLE_PARTS_DATABASE.filter((item) => {
      const matchesMake = selectedMake ? item.make === selectedMake : true
      const matchesText = searchTerm
        ? item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.partType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.oemPart.toLowerCase().includes(searchTerm.toLowerCase())
        : true
      return matchesMake && matchesText
    })
    setMatchedResults(filtered)
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <RefreshCw className="h-6 w-6 text-blue-600 animate-spin-slow" />
        <h2 className="text-2xl font-bold text-gray-900">Korean Parts Cross-Reference Utility</h2>
      </div>
      <p className="text-gray-600 mb-6 text-sm md:text-base">
        Can't source a costly original equipment component? Find verified, direct-fit aftermarket equivalent parts widely available at local parts vendors in South Africa.
      </p>

      <form onSubmit={handleSearchLookup} className="grid gap-4 md:grid-cols-3 items-end mb-8 bg-gray-50 p-4 rounded-xl border">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2 tracking-wider">Manufacturer</label>
          <select 
            value={selectedMake} 
            onChange={(e) => setSelectedMake(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Makes</option>
            <option value="Hyundai">Hyundai</option>
            <option value="Kia">Kia</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase mb-2 tracking-wider">Search Keyword</label>
          <input 
            type="text" 
            placeholder="e.g. i20, Oil Filter, Brake Pads"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 p-2.5 font-semibold text-white shadow hover:bg-blue-700 transition">
          <Search className="h-4 w-4" />
          Analyze Fitment
        </button>
      </form>

      {/* Lookup Output Profiles */}
      <div className="space-y-4">
        {matchedResults.length > 0 ? (
          matchedResults.map((result) => (
            <div key={result.id} className="border rounded-xl p-5 hover:shadow-md transition bg-white">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b pb-3 mb-3">
                <div>
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded mb-1">{result.make}</span>
                  <h4 className="font-bold text-gray-900 text-lg">{result.model}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-400 block">Component Type</span>
                  <span className="font-semibold text-gray-800">{result.partType}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 bg-gray-50 p-3 rounded-lg border text-sm mb-3">
                <div>
                  <span className="text-xs font-medium text-gray-500 block">OEM Factory Serial</span>
                  <code className="font-mono bg-white px-1.5 py-0.5 border rounded text-red-600 font-semibold">{result.oemPart}</code>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 block">SA Market Alternative</span>
                  <span className="font-bold text-green-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                    {result.altBrand} — {result.altPart}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic bg-blue-50/50 p-2.5 rounded border border-blue-100/50">{result.fitmentNotes}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border border-dashed rounded-xl text-gray-400">
            Select standard parameter values or hit search to find alternative replacement references.
          </div>
        )}
      </div>
    </div>
  )
}
