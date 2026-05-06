/**
 * Client-side analytics helpers.
 * Supports GA4 (via gtag), GTM (dataLayer), Meta Pixel (fbq), and Plausible (plausible).
 * Respects Consent Mode v2 — no tracking fires before user consent (except Plausible, which is cookieless).
 *
 * 2026-05-01 PPC overhaul:
 *   - Every event payload auto-attaches source attribution (gclid/fbclid/utm) via getAttribution()
 *   - Lead events carry a `value` + `currency` parameter for smart-bidding optimisation
 *   - New events: lead_thank_you_view, scroll_depth (now wired), outbound_click,
 *     form_field_focus, form_field_abandon, content_group_view
 */

import { getAttribution } from "./attribution";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    __mm_consent?: "granted" | "denied" | "pending";
  }
}

export type AnalyticsEvent =
  | "quote_submit"
  | "phone_click"
  | "email_click"
  | "whatsapp_click"
  | "cta_click"
  | "faq_open"
  | "scroll_depth"
  // Hero engagement events
  | "cta_call_click"
  | "cta_quote_click"
  | "cta_whatsapp_click"
  | "cta_quote_submit"
  | "cta_quote_error"
  | "hero_form_focus"
  // Two-step hero form events
  | "step1_submit"
  | "step1_validation_error"
  | "step2_focus"
  | "mobile_sticky_cta_tap"
  | "cta_offer_click"
  | "offer_terms_click"
  // High-intent postcode lookup (PPC + Meta optimisation signal)
  | "postcode_check"
  // Backup conversion (fires when /thanks is reached; supplements
  // cta_quote_submit which can be lost to ad blockers / network blips)
  | "lead_thank_you_view"
  // External link clicks (Trustpilot, Google reviews, Companies House etc.)
  | "outbound_click"
  // Form interaction depth — first focus + abandonment field
  | "form_field_focus"
  | "form_field_abandon"
  // Content classification — fires once per page view to tag the page type
  | "content_group_view";

// ---------------------------------------------------------------------------
// Lead-value mapping. Used by the `value` parameter on conversion events so
// Google/Meta smart bidding can prioritise high-value leads. Numbers are
// rough indicative job values pulled from the existing town-content /
// county-hub pricing bands (£600/£800/£1050/£1400/£1600/£1800). The exact
// figures don't matter as much as the relative weights — they're optimisation
// hints, not invoice values.
// ---------------------------------------------------------------------------
const PROPERTY_SIZE_VALUE_GBP: Record<string, number> = {
  "Studio / 1 bedroom": 600,
  "2 bedroom": 800,
  "3 bedroom": 1050,
  "4 bedroom": 1400,
  "5+ bedroom": 1800,
  "Commercial / office": 1500,
  "Single items": 150,
};

export function estimatedLeadValueGBP(propertySize?: string): number {
  if (!propertySize) return 800; // median fallback
  return PROPERTY_SIZE_VALUE_GBP[propertySize] ?? 800;
}

// ---------------------------------------------------------------------------
// Enhanced Conversions for Google Ads — hashes user PII (email, phone) so
// Google can match the conversion back to the Ads click ID even when
// cookies are blocked (iOS Mail Privacy Protection, Safari ITP, etc.).
//
// Per Google spec:
//   - Email: lowercase + trim before hashing
//   - Phone: E.164 (+447495835006), no spaces/dashes
//   - SHA-256, hex-encoded
//
// Pushed to dataLayer as `enhanced_conversion_data` per the GTM Enhanced
// Conversions tag spec; Google's Ads tag in GTM picks it up.
// ---------------------------------------------------------------------------
async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalisePhoneE164(phone: string): string {
  // Strip everything except digits + leading +. UK number defaults: 0xx → +44xx.
  const trimmed = phone.trim().replace(/[^\d+]/g, "");
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("0")) return "+44" + trimmed.slice(1);
  return trimmed;
}

export async function buildEnhancedConversionPayload(opts: {
  email?: string;
  phone?: string;
}): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (opts.email) out.sha256_email_address = await sha256Hex(normaliseEmail(opts.email));
  if (opts.phone) out.sha256_phone_number = await sha256Hex(normalisePhoneE164(opts.phone));
  return out;
}

// ---------------------------------------------------------------------------
// Core track() — fires to Plausible (always), then GA4/GTM/Meta (consent-gated).
// Auto-attaches source attribution to every event.
// ---------------------------------------------------------------------------
export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Attach captured attribution (gclid, fbclid, utm_*, landing_referrer) to
  // every event. First-touch within 30-day TTL — see lib/attribution.ts.
  const attribution = getAttribution();
  const enriched = { ...attribution, ...props };

  // Plausible always fires (cookieless, consent-free)
  if (typeof window.plausible === "function") {
    window.plausible(event, { props: enriched });
  }

  // Gated on consent
  const granted = window.__mm_consent === "granted";
  if (!granted) return;

  if (typeof window.gtag === "function") {
    window.gtag("event", event, enriched);
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...enriched });
  }
  if (typeof window.fbq === "function") {
    // Map to Meta standard Lead event; everything else fires as trackCustom.
    // The lead_thank_you_view backup also fires Lead so Meta gets a
    // duplicate-resilient signal (Meta dedupes by event_id when set).
    const leadEvents: AnalyticsEvent[] = ["quote_submit", "cta_quote_submit", "lead_thank_you_view"];
    if (leadEvents.includes(event)) {
      window.fbq("track", "Lead", enriched);
    } else if (event === "phone_click" || event === "whatsapp_click") {
      window.fbq("track", "Contact", enriched);
    } else {
      window.fbq("trackCustom", event, enriched);
    }
  }
}

/**
 * Wire up global click listeners for phone, email, whatsapp, CTA buttons,
 * and external (outbound) links.
 *
 * Call from a client component at the root of the app.
 */
export function wireGlobalAnalytics() {
  if (typeof window === "undefined") return () => {};

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const anchor = target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") ?? "";
    const explicit = anchor.getAttribute("data-analytics-event") as AnalyticsEvent | null;
    const source = anchor.getAttribute("data-analytics-source") ?? undefined;

    if (explicit) {
      track(explicit, source ? { source } : {});
      return;
    }

    if (href.startsWith("tel:")) {
      track("phone_click", { number: href.slice(4) });
      return;
    }
    if (href.startsWith("mailto:")) {
      track("email_click", { email: href.slice(7) });
      return;
    }
    if (href.includes("wa.me/") || href.includes("whatsapp.com")) {
      track("whatsapp_click", {});
      return;
    }
    if (anchor.classList.contains("bg-mm-red") || anchor.classList.contains("btn-red")) {
      track("cta_click", { text: anchor.textContent?.trim().slice(0, 60), href });
      return;
    }
    // External (non-Marley) links — useful trust-funnel signal.
    // Skips internal links (relative or marleymoves.co.uk) and links
    // we already track explicitly above.
    if (/^https?:\/\//i.test(href)) {
      try {
        const dest = new URL(href);
        const isInternal = dest.hostname.endsWith("marleymoves.co.uk") || dest.hostname === window.location.hostname;
        if (!isInternal) {
          track("outbound_click", {
            href,
            destination_host: dest.hostname,
            text: anchor.textContent?.trim().slice(0, 60),
          });
        }
      } catch {
        /* malformed URL — ignore */
      }
    }
  };

  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
