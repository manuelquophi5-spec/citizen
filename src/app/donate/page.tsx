import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HandHeart, Building2 } from "lucide-react";
import { DataProvider } from "@/lib/data-provider";
import { DonationForm } from "@/components/forms/donation-form";
import { Card, SectionHeading } from "@/components/ui";
import { formatGHS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Donate · The Citizen Project",
  description: "Fund verified civic education and community initiatives across South Tongu District with direct photographic verification.",
};

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
            eyebrow="Public District Fund"
            title="Fund verified community action in South Tongu"
            description="Every cedi contributed goes directly to civic education, youth workshops, and grassroots community initiatives across Sogakope, Dabala, and neighboring towns — tracked openly on our public transparency dashboard."
          />
          <Card className="mt-8 p-6 sm:p-8">
            <DonationForm initiativeId={searchParams.initiative} />
          </Card>

          <div className="mt-8 grid gap-4 text-sm text-ocean-600 dark:text-ocean-300 sm:grid-cols-2">
            <p className="flex items-start gap-2.5 rounded-xl border border-ocean-100 bg-ocean-50/50 p-3.5 dark:border-ocean-800 dark:bg-ocean-900/30">
              <HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <span><strong className="text-ocean-900 dark:text-white">Sponsor an initiative:</strong> Link your gift to a specific project from the Initiatives page.</span>
            </p>
            <p className="flex items-start gap-2.5 rounded-xl border border-ocean-100 bg-ocean-50/50 p-3.5 dark:border-ocean-800 dark:bg-ocean-900/30">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-ocean-600 dark:text-ocean-400" />
              <span><strong className="text-ocean-900 dark:text-white">Institutional giving:</strong> Select corporate contribution or contact us for District Assembly CSR partnership.</span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ocean-950 dark:text-white">
                Recent donations at work
              </h2>
              <span className="rounded-full bg-leaf-400/15 px-2 py-0.5 text-[11px] font-semibold text-leaf-600 dark:text-leaf-400">
                Verified
              </span>
            </div>
            <p className="mt-1.5 text-xs text-ocean-600 dark:text-ocean-400">
              Field evidence from our latest educational materials and community supplies handover in South Tongu.
            </p>
            <div className="mt-3.5 grid grid-cols-2 gap-2">
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
              className="mt-3.5 block text-right text-xs font-semibold text-gold-600 hover:underline dark:text-gold-400"
            >
              Explore all 64 archive photos &rarr;
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <div>
                <h2 className="font-display text-base font-semibold text-ocean-950 dark:text-white">Public Donor Ledger</h2>
                <p className="text-[11px] text-ocean-500">Recent community supporters</p>
              </div>
              <Link href="/transparency" className="text-xs font-semibold text-ocean-600 hover:text-ocean-950 dark:text-gold-400">
                Ledger &rarr;
              </Link>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {recentDonors.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl bg-ocean-50/60 p-3 text-xs dark:bg-ocean-800/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ocean-200/80 font-mono text-[11px] font-bold text-ocean-900 dark:bg-ocean-700 dark:text-ocean-100">
                      {d.anonymous ? "?" : (d.donor_name || "S")[0]?.toUpperCase()}
                    </div>
                    <span className="truncate font-medium text-ocean-900 dark:text-ocean-100">
                      {d.anonymous ? "Anonymous supporter" : d.donor_name || "Community Supporter"}
                    </span>
                  </div>
                  <span className="shrink-0 font-mono font-semibold text-ocean-950 dark:text-gold-300">
                    {formatGHS(d.amount)}
                  </span>
                </div>
              ))}
              {recentDonors.length === 0 && (
                <p className="py-4 text-center text-xs text-ocean-500">
                  Be the first to contribute to the South Tongu Community Fund.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
