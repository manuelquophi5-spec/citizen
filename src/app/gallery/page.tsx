import type { Metadata } from "next";
import { DataProvider } from "@/lib/data-provider";
import { galleryImages, initiatives as mockInitiatives } from "@/lib/mock-data";
import { SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Media Gallery" };

export default async function GalleryPage() {
  const liveInitiatives = await DataProvider.getInitiatives();
  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";
  const initiatives = liveInitiatives.length > 0 ? liveInitiatives : (isLive ? [] : mockInitiatives);

  const images = galleryImages.map((img) => ({
    ...img,
    initiativeTitle: initiatives.find((i: any) => i.id === img.initiativeId || i.slug === img.initiativeId)?.title,
  }));

  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading
          eyebrow="See it for yourself"
          title="Media Gallery"
          description="Photos and event albums from across civic initiatives in South Tongu District."
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-ocean-600 to-ocean-950"
            >
              <span className="px-2 text-center font-mono text-[11px] text-ocean-200">
                {img.initiativeTitle ?? "Civic Initiative"}
              </span>
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[11px] text-white opacity-0 transition group-hover:opacity-100">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
          {images.length === 0 && (
            <p className="col-span-full text-ocean-600 dark:text-ocean-400">
              No photos uploaded yet — this gallery populates automatically from completed civic milestones.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
