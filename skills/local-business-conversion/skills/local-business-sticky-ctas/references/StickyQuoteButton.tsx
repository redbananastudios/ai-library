"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Floating "Get a Quote" button that appears after the user scrolls past the hero
 * (~600px). Hidden on mobile (the MobileCallBar already covers that slot).
 */
export function StickyQuoteButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const threshold = 600;
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/quote"
      aria-label="Get a free quote"
      data-analytics-event="cta_click"
      data-analytics-source="sticky-quote"
      className={`hidden md:inline-flex fixed bottom-6 right-24 z-40 items-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
      style={{ backgroundColor: "#C03838", color: "#ffffff" }}
    >
      Get a Quote
      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
    </Link>
  );
}
