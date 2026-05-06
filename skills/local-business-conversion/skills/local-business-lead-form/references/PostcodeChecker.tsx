"use client";

import { useState } from "react";
import Link from "next/link";
import { track } from "@/lib/analytics";

type Area = { name: string; slug: string; outcodes: string[] };

export function PostcodeChecker({ areas }: { areas: Area[] }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<
    | { kind: "idle" }
    | { kind: "invalid" }
    | { kind: "match"; area: Area }
    | { kind: "no-match"; outcode: string }
  >({ kind: "idle" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = value.trim().toUpperCase().replace(/\s+/g, "");
    const outcode = extractOutcode(input);
    if (!outcode) {
      track("postcode_check", { result: "invalid" });
      setResult({ kind: "invalid" });
      return;
    }
    const match = areas.find((a) => a.outcodes.includes(outcode));
    if (match) {
      // High-intent engagement signal for PPC + Meta optimisation —
      // a user who's checked their postcode and matched a town we cover
      // is likely to convert. GA4/GTM dataLayer/Meta Pixel all receive it.
      track("postcode_check", { result: "match", outcode, town_slug: match.slug });
      setResult({ kind: "match", area: match });
    } else {
      track("postcode_check", { result: "no_match", outcode });
      setResult({ kind: "no-match", outcode });
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-2xl">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="postcode-input">Postcode</label>
        <input
          id="postcode-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a postcode (e.g. SP7 9PX)"
          className="flex-1 rounded-[4px] border border-mm-gray-150 bg-white px-5 py-4 text-[15px] focus:border-mm-charcoal focus:outline-none"
          autoComplete="postal-code"
          spellCheck={false}
        />
        <button
          type="submit"
          className="rounded-[4px] bg-mm-red px-6 py-4 text-[14px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-mm-red-deep"
        >
          Check
        </button>
      </form>
      <div aria-live="polite" className="mt-4 min-h-[3rem] text-[15px]">
        {result.kind === "invalid" ? (
          <p className="text-mm-red">That doesn&apos;t look like a UK postcode. Try something like &ldquo;SP7 9PX&rdquo;.</p>
        ) : null}
        {result.kind === "match" ? (
          <p className="text-mm-charcoal">
            Yes, we cover <strong>{result.area.name}</strong>.{" "}
            <Link href={`/removals/${result.area.slug}`} className="text-mm-red underline">
              See our {result.area.name} page →
            </Link>
          </p>
        ) : null}
        {result.kind === "no-match" ? (
          <p className="text-mm-charcoal">
            We don&apos;t regularly cover <strong>{result.outcode}</strong>, but we do UK-wide long-distance moves.{" "}
            <Link href="/quote" className="text-mm-red underline">
              Get a quote →
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

function extractOutcode(input: string): string | null {
  // Basic UK postcode regex — outcode is the first part
  const match = input.match(/^([A-Z]{1,2}[0-9][A-Z0-9]?)/);
  return match ? match[1] : null;
}
