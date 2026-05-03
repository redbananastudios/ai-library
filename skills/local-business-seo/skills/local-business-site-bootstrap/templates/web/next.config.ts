import type { NextConfig } from 'next'

/**
 * Redirect manifest.
 *
 * RULE: every URL on the legacy site (WordPress, Squarespace, whatever)
 * must resolve 200 or 308 on the new site.
 *
 * Process:
 *   1. Fetch old sitemap → list of URLs
 *   2. For each, decide: keep (same path), 308 (renamed), or merge (multi-to-one)
 *   3. Add entry below
 *   4. Run scripts/test-redirects.mjs against Vercel preview before cutover
 */

const nextConfig: NextConfig = {
  redirects: async () => [
    // Example: old WP service URL → new clean URL
    // {
    //   source: '/house-removals-shaftesbury/',
    //   destination: '/services/house-removals/',
    //   permanent: true,
    // },
    // Example: old WP slug consolidation
    // {
    //   source: '/long-haul/:path*',
    //   destination: '/services/long-distance',
    //   permanent: true,
    // },
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },

  experimental: {
    // Tune as needed
  },
}

export default nextConfig
