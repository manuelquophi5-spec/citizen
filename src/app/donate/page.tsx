import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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

        <div className="space-y-6">
          <Card className="overflow-hidden p-5">
            <h2 className="font-display text-base font-semibold text-ocean-950 dark:text-white">
              Recent donations at work
            </h2>
            <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
              Field evidence from our latest educational materials and community supplies handover in South Tongu.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ocean-100 dark:bg-ocean-900">
                <Image
                  src="/images/outreach/IMG_9626.jpg"
                  alt="Recent Donation Delivery"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ocean-100 dark:bg-ocean-900">
                <Image
                  src="/images/outreach/IMG_9633.jpg"
                  alt="Youth Civic Engagement"
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
            </div>
            <Link
              href="/gallery"
              className="mt-3 block text-right text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
            >
              View all 64 field photos &rarr;
            </Link>
          </Card>

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
      </div>
    </section>
  );
}
