import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { MediaGalleryGrid } from "@/components/media-gallery-grid";
import { OUTREACH_PHOTOS } from "@/lib/gallery-data";

export const metadata: Metadata = {
  title: "Media Gallery · The Citizen Project",
  description: "Photographic field evidence from our recent community outreach and donation distributions across South Tongu District.",
};

export default function GalleryPage() {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Proof of Impact"
          title="Media Gallery"
          description="High-resolution photographic field records from our recent donation handovers, community outreach, and youth civic engagements across South Tongu District."
        />

        <div className="mt-10">
          <MediaGalleryGrid photos={OUTREACH_PHOTOS} />
        </div>
      </div>
    </section>
  );
}
