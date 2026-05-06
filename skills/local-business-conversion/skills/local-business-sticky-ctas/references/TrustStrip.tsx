import {
  ShieldCheck,
  PackageCheck,
  Clock,
  FileText,
  Users,
  Truck,
  Star,
  Home,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type TrustItem = {
  Icon: LucideIcon;
  label: string;
  detail: string;
};

// Display the rating only. The literal review count is banned in customer-
// facing copy (count grows weekly; the number rotting in HTML is worse than
// not having it). Rating stays at 5.0 across every town and is safe to show.
const { rating: REVIEW_RATING } = siteConfig.googleReviews;

const items: TrustItem[] = [
  {
    Icon: ShieldCheck,
    label: "Public Liability",
    detail: "Up to £2.5m cover",
  },
  {
    Icon: PackageCheck,
    label: "Goods in Transit",
    detail: "Up to £50k per load",
  },
  {
    Icon: Clock,
    label: "2-Hour Quote",
    detail: "Written, no waiting",
  },
  {
    Icon: FileText,
    label: "Fixed-Price Quotes",
    detail: "No surprise charges",
  },
  {
    Icon: Users,
    label: "In-House Crews",
    detail: "Never subcontracted",
  },
  {
    Icon: Truck,
    label: "UK-Wide Reach",
    detail: "Local & long distance",
  },
  {
    Icon: Star,
    label: `${REVIEW_RATING.toFixed(1)}★ Google Reviews`,
    detail: "Five-star rated across every town we cover",
  },
  {
    Icon: Home,
    label: "Family-Run",
    detail: "Honest, hands-on service",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-mm-gray-150 bg-mm-cream-deep">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-12 md:py-16">
        <div className="mb-10 text-center">
          <p className="eyebrow justify-center !text-mm-red before:bg-mm-red">
            Why Marley Moves
          </p>
          <h2 className="font-serif mt-4 text-3xl leading-tight text-mm-charcoal md:text-4xl">
            Properly insured. Priced honestly.
            <br className="hidden md:block" /> Answered by Connor.
          </h2>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-4">
          {items.map(({ Icon, label, detail }) => (
            <li
              key={label}
              className="group flex flex-col items-center text-center"
            >
              <span
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-mm-white ring-1 ring-mm-charcoal/15 transition-all duration-300 group-hover:ring-mm-red group-hover:ring-2 group-hover:shadow-mm-card-hover"
                aria-hidden="true"
              >
                <Icon
                  className="h-7 w-7 text-mm-red transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                />
              </span>
              <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-mm-charcoal">
                {label}
              </div>
              <div className="mt-1.5 text-[12px] leading-snug text-mm-gray-600">
                {detail}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
