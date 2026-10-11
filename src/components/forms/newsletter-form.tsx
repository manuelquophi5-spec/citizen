"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { subscribeNewsletterAction } from "@/app/actions/newsletter";

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const result = await subscribeNewsletterAction(email);

    setLoading(false);
    if (result.success) {
      setSent(true);
      (e.target as HTMLFormElement).reset();
    } else {
      setError(result.error || "Subscription failed.");
    }
  }

  return (
    <div className="space-y-1.5">
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          required
          aria-label="Email address for updates"
          autoComplete="email"
          spellCheck={false}
          placeholder="you@example.com"
          className={cn(
            "w-full min-w-0 rounded-lg border px-3 py-2 text-sm focus:border-gold-500",
            dark
              ? "border-ocean-800 bg-ocean-900 text-white placeholder:text-ocean-300"
              : "border-ocean-200 bg-white text-ocean-900 placeholder:text-ocean-600"
          )}
        />
        <button
          type="submit"
          disabled={loading || sent}
          aria-live="polite"
          className="shrink-0 rounded-lg bg-gold-500 px-3 py-2 text-sm font-semibold text-ocean-950 transition hover:bg-gold-400 disabled:opacity-60"
        >
          {loading ? "..." : sent ? "Joined!" : "Join"}
        </button>
      </form>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
