import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui";
import { MediaGalleryGrid, type GalleryPhoto } from "@/components/media-gallery-grid";
import { OUTREACH_PHOTOS } from "@/lib/gallery-data";
import { getMediaRegistry } from "@/lib/media-registry";

export const metadata: Metadata = {
  title: "Media Gallery · The Citizen Project",
  description: "Photographic field evidence from our recent community outreach and donation distributions across South Tongu District.",
};

export const dynamic = "force-dynamic";

export default function GalleryPage() {
  const customItems = getMediaRegistry();

  const uploadedPhotos: GalleryPhoto[] = customItems.map((item) => {
    const validCat = ["DONATIONS", "OUTREACH", "YOUTH", "COMMUNITY"].includes(item.category)
      ? (item.category as GalleryPhoto["category"])
      : "COMMUNITY";

    return {
      id: item.id,
      src: item.src,
      thumbnail: item.thumbnail || item.src,
      title: item.title,
      caption: item.caption || `Photographic record: ${item.title}`,
      category: validCat,
      location: item.location || "South Tongu District",
      date: item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "Recent",
    };
  });

  const allPhotos = [...uploadedPhotos, ...OUTREACH_PHOTOS];

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="Proof of Impact"
          title="Media Gallery"
          description="High-resolution photographic field records from our recent donation handovers, community outreach, and youth civic engagements across South Tongu District."
        />

        <div className="mt-10">
          <MediaGalleryGrid photos={allPhotos} />
        </div>
      </div>
    </section>
  );
}
