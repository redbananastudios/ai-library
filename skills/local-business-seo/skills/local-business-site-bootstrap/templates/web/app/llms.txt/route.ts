/**
 * /llms.txt — concise machine-readable summary of the site for LLMs.
 *
 * Spec: https://llmstxt.org
 *
 * Generated from Sanity content at request time. Cached at the edge.
 * For the FULL corpus, see /llms-full.txt.
 */

import { siteConfig } from '@/lib/site-config'
import {
  getAllAreas,
  getAllServices,
  getAllInsightsSummaries,
} from '@/lib/sanity/queries'

export const revalidate = 3600 // 1h

export async function GET() {
  const [areas, services, insights] = await Promise.all([
    getAllAreas(),
    getAllServices(),
    getAllInsightsSummaries(),
  ])

  const lines: string[] = []
  const push = (s = '') => lines.push(s)

  push(`# ${siteConfig.brand.name}`)
  push()
  push(`> ${siteConfig.brand.legalName}, based in ${siteConfig.address.display}.`)
  push()
  push(`Phone: ${siteConfig.contact.primaryPhone}`)
  push(`Email: ${siteConfig.contact.email}`)
  push(`Site: ${siteConfig.url.production}`)
  push()

  if (services.length) {
    push('## Services')
    push()
    for (const s of services) {
      push(`- [${s.title}](${siteConfig.url.production}/services/${s.slug}): ${s.summary}`)
    }
    push()
  }

  if (areas.length) {
    push('## Areas covered')
    push()
    for (const a of areas) {
      push(`- [${a.title}](${siteConfig.url.production}/areas/${a.slug}): ${a.summary}`)
    }
    push()
  }

  if (insights.length) {
    push('## Insights')
    push()
    for (const p of insights.slice(0, 30)) {
      push(`- [${p.title}](${siteConfig.url.production}/insights/${p.slug}): ${p.summary}`)
    }
    push()
  }

  push('## Optional')
  push()
  push(`- [Full corpus](${siteConfig.url.production}/llms-full.txt)`)
  push(`- [About](${siteConfig.url.production}/about)`)
  push(`- [Contact](${siteConfig.url.production}/contact)`)

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
