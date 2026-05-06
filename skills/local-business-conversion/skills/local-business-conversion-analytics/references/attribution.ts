/**
 * Source attribution capture for paid-traffic reporting.
 *
 * On first visit, reads gclid (Google Ads click ID), fbclid (Meta click
 * ID), and the standard utm_* parameters from the URL. Stores them in
 * localStorage with a 30-day TTL, plus the document.referrer at landing.
 *
 * Every analytics `track()` call attaches the stored attribution to the
 * event payload via getAttribution(), so a Lead submitted 10 minutes
 * after landing still credits the original click that drove the visit.
 *
 * No PII captured here — these are click IDs and campaign names only.
 *
 * Per AEO/PPC handoff 2026-05-01.
 */

const STORAGE_KEY = "mm-attribution";
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid", // Microsoft Ads (Bing)
  "ttclid", // TikTok
  "li_fat_id", // LinkedIn
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
] as const;

type ParamKey = (typeof PARAMS)[number];

export type Attribution = Partial<Record<ParamKey, string>> & {
  landing_referrer?: string;
  landing_url?: string;
  captured_at?: number;
};

function isExpired(a: Attribution): boolean {
  if (!a.captured_at) return true;
  return Date.now() - a.captured_at > TTL_MS;
}

/**
 * Capture URL params on first visit. Idempotent: only writes when the
 * current URL has at least one tracked param AND either no prior
 * attribution exists or the prior is expired. Attribution is "first
 * touch wins within the TTL window" — established marketing practice
 * for short sales cycles like ours (most quotes book within 14 days).
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const captured: Attribution = {};
    let foundAny = false;
    for (const key of PARAMS) {
      const v = url.searchParams.get(key);
      if (v) {
        captured[key] = v;
        foundAny = true;
      }
    }
    if (!foundAny) return; // organic landing — keep any existing attribution

    captured.landing_referrer = document.referrer || undefined;
    captured.landing_url = url.href;
    captured.captured_at = Date.now();

    const existing = readAttribution();
    if (existing && !isExpired(existing)) {
      // First-touch wins within TTL — don't overwrite
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
  } catch {
    /* localStorage may be unavailable (private mode, blocked) — fail silent */
  }
}

function readAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Attribution;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Read the current attribution payload to attach to a tracked event.
 * Returns an empty object if no attribution captured or expired (the
 * shape stays consistent for spread-into-payload usage).
 */
export function getAttribution(): Attribution {
  const a = readAttribution();
  if (!a || isExpired(a)) return {};
  // Strip captured_at — it's an internal field, not useful as event payload.
  const { captured_at: _captured_at, ...rest } = a;
  void _captured_at;
  return rest;
}
