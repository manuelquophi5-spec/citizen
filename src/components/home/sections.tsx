import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, CalendarDays, Heart } from "lucide-react";
import { Card, Badge, ProgressBar, SectionHeading, StatCounter, Reveal, Button } from "@/components/ui";
import { formatDate, formatGHS, percent } from "@/lib/utils";
import { labelize as labelizeCategory } from "@/types";

export function StatsBand({
  initiatives,
  volunteers,
  communities,
  raised,
}: {
  initiatives: number;
  volunteers: number;
  communities: number;
  raised: number;
}) {
  return (
    <section className="border-y border-ocean-800/80 bg-ocean-950 py-10 text-white">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-ocean-800/60">
          <div className="sm:px-6 first:sm:pl-0">
            <StatCounter value={initiatives} label="Active civic initiatives" />
          </div>
          <div className="sm:px-6">
            <StatCounter value={volunteers} label="Registered local volunteers" />
          </div>
          <div className="sm:px-6">
            <StatCounter value={communities} label="South Tongu communities" />
          </div>
          <div className="sm:px-6 last:sm:pr-0">
            <p className="font-mono text-3xl font-semibold text-gold-400 sm:text-4xl tabular-nums">
              GH₵ {raised.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-ocean-300">Verified donations deployed</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedInitiatives({
  initiatives,
}: {
  initiatives: { id: string; slug: string; title: string; summary: string; category: string; status: string; budget: number; amountRaised: number; progressLabel: string | null }[];
}) {
  return (
    <section className="section-y">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="District projects" title="Featured initiatives" />
          <Link href="/initiatives" className="flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:text-ocean-900 dark:text-gold-400">
            View all initiatives <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((i, idx) => {
            const cardImages = [
              "/images/outreach/IMG_9626.jpg",
              "/images/outreach/IMG_9633.jpg",
              "/images/outreach/IMG_9640.jpg",
              "/images/outreach/IMG_9650.jpg",
              "/images/outreach/IMG_9665.jpg",
              "/images/outreach/IMG_9674.jpg",
            ];
            const imgPath = cardImages[idx % cardImages.length];

            return (
              <Reveal key={i.id} delay={idx * 0.05}>
                <Link href={`/initiatives/${i.slug}`} className="block h-full">
                  <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-ocean-950/10 dark:hover:shadow-ocean-950/50">
                    <div className="relative h-44 w-full overflow-hidden bg-ocean-900">
                      <Image
                        src={imgPath}
                        alt={i.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-ocean-950/20 to-transparent" />
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center rounded-full bg-ocean-950/80 px-2.5 py-1 text-[11px] font-semibold text-ocean-100 backdrop-blur-md">
                          {i.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-ocean-200">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3 text-gold-400" /> South Tongu
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge tone="gold">Coming soon…</Badge>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          In planning
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-semibold text-ocean-950 group-hover:text-ocean-700 dark:text-white dark:group-hover:text-gold-300 transition-colors">
                        {i.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm text-ocean-600 dark:text-ocean-300 leading-relaxed">
                        {i.summary}
                      </p>
                      <div className="mt-5 border-t border-ocean-100 pt-3 flex items-center justify-between text-xs dark:border-ocean-800">
                        <span className="font-mono text-ocean-600 dark:text-ocean-400">Target: {formatGHS(i.budget)}</span>
                        <span className="font-semibold text-ocean-700 dark:text-gold-400 group-hover:underline">
                          View details &rarr;
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function RecentOutreachShowcase() {
  return (
    <section className="section-y bg-ocean-50/70 dark:bg-ocean-900/30">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Direct field verification"
            title="Recent community outreach in South Tongu"
            description="Tangible deliveries and civic engagements funded by community contributions across Sogakope, Dabala, and Agorkpo."
          />
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 rounded-full bg-ocean-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-ocean-700 dark:bg-gold-500 dark:text-ocean-950 dark:hover:bg-gold-400"
          >
            Explore all 64 archive photos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Asymmetric Editorial Documentary Grid */}
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          {/* Main Hero Photo Card */}
          <div className="lg:col-span-7">
            <Link href="/gallery" className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-ocean-900 shadow-md transition-all hover:shadow-xl">
              <Image
                src="/images/outreach/IMG_9626.jpg"
                alt="Direct Educational Materials Handover"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-950/30 to-transparent p-6 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2">
                  <Badge tone="gold">Donation Handover</Badge>
                  <span className="text-xs font-mono text-ocean-300 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gold-400" /> Agorkpo Basic School
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl sm:text-2xl font-semibold">
                  Direct Educational Materials Handover
                </h3>
                <p className="mt-1 text-sm text-ocean-200 line-clamp-2 max-w-xl">
                  Coordinators and volunteers distributing classroom supplies and educational packages to student leaders and teachers.
                </p>
              </div>
            </Link>
          </div>

          {/* Secondary Stacked Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Link href="/gallery" className="group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-ocean-900 shadow-sm transition-all hover:shadow-md">
              <Image
                src="/images/outreach/IMG_9633.jpg"
                alt="Youth Leadership Dialogue"
                fill
                sizes="(max-width: 1024px) 50vw, 40vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/85 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[11px] font-mono text-gold-300 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Sogakope Central
                </span>
                <p className="font-display text-sm font-semibold line-clamp-1">Youth Leadership & Civic Responsibility Workshop</p>
              </div>
            </Link>

            <Link href="/gallery" className="group relative block aspect-[16/9] overflow-hidden rounded-2xl bg-ocean-900 shadow-sm transition-all hover:shadow-md">
              <Image
                src="/images/outreach/IMG_9640.jpg"
                alt="Community Field Coordination"
                fill
                sizes="(max-width: 1024px) 50vw, 40vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/85 via-transparent to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-[11px] font-mono text-gold-300 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Dabala Community Center
                </span>
                <p className="font-display text-sm font-semibold line-clamp-1">Field Coordination & Local Elder Assembly</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function UpcomingEvents({
  events,
}: {
  events: { id: string; slug: string; title: string; summary: string; location: string | null; startDate: Date }[];
}) {
  return (
    <section className="section-y bg-ocean-50 dark:bg-ocean-900/40">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Save the date" title="Upcoming events" />
          <Link href="/events" className="flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:text-ocean-900 dark:text-ocean-300">
            View full calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4">
          {events.map((e, idx) => (
            <Reveal key={e.id} delay={idx * 0.05}>
              <Link href={`/events#${e.slug}`}>
                <Card className="flex flex-col gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)] sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-ocean-700 font-mono text-white">
                    <span className="text-lg font-semibold leading-none">{e.startDate.getDate()}</span>
                    <span className="text-[10px] uppercase">{e.startDate.toLocaleString("en-GH", { month: "short" })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold text-ocean-950 dark:text-white">{e.title}</h3>
                    <p className="mt-1 line-clamp-1 text-sm text-ocean-600 dark:text-ocean-300">{e.summary}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 text-xs text-ocean-600 dark:text-ocean-400 sm:text-right">
                    <span className="flex items-center gap-1 sm:justify-end"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.startDate)}</span>
                    {e.location && <span className="flex items-center gap-1 sm:justify-end"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>}
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({
  testimonials,
}: {
  testimonials: { id: string; name: string; role: string | null; content: string }[];
}) {
  return (
    <section className="section-y">
      <div className="container-page">
        <SectionHeading eyebrow="Community voices" title="Voices from South Tongu" align="center" />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Reveal key={t.id} delay={idx * 0.05}>
              <Card className="flex h-full flex-col justify-between p-6">
                <p className="text-sm sm:text-base text-ocean-800 dark:text-ocean-200 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-ocean-100 pt-4 dark:border-ocean-800">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-100 font-display text-xs font-semibold text-ocean-800 dark:bg-ocean-800 dark:text-gold-300">
                    {t.name.split(" ").map((n) => n[0]?.toUpperCase()).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-semibold text-ocean-950 dark:text-white truncate">{t.name}</p>
                    {t.role && <p className="text-xs text-ocean-600 dark:text-ocean-400 truncate">{t.role}</p>}
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersStrip({ partners }: { partners: { id: string; name: string; organisation: string | null }[] }) {
  if (partners.length === 0) return null;
  return (
    <section className="border-y border-ocean-100 bg-white py-10 dark:border-ocean-900 dark:bg-ocean-950">
      <div className="container-page">
        <p className="text-center text-xs font-semibold text-ocean-600 dark:text-ocean-400">
          In partnership with local and regional institutions
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <span key={p.id} className="font-display text-sm font-medium text-ocean-700 dark:text-ocean-300 hover:text-ocean-950 dark:hover:text-white transition-colors">
              {p.organisation ?? p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="bg-ocean-950 py-20 text-center text-white relative overflow-hidden">
      <div className="container-page relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean-900 px-3 py-1 text-xs font-semibold text-gold-400">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
          Public District Ledger
        </span>
        <h2 className="mx-auto mt-4 max-w-xl text-balance font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">
          Ready to put your support where South Tongu can see it?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ocean-200">
          Every contribution is publicly logged on our Transparency Dashboard with complete photographic field verification.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/donate" size="lg" variant="primary">
            <Heart className="h-4 w-4" /> Support the Community Fund
          </Button>
          <Button href="/volunteer" size="lg" variant="secondary">
            Become a Volunteer
          </Button>
        </div>
      </div>
    </section>
  );
}
