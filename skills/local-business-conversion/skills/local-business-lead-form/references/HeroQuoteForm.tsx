"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuote } from "@/app/actions/submit-quote";
import {
  track,
  estimatedLeadValueGBP,
  buildEnhancedConversionPayload,
} from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { AddressAutocomplete, type AutocompletePlace } from "@/components/forms/AddressAutocomplete";

// =============================================================================
// Two-step quote form. Lives at the bottom of the hero on desktop and in an
// inline section below the hero on mobile (#hero-form anchor).
//
// Step 1: Name · Email · Moving from · Moving to (low-friction commitment)
// Step 2: Phone · Date of move · Property size · How did you hear?
//
// Step 1 is client-only (no server hit). Step 2 calls submitQuote() and
// redirects to /thanks?name=<first-name> on success.
//
// The same component renders on both desktop and mobile. Field stack switches
// from horizontal grid (md+) to vertical stack (sm).
// =============================================================================

type Step = "step1" | "step2";

type Step1Fields = {
  name: string;
  email: string;
  fromAddress: string;
  toAddress: string;
};

// Postcodes resolved from Google Places when the user picks a suggestion.
// Empty strings if the user typed freely without selecting a place — the
// server action still gets the typed address; postcode is just a bonus
// extracted signal for Connor's email.
type ResolvedPostcodes = {
  from: string;
  to: string;
};

type Step2Fields = {
  phone: string;
  dateOfMove: string;
  propertySize: string;
  referrer: string;
};

const PROPERTY_SIZES = [
  "Studio / 1 bedroom",
  "2 bedroom",
  "3 bedroom",
  "4 bedroom",
  "5+ bedroom",
  "Single item",
  "Commercial",
];

const DATE_OPTIONS = [
  "As soon as possible",
  "Within 2 weeks",
  "Within 1 month",
  "Within 2-3 months",
  "Just exploring",
];

const REFERRER_OPTIONS = [
  "Google search",
  "Recommendation",
  "Facebook / Instagram",
  "Returning customer",
  "Other",
];

