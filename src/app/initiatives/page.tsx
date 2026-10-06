import type { Metadata } from "next";
import Link from "next/link";
import { DataProvider } from "@/lib/data-provider";
import { SectionHeading, Card, Badge, ProgressBar } from "@/components/ui";
import { formatGHS, percent } from "@/lib/utils";
import { labelize } from "@/types";

export const metadata: Metadata = { title: "Initiatives" };

export default async function InitiativesPage() {
  const initiativesList = await DataProvider.getInitiatives();
  const sorted = [...initiativesList].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our work"
          title="Initiatives"
          description="Every initiative below lists its objectives, budget, funding progress, and community impact — in keeping with our transparency commitment."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((i) => (
            <Link key={i.id} href={`/initiatives/${i.slug}`}>
              <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)]">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-ocean-600 to-ocean-900 font-mono text-xs text-ocean-200">
                  {i.category}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={i.status === "ACTIVE" ? "leaf" : "ocean"}>{labelize(i.status)}</Badge>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ocean-950 group-hover:text-ocean-700 dark:text-white">
                    {i.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-ocean-600 dark:text-ocean-300">{i.summary || i.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-mono text-ocean-600 dark:text-ocean-400">
                      <span>{formatGHS(i.raised_amount)} raised</span>
                      <span>of {formatGHS(i.target_amount)}</span>
                    </div>
                    <div className="mt-1.5"><ProgressBar value={percent(i.raised_amount, i.target_amount)} /></div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {sorted.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-ocean-200 p-8 text-center text-sm text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
              No initiatives recorded yet. Initiatives published in the administrative console will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
