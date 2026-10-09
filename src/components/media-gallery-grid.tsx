"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Eye, Download, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui";

export interface GalleryPhoto {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  category: "DONATIONS" | "OUTREACH" | "YOUTH" | "COMMUNITY";
  location: string;
  date: string;
  caption?: string;
}

export function MediaGalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const categories = [
    { id: "ALL", label: "All Photos" },
    { id: "DONATIONS", label: "Donation Deliveries" },
    { id: "OUTREACH", label: "Field Outreach" },
    { id: "YOUTH", label: "Youth & Learners" },
    { id: "COMMUNITY", label: "Community Meetings" },
  ];

  const filteredPhotos =
    selectedCategory === "ALL"
      ? photos
      : photos.filter((p) => p.category === selectedCategory);

  const activePhoto = activePhotoIndex !== null ? filteredPhotos[activePhotoIndex] : null;

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : filteredPhotos.length - 1) : null));
    }
  }, [activePhotoIndex, filteredPhotos.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev !== null ? (prev < filteredPhotos.length - 1 ? prev + 1 : 0) : null));
    }
  }, [activePhotoIndex, filteredPhotos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePhotoIndex(null);
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, handleNext, handlePrev]);

  return (
    <div>
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setSelectedCategory(c.id);
              setActivePhotoIndex(null);
            }}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === c.id
                ? "bg-ocean-700 text-white shadow-xs dark:bg-gold-500 dark:text-ocean-950"
                : "bg-ocean-50 text-ocean-700 hover:bg-ocean-100 dark:bg-ocean-900/60 dark:text-ocean-300 dark:hover:bg-ocean-800"
            }`}
          >
            {c.label} {c.id === "ALL" ? `(${photos.length})` : `(${photos.filter((p) => p.category === c.id).length})`}
          </button>
        ))}
      </div>

      {/* Responsive Photo Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filteredPhotos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActivePhotoIndex(idx)}
            className="group relative aspect-[4/3] w-full text-left cursor-pointer overflow-hidden rounded-xl bg-ocean-100 shadow-xs transition hover:-translate-y-1 hover:shadow-md focus-visible:ring-2 focus-visible:ring-gold-500 dark:bg-ocean-900"
            aria-label={`View ${photo.title}`}
          >
            <Image
              src={photo.thumbnail}
              alt={photo.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-ocean-950/20 to-transparent opacity-0 transition duration-200 group-hover:opacity-100 flex flex-col justify-end p-3 text-white">
              <span className="font-mono text-[10px] text-amber-300 uppercase tracking-wider">
                {photo.location}
              </span>
              <p className="font-medium text-xs line-clamp-1">{photo.title}</p>
              <div className="mt-1 flex items-center gap-1 text-[10px] text-ocean-300">
                <Eye className="h-3 w-3" /> Click to enlarge
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <p className="py-12 text-center text-sm text-ocean-500 dark:text-ocean-400">
          No photos found in this category.
        </p>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActivePhotoIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close photo preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Main Image Container */}
          <div
            className="relative flex flex-col items-center max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-ocean-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[65vh] w-[85vw] max-w-4xl">
              <Image
                src={activePhoto.src}
                alt={activePhoto.title}
                fill
                sizes="(max-width: 1280px) 90vw, 1200px"
                className="object-contain"
                priority
              />
            </div>

            <div className="w-full p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-ocean-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="gold">{activePhoto.category}</Badge>
                  <span className="font-mono text-xs text-ocean-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" /> {activePhoto.location}
                  </span>
                  <span className="font-mono text-xs text-ocean-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {activePhoto.date}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-base font-semibold">{activePhoto.title}</h3>
                {activePhoto.caption && (
                  <p className="text-xs text-ocean-300 mt-0.5">{activePhoto.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePhoto.src}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ocean-700 transition"
                >
                  <Download className="h-3.5 w-3.5" /> Full Resolution
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
