import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { getServerSession } from "@/lib/auth";
import { saveMediaItem, type MediaItem } from "@/lib/media-registry";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Official Administrator privileges required to upload media." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided in upload." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File exceeds maximum limit of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    const title = (formData.get("title") as string) || file.name.replace(/\.[^/.]+$/, "");
    const caption = (formData.get("caption") as string) || "";
    const categoryRaw = (formData.get("category") as string) || "OUTREACH";
    const location = (formData.get("location") as string) || "South Tongu District";
    const target = (formData.get("target") as MediaItem["target"]) || "gallery";

    const allowedCategories = ["DONATIONS", "OUTREACH", "YOUTH", "COMMUNITY", "INFRASTRUCTURE", "GENERAL"];
    const category = (allowedCategories.includes(categoryRaw) ? categoryRaw : "OUTREACH") as MediaItem["category"];

    // Generate safe, collision-resistant filename
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const cleanBase = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const filename = `${cleanBase}-${uniqueSuffix}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const publicUrl = `/uploads/${filename}`;
    const mediaItem: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      src: publicUrl,
      thumbnail: publicUrl,
      title: title.trim(),
      caption: caption.trim() || undefined,
      category,
      location: location.trim(),
      target,
      uploadedBy: session.name || "District Coordinator",
      uploadedAt: new Date().toISOString(),
      fileSize: file.size,
    };

    saveMediaItem(mediaItem);

    revalidatePath("/gallery");
    revalidatePath("/initiatives");
    revalidatePath("/blog");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      url: publicUrl,
      item: mediaItem,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Media upload failed.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
