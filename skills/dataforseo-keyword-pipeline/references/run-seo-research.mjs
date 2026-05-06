#!/usr/bin/env node
// Marley Moves — DataForSEO research runner
// Usage:
//   node scripts/run-seo-research.mjs <phase> [--dry-run]
//   phases: keywords | serp | mappack | briefs | summary | all

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CACHE_DIR = join(ROOT, "cache");
const BRIEF_DIR = join(ROOT, "content-briefs");

const LOGIN = process.env.DATAFORSEO_LOGIN;
const PASSWORD = process.env.DATAFORSEO_PASSWORD;

const LOCATION_CODE = 2826; // United Kingdom
const LANGUAGE_CODE = "en";

const TOWNS = [
  { slug: "gillingham",     name: "Gillingham" },
  { slug: "shaftesbury",    name: "Shaftesbury" },
  { slug: "sherborne",      name: "Sherborne" },
  { slug: "yeovil",         name: "Yeovil" },
  { slug: "warminster",     name: "Warminster" },
  { slug: "wincanton",      name: "Wincanton" },
  { slug: "mere",           name: "Mere" },
  { slug: "bruton",         name: "Bruton" },
  { slug: "blandford-forum",name: "Blandford Forum" },
  { slug: "frome",          name: "Frome" },
  { slug: "salisbury",      name: "Salisbury" },
  { slug: "dorchester",     name: "Dorchester" },
  { slug: "weymouth",       name: "Weymouth" },
  { slug: "bath",           name: "Bath" },
  { slug: "bournemouth",    name: "Bournemouth" },
  { slug: "poole",          name: "Poole" },
];

const COMPETITOR_DOMAINS = [
  "dpsremovals.com",
  "johnsonsofshaftesbury.co.uk",
  "pitmansremovals.co.uk",
  "sandysremovalsandstorage.com",
  "armishaws.com",
];

const SERVICES = [
  { slug: "house-removals",   seed: "house removals dorset",          label: "House Removals" },
  { slug: "packing",          seed: "packing services dorset",         label: "Packing Services" },
  { slug: "storage",          seed: "storage units dorset",            label: "Storage" },
  { slug: "long-distance",    seed: "long distance removals dorset",   label: "Long Distance Removals" },
  { slug: "house-clearances", seed: "house clearance dorset",          label: "House Clearances" },
];

const HUB_PAGES = [
  { id: "01-home-removals-gillingham", url: "/",                          primary: "removals gillingham", secondary: ["removal company gillingham"], headline: "Home — Marley Moves" },
  { id: "02-removals-hub-dorset",      url: "/removals/",                  primary: "removals dorset",     secondary: [],                              headline: "Removals hub — Dorset" },
  { id: "03-house-removals-dorset",    url: "/services/house-removals/",   primary: "house removals dorset", secondary: [],                            headline: "House removals (service)" },
];

const DIRECTORY_HOSTS = /^(www\.)?(checkatrade|yell|reallymoving|threebestrated|trustatrader|gov\.uk|getamover|removalreviews|comparemymove|whodoyou|quickermove|reallymoving|removalcompanies\.co\.uk)\./i;
const NATIONAL_BRANDS = /^(www\.)?(pickfords|britannia|bishopsmove|whiteandcompany|britanniamovers|amorderemovals|bishopsmove)\./i;

const DRY_RUN = process.argv.includes("--dry-run");
const PHASE = process.argv[2] || "all";

let apiCallCount = 0;
let apiCostUsd = 0;

const COSTS = {
  ranked_keywords: 0.05,
  related_keywords: 0.04,
  bulk_keyword_difficulty: 0.10,
  keyword_overview: 0.05,
  serp_organic: 0.002,
  serp_maps: 0.002,
};

// ───────────────────────────────────────────────────────────────────
// Core utilities
// ───────────────────────────────────────────────────────────────────

function ensureDir(d) {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

function sha256(s) {
  return createHash("sha256").update(s).digest("hex");
}

function cacheKey(prefix, endpoint, body) {
  const h = sha256(endpoint + JSON.stringify(body));
  return join(CACHE_DIR, `${prefix}-${h}.json`);
}

function readCache(path) {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch { return null; }
}

function writeCache(path, data) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
}

function authHeader() {
  return "Basic " + Buffer.from(`${LOGIN}:${PASSWORD}`).toString("base64");
}

async function postJson(endpoint, body, costKey) {
  const url = `https://api.dataforseo.com${endpoint}`;
  const cacheFile = cacheKey("api", endpoint, body);
  const cached = readCache(cacheFile);
  if (cached) return cached;

  if (DRY_RUN) {
    apiCallCount++;
    apiCostUsd += COSTS[costKey] || 0;
    return { _dryRun: true, endpoint, body };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`DataForSEO ${endpoint} → HTTP ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO ${endpoint} → status ${data.status_code}: ${data.status_message}`);
  }
  apiCallCount++;
  apiCostUsd += COSTS[costKey] || 0;
  writeCache(cacheFile, data);
  return data;
}

