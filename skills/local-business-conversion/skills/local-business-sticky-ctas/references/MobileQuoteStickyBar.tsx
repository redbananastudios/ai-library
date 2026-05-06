"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

// Sticky bottom bar shown only on the home page. Pulls visitors towards
// the quote form rather than straight to a phone call (the form is the
// primary conversion path; phone is in the top nav).
//
// Hides itself once #hero-form is in view so the user isn't fighting a
// floating bar while filling the form. The bar also disappears once the
// user submits step 2 and navigates to /thanks (pathname check).
export function MobileQuoteStickyBar() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = document.querySelector("#hero-form");
    if (!target) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: "-30% 0px 0px 0px" },
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, []);

  if (pathname !== "/") return null;
  if (hidden) return null;

  return (
    <div
      role="region"
      aria-label="Quick quote actions"
      className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-mm-charcoal text-white px-4 py-3 shadow-[0_-8px_18px_rgba(0,0,0,0.18)] flex items-center justify-between gap-3"
    >
      <div className="flex flex-col leading-none">
        <span className="text-[10px] uppercase tracking-[0.14em] text-white/70">From</span>
        <span className="font-serif text-[22px] text-mm-red mt-0.5">£600</span>
      </div>
      <a
        href="#hero-form"
        onClick={() => track("mobile_sticky_cta_tap", {})}
        className="rounded-[3px] bg-mm-red px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white"
      >
        Get my quote ↓
      </a>
    </div>
  );
}
