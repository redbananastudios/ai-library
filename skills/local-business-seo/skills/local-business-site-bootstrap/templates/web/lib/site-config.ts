/**
 * Single source of truth for site-wide facts.
 *
 * RULE: anything that grows or changes (review count, years trading,
 * jobs completed) lives here. Never hardcode in customer-facing copy.
 *
 * RULE: address.full is for JSON-LD only. Customer-facing components
 * read address.display (recognised town + outward postcode).
 */

export const siteConfig = {
  brand: {
    name: 'PLACEHOLDER Brand',
    legalName: 'PLACEHOLDER Brand Ltd',
    companyNumber: 'TBC',
    foundingYear: undefined as number | undefined, // never claim a year you can't prove
  },

  url: {
    production: 'https://example.com',
    productionHost: 'example.com',
  },

  contact: {
    primaryPhone: '00000 000000',
    primaryPhoneHref: 'tel:+440000000000',
    secondaryPhone: undefined as string | undefined,
    secondaryPhoneHref: undefined as string | undefined,
    whatsapp: undefined as string | undefined, // e.g. '+447495835006'
    email: 'hello@example.com',
  },

  address: {
    /** JSON-LD only. Full street + 4-char inward postcode. */
    full: {
      streetAddress: 'TBC',
      addressLocality: 'TBC',
      addressRegion: 'TBC',
      postalCode: 'AA1 1AA',
      addressCountry: 'GB',
    },
    /** Customer-facing components use this. Recognised town + outward postcode. */
    display: 'Town, AA1',
  },

  /** Yard / second base, if applicable. Same display rule. */
  secondaryAddress: undefined as
    | {
        full: {
          streetAddress: string
          addressLocality: string
          addressRegion: string
          postalCode: string
          addressCountry: string
        }
        display: string
      }
    | undefined,

  social: {
    facebook: undefined as string | undefined,
    instagram: undefined as string | undefined,
    trustpilot: undefined as string | undefined,
    googleBusinessProfile: undefined as string | undefined,
    gbpPlaceId: undefined as string | undefined, // populate after GBP claimed
  },

  /** Aggregate review numbers. SSOT — feeds JSON-LD AND visible copy. */
  googleReviews: {
    count: 0,
    rating: 5.0,
  },

  /** Insurance / accreditations. Only set what you can prove. */
  trust: {
    publicLiabilityCover: undefined as string | undefined, // e.g. '£2,500,000'
    goodsInTransitCover: undefined as string | undefined, // e.g. '£50,000 per load'
    accreditations: [] as string[], // e.g. ['Checkatrade verified']
  },

  locale: 'en-GB' as const,
} as const

export const stripBrandSuffix = (title: string): string => {
  const brand = siteConfig.brand.name
  const patterns = [
    new RegExp(`\\s*[\\|—\\-–]\\s*${brand}\\s*$`, 'i'),
    new RegExp(`\\s*[\\|—\\-–]\\s*${brand.replace(/\s+/g, '\\s*')}\\s*$`, 'i'),
  ]
  let cleaned = title.trim()
  for (const re of patterns) cleaned = cleaned.replace(re, '').trim()
  return cleaned
}
