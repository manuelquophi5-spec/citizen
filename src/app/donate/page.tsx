import type { Metadata } from "next";
import { HandHeart, Building2 } from "lucide-react";
import { DataProvider } from "@/lib/data-provider";
import { DonationForm } from "@/components/forms/donation-form";
import { Card, SectionHeading } from "@/components/ui";
import { formatGHS } from "@/lib/utils";

export const metadata: Metadata = { title: "Donate" };

export default async function DonatePage({ searchParams }: { searchParams: { initiative?: string } }) {
  const donations = await DataProvider.getDonations();
  const recentDonors = [...donations]
    .filter((d) => d.status === "SUCCESS")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <section className="section-y">
      <div className="container-page grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeading
            eyebrow="Fuel the work"
            title="Make a donation"
            description="Transparent and community-backed civic funding. Every contribution powers tangible development initiatives across South Tongu District."
          />
          <Card className="mt-8 p-6 sm:p-8">
            <DonationForm initiativeId={searchParams.initiative} />
          </Card>

          <div className="mt-8 grid gap-4 text-sm text-ocean-600 dark:text-ocean-300 sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span><strong className="text-ocean-900 dark:text-white">Sponsor an initiative</strong> — link your gift to a specific project from the Initiatives page.</span>
            </p>
            <p className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600 dark:text-ocean-400" />
              <span><strong className="text-ocean-900 dark:text-white">Corporate giving</strong> — select corporate contribution or contact us for a institutional partnership plan.</span>
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-ocean-950 dark:text-white">Donor wall</h2>
          <div className="mt-4 space-y-3">
            {recentDonors.map((d) => (
              <Card key={d.id} className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-ocean-800 dark:text-ocean-200">
                  {d.anonymous ? "Anonymous supporter" : d.donor_name || "A generous donor"}
                </span>
                <span className="font-mono text-sm text-ocean-600 dark:text-ocean-400">{formatGHS(d.amount)}</span>
              </Card>
            ))}
            {recentDonors.length === 0 && <p className="text-sm text-ocean-600 dark:text-ocean-400">Be the first to donate.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
