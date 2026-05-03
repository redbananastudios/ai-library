/**
 * robots.txt with explicit AI crawler allowlist.
 *
 * WHY explicit: default `User-agent: *` is enough for most, but explicit
 * `allow` rules per AI bot signal intent and protect against the bots
 * changing their default behaviour. We want our content cited in
 * ChatGPT, Claude, Perplexity, Google AI Overviews, Apple Intelligence.
 */

import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { isCanonicalDeploy } from '@/lib/seo/canonical'

const AI_CRAWLERS = [
  'GPTBot',          // OpenAI training
  'OAI-SearchBot',   // OpenAI search index
  'ChatGPT-User',    // ChatGPT browsing
  'PerplexityBot',   // Perplexity
  'ClaudeBot',       // Anthropic training
  'Claude-Web',      // Claude browsing
  'Google-Extended', // Bard / Gemini training opt-in
  'Applebot-Extended', // Apple Intelligence
] as const

export default function robots(): MetadataRoute.Robots {
  // On non-canonical deploys (Vercel preview, branch deploys), block everything.
  if (!isCanonicalDeploy()) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: undefined,
      host: undefined,
    }
  }

  return {
    rules: [
      // Default: allow all crawlers, exclude API + Next internals
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Explicit AI crawler allows (signal intent)
      ...AI_CRAWLERS.map((bot) => ({
        userAgent: bot,
        allow: '/',
      })),
    ],
    sitemap: `${siteConfig.url.production}/sitemap.xml`,
    host: siteConfig.url.productionHost,
  }
}
