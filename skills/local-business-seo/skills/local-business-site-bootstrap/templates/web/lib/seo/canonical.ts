/**
 * Canonical hostname enforcement + INDEXING_ENABLED gate.
 *
 * The site ships `index, follow` ONLY when:
 *   1. We're on the canonical production hostname, AND
 *   2. INDEXING_ENABLED env var equals 'true'
 *
 * Both conditions must be met. Vercel previews fail (1).
 * Production deploys before cutover fail (2) — set INDEXING_ENABLED=true
 * in Vercel Production env at the moment of cutover, never before.
 *
 * Without this, Vercel previews can leak into Google's index, and
 * unprepared production deploys can deindex an otherwise live site.
 */

import { siteConfig } from '@/lib/site-config'
import type { Metadata } from 'next'

const CANONICAL_HOST = siteConfig.url.productionHost

/** True only when this build is the live canonical site. */
export const isCanonicalDeploy = (): boolean => {
  if (process.env.INDEXING_ENABLED !== 'true') return false
  if (process.env.VERCEL_ENV !== undefined && process.env.VERCEL_ENV !== 'production') return false
  if (process.env.VERCEL_URL && !process.env.VERCEL_URL.endsWith(CANONICAL_HOST)) return false
  return true
}

/** Returns Metadata.robots that defaults to noindex unless canonical. */
export const robotsMetadata = (): Metadata['robots'] => {
  if (isCanonicalDeploy()) {
    return {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    }
  }
  return {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  }
}

/** Canonical URL for a given path. */
export const canonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url.production}${cleanPath}`
}
