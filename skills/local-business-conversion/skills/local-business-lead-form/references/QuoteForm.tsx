"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/primitives/Button";
import { siteConfig } from "@/lib/site-config";
import { submitQuote } from "@/app/actions/submit-quote";
import {
  track,
  estimatedLeadValueGBP,
  buildEnhancedConversionPayload,
} from "@/lib/analytics";

const serviceOptions = [
  "Packing",
  "Unpacking",
  "Storage",
  "Furniture dismantling",
  "Specialist items",
  "House clearance",
];

const propertySizes = [
  "Studio / 1 bedroom",
  "2 bedroom",
  "3 bedroom",
  "4 bedroom",
  "5+ bedroom",
  "Commercial / office",
  "Single items",
];

type FormState = {
  name: string;
  phone: string;
  email: string;
  fromPostcode: string;
  toPostcode: string;
  propertySize: string;
  preferredDate: string;
  services: string[];
  notes: string;
};

const initial: FormState = {
  name: "",
  phone: "",
  email: "",
  fromPostcode: "",
  toPostcode: "",
  propertySize: "",
  preferredDate: "",
  services: [],
  notes: "",
};

export function QuoteForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form field abandonment tracking — fires `form_field_focus` on the
  // first field touched (engagement signal), and `form_field_abandon` on
  // navigate-away if the form was started but not submitted (drop-off
  // signal — surfaces the field that's killing conversions).
  const firstFocusedRef = useRef<string | null>(null);
  const lastFocusedRef = useRef<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (firstFocusedRef.current && !submittedRef.current) {
        track("form_field_abandon", {
          location: "quote_page_form",
          first_focused_field: firstFocusedRef.current,
          last_focused_field: lastFocusedRef.current,
        });
      }
    };
  }, []);

  const onFieldFocus = (field: string) => {
    if (!firstFocusedRef.current) {
      firstFocusedRef.current = field;
      track("form_field_focus", { location: "quote_page_form", field });
    }
    lastFocusedRef.current = field;
  };

  const toggleService = (s: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s],
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submittedRef.current = true;

    const value = estimatedLeadValueGBP(form.propertySize);

    // Conversion tracking — fires for GA4, GTM dataLayer, Plausible, and
    // Meta Pixel. cta_quote_submit is mapped to a Meta Pixel `Lead` event
    // in lib/analytics.ts so PPC and Meta Ads conversion APIs receive it.
    // The `value` + `currency` fields let Google/Meta smart bidding
    // weight high-value moves over single-item jobs.
    track("cta_quote_submit", {
      location: "quote_page_form",
      value,
      currency: "GBP",
      property_size: form.propertySize || undefined,
      services: form.services.length ? form.services : undefined,
      from_postcode_outcode: form.fromPostcode.split(" ")[0]?.toUpperCase() || undefined,
      to_postcode_outcode: form.toPostcode.split(" ")[0]?.toUpperCase() || undefined,
    });

    // Enhanced Conversions for Google Ads — push hashed PII into dataLayer
    // alongside the conversion. The Google Ads tag in GTM picks this up
    // and sends it with the Ads click ID, rescuing attribution from
    // cookie loss / iOS Mail Privacy / Safari ITP. Fires async so it
    // doesn't block the form submit.
    if (form.email || form.phone) {
      buildEnhancedConversionPayload({ email: form.email, phone: form.phone })
        .then((data) => {
          if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: "enhanced_conversion_data", user_data: data });
          }
        })
        .catch(() => {
          /* non-critical — conversion event already fired */
        });
    }

    start(async () => {
      const result = await submitQuote(form);
      if (result.ok) {
        setDone(true);
      } else {
        track("cta_quote_error", {
          location: "quote_page_form",
          errorType: result.error ? "submit_failed" : "network_error",
        });
        setError(result.error ?? "Something went wrong. Please call us on " + siteConfig.primaryPhone + ".");
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-[4px] border border-mm-gray-150 bg-mm-offwhite p-10 text-center">
        <p className="eyebrow justify-center">Thank you</p>
        <h2 className="font-serif mt-4 text-3xl text-mm-charcoal md:text-4xl">
          We&apos;ve got your details.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-mm-gray-600">
          You&apos;ll hear from us within two working hours with a written fixed quote. If your move is
          urgent, call us directly on{" "}
          <a href={`tel:${siteConfig.primaryPhoneTel}`} className="text-mm-red font-semibold">
            {siteConfig.primaryPhone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* About you */}
      <fieldset className="space-y-4">
        <legend className="eyebrow mb-2">About you</legend>
        <div className="grid gap-4 md:grid-cols-3">
          <Input fieldId="name" onFocus={onFieldFocus} label="Name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
          <Input fieldId="phone" onFocus={onFieldFocus} label="Phone" required type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
          <Input fieldId="email" onFocus={onFieldFocus} label="Email" required type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
        </div>
      </fieldset>

      {/* Your move */}
      <fieldset className="space-y-4">
        <legend className="eyebrow mb-2">Your move</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Input fieldId="from_postcode" onFocus={onFieldFocus} label="From postcode" required value={form.fromPostcode} onChange={(v) => setForm({ ...form, fromPostcode: v.toUpperCase() })} autoComplete="postal-code" />
          <Input fieldId="to_postcode" onFocus={onFieldFocus} label="To postcode" required value={form.toPostcode} onChange={(v) => setForm({ ...form, toPostcode: v.toUpperCase() })} />
          <Select fieldId="property_size" onFocus={onFieldFocus} label="Property size" required value={form.propertySize} onChange={(v) => setForm({ ...form, propertySize: v })} options={propertySizes} />
          <Input fieldId="preferred_date" onFocus={onFieldFocus} label="Preferred date (approx.)" type="date" value={form.preferredDate} onChange={(v) => setForm({ ...form, preferredDate: v })} />
        </div>
      </fieldset>

      {/* Services */}
      <fieldset>
        <legend className="eyebrow mb-3">Services (tick what applies)</legend>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((s) => {
            const selected = form.services.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                className={`rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                  selected
                    ? "border-mm-charcoal bg-mm-charcoal text-white"
                    : "border-mm-gray-150 bg-white text-mm-charcoal hover:border-mm-charcoal"
                }`}
                aria-pressed={selected}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset>
        <legend className="eyebrow mb-2">Anything else?</legend>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Access notes, piano, pets, stairs, parking restrictions..."
          className="w-full rounded-[4px] border border-mm-gray-150 bg-white p-4 text-[14px] leading-relaxed focus:border-mm-charcoal focus:outline-none"
        />
      </fieldset>

      {error ? (
        <p className="rounded-[4px] border border-mm-red bg-mm-red/5 p-4 text-[14px] text-mm-red">{error}</p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[12px] text-mm-gray-400 max-w-sm">
          By submitting you agree to us contacting you about your move. We never share your details.
        </p>
        <Button type="submit" variant="red" disabled={pending}>
          {pending ? "Sending..." : "Send: get quote in 2 hours"}
        </Button>
      </div>

      {/* WhatsApp alternative — for customers who'd rather send a few photos
          than fill the form. Direct route to Connor's mobile, prefilled with
          the standard quote-request message from siteConfig. */}
      <div className="border-t border-mm-gray-150 pt-6 text-center">
        <p className="text-[13px] text-mm-gray-600">
          Prefer not to fill a form?{" "}
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              "Hi Marley Moves, I'd like a quote for my move and I'm happy to send a few photos of the rooms.",
            )}`}
            className="font-semibold text-mm-charcoal underline decoration-mm-red decoration-2 underline-offset-4 hover:text-mm-red"
            rel="noopener"
          >
            WhatsApp Connor a few photos
          </a>{" "}
          and we&apos;ll quote from those.
        </p>
      </div>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  fieldId,
  onFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  fieldId?: string;
  onFocus?: (field: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mm-gray-600">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={fieldId && onFocus ? () => onFocus(fieldId) : undefined}
        className="w-full rounded-[4px] border border-mm-gray-150 bg-white px-4 py-3 text-[14px] focus:border-mm-charcoal focus:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
  fieldId,
  onFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  fieldId?: string;
  onFocus?: (field: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.1em] text-mm-gray-600">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={fieldId && onFocus ? () => onFocus(fieldId) : undefined}
        className="w-full rounded-[4px] border border-mm-gray-150 bg-white px-4 py-3 text-[14px] focus:border-mm-charcoal focus:outline-none"
      >
        <option value="">Please choose...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