async function fetchPage(url) {
  const cacheFile = join(CACHE_DIR, "page-" + sha256(url) + ".json");
  const cached = readCache(cacheFile);
  if (cached) return cached;
  if (DRY_RUN) return { _dryRun: true, url };

  let html = "";
  let status = 0;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MarleyMovesSEOBot/1.0; research only; +https://marleymoves.co.uk)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    });
    status = res.status;
    if (res.ok) html = await res.text();
  } catch (err) {
    const result = { url, status, error: String(err), h1: "", h2: [], wordCount: 0, schemaTypes: [] };
    writeCache(cacheFile, result);
    return result;
  }

  if (!html) {
    const result = { url, status, h1: "", h2: [], wordCount: 0, schemaTypes: [] };
    writeCache(cacheFile, result);
    return result;
  }

  const $ = cheerio.load(html);
  const h1 = $("h1").first().text().trim().slice(0, 200);
  const h2 = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 30);
  // strip script/style/nav/footer for word count
  $("script,style,nav,footer,header,aside,noscript").remove();
  const text = $("main, article, body").first().text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").length : 0;
  const schemaTypes = new Set();
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const blob = JSON.parse($(el).contents().text() || "null");
      const stack = Array.isArray(blob) ? [...blob] : [blob];
      while (stack.length) {
        const node = stack.pop();
        if (!node || typeof node !== "object") continue;
        if (node["@type"]) {
          if (Array.isArray(node["@type"])) node["@type"].forEach(t => schemaTypes.add(t));
          else schemaTypes.add(node["@type"]);
        }
        if (node["@graph"]) stack.push(...node["@graph"]);
      }
    } catch {}
  });

  const result = { url, status, h1, h2, wordCount, schemaTypes: [...schemaTypes] };
  writeCache(cacheFile, result);
  return result;
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function writeCsv(path, columns, rows) {
  const lines = [columns.map(csvEscape).join(",")];
  for (const r of rows) lines.push(columns.map(c => csvEscape(r[c])).join(","));
  // UTF-8 BOM so Excel opens it correctly
  writeFileSync(path, "﻿" + lines.join("\r\n") + "\r\n", "utf8");
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function classifyIntent(serpItemTypes = []) {
  const types = serpItemTypes;
  const hasOrganic = types.includes("organic");
  const hasLocalPack = types.includes("local_pack") || types.includes("map");
  const hasFeatured = types.includes("featured_snippet") || types.includes("people_also_ask");
  if (hasLocalPack || (hasOrganic && !hasFeatured)) return "commercial";
  if (hasFeatured && !hasLocalPack) return "informational";
  return "mixed";
}

function isDirectoryHost(url) {
  try { return DIRECTORY_HOSTS.test(new URL(url).host); }
  catch { return false; }
}

function isNationalBrand(url) {
  try { return NATIONAL_BRANDS.test(new URL(url).host); }
  catch { return false; }
}

// ───────────────────────────────────────────────────────────────────
// Phase 1 — keywords
// ───────────────────────────────────────────────────────────────────

async function phase1Keywords() {
  console.log("\n[Phase 1] Building keyword universe…");
  const merged = new Map(); // keyword -> { ...metrics, ranking_competitors:[], sources:[] }

  // 1a. Competitor ranked keywords
  console.log("  1a. Pulling competitor ranked keywords…");
  for (const domain of COMPETITOR_DOMAINS) {
    const body = [{
      target: domain,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      limit: 100,
      filters: [["ranked_serp_element.serp_item.rank_group", "<=", 50]],
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    }];
    const res = await postJson("/v3/dataforseo_labs/google/ranked_keywords/live", body, "ranked_keywords");
    if (DRY_RUN) continue;
    const items = res?.tasks?.[0]?.result?.[0]?.items || [];
    for (const it of items) {
      const kw = it?.keyword_data?.keyword;
      if (!kw) continue;
      const ki = it?.keyword_data?.keyword_info || {};
      const kp = it?.keyword_data?.keyword_properties || {};
      const sinfo = it?.keyword_data?.search_intent_info || {};
      const existing = merged.get(kw) || {
        keyword: kw,
        search_volume_uk: ki.search_volume ?? null,
        cpc_gbp: ki.cpc ?? null,
        competition: ki.competition_level ?? ki.competition ?? null,
        keyword_difficulty: kp.keyword_difficulty ?? null,
        intent: sinfo.main_intent ?? null,
        ranking_competitors: [],
        sources: [],
      };
      if (!existing.ranking_competitors.includes(domain)) existing.ranking_competitors.push(domain);
      if (!existing.sources.includes("ranked_keywords")) existing.sources.push("ranked_keywords");
      merged.set(kw, existing);
    }
    console.log(`    · ${domain}: ${items.length} keywords`);
  }

  // 1b. Related keywords from seed templates
  console.log("  1b. Pulling related keywords for seed templates…");
  const seeds = [
    ...TOWNS.map(t => `removals ${t.name.toLowerCase()}`),
    ...TOWNS.map(t => `house removals ${t.name.toLowerCase()}`),
    ...TOWNS.map(t => `removal company ${t.name.toLowerCase()}`),
    ...TOWNS.map(t => `moving company ${t.name.toLowerCase()}`),
    "removals near me",
    ...SERVICES.map(s => s.seed),
  ];

  for (const seed of seeds) {
    const body = [{
      keyword: seed,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      limit: 50,
      depth: 2,
      include_seed_keyword: true,
    }];
    const res = await postJson("/v3/dataforseo_labs/google/related_keywords/live", body, "related_keywords");
    if (DRY_RUN) continue;
    const items = res?.tasks?.[0]?.result?.[0]?.items || [];
    for (const it of items) {
      const kd = it?.keyword_data;
      if (!kd?.keyword) continue;
      const kw = kd.keyword;
      const ki = kd.keyword_info || {};
      const kp = kd.keyword_properties || {};
      const sinfo = kd.search_intent_info || {};
      const itemTypes = (kd.serp_info?.item_types) || [];
      const existing = merged.get(kw) || {
        keyword: kw,
        search_volume_uk: null,
        cpc_gbp: null,
        competition: null,
        keyword_difficulty: null,
        intent: null,
        ranking_competitors: [],
        sources: [],
        intent_flag: null,
        serp_item_types: itemTypes,
      };
      existing.search_volume_uk = ki.search_volume ?? existing.search_volume_uk;
      existing.cpc_gbp = ki.cpc ?? existing.cpc_gbp;
      existing.competition = ki.competition_level ?? ki.competition ?? existing.competition;
      existing.keyword_difficulty = kp.keyword_difficulty ?? existing.keyword_difficulty;
      existing.intent = sinfo.main_intent ?? existing.intent;
      if (itemTypes.length) existing.serp_item_types = itemTypes;
      if (!existing.sources.includes("related_keywords")) existing.sources.push("related_keywords");
      merged.set(kw, existing);
    }
    console.log(`    · "${seed}": ${items.length} related`);
  }

  // 1c. Bulk KD for any keyword still missing it
  console.log("  1c. Bulk keyword difficulty fill-in…");
  const needsKd = [...merged.values()].filter(k => k.keyword_difficulty == null && k.search_volume_uk != null && k.search_volume_uk >= 10);
  const batches = [];
  for (let i = 0; i < needsKd.length; i += 700) batches.push(needsKd.slice(i, i + 700));
  for (const batch of batches) {
    const body = [{
      keywords: batch.map(k => k.keyword),
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
    }];
    const res = await postJson("/v3/dataforseo_labs/google/bulk_keyword_difficulty/live", body, "bulk_keyword_difficulty");
    if (DRY_RUN) continue;
    const items = res?.tasks?.[0]?.result?.[0]?.items || [];
    for (const it of items) {
      const e = merged.get(it.keyword);
      if (e) e.keyword_difficulty = it.keyword_difficulty ?? e.keyword_difficulty;
    }
    console.log(`    · KD filled for ${items.length} keywords`);
  }

  // Filter + finalise intent_flag
  const high_intent = /(emergency|same.day|urgent|tonight|weekend|asap)/i;
  const junk = /(porn|sex|xxx|cialis|viagra|crypto|nft|bitcoin)/i;
  const out = [];
  for (const k of merged.values()) {
    if (junk.test(k.keyword)) continue;
    const vol = k.search_volume_uk;
    if ((vol == null || vol < 10) && !high_intent.test(k.keyword)) continue;
    k.intent_flag = classifyIntent(k.serp_item_types || []);
    out.push(k);
  }
  out.sort((a, b) => (b.search_volume_uk || 0) - (a.search_volume_uk || 0));

  if (DRY_RUN) {
    console.log(`  (dry-run: would write master_keywords.csv)`);
    return;
  }

  writeCsv(join(ROOT, "master_keywords.csv"),
    ["keyword","search_volume_uk","cpc_gbp","competition","keyword_difficulty","intent_flag","ranking_competitors","sources"],
    out.map(k => ({
      ...k,
      ranking_competitors: (k.ranking_competitors || []).join("|"),
      sources: (k.sources || []).join("|"),
    })),
  );
  console.log(`  ✓ Wrote master_keywords.csv (${out.length} keywords)`);

  // Save the in-memory map for downstream phases
  writeFileSync(join(CACHE_DIR, "_keywords-merged.json"), JSON.stringify([...merged.values()], null, 2), "utf8");
}

// ───────────────────────────────────────────────────────────────────
// Phase 2 — SERP organic + page extraction
// ───────────────────────────────────────────────────────────────────

function deepBriefKeywords() {
  // Each entry: { id, url, primary, secondary[], headline, kind: 'hub'|'town' }
  const list = [...HUB_PAGES.map(h => ({ ...h, kind: "hub" }))];
  for (const t of TOWNS) {
    list.push({
      id: `town-${t.slug}`,
      url: `/removals/${t.slug}/`,
      primary: `removals ${t.name.toLowerCase()}`,
      secondary: [`removal company ${t.name.toLowerCase()}`],
      headline: `Removals ${t.name}`,
      kind: "town",
    });
  }
  return list;
}

async function phase2Serp() {
  console.log("\n[Phase 2] SERP organic pulls + page extraction…");
  const briefs = deepBriefKeywords();
  // Build unique keyword set: every primary + the home secondary explicitly
  const keywordSet = new Set();
  for (const b of briefs) keywordSet.add(b.primary);
  // Home brief uses 'removal company gillingham' as secondary; pull it too
  keywordSet.add("removal company gillingham");
  // Plus 4 secondary-services light SERPs
  for (const s of SERVICES.filter(x => x.slug !== "house-removals")) keywordSet.add(s.seed);

  const flags = []; // directory-dominated keywords

  for (const kw of keywordSet) {
    const body = [{
      keyword: kw,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      device: "desktop",
      depth: 10,
    }];
    const res = await postJson("/v3/serp/google/organic/live/advanced", body, "serp_organic");
    if (DRY_RUN) continue;

    const items = (res?.tasks?.[0]?.result?.[0]?.items || []).filter(i => i.type === "organic").slice(0, 10);
    const expanded = [];
    for (const it of items) {
      const url = it.url;
      if (!url) continue;
      const page = await fetchPage(url);
      expanded.push({
        rank: it.rank_absolute ?? it.rank_group,
        url,
        title: it.title || "",
        snippet: it.description || "",
        domain: (() => { try { return new URL(url).host; } catch { return ""; } })(),
        h1: page.h1,
        h2: page.h2,
        wordCount: page.wordCount,
        schemaTypes: page.schemaTypes,
        fetchStatus: page.status,
      });
    }

    const directoryCount = expanded.filter(e => isDirectoryHost(`https://${e.domain}/`)).length;
    if (directoryCount >= 4) flags.push({ keyword: kw, directory_count: directoryCount, top_domains: expanded.map(e => e.domain) });

    const out = { keyword: kw, pulled_at: new Date().toISOString(), top10: expanded };
    writeFileSync(join(CACHE_DIR, `serp-${slugify(kw)}.json`), JSON.stringify(out, null, 2), "utf8");
    console.log(`    · "${kw}": ${expanded.length} results, ${directoryCount} directories${directoryCount >= 4 ? " (FLAGGED)" : ""}`);
  }

  if (!DRY_RUN && flags.length) {
    const lines = ["# Directory-dominated SERPs (flagged — won via citations, not on-page)\n"];
    for (const f of flags) {
      lines.push(`## ${f.keyword}`);
      lines.push(`- ${f.directory_count}/10 results are directories`);
      lines.push(`- Top 10 domains: ${f.top_domains.join(", ")}`);
      lines.push("");
    }
    writeFileSync(join(ROOT, "flags.md"), lines.join("\n"), "utf8");
    console.log(`  ✓ Wrote flags.md (${flags.length} flagged keywords)`);
  }
}

// ───────────────────────────────────────────────────────────────────
// Phase 3 — Map Pack
// ───────────────────────────────────────────────────────────────────

async function phase3MapPack() {
  console.log("\n[Phase 3] Map Pack pulls (16 towns × 2 templates)…");
  const rows = [];
  for (const town of TOWNS) {
    const tn = town.name.toLowerCase();
    for (const tmpl of [`removals ${tn}`, `removal company ${tn}`]) {
      const body = [{
        keyword: tmpl,
        location_code: LOCATION_CODE,
        language_code: LANGUAGE_CODE,
        device: "desktop",
        depth: 10,
      }];
      const res = await postJson("/v3/serp/google/maps/live/advanced", body, "serp_maps");
      if (DRY_RUN) continue;
      const items = (res?.tasks?.[0]?.result?.[0]?.items || []).filter(i => i.type === "maps_search" || i.type === "map" || i.type === "google_maps_search" || i.title).slice(0, 3);
      if (!items.length) {
        // Some templates return 'maps' wrapper; flatten any nested
        const flat = res?.tasks?.[0]?.result?.[0]?.items || [];
        flat.slice(0, 3).forEach((it, idx) => items[idx] = it);
      }
      items.slice(0, 3).forEach((it, idx) => {
        rows.push({
          town: town.name,
          town_slug: town.slug,
          template: tmpl,
          position: idx + 1,
          business_name: it.title || it.name || "",
          rating: it.rating?.value ?? "",
          reviews_count: it.rating?.votes_count ?? it.reviews ?? "",
          category: (it.category || it.categories?.[0] || "") + "",
          address: it.address || "",
          place_id: it.place_id || it.cid || "",
          domain: (() => { try { return it.url ? new URL(it.url).host : ""; } catch { return ""; } })(),
          is_marley: /marley/i.test(it.title || "") ? "yes" : "no",
        });
      });
      console.log(`    · ${town.name} / "${tmpl}": ${Math.min(items.length, 3)} pack results`);
    }
  }
  if (DRY_RUN) return;
  writeCsv(join(ROOT, "map_pack_competition.csv"),
    ["town","town_slug","template","position","business_name","rating","reviews_count","category","address","place_id","domain","is_marley"],
    rows,
  );
  console.log(`  ✓ Wrote map_pack_competition.csv (${rows.length} rows)`);
}

// ───────────────────────────────────────────────────────────────────
// Phase 4 — Briefs
// ───────────────────────────────────────────────────────────────────

const STOPWORDS = new Set("a an and are as at be by for from has have he her his how i if in is it its of on or our she so that the their them there these they this to was we were what when which while who why will with you your".split(" "));

function topConsensusH2s(top10) {
  const phraseFreq = new Map();
  for (const r of top10) {
    const seenInThisDoc = new Set();
    for (const h of r.h2 || []) {
      const cleaned = cleanH2(h);
      if (!cleaned) continue;
      const norm = cleaned.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
      // Bucket on first 3 stopword-stripped tokens so "Why choose Armishaws" and "Why choose us" merge
      const sig = norm.split(" ").filter(w => !STOPWORDS.has(w) && w.length >= 3).slice(0, 3).join(" ");
      if (!sig || sig.length < 4) continue;
      if (seenInThisDoc.has(sig)) continue;  // count once per document
      seenInThisDoc.add(sig);
      const entry = phraseFreq.get(sig) || { count: 0, examples: [] };
      entry.count++;
      if (!entry.examples.includes(cleaned)) entry.examples.push(cleaned);
      phraseFreq.set(sig, entry);
    }
  }
  return [...phraseFreq.entries()]
    .filter(([, v]) => v.count >= 2)  // ≥2 of top 10 sources used a similar phrasing
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([sig, v]) => ({ signature: sig, frequency: v.count, example: v.examples[0] }));
}

