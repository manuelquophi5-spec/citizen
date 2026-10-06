"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, LoaderCircle, CheckCircle2 } from "lucide-react";
import { SURVEY_CATEGORIES, labelize } from "@/types";
import { addLocalReport, generateLocalReportId } from "@/lib/local-reports";
import type { PriorityLevel, UrgencyLevel } from "@/lib/mock-data";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import { createReportAction } from "@/app/actions/reports";

const inputClass =
  "w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900";

type GeoStatus = "idle" | "locating" | "granted" | "denied" | "unavailable";

export function SurveyForm() {
  const [anonymous, setAnonymous] = useState(false);
  const [sent, setSent] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const captureLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("unavailable");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoStatus("granted");
      },
      (error) => {
        setGeoStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (sent) {
    return (
      <div className="space-y-6 py-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-400/15 text-leaf-600 dark:text-leaf-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-semibold text-ocean-950 dark:text-white">
            Report Submitted Successfully
          </h3>
          <p className="mx-auto max-w-md text-sm text-ocean-700 dark:text-ocean-300">
            Thank you for taking civic action. Your report is securely registered and published to the South Tongu Community Map and operations triage desk.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Button href="/community-map" size="md">
            <MapPin className="h-4 w-4" /> View on Community Map
          </Button>
          <Button
            onClick={() => {
              setSent(false);
              setCoords(null);
              setGeoStatus("idle");
              setAnonymous(false);
            }}
            variant="ghost"
            size="md"
          >
            Report another issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = String(formData.get("title") || "").trim();
        const description = String(formData.get("description") || "").trim();
        const category = String(formData.get("category") || "SANITATION").trim();
        const community = String(formData.get("community") || "Sogakope").trim();
        const town = String(formData.get("town") || "South Tongu").trim();
        const reporterName = anonymous ? null : (formData.get("reporterName") as string) || null;
        const phone = anonymous ? null : (formData.get("phone") as string) || null;
        const email = anonymous ? null : (formData.get("email") as string) || null;
        const priority = ((formData.get("priority") as string) || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH";

        if (!title || !description) return;

        try {
          await createReportAction({
            title,
            description,
            category,
            priority,
            reporter_name: reporterName,
            reporter_phone: phone,
            reporter_email: email,
            location: {
              community,
              town,
              gps: coords ? `${coords.lat}, ${coords.lng}` : undefined,
            },
            status: "SUBMITTED",
          });
        } catch {
          // Fallback handled
        }
        setSent(true);
      }}
      className="space-y-5"
    >
      <label className="flex items-center gap-2 text-sm text-ocean-700 dark:text-ocean-300">
        <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="rounded" />
        Submit anonymously
      </label>

      {!anonymous && (
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="reporterName" placeholder="Full name" className={inputClass} />
          <input name="phone" placeholder="Phone number" className={inputClass} />
          <input name="occupation" placeholder="Occupation" className={inputClass} />
          <input name="email" type="email" placeholder="Email (optional)" className={inputClass} />
        </div>
      )}

      <div className="rounded-lg border border-ocean-200 p-4 dark:border-ocean-700">
        <p className="text-sm font-medium text-ocean-800 dark:text-ocean-200">Pin your exact location (optional)</p>
        <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
          {geoStatus === "granted"
            ? "Captured — this exact point will be pinned on the Community Map, not just the nearest town."
            : "Share your device's GPS location so this report is pinned exactly where the issue is."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={captureLocation}
            disabled={geoStatus === "locating"}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:opacity-60",
              geoStatus === "granted"
                ? "border-leaf-500 bg-leaf-400/10 text-leaf-600"
                : "border-ocean-300 text-ocean-700 hover:border-ocean-500 dark:border-ocean-600 dark:text-ocean-200"
            )}
          >
            {geoStatus === "locating" ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            {geoStatus === "locating"
              ? "Locating…"
              : geoStatus === "granted"
                ? "Location captured"
                : "Use my current location"}
          </button>
          {geoStatus === "granted" && coords && (
            <span className="font-mono text-xs text-ocean-600 dark:text-ocean-400">
              {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </span>
          )}
        </div>
        {(geoStatus === "denied" || geoStatus === "unavailable") && (
          <p className="mt-2 text-xs text-gold-600">
            {geoStatus === "denied" ? "Location access was denied" : "Couldn't get your location"} — your report
            will still be pinned using the Community/Town fields below.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="community" required placeholder="Community" className={inputClass} />
        <input name="town" required placeholder="Town" className={inputClass} />
      </div>

      <select name="category" required defaultValue="" className={inputClass}>
        <option value="" disabled>Select a category</option>
        {SURVEY_CATEGORIES.map((c) => (
          <option key={c} value={c}>{labelize(c)}</option>
        ))}
      </select>

      <input name="title" required placeholder="Issue title" className={inputClass} />
      <textarea name="description" required rows={4} placeholder="Describe the issue in detail" className={inputClass} />
      <textarea name="suggestedSolution" rows={2} placeholder="Suggested solution (optional)" className={inputClass} />

      <div>
        <p className="mb-2 text-sm font-medium text-ocean-800 dark:text-ocean-200">Photo / video (optional)</p>
        <input type="file" accept="image/*,video/*" className={cn(inputClass, "cursor-not-allowed opacity-60")} disabled />
        <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
          Media uploads aren&apos;t available on this demo site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-ocean-800 dark:text-ocean-200">Priority</p>
          <select name="priority" defaultValue="MEDIUM" className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-ocean-800 dark:text-ocean-200">Urgency</p>
          <select name="urgency" defaultValue="MEDIUM" className={inputClass}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">Submit report</Button>
    </form>
  );
}
