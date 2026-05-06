import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import { CoverageMap } from "./CoverageMap";

type Area = {
  _id: string;
  name: string;
  slug: string;
  county?: string;
  distanceFromHqMiles?: number;
};

const topAreasQuery = groq`*[_type == "area"]|order(distanceFromHqMiles asc)[0...8]{
  _id, name, "slug": slug.current, county, distanceFromHqMiles
}`;

type Props = {
  /** Override the default H2 ("Local to your move?"). Used by /services/house-removals/
   *  to swap in a kw-bearing variant ("House removals across Dorset, Somerset and Wiltshire"). */
  heading?: string;
  /** Optional intro paragraph rendered between the H2 and the town-card grid.
   *  Used by /services/house-removals/ to add ~290w of county-coverage prose. */
  intro?: string;
  /** Render the SVG coverage map alongside the prose (2-col layout). Used on
   *  /services/house-removals/ where the map adds genuine SEO + trust value. */
  showMap?: boolean;
};

export async function RelatedAreas({ heading, intro, showMap }: Props = {}) {
  const items = (await sanityClient.fetch<Area[]>(topAreasQuery)) ?? [];
  if (items.length === 0) return null;
  return (
    <section className="mt-16 border-t border-mm-gray-150 pt-12">
      <p className="eyebrow">Areas we cover</p>
      <h2 className="font-serif mt-3 text-2xl text-mm-charcoal md:text-3xl">
        {heading ?? "Local to your move?"}
      </h2>
      {intro && showMap ? (
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1fr] md:items-center md:gap-14">
          <p className="text-[15px] leading-relaxed text-mm-charcoal">{intro}</p>
          <div className="rounded-[4px] border border-mm-gray-150 bg-mm-cream-deep p-4 md:p-6">
            <CoverageMap />
          </div>
        </div>
      ) : intro ? (
        <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-mm-charcoal">{intro}</p>
      ) : null}
      <div className="mt-10 grid gap-3 md:grid-cols-4">
        {items.map((a) => (
          <Link
            key={a._id}
            href={`/removals/${a.slug}`}
            className="group block rounded-[4px] border border-mm-gray-150 px-4 py-3 transition-colors hover:border-mm-charcoal"
          >
            <div className="font-serif text-lg text-mm-charcoal">{a.name}</div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-mm-gray-400">
              {a.county ?? ""}
              {typeof a.distanceFromHqMiles === "number" ? ` · ${a.distanceFromHqMiles} mi` : ""}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/removals" className="text-[13px] font-semibold text-mm-charcoal hover:text-mm-red border-b border-mm-charcoal pb-1 hover:border-mm-red">
          See all areas we cover →
        </Link>
      </div>
    </section>
  );
}
