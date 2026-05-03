/**
 * Edge middleware: forces X-Robots-Tag: noindex, nofollow on every
 * non-canonical hostname (Vercel previews, branch deploys, *.vercel.app).
 *
 * Belt-and-braces: the canonical.ts gate sets noindex via meta tag.
 * This middleware sets it via HTTP header. Either alone is sufficient;
 * both together prevents any single point of failure from indexing
 * preview URLs.
 *
 * Matcher includes text-based meta files because llms.txt and
 * llms-full.txt are routes that wouldn't otherwise pick up the
 * X-Robots-Tag header.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { siteConfig } from '@/lib/site-config'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const host = req.headers.get('host') ?? ''
  const isCanonical = host === siteConfig.url.productionHost
  const indexingEnabled = process.env.INDEXING_ENABLED === 'true'

  if (!isCanonical || !indexingEnabled) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return res
}

export const config = {
  matcher: [
    // All pages
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Plus text-based meta files
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/llms-full.txt',
  ],
}
