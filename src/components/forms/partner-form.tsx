"use client";

import { useState } from "react";
import { PARTNER_CATEGORIES, labelize } from "@/types";
import { Button } from "@/components/ui";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { submitPartnerAction } from "@/app/actions/partner";

const inputClass =
  "w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900";

export function PartnerForm() {
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitPartnerAction({
      name: String(formData.get("name") || ""),
      position: String(formData.get("position") || "") || null,
      organisation: String(formData.get("organisation") || "") || null,
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || "") || null,
      website: String(formData.get("website") || "") || null,
      category: String(formData.get("category") || ""),
      purpose: String(formData.get("purpose") || ""),
      areas_of_collaboration: String(formData.get("areasOfCollaboration") || "") || null,
      referral_source: String(formData.get("referralSource") || "") || null,
      consent: true,
    });

    setLoading(false);
    if (result.success) {
      setSent(true);
      (e.target as HTMLFormElement).reset();
      setConsent(false);
    } else {
      setError(result.error || "Failed to submit partner application. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Full name" className={inputClass} />
        <input name="position" placeholder="Position / title" className={inputClass} />
        <input name="organisation" placeholder="Organisation" className={inputClass} />
        <input name="email" type="email" required placeholder="Email" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input name="website" placeholder="Website (optional)" className={inputClass} />
      </div>

      <select name="category" required defaultValue="" className={inputClass}>
        <option value="" disabled>Partner category</option>
        {PARTNER_CATEGORIES.map((c) => (
          <option key={c} value={c}>{labelize(c)}</option>
        ))}
      </select>

      <textarea name="purpose" required rows={3} placeholder="Purpose of partnership" className={inputClass} />
      <textarea name="areasOfCollaboration" rows={2} placeholder="Areas of collaboration" className={inputClass} />
      <input name="referralSource" placeholder="How did you hear about us?" className={inputClass} />

      <label className="flex items-start gap-2 text-sm text-ocean-700 dark:text-ocean-300">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 rounded"
        />
        I consent to The Citizen Project reviewing and contacting me about this application.
      </label>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-700 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={!consent || loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Application...
          </>
        ) : (
          "Submit application"
        )}
      </Button>

      {sent && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-leaf-400/30 bg-leaf-400/10 p-4 text-xs text-leaf-700 dark:text-leaf-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" />
          <span>
            Thank you for your partnership application. Our South Tongu district team has logged your submission and will review collaboration opportunities with you shortly.
          </span>
        </div>
      )}
    </form>
  );
}
