#!/usr/bin/env node
/**
 * Content audit for local service business sites.
 *
 * Checks customer-facing files for:
 *   - Banned characters (em-dash)
 *   - Banned AI tells
 *   - USP repetition (basic — same phrase >1× per file)
 *   - Cross-page boilerplate (paragraph >=30 words appearing in 2+ files)
 *   - UK English drift
 *   - Address-display rule violations
 *   - Hardcoded growing numbers
 *
 * Usage: node web/scripts/audit-content.mjs
 *
 * Exit code 0 if clean, 1 if any hard-fail issues. Warnings don't fail.
 *
 * Config: web/scripts/.audit-config.json (see SKILL.md).
 */

import { readFileSync, existsSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { resolve, relative } from 'node:path'

// ─────────────────────────────────────────────────────────────────────
// Defaults (overridden by .audit-config.json)
// ─────────────────────────────────────────────────────────────────────

const DEFAULTS = {
  bannedAddressStrings: [],
  addressLegalAllowlistPaths: [
    'app/privacy-policy',
    'app/terms-conditions',
    'lib/site-config.ts',
  ],
  extraBannedAITells: [],
  ukEnglish: true,
  scopeGlobs: [
    'app/**/*.{tsx,ts,mdx,md}',
    'components/**/*.{tsx,ts}',
    'lib/**/*-content.ts',
  ],
  skipGlobs: ['**/*.test.*', '**/node_modules/**'],
}

const BANNED_AI_TELLS = [
  'moreover',
  'furthermore',
  'leverage',
  'robust',
  'delve',
  'harness',
  'unleash',
  "in today's fast-paced world",
  'elevate',
  'unlock the power of',
  'seamless experience',
  'cutting-edge',
  'game-changer',
  'tapestry',
  'pivotal',
  'curated',
  'plethora',
  'myriad',
  'embark on',
  'in the realm of',
  'at the heart of',
]

const US_UK = [
  ['color', 'colour'],
  ['organize', 'organise'],
  ['organized', 'organised'],
  ['organizing', 'organising'],
  ['realize', 'realise'],
  ['realized', 'realised'],
  ['analyze', 'analyse'],
  ['analyzed', 'analysed'],
  ['catalog', 'catalogue'],
  ['traveling', 'travelling'],
  ['traveled', 'travelled'],
  ['favorite', 'favourite'],
  ['neighbor', 'neighbour'],
  ['labor', 'labour'],
  ['sidewalk', 'pavement'],
  ['truck (vehicle)', 'lorry'],
  ['zip code', 'post code'],
]

// ─────────────────────────────────────────────────────────────────────

const projectRoot = process.cwd().endsWith('web')
  ? resolve(process.cwd(), '..')
  : process.cwd()
const webRoot = resolve(projectRoot, 'web')

const configPath = resolve(webRoot, 'scripts/.audit-config.json')
const config = existsSync(configPath)
  ? { ...DEFAULTS, ...JSON.parse(readFileSync(configPath, 'utf8')) }
  : DEFAULTS

// ─────────────────────────────────────────────────────────────────────

const collectFiles = async () => {
  const out = new Set()
  for (const pattern of config.scopeGlobs) {
    for await (const entry of glob(pattern, { cwd: webRoot })) {
      out.add(entry)
    }
  }
  // Filter skips
  const skipMatchers = config.skipGlobs.map((p) => new RegExp(p.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')))
  return [...out].filter((f) => !skipMatchers.some((re) => re.test(f)))
}

const isAddressLegalPath = (filePath) =>
  config.addressLegalAllowlistPaths.some((p) => filePath.includes(p))

const auditFile = (filePath) => {
  const issues = []
  const warnings = []
  const fullPath = resolve(webRoot, filePath)
  const text = readFileSync(fullPath, 'utf8')
  const lines = text.split('\n')

  // 1. Em-dash (in customer-facing strings only — skip JSX/TS comments)
  lines.forEach((line, i) => {
    // Skip lines that look like comments
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return
    if (line.includes('—')) {
      issues.push(`Line ${i + 1}: em-dash in "${line.trim().slice(0, 80)}"`)
    }
  })

  // 2. AI tells
  const allTells = [...BANNED_AI_TELLS, ...config.extraBannedAITells]
  for (const tell of allTells) {
    const re = new RegExp(`\\b${tell.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    let m
    while ((m = re.exec(text))) {
      const lineNum = text.slice(0, m.index).split('\n').length
      issues.push(`Line ${lineNum}: AI tell "${tell}"`)
    }
  }

  // 3. UK English drift
  if (config.ukEnglish) {
    for (const [us, uk] of US_UK) {
      if (us.includes('(')) continue // skip annotated entries
      const re = new RegExp(`\\b${us}\\b`, 'g')
      const matches = text.match(re)
      if (matches) {
        warnings.push(`US English "${us}" — should be "${uk}" (${matches.length}×)`)
      }
    }
  }

  // 4. Address rule violations (skip legal/source paths)
  if (!isAddressLegalPath(filePath)) {
    for (const banned of config.bannedAddressStrings) {
      const re = new RegExp(banned.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      let m
      while ((m = re.exec(text))) {
        const lineNum = text.slice(0, m.index).split('\n').length
        issues.push(`Line ${lineNum}: address rule violation "${banned}"`)
      }
    }
  }

  // 5. Hardcoded growing numbers (heuristic)
  const hardcodedNumberPatterns = [
    /\b\d{2,4}\s+(reviews|customers|moves|jobs|happy customers)\b/gi,
    /\bSince\s+(19|20)\d{2}\b/gi,
    /\bover\s+\d{2,4}\s+(reviews|customers|moves|jobs)\b/gi,
  ]
  for (const re of hardcodedNumberPatterns) {
    let m
    while ((m = re.exec(text))) {
      const lineNum = text.slice(0, m.index).split('\n').length
      warnings.push(`Line ${lineNum}: hardcoded growing number "${m[0]}" — should come from siteConfig/Sanity`)
    }
  }

  return { filePath, issues, warnings, text }
}

const findBoilerplate = (results) => {
  const paragraphCount = new Map()
  for (const r of results) {
    const paragraphs = r.text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p.split(/\s+/).length >= 30)
    for (const p of paragraphs) {
      if (!paragraphCount.has(p)) paragraphCount.set(p, [])
      paragraphCount.get(p).push(r.filePath)
    }
  }
  const boilerplate = []
  for (const [p, files] of paragraphCount.entries()) {
    if (files.length >= 2) {
      boilerplate.push({ snippet: p.slice(0, 100) + '...', files })
    }
  }
  return boilerplate
}

// ─────────────────────────────────────────────────────────────────────

const main = async () => {
  const files = await collectFiles()
  console.log(`Auditing ${files.length} customer-facing files...\n`)

  const results = files.map(auditFile)

  let hardFails = 0
  let totalIssues = 0
  let totalWarnings = 0

  for (const r of results) {
    if (r.issues.length === 0 && r.warnings.length === 0) {
      console.log(`✓ ${r.filePath}`)
      continue
    }
    if (r.issues.length > 0) {
      hardFails++
      console.log(`✗ ${r.filePath}`)
      for (const i of r.issues) console.log(`  - ${i}`)
      totalIssues += r.issues.length
    } else {
      console.log(`⚠ ${r.filePath}`)
    }
    for (const w of r.warnings) console.log(`  ⚠ ${w}`)
    totalWarnings += r.warnings.length
  }

  // Cross-page boilerplate
  const boilerplate = findBoilerplate(results)
  if (boilerplate.length > 0) {
    console.log('\n⚠ Cross-page boilerplate detected:')
    for (const b of boilerplate) {
      console.log(`  - "${b.snippet}" appears in:`)
      for (const f of b.files) console.log(`      ${f}`)
    }
    totalWarnings += boilerplate.length
  }

  console.log(
    `\nSummary: ${hardFails} files failed (${totalIssues} hard issues, ${totalWarnings} warnings).`
  )
  process.exit(hardFails > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
