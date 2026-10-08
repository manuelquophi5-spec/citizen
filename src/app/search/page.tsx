import type { Metadata } from "next";
import Link from "next/link";
import { DataProvider } from "@/lib/data-provider";
import { initiatives as mockInitiatives, events, blogPosts, partners } from "@/lib/mock-data";
import { SectionHeading, Card, Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const needle = q.toLowerCase();
  const matches = (...fields: (string | null | undefined)[]) =>
    fields.some((f) => f && f.toLowerCase().includes(needle));

  const liveInitiatives = await DataProvider.getInitiatives();
  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";
  const allInitiatives = liveInitiatives.length > 0 ? liveInitiatives : (isLive ? [] : mockInitiatives);

  const matchedInitiatives = q ? allInitiatives.filter((i: any) => matches(i.title, i.summary || i.description)).slice(0, 8) : [];
  const matchedEvents = q ? events.filter((e) => matches(e.title, e.summary)).slice(0, 8) : [];
  const matchedPosts = q ? blogPosts.filter((p) => p.published && matches(p.title, p.excerpt)).slice(0, 8) : [];
  const matchedPartners = q
    ? partners.filter((p) => p.status === "APPROVED" && matches(p.name, p.organisation)).slice(0, 8)
    : [];

  const totalResults = matchedInitiatives.length + matchedEvents.length + matchedPosts.length + matchedPartners.length;

  return (
    <section className="section-y">
      <div className="container-page max-w-3xl">
        <SectionHeading eyebrow="Find anything on the site" title="Search" />
        <form className="mt-6 flex gap-2" action="/search">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search initiatives, events, blog posts, partners…"
            className="w-full rounded-lg border border-ocean-200 px-4 py-3 text-sm dark:border-ocean-700 dark:bg-ocean-900"
          />
          <button className="rounded-lg bg-ocean-700 px-5 text-sm font-semibold text-white hover:bg-ocean-600">Search</button>
        </form>

        {q && (
          <p className="mt-6 text-sm text-ocean-600 dark:text-ocean-400">
            {totalResults} result{totalResults === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
          </p>
        )}

        <div className="mt-6 space-y-8">
          {matchedInitiatives.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-600 dark:text-ocean-400">Initiatives</h2>
              <div className="mt-2 space-y-2">
                {matchedInitiatives.map((i) => (
                  <Link key={i.id} href={`/initiatives/${i.slug}`}>
                    <Card className="p-4 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)]"><p className="font-medium text-ocean-900 dark:text-white">{i.title}</p><p className="text-sm text-ocean-600 dark:text-ocean-300">{i.summary}</p></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {matchedEvents.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-600 dark:text-ocean-400">Events</h2>
              <div className="mt-2 space-y-2">
                {matchedEvents.map((e) => (
                  <Link key={e.id} href={`/events#${e.slug}`}>
                    <Card className="p-4 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)]"><p className="font-medium text-ocean-900 dark:text-white">{e.title}</p><p className="text-sm text-ocean-600 dark:text-ocean-300">{e.summary}</p></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {matchedPosts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-600 dark:text-ocean-400">Blog</h2>
              <div className="mt-2 space-y-2">
                {matchedPosts.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`}>
                    <Card className="p-4 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)]"><p className="font-medium text-ocean-900 dark:text-white">{p.title}</p><p className="text-sm text-ocean-600 dark:text-ocean-300">{p.excerpt}</p></Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {matchedPartners.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ocean-600 dark:text-ocean-400">Partners</h2>
              <div className="mt-2 space-y-2">
                {matchedPartners.map((p) => (
                  <Card key={p.id} className="p-4"><p className="font-medium text-ocean-900 dark:text-white">{p.organisation ?? p.name}</p><Badge>{p.category}</Badge></Card>
                ))}
              </div>
            </div>
          )}
          {q && totalResults === 0 && <p className="text-ocean-600 dark:text-ocean-400">No results yet — try a different term.</p>}
        </div>
      </div>
    </section>
  );
}
