import type { Metadata } from "next";
import { DataProvider } from "@/lib/data-provider";
import { ambassadorLeaderboard as mockLeaderboard } from "@/lib/mock-data";
import { SectionHeading, Card, Badge, Button } from "@/components/ui";
import { Award, Users, Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Ambassadors & Leaderboard" };

type BadgeTier = { label: string; tone: "ocean" | "leaf" | "gold" };

function getHighestBadge(hours: number): BadgeTier | null {
  if (hours >= 60) return { label: "Gold · 60h+", tone: "gold" };
  if (hours >= 30) return { label: "Silver · 30h+", tone: "leaf" };
  if (hours >= 10) return { label: "Bronze · 10h+", tone: "ocean" };
  return null;
}

export default async function AmbassadorsPage() {
  const [verifiedHours, profiles] = await Promise.all([
    DataProvider.getVolunteerHours({ status: "VERIFIED" }),
    DataProvider.getAllProfiles(),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name || p.email]));

  // Aggregate verified hours per volunteer
  const hoursMap = new Map<string, number>();
  for (const entry of verifiedHours) {
    if (entry.volunteer_id) {
      hoursMap.set(entry.volunteer_id, (hoursMap.get(entry.volunteer_id) ?? 0) + Number(entry.hours));
    }
  }

  const liveLeaderboard = Array.from(hoursMap.entries())
    .map(([volId, hours]) => ({
      id: volId,
      name: profileMap.get(volId) || `Volunteer #${volId.slice(0, 6)}`,
      hours,
    }))
    .sort((a, b) => b.hours - a.hours);

  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";
  const leaderboard = liveLeaderboard.length > 0
    ? liveLeaderboard
    : (isLive ? [] : [...mockLeaderboard].sort((a, b) => b.hours - a.hours));

  return (
    <section className="section-y">
      <div className="container-page max-w-3xl">
        <SectionHeading
          eyebrow="Lead in your community"
          title="Ambassadors Programme"
          description="Our most active volunteers represent The Citizen Project locally — recruiting, organising, and driving verified civic impact across South Tongu District."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="p-5 text-center">
            <Award className="mx-auto h-7 w-7 text-ocean-600 dark:text-ocean-300" />
            <p className="mt-2 text-sm font-medium text-ocean-900 dark:text-white">Certificates &amp; badges</p>
          </Card>
          <Card className="p-5 text-center">
            <Users className="mx-auto h-7 w-7 text-ocean-600 dark:text-ocean-300" />
            <p className="mt-2 text-sm font-medium text-ocean-900 dark:text-white">Community leadership</p>
          </Card>
          <Card className="p-5 text-center">
            <Trophy className="mx-auto h-7 w-7 text-ocean-600 dark:text-ocean-300" />
            <p className="mt-2 text-sm font-medium text-ocean-900 dark:text-white">Leaderboard recognition</p>
          </Card>
        </div>

        <h2 className="mt-12 font-display text-lg font-semibold text-ocean-950 dark:text-white">Volunteer hours leaderboard</h2>
        <div className="mt-4 space-y-2">
          {leaderboard.map((row, idx) => {
            const badge = getHighestBadge(row.hours);
            return (
              <Card key={row.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 font-mono text-sm text-ocean-600 dark:text-ocean-400">#{idx + 1}</span>
                  <span className="font-medium text-ocean-900 dark:text-white">{row.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
                  <span className="font-mono text-sm text-ocean-600 dark:text-ocean-400">{row.hours}h</span>
                </div>
              </Card>
            );
          })}
          {leaderboard.length === 0 && (
            <p className="text-sm text-ocean-600 dark:text-ocean-400">No approved volunteer hours logged yet.</p>
          )}
        </div>

        <Button href="/contact" size="lg" className="mt-6 w-full">Register your interest as an ambassador</Button>
      </div>
    </section>
  );
}
