"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

// Mobile sticky call bar. Renders on every route EXCEPT the home page,
// which has its own dedicated MobileQuoteStickyBar that pulls visitors
// into the hero quote form rather than straight to a phone call.
export function MobileCallBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <a
      href={`tel:${siteConfig.primaryPhoneTel}`}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-mm-red text-white text-center py-4 text-[15px] font-semibold tracking-wide shadow-[0_-6px_24px_rgba(0,0,0,0.12)]"
      data-analytics-event="phone_click"
      data-analytics-source="mobile-sticky"
    >
      Call {siteConfig.primaryPhone} for a free quote
    </a>
  );
}
