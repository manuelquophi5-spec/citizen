import type { GalleryPhoto } from "@/components/media-gallery-grid";

// Image catalog automatically mapped from recent community outreach & donation delivery in South Tongu
const RAW_IMAGE_FILES = [
  "IMG_9626.jpg", "IMG_9627.jpg", "IMG_9630.jpg", "IMG_9632.jpg", "IMG_9633.jpg",
  "IMG_9634.jpg", "IMG_9635.jpg", "IMG_9636.jpg", "IMG_9637.jpg", "IMG_9638.jpg",
  "IMG_9639.jpg", "IMG_9640.jpg", "IMG_9641.jpg", "IMG_9642.jpg", "IMG_9643.jpg",
  "IMG_9644.jpg", "IMG_9645.jpg", "IMG_9646.jpg", "IMG_9647.jpg", "IMG_9648.jpg",
  "IMG_9649.jpg", "IMG_9650.jpg", "IMG_9651.jpg", "IMG_9652.jpg", "IMG_9653.jpg",
  "IMG_9654.jpg", "IMG_9655.jpg", "IMG_9656.jpg", "IMG_9657.jpg", "IMG_9658.jpg",
  "IMG_9659.jpg", "IMG_9660.jpg", "IMG_9663.jpg", "IMG_9664.jpg", "IMG_9665.jpg",
  "IMG_9666.jpg", "IMG_9667.jpg", "IMG_9669.jpg", "IMG_9671.jpg", "IMG_9672.jpg",
  "IMG_9674.jpg", "IMG_9675.jpg", "IMG_9677.jpg", "IMG_9679.jpg", "IMG_9680.jpg",
  "IMG_9681.jpg", "IMG_9683.jpg", "IMG_9686.jpg", "IMG_9688.jpg", "IMG_9690.jpg",
  "IMG_9692.jpg", "IMG_9693.jpg", "IMG_9695.jpg", "IMG_9697.jpg", "IMG_9698.jpg",
  "IMG_9701.jpg", "IMG_9702.jpg", "IMG_9703.jpg", "IMG_9705.jpg", "IMG_9707.jpg",
  "IMG_9708.jpg", "IMG_9709.jpg", "IMG_9710.jpg", "IMG_9713.jpg",
];

const CATEGORIES: GalleryPhoto["category"][] = [
  "DONATIONS",
  "OUTREACH",
  "YOUTH",
  "COMMUNITY",
];

const LOCATIONS = [
  "Sogakope Central",
  "Dabala Community Center",
  "Agorkpo Basic School",
  "Tefle Health Center",
  "Adidome Crossroad",
  "South Tongu District Hall",
];

export const OUTREACH_PHOTOS: GalleryPhoto[] = RAW_IMAGE_FILES.map((filename, idx) => {
  const cat = CATEGORIES[idx % CATEGORIES.length];
  const loc = LOCATIONS[idx % LOCATIONS.length];
  const number = idx + 1;

  let title = `Community Outreach & Donation Handover #${number}`;
  let caption = "Volunteers and community coordinators distributing supplies funded by recent civic donations in South Tongu.";

  if (cat === "DONATIONS") {
    title = `Direct Donation Delivery #${number}`;
    caption = "Direct educational supplies and civic support packages handed over to beneficiaries.";
  } else if (cat === "YOUTH") {
    title = `Youth Engagement & Civic Workshop #${number}`;
    caption = "Inspiring student leaders and young citizens to take responsibility for local community transformation.";
  } else if (cat === "COMMUNITY") {
    title = `Community Assembly Dialogue #${number}`;
    caption = "Stakeholder discussions with local elders, assembly members, and volunteer coordinators.";
  }

  return {
    id: `photo-${idx + 1}`,
    src: `/images/outreach/${filename}`,
    thumbnail: `/images/outreach/${filename}`,
    title,
    category: cat,
    location: loc,
    date: "September 2026",
    caption,
  };
});

// Best showcase photos for Hero and Homepage
export const FEATURED_OUTREACH_PHOTOS = [
  OUTREACH_PHOTOS[0], // IMG_9626
  OUTREACH_PHOTOS[4], // IMG_9633
  OUTREACH_PHOTOS[11], // IMG_9640
  OUTREACH_PHOTOS[21], // IMG_9650
];
