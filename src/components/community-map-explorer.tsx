"use client";

import { useEffect, useMemo, useState } from "react";
import nextDynamic from "next/dynamic";
import { X, Download, MapPin as MapPinIcon } from "lucide-react";
import type { SurveyReport } from "@/lib/mock-data";
import { getLocalReports, type LocalSurveyReport } from "@/lib/local-reports";
import { resolveCoordinates } from "@/lib/communities";
import { downloadReportPdf } from "@/lib/report-pdf";
import { formatDate } from "@/lib/utils";
import { labelize } from "@/types";
import { Badge, Card } from "@/components/ui";
import type { MapPin } from "@/components/community-map";

import type { ReportRow } from "@/types/database";

const CommunityMap = nextDynamic(
  () => import("@/components/community-map").then((m) => m.CommunityMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl bg-ocean-50 text-sm text-ocean-600 dark:bg-ocean-900 dark:text-ocean-400">
        Loading map…
      </div>
    ),
  }
);

type FullReport = (SurveyReport | LocalSurveyReport) & { source: "seed" | "local" };

function urgencyTone(urgency: string): MapPin["tone"] {
  if (urgency === "CRITICAL") return "critical";
  if (urgency === "HIGH") return "high";
  if (urgency === "LOW") return "low";
  return "medium";
}

export function CommunityMapExplorer({
  seededReports = [],
  liveReports,
}: {
  seededReports?: SurveyReport[];
  liveReports?: ReportRow[];
}) {
  const [localReports, setLocalReports] = useState<LocalSurveyReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLocalReports(getLocalReports());
  }, []);

  const allReports: FullReport[] = useMemo(() => {
    if (liveReports && liveReports.length > 0) {
      const converted: FullReport[] = liveReports.map((r) => {
        const loc = (typeof r.location === "object" && r.location !== null ? r.location : {}) as Record<string, any>;
        const community = loc.community || "Sogakope";
        const town = loc.town || "South Tongu";
        let lat: number | null = null;
        let lng: number | null = null;
        if (loc.gps && typeof loc.gps === "string") {
          const parts = loc.gps.split(",").map((s: string) => parseFloat(s.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            lat = parts[0];
            lng = parts[1];
          }
        }
        return {
          id: r.id,
          community,
          town,
          latitude: lat,
          longitude: lng,
          category: r.category,
          title: r.title,
          description: r.description,
          suggestedSolution: r.admin_notes || r.official_feedback || null,
          priority: (r.priority as any) || "MEDIUM",
          urgency: r.priority === "HIGH" ? "HIGH" : r.priority === "LOW" ? "LOW" : "MEDIUM",
          status: (r.status === "DISPATCHED" ? "IN_PROGRESS" : r.status) as any,
          reporterName: r.reporter_name,
          reporterPhone: r.reporter_phone,
          reporterEmail: r.reporter_email,
          phone: r.reporter_phone,
          email: r.reporter_email,
          occupation: null,
          anonymous: !r.reporter_name,
          createdAt: new Date(r.created_at),
          source: "seed",
        };
      });
      return [...localReports, ...converted].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    const seeded: FullReport[] = seededReports.map((r) => ({ ...r, source: "seed" }));
    return [...localReports, ...seeded].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [seededReports, liveReports, localReports]);

  const { pins, unplaced } = useMemo(() => {
    const pins: MapPin[] = [];
    const unplaced: FullReport[] = [];
    for (const r of allReports) {
      const coords = resolveCoordinates(r.community, r.latitude, r.longitude);
      if (!coords) {
        unplaced.push(r);
        continue;
      }
      pins.push({
        id: r.id,
        lat: coords[0],
        lng: coords[1],
        title: r.title,
        description: `${r.community}, ${r.town} — ${r.status.replace("_", " ")}`,
        tone: urgencyTone(r.urgency),
        source: r.source,
      });
    }
    return { pins, unplaced };
  }, [allReports]);

  const selected = allReports.find((r) => r.id === selectedId) ?? null;

  return (
    <>
      <div className="mt-4">
        <CommunityMap pins={pins} onViewReport={setSelectedId} />
      </div>

      {unplaced.length > 0 && (
        <p className="mt-4 text-xs text-ocean-600 dark:text-ocean-400">
          {unplaced.length} report{unplaced.length > 1 ? "s" : ""} from a community we don&apos;t have coordinates
          for yet aren&apos;t shown — add the community to <code>src/lib/communities.ts</code>, or capture GPS
          directly on the survey form.
        </p>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[1000] flex items-end justify-center bg-ocean-950/50 p-0 sm:items-center sm:p-4"
          onClick={() => setSelectedId(null)}
        >
          <Card
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-b-none sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-0">
              <div className="flex flex-wrap gap-1.5">
                <Badge tone={selected.urgency === "CRITICAL" || selected.urgency === "HIGH" ? "gold" : "ocean"}>
                  {labelize(selected.urgency)} urgency
                </Badge>
                <Badge>{labelize(selected.status)}</Badge>
                {selected.source === "local" && <Badge tone="leaf">From this device</Badge>}
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-ocean-500 hover:bg-ocean-50 dark:text-ocean-400 dark:hover:bg-ocean-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-ocean-950 dark:text-white">{selected.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400">
                  <MapPinIcon className="h-3.5 w-3.5" /> {selected.community}, {selected.town}
                </p>
              </div>

              <p className="text-sm text-ocean-700 dark:text-ocean-300">{selected.description}</p>

              {selected.suggestedSolution && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ocean-600 dark:text-ocean-400">
                    Suggested solution
                  </p>
                  <p className="mt-1 text-sm text-ocean-700 dark:text-ocean-300">{selected.suggestedSolution}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs text-ocean-600 dark:text-ocean-400">
                <div>
                  <p className="font-semibold uppercase tracking-wide">Category</p>
                  <p className="mt-0.5 text-ocean-800 dark:text-ocean-200">{labelize(selected.category)}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide">Reported</p>
                  <p className="mt-0.5 font-mono text-ocean-800 dark:text-ocean-200">{formatDate(selected.createdAt)}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide">Reporter</p>
                  <p className="mt-0.5 text-ocean-800 dark:text-ocean-200">
                    {selected.anonymous ? "Anonymous" : selected.reporterName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wide">Coordinates</p>
                  <p className="mt-0.5 font-mono text-ocean-800 dark:text-ocean-200">
                    {selected.latitude != null && selected.longitude != null
                      ? `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}`
                      : "From community lookup"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => downloadReportPdf(selected)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-ocean-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ocean-600"
              >
                <Download className="h-4 w-4" /> Download as PDF
              </button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
