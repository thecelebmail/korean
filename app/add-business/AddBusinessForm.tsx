'use client'

import { useState } from 'react'
import { AlertCircle, Building2, Loader2, Send } from 'lucide-react'

type SubmissionResponse = { success?: boolean; message?: string; error?: string; businessId?: string }
type FormValues = {
  name: string
  address: string
  city: string
  province: string
  phone: string
  alt_phone: string
  whatsapp: string
  email: string
  website: string
  description: string
  facebook: string
  instagram: string
  twitter: string
  youtube: string
  linkedin: string
  tiktok: string
}

const initialValues: FormValues = {
  name: '', address: '', city: '', province: '', phone: '', alt_phone: '', whatsapp: '',
  email: '', website: '', description: '', facebook: '', instagram: '', twitter: '',
  youtube: '', linkedin: '', tiktok: '',
}

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape',
]

const fields: Array<{ name: keyof FormValues; label: string; type?: string; placeholder?: string; required?: boolean; maxLength?: number }> = [
  { name: 'name', label: 'Business name', required: true, maxLength: 160, placeholder: 'e.g. ABC Korean Motor Spares' },
  { name: 'address', label: 'Street address', maxLength: 500, placeholder: 'Shop number, street and suburb' },
  { name: 'phone', label: 'Main phone number', maxLength: 40, placeholder: 'e.g. 011 123 4567' },
  { name: 'alt_phone', label: 'Alternative phone number', maxLength: 40 },
  { name: 'whatsapp', label: 'WhatsApp number', maxLength: 40 },
  { name: 'email', label: 'Business email', type: 'email', maxLength: 254, placeholder: 'name@business.co.za' },
  { name: 'website', label: 'Website', type: 'url', maxLength: 500, placeholder: 'https://example.co.za' },
]

const socialFields: Array<{ name: keyof FormValues; label: string; placeholder: string }> = [
  { name: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/your-business' },
  { name: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/your-business' },
  { name: 'twitter', label: 'X / Twitter URL', placeholder: 'https://x.com/your-business' },
  { name: 'youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@your-business' },
  { name: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/company/your-business' },
  { name: 'tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@your-business' },
]

export default function AddBusinessForm({ userEmail }: { userEmail: string }) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage('')
    setSuccess(false)

    try {
      const response = await fetch('/api/business-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const result: SubmissionResponse = await response.json()
      if (!response.ok || !result.success) {
        setMessage(result.error || 'We could not submit your business. Please check the details and try again.')
        return
      }
      setSuccess(true)
      setMessage(result.message || 'Your business was submitted for review. You can track it in your dashboard.')
      setValues(initialValues)
    } catch {
      setMessage('Network error. Please check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
  const labelClass = 'block text-sm font-medium text-gray-800'

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      <div className="border-b pb-5">
        <h2 className="text-lg font-semibold text-gray-900">Business details</h2>
        <p className="mt-1 text-sm text-gray-500">Fields marked with * are required. Use accurate information so customers can contact you.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {fields.slice(0, 2).map((field) => (
            <div key={field.name} className={field.name === 'name' || field.name === 'address' ? 'sm:col-span-2' : ''}>
              <label className={labelClass} htmlFor={field.name}>{field.label}{field.required ? ' *' : ''}</label>
              <input id={field.name} name={field.name} type={field.type ?? 'text'} required={field.required} maxLength={field.maxLength} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} className={inputClass} autoComplete="organization" />
            </div>
          ))}
          <div>
            <label className={labelClass} htmlFor="city">City or town *</label>
            <input id="city" name="city" required maxLength={120} value={values.city} onChange={(event) => update('city', event.target.value)} placeholder="e.g. Johannesburg" className={inputClass} autoComplete="address-level2" />
          </div>
          <div>
            <label className={labelClass} htmlFor="province">Province *</label>
            <select id="province" name="province" required value={values.province} onChange={(event) => update('province', event.target.value)} className={inputClass}>
              <option value="">Select province</option>
              {provinces.map((province) => <option key={province} value={province}>{province}</option>)}
            </select>
          </div>
          {fields.slice(2).map((field) => (
            <div key={field.name}>
              <label className={labelClass} htmlFor={field.name}>{field.label}</label>
              <input id={field.name} name={field.name} type={field.type ?? 'text'} maxLength={field.maxLength} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} className={inputClass} autoComplete={field.name === 'email' ? 'email' : 'off'} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-b pb-5">
        <h2 className="text-lg font-semibold text-gray-900">Business description</h2>
        <label className={`${labelClass} mt-4`} htmlFor="description">What do you sell or specialise in?</label>
        <textarea id="description" name="description" rows={4} maxLength={3000} value={values.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe your motor spares, vehicle makes supported, parts and services." className={inputClass} />
        <p className="mt-1 text-right text-xs text-gray-500">{values.description.length}/3000</p>
      </div>

      <div className="border-b pb-5">
        <h2 className="text-lg font-semibold text-gray-900">Social media (optional)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {socialFields.map((field) => (
            <div key={field.name}>
              <label className={labelClass} htmlFor={field.name}>{field.label}</label>
              <input id={field.name} name={field.name} type="url" maxLength={500} value={values[field.name]} onChange={(event) => update(field.name, event.target.value)} placeholder={field.placeholder} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="flex items-start gap-2 text-sm text-gray-700"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" /><span>The submission will be associated with the signed-in account ({userEmail}). It will remain unpublished until the administrator reviews it. Approval will connect the listing to your dashboard for editing.</span></p>
      </div>

      <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? 'Submitting business…' : 'Submit business for review'}
      </button>

      {message && <div role="status" aria-live="polite" className={`flex items-start gap-2 rounded-lg border p-4 text-sm ${success ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        {success ? <CheckCircle2Icon /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>{message}</span>
      </div>}
      <p className="text-xs leading-5 text-gray-500">By submitting, you confirm that you are authorised to submit these business details. Do not submit private information that should not appear in a public directory.</p>
    </form>
  )
}

function CheckCircle2Icon() {
  return <span aria-hidden="true" className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-700 text-[10px] font-bold text-white">✓</span>
}
