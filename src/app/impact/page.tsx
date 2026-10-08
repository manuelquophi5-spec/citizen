import type { Metadata } from "next";
import { DataProvider } from "@/lib/data-provider";
import { SectionHeading, Card, Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Impact Dashboard" };

export default async function ImpactPage() {
  const [initiatives, reports, volunteerHours] = await Promise.all([
    DataProvider.getInitiatives(),
    DataProvider.getReports(),
    DataProvider.getVolunteerHours({ status: "VERIFIED" }),
  ]);

  const completed = initiatives.filter((i) => i.status === "COMPLETED").length;
  const active = initiatives.filter((i) => i.status === "ACTIVE").length;
  const upcoming = initiatives.filter((i) => i.status === "UPCOMING").length;

  const categories = Array.from(new Set(initiatives.map((i) => i.category).filter(Boolean)));
  const trackedHours = volunteerHours.reduce((sum, row) => sum + Number(row.hours || 0), 0);

  const communityLocations = new Set<string>();
  for (const r of reports) {
    if (typeof r.location === "object" && r.location !== null) {
      const loc = r.location as Record<string, any>;
      if (loc.community && typeof loc.community === "string") {
        communityLocations.add(loc.community.trim().toLowerCase());
      }
    }
  }
  for (const i of initiatives) {
    if (i.location) {
      communityLocations.add(i.location.trim().toLowerCase());
    }
  }

  const kpis = [
    { label: "Projects completed", value: completed },
    { label: "Active projects", value: active },
    { label: "Upcoming projects", value: upcoming },
    { label: "Communities reached", value: Math.max(communityLocations.size, 1) },
    { label: "Civic focus areas", value: categories.length },
    { label: "Verified volunteer hours", value: trackedHours },
  ];

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="The bigger picture"
          title="Impact Dashboard"
          description="A snapshot of reach and verified outcomes across every civic initiative and community report in South Tongu District."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5">
              <p className="font-mono text-3xl font-semibold text-ocean-950 dark:text-white">{k.value}</p>
              <p className="mt-1 text-sm text-ocean-600 dark:text-ocean-400">{k.label}</p>
            </Card>
          ))}
        </div>

        {trackedHours > 0 && (
          <p className="mt-6 text-sm text-ocean-600 dark:text-ocean-300">
            <strong className="text-ocean-900 dark:text-white">{trackedHours}</strong> volunteer hours formally logged and approved.
          </p>
        )}

        {categories.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ocean-950 dark:text-white">Active Focus Areas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Badge key={c} tone="gold">{c.replace(/_/g, " ")}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ocean-950 dark:text-white">Active Community Initiatives</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((i) => (
              <Card key={i.id} className="p-5 flex flex-col justify-between">
                <div>
                  <Badge tone={i.status === "ACTIVE" ? "leaf" : "ocean"}>{i.status}</Badge>
                  <h3 className="mt-2 font-display text-base font-semibold text-ocean-950 dark:text-white">{i.title}</h3>
                  <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400 line-clamp-3">{i.summary || i.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-ocean-100 dark:border-ocean-800 flex justify-between text-xs text-ocean-500">
                  <span>{i.location || "South Tongu"}</span>
                  <span className="font-mono font-medium text-ocean-700 dark:text-ocean-300">
                    {Math.round(((i.raised_amount || 0) / (i.target_amount || 1)) * 100)}% Funded
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