function loadKeywordsMap() {
  const path = join(CACHE_DIR, "_keywords-merged.json");
  if (!existsSync(path)) return new Map();
  const arr = JSON.parse(readFileSync(path, "utf8"));
  const m = new Map();
  for (const k of arr) m.set(k.keyword.toLowerCase(), k);
  return m;
}

function loadSerp(keyword) {
  const p = join(CACHE_DIR, `serp-${slugify(keyword)}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function nearbyTowns(slug, n = 3) {
  // Crude "nearby" using a hand-rolled adjacency map (keeps it simple, no geocoding)
  const ADJ = {
    "gillingham": ["shaftesbury","mere","wincanton","sherborne"],
    "shaftesbury": ["gillingham","mere","sherborne","blandford-forum"],
    "sherborne": ["yeovil","gillingham","blandford-forum","dorchester"],
    "yeovil": ["sherborne","bruton","wincanton","dorchester"],
    "warminster": ["mere","frome","salisbury","bath"],
    "wincanton": ["bruton","gillingham","sherborne","frome"],
    "mere": ["gillingham","shaftesbury","warminster","wincanton"],
    "bruton": ["wincanton","frome","yeovil","sherborne"],
    "blandford-forum": ["shaftesbury","sherborne","dorchester","poole"],
    "frome": ["warminster","bruton","bath","wincanton"],
    "salisbury": ["warminster","shaftesbury","bournemouth","mere"],
    "dorchester": ["weymouth","sherborne","blandford-forum","poole"],
    "weymouth": ["dorchester","poole","bournemouth","blandford-forum"],
    "bath": ["frome","warminster","bruton","wincanton"],
    "bournemouth": ["poole","salisbury","blandford-forum","weymouth"],
    "poole": ["bournemouth","blandford-forum","weymouth","dorchester"],
  };
  return (ADJ[slug] || []).slice(0, n);
}

// Extract the location anchor (town name) from a brief's primary keyword so we can
// filter "related keywords" to ones that share that location. Without this, a Sherborne
// brief gets "removals plymouth" suggestions because the global master set is huge.
function locationAnchor(primary) {
  const lower = primary.toLowerCase();
  for (const t of TOWNS) {
    const tn = t.name.toLowerCase();
    if (lower.includes(tn)) return tn;
  }
  if (/\bdorset\b/.test(lower)) return "dorset";
  if (/\bsomerset\b/.test(lower)) return "somerset";
  if (/\bwiltshire\b/.test(lower)) return "wiltshire";
  return null;
}

function relatedKeywordsForBrief(primary, kwMap, max = 12) {
  const pri = primary.toLowerCase();
  const anchor = locationAnchor(primary);
  const local = [];   // contain the anchor
  const generic = []; // non-place near-me/uk generics
  for (const k of kwMap.values()) {
    const kl = k.keyword.toLowerCase();
    if (kl === pri) continue;
    if (!k.search_volume_uk || k.search_volume_uk < 10) continue;
    if (!isMarleyTopical(k.keyword)) continue;
    if (anchor) {
      if (kl.includes(anchor)) local.push(k);
      else if (/\b(near.me|in.the.uk|uk|cost|prices?|how.much|checklist)\b/.test(kl) && !TOWNS.some(t => kl.includes(t.name.toLowerCase()))) generic.push(k);
    } else {
      // Hub-level brief (no anchor): everything topical, sorted by volume
      local.push(k);
    }
  }
  local.sort((a, b) => (b.search_volume_uk || 0) - (a.search_volume_uk || 0));
  generic.sort((a, b) => (b.search_volume_uk || 0) - (a.search_volume_uk || 0));
  // Reserve up to 6 slots for local; rest goes to generic. If local is smaller than 6, generic absorbs the spillover.
  const localCap = Math.min(local.length, Math.ceil(max / 2));
  const genericCap = max - localCap;
  return [...local.slice(0, localCap), ...generic.slice(0, genericCap)];
}

function contentGapsForBrief(primary, kwMap, serp) {
  const pool = relatedKeywordsForBrief(primary, kwMap, 50);
  const blob = ((serp?.top10 || []).map(r => `${r.h1} ${r.h2.join(" ")}`).join(" ") || "").toLowerCase();
  const gaps = [];
  for (const k of pool) {
    if (k.search_volume_uk < 20) continue;
    const tokens = k.keyword.toLowerCase().split(/\s+/).filter(t => !STOPWORDS.has(t) && t.length > 3);
    const covered = tokens.filter(t => blob.includes(t)).length;
    const ratio = tokens.length ? covered / tokens.length : 1;
    if (ratio < 0.5) gaps.push({ keyword: k.keyword, volume: k.search_volume_uk, coverage_ratio: ratio });
  }
  return gaps.slice(0, 8);
}

// Filter & clean the "topics covered by competitors" pool — strip H2s that are phone
// numbers, brand-only mentions, navigation labels, or pure noise.
const H2_NOISE = /^(menu|navigation|search|sign in|log in|register|home|contact|contact us|footer|cookie|privacy|terms|sitemap|share|follow us|latest news|news|blog|categories|archives|recent posts|tags|comments|leave a comment|reply|subscribe|newsletter|get in touch|locations|services|about|about us|quick links|important links|useful links|main menu|skip to|return to|back to top|read more|learn more|find out more|see more|view all|view more|click here|free quote|free estimate|get a quote|request a quote|get free quote|get in touch|what we offer|our work|our team|our services|why choose us|why us|why so many people choose|testimonials|reviews|what our customers say|customer reviews|what people say|frequently asked questions|faq|faqs|gallery|portfolio|case studies|areas covered|areas we cover|where we cover|what we cover|how it works|how we work|the process|process|moving made easy|made easy|time frame|coverage|opening hours|opening times|hours|address|find us|location|locations|stay in touch|connect with us|social|social media)$/i;
const H2_PHONE = /^\s*(call(\s+now)?|tel|telephone|phone)?[:\s]*\+?[\d][\d\s().\-]{6,}$/i;
const H2_BRAND_PREFIXES = /^(armishaws|pitmans|dps|johnsons of shaftesbury|sandys|bishops move|britannia|pickfords|whiteandcompany|white and company|carter removals|riley|stalbridge|foreman|red leaf|weston|anyvan|reallymoving|trustatrader|checkatrade|sirelo)\b/i;

function cleanH2(h) {
  if (!h) return "";
  let s = h.replace(/\s+/g, " ").trim();
  if (s.length < 5) return "";
  if (s.length > 120) s = s.slice(0, 120);
  if (H2_NOISE.test(s.toLowerCase())) return "";
  if (H2_PHONE.test(s)) return "";
  // Brand-only line e.g. "Armishaws" or "Pitmans Removals" → drop
  const wordCount = s.split(/\s+/).length;
  if (wordCount <= 3 && H2_BRAND_PREFIXES.test(s)) return "";
  // Drop "place-list" headings (e.g. "Removals in Kent, Medway, Maidstone, Tonbridge…") —
  // they signal a competitor's full coverage list, which isn't a useful pattern for us.
  // Global match against the OUT_OF_AREA pattern (the const is non-global; build a /g version on the fly)
  const outOfAreaG = new RegExp(OUT_OF_AREA_PLACES.source, "gi");
  const outOfAreaCount = (s.match(outOfAreaG) || []).length;
  if (outOfAreaCount >= 2) return "";
  return s;
}

function cleanTopicsPool(top10) {
  const out = [];
  const seen = new Set();
  for (const r of top10.slice(0, 6)) {
    for (const h of (r.h2 || []).slice(0, 8)) {
      const cleaned = cleanH2(h);
      if (!cleaned) continue;
      const key = cleaned.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(cleaned);
      if (out.length >= 10) return out;
    }
  }
  return out;
}

function recommendedSchemas(brief) {
  const base = ["LocalBusiness", "BreadcrumbList"];
  if (brief.kind === "town") return [...base, "Service", "FAQPage", "Place"];
  if (brief.id === "03-house-removals-dorset") return [...base, "Service", "FAQPage", "Offer"];
  if (brief.url === "/removals/") return [...base, "ItemList", "FAQPage"];
  if (brief.url === "/") return [...base, "Organization", "Service", "AggregateRating"];
  return [...base, "Service", "FAQPage"];
}

function internalLinkSuggestions(brief) {
  const all = [];
  if (brief.kind === "town") {
    all.push("`/` (homepage hero anchor in featured-towns block)");
    all.push("`/removals/` (towns hub grid)");
    all.push("`/services/house-removals/` (cross-sell to flagship service)");
    const slug = brief.id.replace(/^town-/, "");
    nearbyTowns(slug).forEach(s => all.push(`\`/removals/${s}/\` (nearby area cluster)`));
  } else if (brief.url === "/removals/") {
    TOWNS.slice(0, 4).forEach(t => all.push(`\`/removals/${t.slug}/\` (key town cards)`));
    all.push("`/services/house-removals/`");
    all.push("`/` (footer)");
  } else if (brief.url === "/") {
    all.push("`/removals/` (primary CTA hub)");
    all.push("`/services/house-removals/` (flagship service)");
    all.push("Top 4 town pages: gillingham, shaftesbury, sherborne, yeovil");
  } else if (brief.id === "03-house-removals-dorset") {
    all.push("`/` (homepage hero)");
    all.push("`/removals/` (parent hub)");
    all.push("Town pages within Dorset: gillingham, sherborne, blandford-forum, dorchester, weymouth");
    all.push("`/services/packing/` and `/services/storage/` (related services)");
  }
  return all;
}

