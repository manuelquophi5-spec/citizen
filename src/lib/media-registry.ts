import fs from "fs";
import path from "path";

export interface MediaItem {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  caption?: string;
  category: "DONATIONS" | "OUTREACH" | "YOUTH" | "COMMUNITY" | "INFRASTRUCTURE" | "GENERAL";
  location?: string;
  target?: "gallery" | "initiative" | "blog" | "general";
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: number;
}

const REGISTRY_PATH = path.join(process.cwd(), "data", "media-registry.json");

export function getMediaRegistry(): MediaItem[] {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
    return JSON.parse(raw) as MediaItem[];
  } catch {
    return [];
  }
}

export function saveMediaItem(item: MediaItem): MediaItem[] {
  try {
    const list = getMediaRegistry();
    const updated = [item, ...list];
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch {
    return getMediaRegistry();
  }
}

export function deleteMediaItem(id: string): MediaItem[] {
  try {
    const list = getMediaRegistry();
    const target = list.find((i) => i.id === id);
    if (target && target.src.startsWith("/uploads/")) {
      const filename = path.basename(target.src);
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const updated = list.filter((i) => i.id !== id);
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch {
    return getMediaRegistry();
  }
}
