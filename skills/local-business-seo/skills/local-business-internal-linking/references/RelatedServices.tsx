import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";

type Service = {
  _id: string;
  title: string;
  shortName?: string;
  tagline?: string;
  slug: string;
  intro?: string;
};

const otherServicesQuery = groq`*[_type == "service" && slug.current != $exclude][0...3]{
  _id, title, shortName, tagline, "slug": slug.current, intro
}`;

export async function RelatedServices({ excludeSlug }: { excludeSlug: string }) {
  const items = (await sanityClient.fetch<Service[]>(otherServicesQuery, { exclude: excludeSlug })) ?? [];
  if (items.length === 0) return null;
  return (
    <section className="mt-16 border-t border-mm-gray-150 pt-12">
      <p className="eyebrow">Related services</p>
      <h2 className="font-serif mt-3 text-2xl text-mm-charcoal md:text-3xl">You might also need</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <Link
            key={s._id}
            // Services live under /services/<slug>/ since the IA refactor.
            // Sanity stores just the bare slug ("packing", "storage", etc.)
            // so we prefix it here. Without the prefix the links 404.
            href={`/services/${s.slug}`}
            className="group block rounded-[4px] border border-mm-gray-150 p-5 transition-all hover:-translate-y-1 hover:border-mm-charcoal hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
          >
            <h3 className="font-serif text-lg text-mm-charcoal md:text-xl">{s.shortName ?? s.title}</h3>
            {s.tagline ? <p className="mt-1 text-[12px] uppercase tracking-[0.14em] text-mm-gray-400">{s.tagline}</p> : null}
            {s.intro ? <p className="mt-3 text-[13px] leading-relaxed text-mm-gray-600 line-clamp-3">{s.intro}</p> : null}
            <span className="mt-4 inline-block text-[12px] font-semibold text-mm-charcoal group-hover:text-mm-red">
              Learn more →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
