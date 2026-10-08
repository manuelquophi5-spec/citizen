import type { Metadata } from "next";
import { Play } from "lucide-react";
import { DataProvider } from "@/lib/data-provider";
import { successStories, initiatives as mockInitiatives } from "@/lib/mock-data";
import { SectionHeading, Card, Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Success Stories" };

export default async function SuccessStoriesPage() {
  const liveInitiatives = await DataProvider.getInitiatives();
  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";
  const initiatives = liveInitiatives.length > 0 ? liveInitiatives : (isLive ? [] : mockInitiatives);

  const stories = successStories.map((s) => ({
    ...s,
    initiativeCategory: initiatives.find((i: any) => i.id === s.initiativeId || i.slug === s.initiativeId)?.category,
  }));

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Real people, real change"
          title="Success Stories"
          description="Beneficiaries and community outcomes behind the numbers on our Transparency and Impact pages."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="flex h-36 items-center justify-center bg-gradient-to-br from-leaf-500 to-ocean-900 font-mono text-xs text-white">
                {s.initiativeCategory ?? "Success Story"}
              </div>
              <div className="p-5">
                {s.impactMetric && <Badge tone="leaf">{s.impactMetric}</Badge>}
                <h3 className="mt-2 font-display font-semibold text-ocean-950 dark:text-white">{s.title}</h3>
                {s.beneficiaryName && <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">{s.beneficiaryName}</p>}
                <p className="mt-2 text-sm text-ocean-600 dark:text-ocean-300">{s.story}</p>

                {s.interview && (
                  <div className="mt-4 border-t border-ocean-100 pt-4 dark:border-ocean-800">
                    <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-ocean-700 to-ocean-950">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ocean-900 transition group-hover:scale-105">
                        <Play className="h-4 w-4 fill-current" />
                      </span>
                      <span className="absolute bottom-2 right-2 rounded-full bg-ocean-950/70 px-2 py-0.5 font-mono text-xs text-white">
                        {s.interview.durationLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ocean-600 dark:text-ocean-400">
                      {s.interview.kind === "video" ? "Video interview" : "Audio interview"} — recorded in the field
                    </p>
                    <p className="mt-1.5 text-sm italic text-ocean-700 dark:text-ocean-300">
                      &ldquo;{s.interview.transcriptExcerpt}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {stories.length === 0 && <p className="text-ocean-600 dark:text-ocean-400">Stories are on the way — check back soon.</p>}
        </div>
      </div>
    </section>
  );
}