function fmtCpc(v) {
  if (v == null) return "—";
  return "£" + Number(v).toFixed(2);
}

function renderBrief(brief, kwMap) {
  const serp = loadSerp(brief.primary);
  const pri = kwMap.get(brief.primary.toLowerCase()) || {};
  const top10 = serp?.top10 || [];
  const top3WordCount = top10.slice(0, 3).reduce((s, r) => s + (r.wordCount || 0), 0) / Math.max(1, Math.min(3, top10.length));
  const recommendedWordCount = Math.round(top3WordCount * 1.2);
  const consensus = topConsensusH2s(top10);
  const related = relatedKeywordsForBrief(brief.primary, kwMap, 12);
  const gaps = contentGapsForBrief(brief.primary, kwMap, serp);
  const schemas = recommendedSchemas(brief);
  const links = internalLinkSuggestions(brief);

  const directoryCount = top10.filter(r => isDirectoryHost(`https://${r.domain}/`)).length;
  const nationalCount = top10.filter(r => isNationalBrand(`https://${r.domain}/`)).length;

  const lines = [];
  lines.push(`# Content brief — ${brief.headline}`);
  lines.push("");
  lines.push(`**URL**: \`${brief.url}\``);
  lines.push(`**Primary keyword**: \`${brief.primary}\` — UK volume: ${pri.search_volume_uk ?? "—"}/mo · KD: ${pri.keyword_difficulty ?? "—"} · CPC: ${fmtCpc(pri.cpc_gbp)} · intent: ${pri.intent_flag ?? "—"}`);
  if (brief.secondary?.length) {
    lines.push(`**Secondary on this page**: ${brief.secondary.map(s => `\`${s}\``).join(", ")}`);
  }
  lines.push("");
  if (directoryCount >= 4) {
    lines.push(`> ⚠️ **Directory-dominated SERP** (${directoryCount}/10 are directories). On-page SEO alone won't crack this — pair with citations on Checkatrade/Yell/etc.`);
    lines.push("");
  }
  if (nationalCount >= 3) {
    lines.push(`> ⚠️ **National brand pressure** (${nationalCount}/10 are Pickfords/Britannia/etc). Expect a slow climb; lean on local-intent signals.`);
    lines.push("");
  }
  // SERP geographic mismatch warning — when the brief is for a Marley town but the
  // top 10 SERP titles mostly reference a different geography (e.g. Kent for "removals
  // gillingham"). Easy heuristic: count titles that mention an OUT_OF_AREA place but
  // not the brief's own town.
  if (brief.kind === "town" && top10.length) {
    // A result is "off-geo" if its title mentions an out-of-area UK place. (Some results
    // may also mention the brief town — e.g. Gillingham/Kent — but they're still serving
    // the wrong geographic intent.)
    const offGeo = top10.filter(r => OUT_OF_AREA_PLACES.test(r.title || "")).length;
    if (offGeo >= 3) {
      lines.push(`> ⚠️ **SERP geo-ambiguity** (${offGeo}/10 results reference an out-of-area UK town). Google is partly interpreting this keyword as a different location — disambiguate with "Dorset" (or the relevant county) prominently in title, H1, schema \`addressRegion\`, and the first 100 words. Add a "Not [other-town]?" reassurance line near the top.`);
      lines.push("");
    }
  }

  lines.push("## Secondary keyword opportunities (volume ≥10)");
  if (related.length) {
    lines.push("| Keyword | Volume | KD | CPC | Notes |");
    lines.push("|---|---:|---:|---:|---|");
    for (const k of related) {
      const note = (k.ranking_competitors || []).length ? `competitors rank: ${(k.ranking_competitors || []).join(", ")}` : "";
      lines.push(`| ${k.keyword} | ${k.search_volume_uk ?? "—"} | ${k.keyword_difficulty ?? "—"} | ${fmtCpc(k.cpc_gbp)} | ${note} |`);
    }
  } else {
    lines.push("_No related keywords with volume found in master set — re-run Phase 1 with broader seeds if needed._");
  }
  lines.push("");

  lines.push("## Top 10 SERP snapshot");
  if (top10.length) {
    lines.push("| # | Domain | Title | Words | Schema |");
    lines.push("|---:|---|---|---:|---|");
    for (const r of top10) {
      lines.push(`| ${r.rank} | ${r.domain} | ${r.title.replace(/\|/g, "\\|").slice(0, 80)} | ${r.wordCount || "—"} | ${(r.schemaTypes || []).join(", ") || "—"} |`);
    }
  } else {
    lines.push("_No SERP data — Phase 2 not yet run for this keyword._");
  }
  lines.push("");

  lines.push(`## Recommended word count`);
  lines.push(`Target **${recommendedWordCount} words** (top-3 average × 1.2). The top 3 results currently sit at an average ${Math.round(top3WordCount)} words.`);
  lines.push("");

  lines.push(`## Required H2 sections (consensus across top 10)`);
  if (consensus.length) {
    for (const c of consensus) {
      lines.push(`- **${c.example}** _(used by ${c.frequency}/10 top results)_`);
    }
  } else {
    lines.push("_No strong H2 consensus emerged. Free play — but match the dominant top-3 structure manually._");
  }
  lines.push("");

  lines.push(`## Topics covered by competitors (must include)`);
  if (top10.length) {
    const topics = cleanTopicsPool(top10);
    if (topics.length) topics.forEach(h => lines.push(`- ${h}`));
    else lines.push("_Top 10 results have no clean H2 structure (mostly business homepages with brand-only headings). Build a structured page from scratch — that itself is a competitive moat._");
  } else {
    lines.push("_(Awaiting SERP data.)_");
  }
  lines.push("");

  lines.push(`## Content gaps — topics no competitor covers well (volume ≥20, weak coverage)`);
  if (gaps.length) {
    for (const g of gaps) {
      lines.push(`- **${g.keyword}** (${g.volume}/mo) — only ${(g.coverage_ratio * 100).toFixed(0)}% of tokens appear in top-10 H2/H1.`);
    }
  } else {
    lines.push("_No clear gaps detected. Differentiation will come from depth + freshness + entity richness, not topic gaps._");
  }
  lines.push("");

  lines.push(`## Schema types to add`);
  for (const s of schemas) {
    let why = "";
    if (s === "LocalBusiness") why = "core local-business signal (NAP, hours, area served)";
    else if (s === "Service") why = "describes the removal service offered, with `areaServed` per town";
    else if (s === "FAQPage") why = "captures common pre-quote questions; competes for PAA boxes";
    else if (s === "BreadcrumbList") why = "trail for SERP breadcrumbs";
    else if (s === "Place") why = "ties page to the town entity (Wikidata/Wikipedia)";
    else if (s === "ItemList") why = "list of all 16 town pages on the hub";
    else if (s === "Offer") why = "fixed-price quote signalling";
    else if (s === "Organization") why = "homepage organisation entity";
    else if (s === "AggregateRating") why = "Trustindex review aggregate";
    lines.push(`- **${s}** — ${why}`);
  }
  lines.push("");

  lines.push(`## Internal link suggestions (pages that should link TO this page)`);
  for (const l of links) lines.push(`- ${l}`);
  lines.push("");

  return lines.join("\n");
}

