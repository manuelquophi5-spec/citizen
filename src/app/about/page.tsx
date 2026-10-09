import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading, Card, Reveal, Button, Badge } from "@/components/ui";
import { ShieldCheck, Users, Scale, Sprout, MapPin, Landmark, Heart, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us · The Citizen Project",
  description: "Learn about The Citizen Project's mission to unite youth and institutions across South Tongu in building an accountable, sustainable Ghana.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Uncompromising Integrity",
    body: "Every cedi and volunteer hour is accounted for in public record — complete with field photos and verifiable receipts.",
  },
  {
    icon: Users,
    title: "Community Participation",
    body: "We build with communities, not for them. Every initiative begins by listening to local residents, elders, and youth.",
  },
  {
    icon: Scale,
    title: "Constituency Fairness",
    body: "Programmes are intentionally designed to reach girls and boys across all 7 electoral areas of South Tongu equally.",
  },
  {
    icon: Sprout,
    title: "Grassroots Sustainability",
    body: "We favor solutions communities can carry forward themselves, long after initial project rollouts are completed.",
  },
];

const electoralAreas = [
  "Sogakope Central",
  "Sogakope South",
  "Tefle",
  "Dabala",
  "Agorkpo",
  "Sokpoe",
  "Fieve",
];

export default function AboutPage() {
  return (
    <div>
      {/* Header Banner */}
      <section className="border-b border-ocean-100 bg-ocean-50/70 py-16 dark:border-ocean-900 dark:bg-ocean-900/30 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Story & Roots"
            title="Why The Citizen Project exists"
            description="South Tongu District has no shortage of civic energy — what it has lacked is a structured, youth-first vehicle to channel that energy into visible, verifiable community change."
          />
        </div>
      </section>

      {/* Editorial Narrative & Field Evidence */}
      <section className="section-y">
        <div className="container-page grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-ocean-700 dark:text-ocean-300 lg:col-span-7">
            <Reveal>
              <div>
                <span className="text-xs font-semibold text-ocean-600 dark:text-gold-400">Origins &amp; Mandate</span>
                <h2 className="mt-1 font-display text-2xl font-semibold text-ocean-950 dark:text-white sm:text-3xl">
                  From classroom civics to constituency-wide action
                </h2>
                <p className="mt-4 text-base leading-relaxed">
                  The Citizen Project began as a civic education programme for basic school learners, designed to
                  complement the National Commission for Civic Education&apos;s (NCCE) mandate under UN Sustainable
                  Development Goal 4. What started as a focused learning calendar has rapidly grown into a broader
                  constituency movement.
                </p>
                <p className="mt-3 text-base leading-relaxed">
                  Today, our work spans environmental stewardship along the Volta estuary, youth civic leadership,
                  direct educational support distributions, and community-led reporting of local social challenges.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="border-t border-ocean-100 pt-6 dark:border-ocean-800">
                <span className="text-xs font-semibold text-ocean-600 dark:text-gold-400">Governance &amp; Stewardship</span>
                <h2 className="mt-1 font-display text-xl font-semibold text-ocean-950 dark:text-white">
                  Accountable, lean, and rooted in the District
                </h2>
                <p className="mt-3 text-base leading-relaxed">
                  We operate with a decentralized, volunteer-led structure: local coordination teams in Sogakope and Dabala,
                  electoral-area volunteer facilitators, and direct advisory relationships with institutional stakeholders
                  including Ghana Education Service (GES), Ghana Health Service (GHS), and the South Tongu District Assembly.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-4 lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ocean-900 shadow-lg">
              <Image
                src="/images/outreach/IMG_9626.jpg"
                alt="Direct Educational Supplies Handover"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-transparent to-transparent p-5 flex flex-col justify-end text-white">
                <p className="font-display text-sm font-semibold">Agorkpo Basic School Handover</p>
                <p className="text-xs text-ocean-300">Classroom learning materials delivered directly to teachers &amp; students</p>
              </div>
            </div>

            <div className="rounded-2xl border border-ocean-100 bg-ocean-50/60 p-5 dark:border-ocean-800 dark:bg-ocean-900/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-ocean-500">
                Active Electoral Areas
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {electoralAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ocean-800 shadow-xs dark:bg-ocean-800 dark:text-ocean-200"
                  >
                    <MapPin className="h-3 w-3 text-gold-500" /> {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="section-y bg-ocean-50/70 dark:bg-ocean-900/30">
        <div className="container-page">
          <SectionHeading eyebrow="Guiding Principles" title="Our core values" align="center" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, idx) => (
              <Reveal key={v.title} delay={idx * 0.05}>
                <Card className="h-full p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <v.icon className="mx-auto h-8 w-8 text-ocean-600 dark:text-gold-400" />
                  <h3 className="mt-4 font-display font-semibold text-ocean-950 dark:text-white">{v.title}</h3>
                  <p className="mt-2 text-xs text-ocean-600 dark:text-ocean-300 leading-relaxed">{v.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency Callout */}
      <section className="container-page py-16 sm:py-20">
        <div className="rounded-3xl bg-ocean-950 p-8 text-white sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-900 px-3 py-1 text-xs font-semibold text-gold-400">
                <Landmark className="h-3.5 w-3.5" /> Public Accountability
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                Open books. Open reporting. Verified impact.
              </h2>
              <p className="mt-3 text-sm text-ocean-200 sm:text-base leading-relaxed">
                We believe trust is built in the light. Every cedi donated and every project milestone achieved is published to our public Transparency Dashboard and Media Gallery with time-stamped photographic records.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
              <Button href="/transparency" size="lg" variant="primary">
                Explore Public Ledger
              </Button>
              <Button href="/gallery" size="md" variant="outline">
                Browse Field Archive &rarr;
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
