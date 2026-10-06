import type { Metadata } from "next";
import { DataProvider } from "@/lib/data-provider";
import { SectionHeading } from "@/components/ui";
import { CommunityMapExplorer } from "@/components/community-map-explorer";

export const metadata: Metadata = { title: "Community Map" };

export default async function CommunityMapPage() {
  const reports = await DataProvider.getReports();

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="See where the need is"
          title="Community Map"
          description="Every reported issue plotted across South Tongu District — this is what makes civic issues visible and verifiable. Open any pin to view district triage status or download an official issue report."
        />

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-ocean-600 dark:text-ocean-300">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#dc2626" }} /> Critical</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#E8A233" }} /> High</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#1E8AA8" }} /> Medium</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: "#3D9A6C" }} /> Low</span>
        </div>

        <CommunityMapExplorer liveReports={reports} />
      </div>
    </section>
  );
}
