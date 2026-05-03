#!/usr/bin/env node
/**
 * Seed singletons + owner author doc into Sanity.
 *
 * Re-runnable: uses hardcoded _ids so repeat invocations patch rather
 * than duplicate.
 *
 * Usage:
 *   node --env-file=web/.env.local scripts/seed-cms.mjs
 *
 * Required env:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET (default 'production')
 *   SANITY_WRITE_TOKEN
 *
 * Edit the SEED object below to match the project facts before running.
 */

import { createClient } from '@sanity/client'

// ─────────────────────────────────────────────────────────────────────
// EDIT THIS for the project being seeded
// ─────────────────────────────────────────────────────────────────────

const SEED = {
  siteSettings: {
    brandName: 'PLACEHOLDER Brand',
    legalName: 'PLACEHOLDER Brand Ltd',
    companyNumber: 'TBC',
    foundingYear: undefined,
    primaryPhone: '00000 000000',
    secondaryPhone: undefined,
    whatsapp: undefined,
    email: 'hello@example.com',
    displayAddress: 'Town, AA1',
    primaryAddress: {
      _type: 'address',
      streetAddress: 'TBC',
      addressLocality: 'TBC',
      addressRegion: 'TBC',
      postalCode: 'AA1 1AA',
      addressCountry: 'GB',
    },
    socialLinks: {
      _type: 'socialLinks',
      facebook: undefined,
      instagram: undefined,
      trustpilot: undefined,
      googleBusinessProfile: undefined,
      gbpPlaceId: undefined,
    },
    reviewCount: 0,
    reviewRating: 5.0,
  },

  tracking: {
    gtmId: undefined,
    ga4Id: undefined,
    metaPixelId: undefined,
    plausibleDomain: undefined,
  },

  nav: {
    primary: [
      { _key: 'home', label: 'Home', href: '/' },
      { _key: 'services', label: 'Services', href: '/services' },
      { _key: 'areas', label: 'Areas', href: '/areas' },
      { _key: 'about', label: 'About', href: '/about' },
      { _key: 'reviews', label: 'Reviews', href: '/reviews' },
      { _key: 'contact', label: 'Contact', href: '/contact' },
    ],
    footerSections: [
      {
        _key: 'company',
        heading: 'Company',
        items: [
          { _key: 'a', label: 'About', href: '/about' },
          { _key: 'b', label: 'Reviews', href: '/reviews' },
          { _key: 'c', label: 'FAQs', href: '/faqs' },
        ],
      },
      {
        _key: 'legal',
        heading: 'Legal',
        items: [
          { _key: 'a', label: 'Privacy', href: '/privacy-policy' },
          { _key: 'b', label: 'Terms', href: '/terms-conditions' },
        ],
      },
    ],
  },

  ownerAuthor: {
    name: 'PLACEHOLDER Owner Name',
    isOwner: true,
    jobTitle: 'Owner',
    knowsAbout: ['service area 1', 'service area 2', 'service area 3'],
    bio: 'PLACEHOLDER bio — one short paragraph (~40 words) about the owner and the business.',
  },
}

// ─────────────────────────────────────────────────────────────────────
// Driver — usually no need to edit below this line
// ─────────────────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-12-01',
  token,
  useCdn: false,
})

const upsertSingleton = async (id, type, data) => {
  await client.createOrReplace({ _id: id, _type: type, ...data })
  console.log(`✓ upserted ${type} (${id})`)
}

const main = async () => {
  await upsertSingleton('siteSettings', 'siteSettings', SEED.siteSettings)
  await upsertSingleton('tracking', 'tracking', SEED.tracking)
  await upsertSingleton('nav', 'nav', SEED.nav)
  await upsertSingleton('author-owner', 'author', SEED.ownerAuthor)
  console.log('\nDone. Open Sanity Studio to fill in the placeholders.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
