import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
};

const otherPostsQuery = groq`*[_type == "post" && slug.current != $exclude && status == "published"]|order(publishedAt desc)[0...3]{
  _id, title, "slug": slug.current, excerpt, publishedAt
}`;

export async function RelatedPosts({ excludeSlug }: { excludeSlug: string }) {
  const items = (await sanityClient.fetch<Post[]>(otherPostsQuery, { exclude: excludeSlug })) ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-mm-gray-150 pt-12">
      <p className="eyebrow">More from the blog</p>
      <h2 className="font-serif mt-3 text-2xl text-mm-charcoal md:text-3xl">Keep reading</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p._id}
            href={`/insights/${p.slug}`}
            className="group block rounded-[4px] border border-mm-gray-150 p-6 transition-all hover:-translate-y-1 hover:border-mm-charcoal hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
          >
            {p.publishedAt ? (
              <time dateTime={p.publishedAt} className="text-[11px] uppercase tracking-[0.14em] text-mm-gray-400">
                {new Date(p.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
              </time>
            ) : null}
            <h3 className="font-serif mt-3 text-xl leading-snug text-mm-charcoal md:text-2xl line-clamp-2">
              {p.title}
            </h3>
            {p.excerpt ? (
              <p className="mt-3 text-[13px] leading-relaxed text-mm-gray-600 line-clamp-3">{p.excerpt}</p>
            ) : null}
            <span className="mt-4 inline-block text-[12px] font-semibold text-mm-charcoal group-hover:text-mm-red">
              Read →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
