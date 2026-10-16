
import { NextRequest, NextResponse } from 'next/server'

const BLOCKED_COUNTRIES = new Set(['CN', 'SG'])

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vercel supplies this country code from the visitor's IP.
  const country = request.headers
    .get('x-vercel-ip-country')
    ?.toUpperCase()

  // If location is unknown, don't accidentally block everyone.
  if (!country || !BLOCKED_COUNTRIES.has(country)) {
    return NextResponse.next()
  }

  // Let the restriction page render without a rewrite loop.
  if (pathname === '/blocked') {
    return NextResponse.next()
  }

  // Block restricted-country API requests rather than serving HTML.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Access restricted.' },
      {
        status: 403,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  // Show a restriction notice for website pages.
  const url = request.nextUrl.clone()
  url.pathname = '/blocked'
  url.search = ''

  return NextResponse.rewrite(url, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
