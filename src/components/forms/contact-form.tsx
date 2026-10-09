"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">
            Full name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Kwami Sasu"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            placeholder="kwami@example.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-phone" className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">
          Phone number (optional)
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="024 000 0000"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          placeholder="Community partnership or inquiry"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="How can The Citizen Project collaborate or assist in your community?"
          className={inputClass}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Send Message
      </Button>

      {sent && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-leaf-400/30 bg-leaf-400/10 p-4 text-xs text-leaf-700 dark:text-leaf-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" />
          <span>
            Thank you for contacting The Citizen Project. Your message has been received by our South Tongu coordination desk, and we will follow up with you directly.
          </span>
        </div>
      )}
    </form>
  );
}