function renderSecondaryServicesBrief(kwMap) {
  const lines = ["# Secondary services — light brief", "", "Top 10 SERP titles + word counts only (no H2/gap analysis). Use as a directional sanity check; commission a full brief later if any of these become priority.", ""];
  for (const s of SERVICES.filter(x => x.slug !== "house-removals")) {
    const kw = s.seed;
    const pri = kwMap.get(kw.toLowerCase()) || {};
    const serp = loadSerp(kw);
    lines.push(`## ${s.label} — \`/services/${s.slug}/\``);
    lines.push(`**Primary keyword**: \`${kw}\` — UK volume: ${pri.search_volume_uk ?? "—"}/mo · KD: ${pri.keyword_difficulty ?? "—"} · CPC: ${fmtCpc(pri.cpc_gbp)}`);
    lines.push("");
    if (serp?.top10?.length) {
      lines.push("| # | Domain | Title | Words |");
      lines.push("|---:|---|---|---:|");
      for (const r of serp.top10) {
        lines.push(`| ${r.rank} | ${r.domain} | ${r.title.replace(/\|/g, "\\|").slice(0, 80)} | ${r.wordCount || "—"} |`);
      }
    } else {
      lines.push("_No SERP data._");
    }
    lines.push("");
  }
  return lines.join("\n");
}

