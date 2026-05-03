/**
 * Breadcrumbs — emits BOTH the visible nav AND the BreadcrumbList JSON-LD.
 *
 * RULE: this is the single source of truth for breadcrumbs. Page templates
 * must NOT call a separate breadcrumbListSchema() helper. Visible
 * breadcrumbs and structured-data breadcrumbs cannot be allowed to drift —
 * Google validates that they match.
 *
 * Marley shipped this fix mid-project (TASK 3 in session 7) after Google
 * Search Console flagged drift between the visible nav and the
 * page-level JSON-LD emit.
 */

import Link from 'next/link'
import { siteConfig } from '@/lib/site-config'

export type Crumb = {
  /** Visible label */
  label: string
  /** Path, e.g. '/services/house-removals'. Omit on the current page. */
  href?: string
}

type Props = {
  /** First crumb is always Home — provide the rest. */
  trail: Crumb[]
}

export function Breadcrumbs({ trail }: Props) {
  const fullTrail: Crumb[] = [{ label: 'Home', href: '/' }, ...trail]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: fullTrail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteConfig.url.production}${c.href}` } : {}),
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          {fullTrail.map((c, i) => {
            const isLast = i === fullTrail.length - 1
            return (
              <li key={i} className="flex items-center gap-2">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined}>{c.label}</span>
                )}
                {!isLast && <span aria-hidden="true">/</span>}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
