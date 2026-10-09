"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
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
        aria-live="polite"
        className="shrink-0 rounded-lg bg-gold-500 px-3 py-2 text-sm font-semibold text-ocean-950 transition hover:bg-gold-400"
      >
        {sent ? "Joined!" : "Join"}
      </button>
    </form>
  );
}