// Permissive UK phone: optional +44 / leading 0, then 9-10 digits.
const UK_PHONE = /^(\+?44|0)\d{9,10}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Match any UK postcode embedded anywhere in a free-text string (used to
// extract a postcode if the user types "10 High Street, Gillingham SP7 9PX"
// without selecting a Google place suggestion).
const UK_POSTCODE_ANYWHERE = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i;

const FIELD =
  "w-full rounded-[3px] border border-mm-gray-150 bg-white px-3 h-[44px] text-[14px] text-mm-charcoal placeholder:text-mm-gray-400 focus:border-mm-charcoal focus:outline-none transition-colors";
const LABEL =
  "block mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mm-charcoal/85";
const ERROR_TEXT = "mt-1 text-[12px] text-red-600";
const PANEL =
  "rounded-[4px] border-2 border-mm-red bg-mm-cream-deep p-5 md:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.25)]";
const SUBMIT_BTN =
  "w-full md:w-auto md:min-w-[150px] md:px-7 h-[44px] rounded-[3px] text-[13px] font-bold uppercase tracking-[0.1em] text-white bg-mm-red hover:-translate-y-[1px] hover:shadow-md transition-all disabled:opacity-50 disabled:translate-y-0";

/** Pull a UK postcode out of a free-text address (e.g. "...Gillingham SP7 9PX, UK"
 *  → "SP7 9PX"). Used as a fallback when the user typed an address without
 *  selecting a Google Places suggestion. */
function extractPostcode(text: string): string {
  const m = text.match(UK_POSTCODE_ANYWHERE);
  return m ? m[0].toUpperCase().replace(/\s+/g, " ") : "";
}

/** Outcode prefix only ("SP8" from "SP7 9PX"). Sent as the `step1_submit`
 *  analytics payload so we get geographic signal without storing full
 *  postcodes in event data. */
function postcodePrefix(pc: string): string {
  const m = pc.trim().toUpperCase().match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
  return m ? m[1] : "";
}

export function HeroQuoteForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("step1");
  const [step1, setStep1] = useState<Step1Fields>({
    name: "",
    email: "",
    fromAddress: "",
    toAddress: "",
  });
  const [resolvedPostcodes, setResolvedPostcodes] = useState<ResolvedPostcodes>({
    from: "",
    to: "",
  });
  const [step2, setStep2] = useState<Step2Fields>({
    phone: "",
    dateOfMove: "",
    propertySize: "",
    referrer: "",
  });
  const [errors1, setErrors1] = useState<Partial<Record<keyof Step1Fields, string>>>({});
  const [errors2, setErrors2] = useState<Partial<Record<keyof Step2Fields, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const focused1 = useRef(false);
  const focused2 = useRef(false);

  // Field abandonment tracking — first focused + last focused, fired on
  // unmount (route change) if the user never made it to a successful
  // submit. Surfaces the field that's causing drop-off in PPC reports.
  const firstFocusedFieldRef = useRef<string | null>(null);
  const lastFocusedFieldRef = useRef<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (firstFocusedFieldRef.current && !submittedRef.current) {
        track("form_field_abandon", {
          location: "hero_form",
          first_focused_field: firstFocusedFieldRef.current,
          last_focused_field: lastFocusedFieldRef.current,
        });
      }
    };
  }, []);

  const onFieldFocus = (field: string, location: "hero_form" | "hero_form_step2") => {
    if (!firstFocusedFieldRef.current) {
      firstFocusedFieldRef.current = field;
      track("form_field_focus", { location, field });
    }
    lastFocusedFieldRef.current = field;
  };

  const onFocus1 = () => {
    if (!focused1.current) {
      focused1.current = true;
      track("hero_form_focus", { location: "hero_form" });
    }
  };
  const onFocus2 = () => {
    if (!focused2.current) {
      focused2.current = true;
      track("step2_focus", { location: "hero_form_step2" });
    }
  };

  const set1 =
    (k: keyof Step1Fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setStep1((prev) => ({ ...prev, [k]: e.target.value }));

  /** Called when the user picks a Google Places suggestion. We replace the
   *  input value with Google's canonical formatted address and stash the
   *  resolved postcode (if any) for the server action. */
  const onPlaceSelected =
    (which: "from" | "to") => (place: AutocompletePlace) => {
      const fieldKey = which === "from" ? "fromAddress" : "toAddress";
      setStep1((prev) => ({ ...prev, [fieldKey]: place.formattedAddress }));
      setResolvedPostcodes((prev) => ({ ...prev, [which]: place.postcode ?? "" }));
    };

  const set2 =
    (k: keyof Step2Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setStep2((prev) => ({ ...prev, [k]: e.target.value }));

  function validateStep1(s: Step1Fields): Partial<Record<keyof Step1Fields, string>> {
    const e: Partial<Record<keyof Step1Fields, string>> = {};
    if (s.name.trim().length < 2) e.name = "Please enter your name.";
    if (!EMAIL.test(s.email.trim())) e.email = "Please enter a valid email address.";
    // Address fields accept any non-trivial text (full address, town, or
    // postcode). Google Places normally fills these via autocomplete; a free
    // typed value still works as long as it has some specificity.
    if (s.fromAddress.trim().length < 4) e.fromAddress = "Enter where you're moving from.";
    if (s.toAddress.trim().length < 4) e.toAddress = "Enter where you're moving to.";
    return e;
  }

  function validateStep2(s: Step2Fields): Partial<Record<keyof Step2Fields, string>> {
    const e: Partial<Record<keyof Step2Fields, string>> = {};
    if (!UK_PHONE.test(s.phone.replace(/\s/g, ""))) e.phone = "Please enter a valid UK phone number.";
    if (!s.dateOfMove) e.dateOfMove = "Please pick a date.";
    if (!s.propertySize) e.propertySize = "Please pick a property size.";
    return e;
  }

  function handleStep1Submit(ev: React.FormEvent) {
    ev.preventDefault();
    const errs = validateStep1(step1);
    setErrors1(errs);
    if (Object.keys(errs).length > 0) {
      track("step1_validation_error", { field: Object.keys(errs)[0] });
      return;
    }
    // Use the Google-resolved postcode if the user picked a suggestion, or
    // try to extract one from the free-typed text. Either way, we only send
    // the outcode prefix to analytics (no full postcodes in event data).
    const fromPc = resolvedPostcodes.from || extractPostcode(step1.fromAddress);
    const toPc = resolvedPostcodes.to || extractPostcode(step1.toAddress);
    track("step1_submit", {
      fromPrefix: postcodePrefix(fromPc),
      toPrefix: postcodePrefix(toPc),
    });
    setStep("step2");
  }

  async function handleStep2Submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (submitting) return;
    const errs = validateStep2(step2);
    setErrors2(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      // Resolve postcodes one more time at submit so the server action gets
      // both the full address (in notes-style fields) and the postcode where
      // available. Google-resolved postcodes win; free-typed text postcodes
      // are the fallback.
      const fromPc = resolvedPostcodes.from || extractPostcode(step1.fromAddress);
      const toPc = resolvedPostcodes.to || extractPostcode(step1.toAddress);
      const result = await submitQuote({
        name: step1.name.trim(),
        email: step1.email.trim(),
        phone: step2.phone.trim(),
        fromPostcode: fromPc,
        toPostcode: toPc,
        propertySize: step2.propertySize,
        preferredDate: step2.dateOfMove,
        referrer: step2.referrer || undefined,
        services: [],
        // Pack the full addresses into the notes field so Connor sees them
        // in the email even when the postcode isn't extractable.
        notes: `From: ${step1.fromAddress.trim()}\nTo: ${step1.toAddress.trim()}`,
        source: "homepage_hero_2step",
      });
      if (result.ok) {
        submittedRef.current = true;
        const value = estimatedLeadValueGBP(step2.propertySize);
        track("cta_quote_submit", {
          location: "hero_form_step2",
          value,
          currency: "GBP",
          property_size: step2.propertySize,
          from_postcode_outcode: postcodePrefix(fromPc) || undefined,
          to_postcode_outcode: postcodePrefix(toPc) || undefined,
          referrer_choice: step2.referrer || undefined,
          date_of_move: step2.dateOfMove,
        });
        // Enhanced Conversions for Google Ads — push hashed PII so Google
        // can match the conversion back to the click ID even after cookie
        // loss / iOS Mail Privacy / Safari ITP. Fire-and-forget so it
        // doesn't block the redirect to /thanks.
        buildEnhancedConversionPayload({ email: step1.email, phone: step2.phone })
          .then((data) => {
            if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
              window.dataLayer.push({ event: "enhanced_conversion_data", user_data: data });
            }
          })
          .catch(() => {
            /* non-critical — conversion event already fired */
          });
        const firstName = step1.name.trim().split(/\s+/)[0];
        router.push(`/thanks?name=${encodeURIComponent(firstName)}`);
      } else {
        setServerError(
          result.error ?? "Something went wrong. Please try again, or call 01747 637070.",
        );
        track("cta_quote_error", { location: "hero_form_step2", errorType: "submit_failed" });
      }
    } catch {
      setServerError("Something went wrong. Please try again, or call 01747 637070.");
      track("cta_quote_error", { location: "hero_form_step2", errorType: "network_error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ---- STEP 1 ---------------------------------------------------------------
  if (step === "step1") {
    return (
      <div className={PANEL}>
        <h2 className="font-serif text-[24px] md:text-[30px] lg:text-[34px] leading-[1.05] tracking-tight text-mm-charcoal">
          Get a fixed quote within 2 hours
        </h2>
        <form
          onSubmit={handleStep1Submit}
          className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3"
          noValidate
        >
          <div>
            <label htmlFor="hero-name" className={LABEL}>
              Your name
            </label>
            <input
              id="hero-name"
              type="text"
              value={step1.name}
              onChange={set1("name")}
              onFocus={onFocus1}
              className={FIELD}
              placeholder="First and last name"
              autoComplete="name"
              aria-invalid={!!errors1.name}
              required
            />
            {errors1.name && <p className={ERROR_TEXT}>{errors1.name}</p>}
          </div>
          <div>
            <label htmlFor="hero-email" className={LABEL}>
              Email
            </label>
            <input
              id="hero-email"
              type="email"
              value={step1.email}
              onChange={set1("email")}
              onFocus={onFocus1}
              className={FIELD}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors1.email}
              required
            />
            {errors1.email && <p className={ERROR_TEXT}>{errors1.email}</p>}
          </div>
          <div>
            <label htmlFor="hero-from" className={LABEL}>
              Moving from
            </label>
            <AddressAutocomplete
              id="hero-from"
              value={step1.fromAddress}
              onChange={set1("fromAddress")}
              onPlaceSelected={onPlaceSelected("from")}
              onFocus={onFocus1}
              className={FIELD}
              placeholder="Address or postcode"
              required
              ariaInvalid={!!errors1.fromAddress}
            />
            {errors1.fromAddress && <p className={ERROR_TEXT}>{errors1.fromAddress}</p>}
          </div>
          <div>
            <label htmlFor="hero-to" className={LABEL}>
              Moving to
            </label>
            <AddressAutocomplete
              id="hero-to"
              value={step1.toAddress}
              onChange={set1("toAddress")}
              onPlaceSelected={onPlaceSelected("to")}
              onFocus={onFocus1}
              className={FIELD}
              placeholder="Address or postcode"
              required
              ariaInvalid={!!errors1.toAddress}
            />
            {errors1.toAddress && <p className={ERROR_TEXT}>{errors1.toAddress}</p>}
          </div>
          <div className="flex items-end">
            <button type="submit" className={SUBMIT_BTN}>
              Get my quote →
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-mm-charcoal/70">
          5.0 <span className="text-mm-red">★★★★★</span> Google rating · Family-run · Insured £2.5m · Or call{" "}
          <a
            href={`tel:${siteConfig.primaryPhoneTel}`}
            className="underline hover:text-mm-charcoal"
          >
            {siteConfig.primaryPhone}
          </a>
        </p>
      </div>
    );
  }

  // ---- STEP 2 ---------------------------------------------------------------
  const firstName = step1.name.trim().split(/\s+/)[0] || "friend";
  return (
    <div className={PANEL}>
      <button
        type="button"
        onClick={() => setStep("step1")}
        className="text-[12px] text-mm-charcoal/70 hover:text-mm-red underline mb-3"
      >
        ← Back
      </button>
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mm-charcoal/55 mb-2"
        aria-live="polite"
      >
        Step 2 of 2
      </p>
      <h2 className="font-serif text-[20px] md:text-[24px] leading-tight text-mm-charcoal">
        Just one last step, {firstName}.
      </h2>
      <p className="mt-2 text-[12px] text-mm-charcoal/70">
        Moving from <strong className="text-mm-charcoal">{step1.fromAddress}</strong>{" "}
        to <strong className="text-mm-charcoal">{step1.toAddress}</strong> ·{" "}
        {step1.email}
      </p>
      <form
        onSubmit={handleStep2Submit}
        className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3"
        noValidate
      >
        <div>
          <label htmlFor="hero-phone" className={LABEL}>
            Phone
          </label>
          <input
            id="hero-phone"
            type="tel"
            value={step2.phone}
            onChange={set2("phone")}
            onFocus={onFocus2}
            className={FIELD}
            placeholder="e.g. 07700 900123"
            autoComplete="tel"
            aria-invalid={!!errors2.phone}
            required
          />
          {errors2.phone && <p className={ERROR_TEXT}>{errors2.phone}</p>}
        </div>
        <div>
          <label htmlFor="hero-date" className={LABEL}>
            Date of move
          </label>
          <select
            id="hero-date"
            value={step2.dateOfMove}
            onChange={set2("dateOfMove")}
            onFocus={onFocus2}
            className={FIELD}
            aria-invalid={!!errors2.dateOfMove}
            required
          >
            <option value="">Select...</option>
            {DATE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors2.dateOfMove && <p className={ERROR_TEXT}>{errors2.dateOfMove}</p>}
        </div>
        <div>
          <label htmlFor="hero-size" className={LABEL}>
            Property size
          </label>
          <select
            id="hero-size"
            value={step2.propertySize}
            onChange={set2("propertySize")}
            onFocus={onFocus2}
            className={FIELD}
            aria-invalid={!!errors2.propertySize}
            required
          >
            <option value="">Select...</option>
            {PROPERTY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors2.propertySize && <p className={ERROR_TEXT}>{errors2.propertySize}</p>}
        </div>
        <div>
          <label htmlFor="hero-referrer" className={LABEL}>
            How did you hear?
          </label>
          <select
            id="hero-referrer"
            value={step2.referrer}
            onChange={set2("referrer")}
            onFocus={onFocus2}
            className={FIELD}
          >
            <option value="">Optional</option>
            {REFERRER_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={submitting} className={SUBMIT_BTN}>
            {submitting ? "Sending..." : "Get your quote →"}
          </button>
        </div>
      </form>
      {serverError && <p className="mt-3 text-[13px] text-red-600">{serverError}</p>}
      <p className="mt-3 text-center text-[11px] leading-relaxed text-mm-charcoal/70">
        Family-run · Fixed-price written quote · Or call{" "}
        <a
          href={`tel:${siteConfig.primaryPhoneTel}`}
          className="underline hover:text-mm-charcoal"
        >
          {siteConfig.primaryPhone}
        </a>
      </p>
    </div>
  );
}
