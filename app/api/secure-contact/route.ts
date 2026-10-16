
import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_COUNTRIES = new Set(['CN', 'SG'])
const MAX_MESSAGE_LENGTH = 3000
const MAX_REQUEST_BYTES = 12_000

export async function POST(request: NextRequest) {
  // Enforce the country restriction independently.
  const country = request.headers
    .get('x-vercel-ip-country')
    ?.toUpperCase()

  if (country && BLOCKED_COUNTRIES.has(country)) {
    return NextResponse.json(
      { error: 'Access restricted.' },
      { status: 403 }
    )
  }

  // Accept standard browser form submissions only.
  const contentType = request.headers.get('content-type') ?? ''

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Invalid content type.' },
      { status: 415 }
    )
  }

  const contentLength = Number(
    request.headers.get('content-length') ?? '0'
  )

  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: 'Submission is too large.' },
      { status: 413 }
    )
  }

  try {
    const formData = await request.formData()

    const honeypot = formData.get('website_hp')
    const email = formData.get('email')
    const message = formData.get('message')

    // Silently discard likely bot submissions.
    if (typeof honeypot === 'string' && honeypot.trim()) {
      return NextResponse.json({ success: true })
    }

    if (
      typeof email !== 'string' ||
      typeof message !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Email and message are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim()
    const cleanMessage = message.trim()

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      )
    }

    if (
      cleanMessage.length < 10 ||
      cleanMessage.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 3000 characters.' },
        { status: 400 }
      )
    }

    // No email service or database storage is configured.
    // Do not claim that the message has been delivered.
    return NextResponse.json(
      {
        success: false,
        message:
          'Your details were validated, but message delivery is not currently available. Please contact the website administrator directly.',
      },
      { status: 503 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid submission.' },
      { status: 400 }
    )
  }
}
