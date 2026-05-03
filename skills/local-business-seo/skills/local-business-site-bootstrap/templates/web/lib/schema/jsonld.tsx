/**
 * JSON-LD schema graph for a local service business.
 *
 * Architecture (the WHY):
 *
 * - ONE Organization node (`#organization`). All inbound refs point here.
 *   Never duplicate per area or per service.
 * - ONE Person node for the owner (`#person`), emitted globally from
 *   layout.tsx so its @id resolves on every page.
 * - Service nodes per area/town (`provider: { @id: #organization }`,
 *   `areaServed: { @type: City, name: ... }`). NOT duplicate
 *   LocalBusiness nodes per area.
 * - Review nodes back the AggregateRating on Organization. Each visible
 *   review on the /reviews page emits its own Review JSON-LD.
 * - BreadcrumbList JSON-LD comes from the visible <Breadcrumbs>
 *   component (single source of truth — visible nav and structured
 *   breadcrumbs cannot drift).
 * - BlogPosting per blog post with author ref → #person, publisher
 *   ref → #organization.
 *
 * Anti-patterns this prevents:
 * - Duplicate LocalBusiness/MovingCompany per area (Marley shipped this
 *   initially with 16 competing entities for one physical business).
 * - Orphan Organization node alongside LocalBusiness (had two #org-*
 *   entities on Marley pre-consolidation).
 * - AggregateRating without backing Review entities (looks
 *   unverifiable to Google).
 */

import { siteConfig } from '@/lib/site-config'

const ORG_ID = `${siteConfig.url.production}/#organization`
const PERSON_ID = `${siteConfig.url.production}/#person`
const WEBSITE_ID = `${siteConfig.url.production}/#website`

type JsonLd = Record<string, unknown>

const renderJsonLd = (data: JsonLd | JsonLd[]) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
)

/* ─────────────────────────────────────────────────────────
 * Organization (the canonical entity, emitted on every page)
 * ───────────────────────────────────────────────────────── */

export const organizationSchema = () => {
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': ORG_ID,
    name: siteConfig.brand.name,
    legalName: siteConfig.brand.legalName,
    url: siteConfig.url.production,
    telephone: siteConfig.contact.primaryPhone,
    email: siteConfig.contact.email,
    address: {
      '@type': 'PostalAddress',
      ...siteConfig.address.full,
    },
    founder: { '@id': PERSON_ID },
    knowsAbout: [], // populate from services array if useful
    sameAs: [
      siteConfig.social.facebook,
      siteConfig.social.instagram,
      siteConfig.social.trustpilot,
      siteConfig.social.googleBusinessProfile,
    ].filter(Boolean),
  }

  if (siteConfig.brand.companyNumber && siteConfig.brand.companyNumber !== 'TBC') {
    data.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'Companies House',
      value: siteConfig.brand.companyNumber,
    }
  }

  if (siteConfig.brand.foundingYear) {
    data.foundingDate = String(siteConfig.brand.foundingYear)
  }

  if (siteConfig.googleReviews.count > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: siteConfig.googleReviews.rating,
      reviewCount: siteConfig.googleReviews.count,
    }
  }

  return renderJsonLd(data)
}

/* ─────────────────────────────────────────────────────────
 * Person (owner — emitted globally for E-E-A-T)
 * ───────────────────────────────────────────────────────── */

export type PersonInput = {
  name: string
  jobTitle: string
  knowsAbout: string[]
  image?: string
  bio?: string
}

export const personSchema = (person: PersonInput) =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    jobTitle: person.jobTitle,
    knowsAbout: person.knowsAbout,
    image: person.image,
    description: person.bio,
    worksFor: { '@id': ORG_ID },
  })

/* ─────────────────────────────────────────────────────────
 * WebSite (sitelinks search box eligibility)
 * ───────────────────────────────────────────────────────── */

export const websiteSchema = () =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteConfig.url.production,
    name: siteConfig.brand.name,
    publisher: { '@id': ORG_ID },
  })

/* ─────────────────────────────────────────────────────────
 * Service per area (NOT a duplicate LocalBusiness)
 * ───────────────────────────────────────────────────────── */

export type AreaServiceInput = {
  serviceType: string
  cityName: string
  cityRegion?: string
  description: string
  url: string
}

export const areaServiceSchema = (input: AreaServiceInput) =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: input.serviceType,
    provider: { '@id': ORG_ID },
    areaServed: {
      '@type': 'City',
      name: input.cityName,
      ...(input.cityRegion ? { containedInPlace: { '@type': 'AdministrativeArea', name: input.cityRegion } } : {}),
    },
    description: input.description,
    url: input.url,
  })

/* ─────────────────────────────────────────────────────────
 * Review (one per visible review on the /reviews page)
 * ───────────────────────────────────────────────────────── */

export type ReviewInput = {
  authorName: string
  rating: number // 1–5
  body: string
  datePublished?: string
}

export const reviewSchema = (review: ReviewInput) =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: { '@id': ORG_ID },
    author: { '@type': 'Person', name: review.authorName },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
      bestRating: 5,
    },
    reviewBody: review.body,
    ...(review.datePublished ? { datePublished: review.datePublished } : {}),
    publisher: { '@id': ORG_ID },
  })

/* ─────────────────────────────────────────────────────────
 * BlogPosting (per /insights/[slug] post)
 * ───────────────────────────────────────────────────────── */

export type BlogPostingInput = {
  url: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  image?: string
  articleSection?: string
  keywords?: string[]
}

export const blogPostingSchema = (post: BlogPostingInput) =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
    headline: post.headline,
    description: post.description,
    image: post.image,
    datePublished: post.datePublished,
    dateModified: post.dateModified ?? post.datePublished,
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    ...(post.articleSection ? { articleSection: post.articleSection } : {}),
    ...(post.keywords && post.keywords.length ? { keywords: post.keywords.join(', ') } : {}),
  })

/* ─────────────────────────────────────────────────────────
 * FAQPage (inline FAQs on any page)
 * ───────────────────────────────────────────────────────── */

export type FaqItem = { question: string; answer: string }

export const faqPageSchema = (faqs: FaqItem[]) =>
  renderJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  })
