/**
 * Root layout — emits the global schema graph on every page:
 *   - Organization (#organization, all inbound refs resolve here)
 *   - Person (#person, owner — required for E-E-A-T)
 *   - WebSite (#website, sitelinks search box eligible)
 *
 * Per-page schemas (Service, BlogPosting, BreadcrumbList) are emitted
 * by the page templates themselves.
 */

import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site-config'
import { robotsMetadata } from '@/lib/seo/canonical'
import {
  organizationSchema,
  personSchema,
  websiteSchema,
  type PersonInput,
} from '@/lib/schema/jsonld'
import { getOwnerPerson } from '@/lib/sanity/queries'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url.production),
  title: {
    default: `${siteConfig.brand.name} — ${siteConfig.address.display}`,
    template: `%s | ${siteConfig.brand.name}`,
  },
  robots: robotsMetadata(),
  alternates: {
    canonical: '/',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const owner: PersonInput | null = await getOwnerPerson().catch(() => null)

  return (
    <html lang={siteConfig.locale}>
      <body>
        {organizationSchema()}
        {websiteSchema()}
        {owner ? personSchema(owner) : null}
        {children}
      </body>
    </html>
  )
}
