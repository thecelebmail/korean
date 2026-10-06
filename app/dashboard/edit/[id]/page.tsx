// app/dashboard/edit/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VendorEditForm() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const [formData, setFormData] = useState({
    name: '', phone: '', alt_number: '', whatsapp: '',
    email: '', website: '', address: '', description: ''
  })

  useEffect(() => {
    async function loadShopData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: shop, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && shop) {
        setFormData({
          name: shop.name || '',
          phone: shop.phone || '',
          alt_number: shop.alt_number || '',
          whatsapp: shop.whatsapp || '',
          email: shop.email || '',
          website: shop.website || '',
          address: shop.address || '',
          description: shop.description || ''
        })
      }
      setLoading(false)
    }
    loadShopData()
  }, [id, router, supabase])

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMsg('')

    const response = await fetch('/api/vendor/edit', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...formData })
    })

    const result = await response.json()
    setSaving(false)
    if (result.success) {
      setStatusMsg('Storefront listing synchronized successfully!')
      setTimeout(() => setStatusMsg(''), 4000)
    } else {
      setStatusMsg(`Error: ${result.error}`)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600 h-8 w-8" /></div>
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-white border rounded-2xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Listing: {formData.name}</h1>
        <p className="text-sm text-gray-500 mb-6">Keep your contact lines current to ensure South African auto parts hunters can reach your yard directly.</p>

        {statusMsg && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 text-sm font-medium ${statusMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
            {!statusMsg.startsWith('Error') && <CheckCircle className="h-4 w-4" />}
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmission} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Landline Phone</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Alt Phone Line</label>
              <input type="text" value={formData.alt_number} onChange={e => setFormData({...formData, alt_number: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">WhatsApp Line</label>
              <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" placeholder="e.g. 0821234567" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Public Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Website URL</label>
              <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Physical Storefront Address</label>
            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={2} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Inventory Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} className="w-full border rounded-lg p-2.5 text-sm bg-white" placeholder="Specify engines break models, stripping options or shipping logistics..." />
          </div>

          <div className="border-t pt-6 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Listing Modifications
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
