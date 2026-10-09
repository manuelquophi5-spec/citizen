"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Copy,
  ExternalLink,
  Filter,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  X,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { Card, Badge, Button } from "@/components/ui";
import { toast } from "@/components/ui/toast";
import type { MediaItem } from "@/lib/media-registry";
import { getMediaItemsAction, deleteMediaItemAction } from "@/app/actions/media";

const CATEGORIES = [
  { id: "ALL", label: "All Assets" },
  { id: "DONATIONS", label: "Donations & Handovers" },
  { id: "OUTREACH", label: "Field Outreach" },
  { id: "YOUTH", label: "Youth & Education" },
  { id: "COMMUNITY", label: "Community Meetings" },
  { id: "INFRASTRUCTURE", label: "Infrastructure & Works" },
  { id: "GENERAL", label: "General & Branding" },
];

export function AdminMediaLibrary({
  onSelectImage,
  selectionMode = false,
  onNotify,
}: {
  onSelectImage?: (url: string) => void;
  selectionMode?: boolean;
  onNotify?: (msg: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewModalItem, setPreviewModalItem] = useState<MediaItem | null>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<MediaItem["category"]>("OUTREACH");
  const [location, setLocation] = useState("Sogakope Central");
  const [target, setTarget] = useState<MediaItem["target"]>("gallery");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getMediaItemsAction();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch {
      toast.error("Failed to load media assets", "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files (JPEG, PNG, WebP, AVIF) are permitted.", "Invalid File");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds maximum 10MB size limit.", "File Too Large");
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
    const preview = URL.createObjectURL(file);
    setFilePreviewUrl(preview);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose an image to upload.", "No File Selected");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("category", category);
      formData.append("location", location);
      formData.append("target", target || "gallery");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Upload failed");
      }

      toast.success(`Photo "${title}" uploaded to /uploads/${selectedFile.name}`, "Upload Complete");
      onNotify?.(`Uploaded photo "${title}" to media library`);
      
      // Reset form
      setSelectedFile(null);
      setFilePreviewUrl(null);
      setTitle("");
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh media library
      fetchItems();

      if (onSelectImage && json.url) {
        onSelectImage(json.url);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error(msg, "Upload Error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this media asset from the server?")) {
      return;
    }

    try {
      const res = await deleteMediaItemAction(id);
      if (res.success && res.data) {
        setItems(res.data);
        toast.info("Media file removed from server uploads.", "Asset Deleted");
        onNotify?.("Media file deleted from server");
      } else {
        toast.error(res.error || "Failed to delete asset", "Error");
      }
    } catch {
      toast.error("Failed to delete asset", "Error");
    }
  };

  const handleCopyUrl = (url: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success(`Copied path "${url}" to clipboard!`, "Link Copied");
    onNotify?.(`Copied media URL to clipboard: ${url}`);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Upload Zone */}
      <Card className="overflow-hidden border-ocean-200/80 bg-white shadow-sm dark:border-ocean-800 dark:bg-ocean-950">
        <div className="border-b border-ocean-100 bg-ocean-50/60 p-5 dark:border-ocean-800/80 dark:bg-ocean-900/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                District Asset Manager
              </span>
              <h2 className="text-xl font-display font-semibold text-ocean-950 dark:text-white">
                Upload Images for Features, Gallery & Blog
              </h2>
              <p className="text-xs text-ocean-600 dark:text-ocean-400 mt-1">
                Upload high-resolution field photos directly to the server. Files are immediately accessible across the public site.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchItems} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="p-6">
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Drop Zone */}
            <div className="lg:col-span-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragOver
                    ? "border-emerald-500 bg-emerald-50/50 dark:border-emerald-400 dark:bg-emerald-950/20"
                    : filePreviewUrl
                    ? "border-ocean-300 bg-ocean-50/30 dark:border-ocean-700 dark:bg-ocean-900/20"
                    : "border-ocean-200 bg-ocean-50/40 hover:border-ocean-400 hover:bg-ocean-50/80 dark:border-ocean-800 dark:bg-ocean-900/30 dark:hover:border-ocean-700"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                {filePreviewUrl ? (
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <Image
                      src={filePreviewUrl}
                      alt="Upload preview"
                      fill
                      className="object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-xs font-semibold text-white">Click or drop to change image</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean-100 text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ocean-950 dark:text-white">
                        Drag and drop your photo here
                      </p>
                      <p className="text-xs text-ocean-500 dark:text-ocean-400 mt-0.5">
                        Supports JPEG, PNG, WebP, AVIF up to 10MB
                      </p>
                    </div>
                    <span className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-ocean-700 shadow-sm border border-ocean-200 dark:bg-ocean-800 dark:border-ocean-700 dark:text-ocean-200">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-4 lg:col-span-7">
              <div>
                <label className="block text-xs font-semibold text-ocean-900 dark:text-ocean-200">
                  Photo Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dabala Market Drainage Desilting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ocean-200 bg-white px-3.5 py-2 text-sm text-ocean-950 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-ocean-900 dark:text-ocean-200">
                    Category Tag *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MediaItem["category"])}
                    className="mt-1.5 w-full rounded-xl border border-ocean-200 bg-white px-3.5 py-2 text-sm text-ocean-950 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  >
                    <option value="DONATIONS">DONATIONS (Supplies Handover)</option>
                    <option value="OUTREACH">OUTREACH (Community Engagement)</option>
                    <option value="YOUTH">YOUTH (Civic Education & Students)</option>
                    <option value="COMMUNITY">COMMUNITY (Assembly & Dialogue)</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE (Local Works)</option>
                    <option value="GENERAL">GENERAL (Branding & General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ocean-900 dark:text-ocean-200">
                    Location in South Tongu
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sogakope Central"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-ocean-200 bg-white px-3.5 py-2 text-sm text-ocean-950 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-900 dark:text-ocean-200">
                  Target Destination / Feature
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as MediaItem["target"])}
                  className="mt-1.5 w-full rounded-xl border border-ocean-200 bg-white px-3.5 py-2 text-sm text-ocean-950 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                >
                  <option value="gallery">Public Media Gallery (/gallery)</option>
                  <option value="initiative">Initiative Project Cover</option>
                  <option value="blog">Blog Editorial Cover</option>
                  <option value="general">General Asset Library</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-900 dark:text-ocean-200">
                  Field Caption / Context (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the activity, beneficiaries, or impact details..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-ocean-200 bg-white px-3.5 py-2 text-sm text-ocean-950 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreviewUrl(null);
                      setTitle("");
                      setCaption("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  type="submit"
                  size="md"
                  disabled={uploading || !selectedFile}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? "Saving to Server..." : "Upload Photo to Library"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Asset Explorer & Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ocean-600 dark:text-ocean-400">
              Filter by Category:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-ocean-950 text-white dark:bg-white dark:text-ocean-950 shadow-sm"
                      : "bg-white text-ocean-700 border border-ocean-200 hover:bg-ocean-100 dark:bg-ocean-900 dark:text-ocean-300 dark:border-ocean-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ocean-400" />
            <input
              type="text"
              placeholder="Search uploaded photos…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-ocean-200 bg-white py-1.5 pl-9 pr-4 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-ocean-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => {
                if (selectionMode && onSelectImage) {
                  onSelectImage(item.src);
                } else {
                  setPreviewModalItem(item);
                }
              }}
              className="group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md border-ocean-200/80 dark:border-ocean-800 bg-white dark:bg-ocean-950"
            >
              <div className="relative h-44 w-full bg-ocean-900">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute left-2.5 top-2.5">
                  <Badge tone={item.category === "DONATIONS" ? "gold" : "ocean"}>
                    {item.category}
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => handleCopyUrl(item.src, e)}
                    title="Copy Image URL"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-md hover:bg-black"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    title="Delete Media File"
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600/80 text-white backdrop-blur-md hover:bg-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5">
                <h4 className="font-display text-sm font-semibold text-ocean-950 group-hover:text-ocean-700 dark:text-white line-clamp-1">
                  {item.title}
                </h4>
                {item.caption && (
                  <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400 line-clamp-1">
                    {item.caption}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-ocean-500 dark:text-ocean-400 border-t border-ocean-100 pt-2 dark:border-ocean-800">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold-500" />
                    {item.location || "South Tongu"}
                  </span>
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                </div>

                {selectionMode && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3 w-full bg-ocean-950 text-white dark:bg-white dark:text-ocean-950 text-xs py-1"
                    onClick={() => {
                      onSelectImage?.(item.src);
                    }}
                  >
                    Select this Image
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="rounded-2xl border border-dashed border-ocean-200 p-12 text-center text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
            <FileImage className="mx-auto h-10 w-10 text-ocean-400 mb-3" />
            <p className="font-semibold text-ocean-950 dark:text-white">No media files found</p>
            <p className="text-xs text-ocean-500 dark:text-ocean-400 mt-1 max-w-sm mx-auto">
              Use the upload area above to add your first photo from recent community donations, youth workshops, or district events.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox / Preview Modal */}
      {previewModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewModalItem(null)}
        >
          <div
            className="relative max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-ocean-950 border border-ocean-200 dark:border-ocean-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96 w-full bg-black">
              <Image
                src={previewModalItem.src}
                alt={previewModalItem.title}
                fill
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Badge tone="gold">{previewModalItem.category}</Badge>
                  <h3 className="mt-2 text-xl font-display font-semibold text-ocean-950 dark:text-white">
                    {previewModalItem.title}
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopyUrl(previewModalItem.src)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" /> Copy Path ({previewModalItem.src})
                </Button>
              </div>
              {previewModalItem.caption && (
                <p className="mt-3 text-sm text-ocean-700 dark:text-ocean-300">
                  {previewModalItem.caption}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-ocean-500 border-t border-ocean-100 pt-3 dark:border-ocean-800">
                <span>Location: {previewModalItem.location}</span>
                <span>Uploaded: {new Date(previewModalItem.uploadedAt).toLocaleString()}</span>
                <span>File Path: {previewModalItem.src}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
