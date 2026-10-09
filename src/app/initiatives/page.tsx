import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { DataProvider } from "@/lib/data-provider";
import { SectionHeading, Card, Badge } from "@/components/ui";
import { formatGHS } from "@/lib/utils";

export const metadata: Metadata = { title: "Initiatives" };

export default async function InitiativesPage() {
  const initiativesList = await DataProvider.getInitiatives();
  const sorted = [...initiativesList].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const cardImages = [
    "/images/outreach/IMG_9626.jpg",
    "/images/outreach/IMG_9633.jpg",
    "/images/outreach/IMG_9640.jpg",
    "/images/outreach/IMG_9650.jpg",
    "/images/outreach/IMG_9665.jpg",
    "/images/outreach/IMG_9674.jpg",
  ];

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Our work"
          title="Featured Community Initiatives"
          description="Explore key community initiatives in development across South Tongu District. Public crowdfunding and volunteer signups are launching soon."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((i, idx) => {
            const imgPath = i.cover_image || (i as any).coverImage || cardImages[idx % cardImages.length];

            return (
              <Link key={i.id} href={`/initiatives/${i.slug}`} className="block h-full">
                <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ocean-950/10 dark:hover:shadow-ocean-950/50">
                  <div className="relative h-44 w-full overflow-hidden bg-ocean-900">
                    <Image
                      src={imgPath}
                      alt={i.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-ocean-950/20 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center rounded-full bg-ocean-950/80 px-2.5 py-1 text-[11px] font-semibold text-ocean-100 backdrop-blur-md">
                        {i.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-ocean-200">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="h-3 w-3 text-gold-400" /> South Tongu
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone="gold">Coming soon…</Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        In planning
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold text-ocean-950 group-hover:text-ocean-700 dark:text-white dark:group-hover:text-gold-300 transition-colors">
                      {i.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 flex-1 text-sm text-ocean-600 dark:text-ocean-300 leading-relaxed">
                      {i.summary || i.description}
                    </p>
                    <div className="mt-5 border-t border-ocean-100 pt-3 flex items-center justify-between text-xs dark:border-ocean-800">
                      <span className="font-mono text-ocean-600 dark:text-ocean-400">Target: {formatGHS(i.target_amount)}</span>
                      <span className="font-semibold text-ocean-700 dark:text-gold-400 group-hover:underline">
                        View details &rarr;
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
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