async function phase4Briefs() {
  console.log("\n[Phase 4] Generating content briefs…");
  if (DRY_RUN) { console.log("  (dry-run: skip)"); return; }
  const kwMap = loadKeywordsMap();
  const briefs = deepBriefKeywords();
  for (const b of briefs) {
    const md = renderBrief(b, kwMap);
    writeFileSync(join(BRIEF_DIR, `${b.id}.md`), md, "utf8");
    console.log(`  ✓ ${b.id}.md`);
  }
  writeFileSync(join(BRIEF_DIR, "secondary-services.md"), renderSecondaryServicesBrief(kwMap), "utf8");
  console.log(`  ✓ secondary-services.md`);
}

// ───────────────────────────────────────────────────────────────────
// Phase 5 — Summary
// ───────────────────────────────────────────────────────────────────

function intentWeight(flag) {
  if (flag === "commercial") return 1.5;
  if (flag === "informational") return 0.4;
  return 1.0;
}

// Service-intent tokens (the keyword must commercially relate to what Marley sells)
const SERVICE_INTENT = /\b(removal|removals|moving|movers|packing|packers|storage|self.storage|clearance|clearances|man.and.van|relocat|haulage)\b/i;
// Service-area scope. Marley operates Dorset / Somerset / Wiltshire + UK-wide long distance; we keep:
//   1. The 16 priority towns
//   2. Nearby town/county names
//   3. Non-place generics (no town mentioned at all)
const IN_AREA_PLACES = /\b(gillingham|shaftesbury|sherborne|yeovil|warminster|wincanton|mere|bruton|blandford|frome|salisbury|dorchester|weymouth|bath|bournemouth|poole|dorset|somerset|wiltshire|hampshire|swindon|taunton|chippenham|trowbridge|bridport|swanage|wareham|wimborne|verwood|ferndown|christchurch|new.forest|south.west|england)\b/i;
const OUT_OF_AREA_PLACES = /\b(london|manchester|birmingham|leeds|liverpool|bristol|sheffield|edinburgh|glasgow|cardiff|belfast|newcastle|nottingham|leicester|coventry|sunderland|bradford|stoke|wolverhampton|plymouth|derby|southampton|portsmouth|reading|brighton|hove|worthing|crawley|cambridge|oxford|york|hull|exeter|truro|cornwall|devon|kent|sussex|surrey|essex|norfolk|suffolk|lincolnshire|yorkshire|lancashire|derbyshire|cheshire|staffordshire|warwickshire|northamptonshire|bedfordshire|hertfordshire|buckinghamshire|berkshire|basingstoke|fareham|aldershot|guildford|woking|farnham|maidstone|tunbridge|dover|canterbury|chelmsford|colchester|ipswich|norwich|peterborough|telford|shrewsbury|hereford|gloucester|cheltenham|bicester|banbury|abingdon|witney|didcot|newbury|andover|winchester|eastleigh|gosport|havant|chichester|bognor|littlehampton|horsham|haywards.heath|burgess.hill|lewes|eastbourne|hastings|sevenoaks|tonbridge|gravesend|dartford|bromley|croydon|sutton|kingston|wimbledon|barnsley|wakefield|huddersfield|halifax|rotherham|doncaster|preston|blackpool|blackburn|bolton|bury|wigan|warrington|chester|crewe|macclesfield|stockport|rochdale|salford|harrogate|scarborough|middlesbrough|durham|carlisle|whitehaven|gateshead|slough|watford|luton|milton.keynes|aylesbury|high.wycombe|stevenage|hemel|st.albans|harlow|romford|barking|enfield|harrow|hounslow|ealing|brent|haringey|camden|islington|hackney|tower.hamlets|greenwich|lewisham|wandsworth|merton|kingston.thames|richmond.thames|barnet|redbridge|newham|waltham.forest|bexley|havering|bromley.london|orpington|bath.spa|spa.bath|swansea|newport|wrexham|aberdeen|dundee|inverness|stirling|perth.scot|paisley|kilmarnock|ayr|dumfries|galloway)\b/i;
const PURE_PLACE_NOISE = /\b(street.name|car.hire|auction|living.in|things.to.do|weather|map|postcode|directions)\b/i;

