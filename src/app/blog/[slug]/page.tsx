import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBlogPostBySlug } from "@/lib/mock-data";
import { Badge } from "@/components/ui";
import { ShareRow } from "@/components/share-row";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="section-y">
      <div className="container-page max-w-2xl">
        <Badge>{post.category}</Badge>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ocean-950 dark:text-white">{post.title}</h1>
        <p className="mt-2 font-mono text-xs text-ocean-600 dark:text-ocean-400">{formatDate(post.publishedAt)}</p>
        {post.coverImage && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-ocean-200 dark:border-ocean-800 shadow-sm bg-ocean-100 dark:bg-ocean-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full max-h-[440px] object-cover" />
          </div>
        )}
        <div className="mt-6 whitespace-pre-line text-ocean-700 dark:text-ocean-300">{post.content}</div>
        <div className="mt-8 border-t border-ocean-100 pt-5 dark:border-ocean-800">
          <ShareRow title={post.title} />
        </div>
      </div>
    </article>
  );
}
