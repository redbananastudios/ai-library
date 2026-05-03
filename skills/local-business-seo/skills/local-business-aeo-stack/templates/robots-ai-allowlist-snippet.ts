/**
 * Drop-in snippet for `app/robots.ts` if retrofitting onto an existing
 * Next.js project. Returns the AI crawler allow rules to spread into
 * an existing rules array.
 *
 * Usage:
 *   import { aiCrawlerAllowRules } from './_aeo-snippet'
 *   export default function robots(): MetadataRoute.Robots {
 *     return {
 *       rules: [
 *         { userAgent: '*', allow: '/' },
 *         ...aiCrawlerAllowRules,
 *       ],
 *       sitemap: 'https://yoursite.com/sitemap.xml',
 *     }
 *   }
 */

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-Web',
  'Google-Extended',
  'Applebot-Extended',
] as const

export const aiCrawlerAllowRules = AI_CRAWLERS.map((bot) => ({
  userAgent: bot,
  allow: '/',
}))
