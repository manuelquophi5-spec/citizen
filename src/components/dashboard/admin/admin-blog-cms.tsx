"use client";

import { useState } from "react";
import { BookOpen, Plus, X, Eye, CheckCircle2, Globe, FileEdit, Tag, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import {
  getEditorialPosts,
  togglePostPublished,
  saveEditorialPost,
  updateEditorialPost,
  deleteEditorialPost,
  type EditorialPostEntry,
} from "@/lib/admin-store";
import { FilamentBadge } from "../filament/filament-badge";
import { formatDate } from "@/lib/utils";

export function AdminBlogCms({
  coordinatorName,
  onNotify,
}: {
  coordinatorName: string;
  onNotify: (msg: string) => void;
}) {
  const [posts, setPosts] = useState<EditorialPostEntry[]>(() => getEditorialPosts());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<EditorialPostEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New post form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Community Updates");
  const [tagsInput, setTagsInput] = useState("Civic Action, South Tongu");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(true);

  // Edit post form state
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTagsInput, setEditTagsInput] = useState("");
  const [editCoverImage, setEditCoverImage] = useState("");
  const [editPublished, setEditPublished] = useState(true);

  const handleToggle = (id: string) => {
    const updated = togglePostPublished(id, coordinatorName);
    setPosts(updated);
    const p = updated.find((item) => item.id === id);
    onNotify(`${p?.published ? "Published" : "Set to Draft"}: "${p?.title}"`);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updated = saveEditorialPost(
      {
        slug,
        title,
        excerpt,
        category,
        tags,
        coverImage: coverImage.trim() || undefined,
        published,
      },
      coordinatorName
    );

    setPosts(updated);
    setIsCreateOpen(false);
    setTitle("");
    setExcerpt("");
    setCoverImage("");
    onNotify(`Created new article: "${title}"`);
  };

  const handleOpenEdit = (post: EditorialPostEntry) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditExcerpt(post.excerpt);
    setEditCategory(post.category);
    setEditTagsInput(post.tags.join(", "));
    setEditCoverImage(post.coverImage || "");
    setEditPublished(post.published);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !editTitle.trim()) return;

    const tags = editTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const updated = updateEditorialPost(
      editingPost.id,
      {
        title: editTitle,
        excerpt: editExcerpt,
        category: editCategory,
        tags,
        coverImage: editCoverImage.trim() || undefined,
        published: editPublished,
      },
      coordinatorName
    );

    setPosts(updated);
    setEditingPost(null);
    onNotify(`Updated article: "${editTitle}"`);
  };

  const handleDelete = (id: string) => {
    const next = deleteEditorialPost(id, coordinatorName);
    setPosts(next);
    setDeletingId(null);
    onNotify("Article deleted and archived");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
              Civic News &amp; Editorial CMS
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
              <BookOpen className="h-3 w-3" /> {posts.length} Articles
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
            Author and publish community impact stories, quarterly newsletters, and assembly bulletins to the public portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-ocean-950 shadow-sm hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" /> Draft New Article
        </button>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-xl border border-ocean-200/80 bg-white shadow-xs dark:border-ocean-800 dark:bg-[#0c1322]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ocean-100 bg-ocean-50/70 font-semibold uppercase tracking-wider text-ocean-500 dark:border-ocean-800/80 dark:bg-ocean-900/50 dark:text-ocean-400">
              <tr>
                <th className="px-4 py-3">Article Title &amp; Excerpt</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-100 dark:divide-ocean-800/60">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ocean-500">
                    No articles published or drafted yet.
                  </td>
                </tr>
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="transition hover:bg-ocean-50/50 dark:hover:bg-ocean-900/30">
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="flex items-center gap-2.5">
                        {p.coverImage ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-ocean-200 dark:border-ocean-800 bg-ocean-100 dark:bg-ocean-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-ocean-200 bg-ocean-50 text-ocean-400 dark:border-ocean-800 dark:bg-ocean-900/40">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-ocean-950 dark:text-white line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-ocean-500 line-clamp-1">{p.excerpt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-ocean-700 dark:text-ocean-300 font-medium">
                      {p.category}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded bg-ocean-100 px-1.5 py-0.5 text-[10px] text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-ocean-600 dark:text-ocean-400">
                      {p.views} views
                    </td>
                    <td className="px-4 py-3.5">
                      <FilamentBadge color={p.published ? "success" : "gray"}>
                        {p.published ? "Live / Published" : "Draft"}
                      </FilamentBadge>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(p.id)}
                          className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                            p.published
                              ? "border border-ocean-200 text-ocean-700 hover:bg-ocean-100 dark:border-ocean-700 dark:text-ocean-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {p.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Article"
                          className="rounded-md border border-ocean-200 bg-white p-1 text-ocean-600 hover:border-amber-500 hover:text-amber-600 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingId(p.id)}
                          title="Delete Article"
                          className="rounded-md border border-rose-500/20 bg-rose-500/10 p-1 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draft New Article Modal (CREATE) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsCreateOpen(false)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ocean-100 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Draft New Civic Article</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Tongu Health Outreach Screens 400 Residents in Agorkpo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                    Editorial Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  >
                    <option value="Community Updates">Community Updates</option>
                    <option value="Impact Stories">Impact Stories</option>
                    <option value="Health &amp; Wellness">Health &amp; Wellness</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="District Assembly Bulletins">District Assembly Bulletins</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Volta, Clinics, Youth"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Lead Paragraph / Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Opening summary explaining the milestone, beneficiaries, and civic impact..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Cover Image URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. /uploads/health-outreach.jpg or /images/..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                  {coverImage && (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-ocean-200 dark:border-ocean-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverImage} alt="Cover preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-ocean-500">
                  Tip: Upload an image in the Media &amp; Gallery tab and copy its URL here.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-ocean-300 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="publishedCheck" className="text-ocean-700 dark:text-ocean-300 select-none">
                  Publish immediately to the live public portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Save &amp; Record Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Article Modal (UPDATE) */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingPost(null)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ocean-100 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Edit Article Details</h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                    Editorial Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  >
                    <option value="Community Updates">Community Updates</option>
                    <option value="Impact Stories">Impact Stories</option>
                    <option value="Health &amp; Wellness">Health &amp; Wellness</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="District Assembly Bulletins">District Assembly Bulletins</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editTagsInput}
                    onChange={(e) => setEditTagsInput(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Lead Paragraph / Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editExcerpt}
                  onChange={(e) => setEditExcerpt(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Cover Image URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. /uploads/health-outreach.jpg or /images/..."
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    className="flex-1 rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                  {editCoverImage && (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-ocean-200 dark:border-ocean-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editCoverImage} alt="Cover preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-ocean-500">
                  Tip: Upload an image in the Media &amp; Gallery tab and copy its URL here.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editPublishedCheck"
                  checked={editPublished}
                  onChange={(e) => setEditPublished(e.target.checked)}
                  className="rounded border-ocean-300 text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="editPublishedCheck" className="text-ocean-700 dark:text-ocean-300 select-none">
                  Live / Published on public portal
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Article Confirmation Modal (DELETE) */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeletingId(null)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ocean-950 dark:text-white">Delete Article?</h3>
                <p className="text-xs text-ocean-600 dark:text-ocean-400">
                  Are you sure you want to permanently delete this editorial article? This action is recorded in the audit trail.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-ocean-200 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
              >
                Keep Article
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
