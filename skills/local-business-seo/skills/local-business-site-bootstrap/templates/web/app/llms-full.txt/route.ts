/**
 * /llms-full.txt — full text corpus for LLMs.
 *
 * Includes service pages, area pages, insights, FAQs in plain text.
 * Updated on every revalidation. ~50–500KB depending on site size.
 */

import { siteConfig } from '@/lib/site-config'
import {
  getAllAreasFull,
  getAllServicesFull,
  getAllInsightsFull,
  getAllFaqs,
} from '@/lib/sanity/queries'
import { portableTextToPlain } from '@/lib/sanity/portable-text-plain'

export const revalidate = 3600

export async function GET() {
  const [areas, services, insights, faqs] = await Promise.all([
    getAllAreasFull(),
    getAllServicesFull(),
    getAllInsightsFull(),
    getAllFaqs(),
  ])

  const lines: string[] = []
  const push = (s = '') => lines.push(s)

  push(`# ${siteConfig.brand.name} — Full Content`)
  push()
  push(`Source: ${siteConfig.url.production}`)
  push(`Generated: ${new Date().toISOString()}`)
  push()

  push('## About')
  push()
  push(`${siteConfig.brand.legalName} provides services across ${siteConfig.address.display} and surrounding areas.`)
  if (siteConfig.brand.companyNumber !== 'TBC') {
    push(`Companies House registration: ${siteConfig.brand.companyNumber}.`)
  }
  push(`Phone: ${siteConfig.contact.primaryPhone}. Email: ${siteConfig.contact.email}.`)
  push()

  push('## Services')
  push()
  for (const s of services) {
    push(`### ${s.title}`)
    push()
    push(s.summary)
    push()
    if (s.body) {
      push(portableTextToPlain(s.body))
      push()
    }
  }

  push('## Areas covered')
  push()
  for (const a of areas) {
    push(`### ${a.title}`)
    push()
    push(a.summary)
    push()
    if (a.body) {
      push(portableTextToPlain(a.body))
      push()
    }
  }

  if (faqs.length) {
    push('## FAQs')
    push()
    for (const f of faqs) {
      push(`### ${f.question}`)
      push()
      push(f.answer)
      push()
    }
  }

  if (insights.length) {
    push('## Insights')
    push()
    for (const p of insights) {
      push(`### ${p.title}`)
      push()
      if (p.summary) {
        push(p.summary)
        push()
      }
      if (p.body) {
        push(portableTextToPlain(p.body))
        push()
      }
    }
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