function isMarleyTopical(kw) {
  const k = kw.toLowerCase();
  if (PURE_PLACE_NOISE.test(k)) return false;
  if (!SERVICE_INTENT.test(k)) return false;
  if (OUT_OF_AREA_PLACES.test(k) && !IN_AREA_PLACES.test(k)) return false;
  return true;
}

async function phase5Summary() {
  console.log("\n[Phase 5] Building summary report…");
  if (DRY_RUN) { console.log("  (dry-run: skip)"); return; }
  const kwMap = loadKeywordsMap();
  const all = [...kwMap.values()];

  // Score every keyword. Treat KD=0 as "unknown / treat with caution" → floor at 5 so a
  // place-name with reported KD=0 doesn't get an absurdly inflated score.
  const scored = all
    .filter(k => k.search_volume_uk && k.search_volume_uk >= 10)
    .filter(k => isMarleyTopical(k.keyword))
    .map(k => {
      const w = intentWeight(k.intent_flag);
      const rawKd = k.keyword_difficulty;
      // Treat unknown (null) or 0 as a soft 25 — DataForSEO returns 0 for thin SERP data
      const kd = rawKd == null || rawKd === 0 ? 25 : rawKd;
      const score = (k.search_volume_uk * w) / (kd + 1);
      return { ...k, _score: score };
    });

  scored.sort((a, b) => b._score - a._score);
  const top20 = scored.slice(0, 20);

  // Fastest wins: KD ≤ 35, volume ≥ 30, Marley-topical, SERP not directory-dominated
  const fastestWins = scored.filter(k => {
    if ((k.keyword_difficulty ?? 99) > 35) return false;
    if ((k.search_volume_uk || 0) < 30) return false;
    if (!isMarleyTopical(k.keyword)) return false;
    const serp = loadSerp(k.keyword);
    if (serp) {
      const dirCount = (serp.top10 || []).filter(r => isDirectoryHost(`https://${r.domain}/`)).length;
      if (dirCount >= 4) return false;
    }
    return true;
  }).slice(0, 5);

  // Defer: KD ≥ 60 OR national brand pressure
  const defer = scored.filter(k => {
    if ((k.keyword_difficulty ?? 0) >= 60) return true;
    const serp = loadSerp(k.keyword);
    if (serp) {
      const natCount = (serp.top10 || []).filter(r => isNationalBrand(`https://${r.domain}/`)).length;
      if (natCount >= 3) return true;
    }
    return false;
  }).slice(0, 5);

  // Content gaps (3): keywords with volume ≥30 where top-10 avg word count < 600 AND no FAQ schema in top 5
  const gaps = [];
  for (const k of scored) {
    if (k.search_volume_uk < 30) continue;
    const serp = loadSerp(k.keyword);
    if (!serp || !(serp.top10 || []).length) continue;
    const avgWords = serp.top10.reduce((s, r) => s + (r.wordCount || 0), 0) / serp.top10.length;
    const hasFAQ = serp.top10.slice(0, 5).some(r => (r.schemaTypes || []).includes("FAQPage"));
    if (avgWords < 600 && !hasFAQ) gaps.push({ keyword: k.keyword, volume: k.search_volume_uk, avg_words: Math.round(avgWords) });
    if (gaps.length >= 3) break;
  }

  // Flagged (directory-dominated)
  const flaggedPath = join(ROOT, "flags.md");
  const flaggedKws = [];
  if (existsSync(flaggedPath)) {
    const txt = readFileSync(flaggedPath, "utf8");
    for (const m of txt.matchAll(/^## (.+)$/gm)) flaggedKws.push(m[1]);
  }

  const lines = [];
  lines.push("# Marley Moves — SEO research executive summary");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Master keyword set: ${all.length} keywords (after volume filter ≥10).`);
  lines.push("");

  lines.push("## 1. Top 20 keywords by opportunity score");
  lines.push("Score = `volume × intent_weight / (KD + 1)`. Intent weights: commercial 1.5, mixed 1.0, informational 0.4.");
  lines.push("");
  lines.push("| # | Keyword | Volume | KD | CPC | Intent | Score |");
  lines.push("|---:|---|---:|---:|---:|---|---:|");
  top20.forEach((k, i) => lines.push(`| ${i + 1} | ${k.keyword} | ${k.search_volume_uk} | ${k.keyword_difficulty ?? "—"} | ${fmtCpc(k.cpc_gbp)} | ${k.intent_flag} | ${k._score.toFixed(1)} |`));
  lines.push("");

  lines.push("## 2. 5 fastest wins (rank top-3 within 1–2 quarters)");
  lines.push("Criteria: KD ≤ 35, volume ≥ 30, on-topic for Marley, no directory dominance in SERP.");
  lines.push("");
  if (fastestWins.length) {
    lines.push("| # | Keyword | Volume | KD | CPC |");
    lines.push("|---:|---|---:|---:|---:|");
    fastestWins.forEach((k, i) => lines.push(`| ${i + 1} | ${k.keyword} | ${k.search_volume_uk} | ${k.keyword_difficulty ?? "—"} | ${fmtCpc(k.cpc_gbp)} |`));
  } else lines.push("_None met all criteria — relax KD ceiling or volume floor if you want a candidate set._");
  lines.push("");

  lines.push("## 3. 5 to defer (too competitive right now)");
  lines.push("Criteria: KD ≥ 60 OR ≥3/10 top results are national brands (Pickfords, Britannia, Bishops Move, etc.).");
  lines.push("");
  if (defer.length) {
    lines.push("| # | Keyword | Volume | KD | Reason |");
    lines.push("|---:|---|---:|---:|---|");
    defer.forEach((k, i) => {
      const serp = loadSerp(k.keyword);
      const natCount = serp ? (serp.top10 || []).filter(r => isNationalBrand(`https://${r.domain}/`)).length : 0;
      const reason = (k.keyword_difficulty ?? 0) >= 60 ? `KD ${k.keyword_difficulty}` : `${natCount}/10 national brands`;
      lines.push(`| ${i + 1} | ${k.keyword} | ${k.search_volume_uk} | ${k.keyword_difficulty ?? "—"} | ${reason} |`);
    });
  } else lines.push("_None — no high-difficulty national-brand-saturated keywords in scope._");
  lines.push("");

  lines.push("## 4. 3 most important content gaps");
  lines.push("Criteria: volume ≥30, top-10 avg word count <600, no FAQ schema in top 5. Easy to outrank with depth + structured data.");
  lines.push("");
  if (gaps.length) {
    lines.push("| # | Keyword | Volume | Top-10 avg words |");
    lines.push("|---:|---|---:|---:|");
    gaps.forEach((g, i) => lines.push(`| ${i + 1} | ${g.keyword} | ${g.volume} | ${g.avg_words} |`));
  } else lines.push("_No qualifying gaps. Competitors cover priority intents adequately — differentiate on depth + entities + freshness instead._");
  lines.push("");

  lines.push("## Directory-dominated SERPs (won via citations, not pages)");
  if (flaggedKws.length) flaggedKws.forEach(k => lines.push(`- \`${k}\``));
  else lines.push("_None flagged in current run._");
  lines.push("");

  writeFileSync(join(ROOT, "summary.md"), lines.join("\n"), "utf8");
  console.log(`  ✓ Wrote summary.md`);
}

// ───────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────

async function main() {
  ensureDir(CACHE_DIR);
  ensureDir(BRIEF_DIR);

  if (!LOGIN || !PASSWORD) {
    console.error("Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD in env. Run sync-credentials.ps1 and re-launch.");
    process.exit(1);
  }

  console.log(`Marley Moves SEO research — phase=${PHASE}${DRY_RUN ? " (DRY RUN)" : ""}`);
  const start = Date.now();

  if (PHASE === "keywords" || PHASE === "all") await phase1Keywords();
  if (PHASE === "serp"     || PHASE === "all") await phase2Serp();
  if (PHASE === "mappack"  || PHASE === "all") await phase3MapPack();
  if (PHASE === "briefs"   || PHASE === "all") await phase4Briefs();
  if (PHASE === "summary"  || PHASE === "all") await phase5Summary();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s.`);
  if (DRY_RUN) {
    console.log(`Planned API calls: ${apiCallCount}`);
    console.log(`Estimated cost:    $${apiCostUsd.toFixed(2)}`);
  } else {
    console.log(`API calls (this run, including cache hits skipped): ${apiCallCount}`);
    console.log(`Estimated incremental spend: $${apiCostUsd.toFixed(2)}`);
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
