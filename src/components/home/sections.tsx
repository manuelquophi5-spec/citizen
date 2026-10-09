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
    <section className="bg-ocean-900">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <StatCounter value={initiatives} label="Initiatives launched" />
        <StatCounter value={volunteers} label="Volunteers engaged" />
        <StatCounter value={communities} label="Communities reached" />
        <StatCounter value={raised} label="Raised toward our mission (GHS)" />
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
          <SectionHeading eyebrow="Where your support goes" title="Featured initiatives" />
          <Link href="/initiatives" className="flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:text-ocean-900 dark:text-ocean-300">
            View all initiatives <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((i, idx) => (
            <Reveal key={i.id} delay={idx * 0.05}>
              <Link href={`/initiatives/${i.slug}`}>
                <Card className="group h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(8,29,38,0.10)]">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-ocean-600 to-ocean-900 font-mono text-xs text-ocean-200">
                    {i.category}
                  </div>
                  <div className="p-5">
                    <Badge tone="gold">Coming soon…</Badge>
                    <h3 className="mt-3 font-display text-lg font-semibold text-ocean-950 group-hover:text-ocean-700 dark:text-white">
                      {i.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ocean-600 dark:text-ocean-300">{i.summary}</p>
                    <div className="mt-4 pt-3 border-t border-ocean-100 dark:border-ocean-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-ocean-600 dark:text-ocean-400">Target: {formatGHS(i.budget)}</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        Coming soon…
                      </span>
                    </div>
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

export function RecentOutreachShowcase() {
  const showcasePhotos = [
    { src: "/images/outreach/IMG_9626.jpg", title: "Direct Educational Materials Handover", location: "Agorkpo Basic School" },
    { src: "/images/outreach/IMG_9633.jpg", title: "Youth Leadership Dialogue", location: "Sogakope Central" },
    { src: "/images/outreach/IMG_9640.jpg", title: "Community Field Coordination", location: "Dabala Center" },
    { src: "/images/outreach/IMG_9650.jpg", title: "Supplies Distribution & Support", location: "Tefle District" },
  ];

  return (
    <section className="section-y bg-ocean-50/60 dark:bg-ocean-900/30">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Real field impact"
            title="Recent donation outreach"
            description="Photographic field evidence from our latest community distributions and educational support across South Tongu District."
          />
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 rounded-full bg-ocean-700 px-4 py-2 text-xs font-semibold text-white hover:bg-ocean-600 dark:bg-gold-500 dark:text-ocean-950 dark:hover:bg-gold-400"
          >
            Explore all 64 photos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {showcasePhotos.map((photo, idx) => (
            <Reveal key={photo.src} delay={idx * 0.05}>
              <Link href="/gallery" className="group block">
                <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-ocean-100 shadow-xs transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg dark:bg-ocean-900">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-transparent to-transparent opacity-0 transition duration-200 group-hover:opacity-100 p-3 flex flex-col justify-end text-white">
                    <span className="font-mono text-[10px] text-amber-300 uppercase">{photo.location}</span>
                    <p className="font-medium text-xs line-clamp-1">{photo.title}</p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
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
        <SectionHeading eyebrow="In their words" title="Voices from South Tongu" align="center" />
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Reveal key={t.id} delay={idx * 0.05}>
              <Card className="h-full p-6">
                <p className="text-ocean-700 dark:text-ocean-200">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-100 font-mono text-xs font-semibold text-ocean-700 dark:bg-ocean-800 dark:text-ocean-200">
                    {t.name.split(" ").map((n) => n[0]?.toUpperCase()).slice(0, 2).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ocean-950 dark:text-white">{t.name}</p>
                    {t.role && <p className="text-xs text-ocean-600 dark:text-ocean-400">{t.role}</p>}
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
        <p className="text-center font-mono text-xs uppercase tracking-[0.2em] text-ocean-600 dark:text-ocean-400">
          In partnership with
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((p) => (
            <span key={p.id} className="font-display text-sm font-medium text-ocean-600 dark:text-ocean-400">
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
    <section className="bg-ocean-950 py-16 text-center text-white">
      <div className="container-page">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ocean-300">
          Every donation is tracked on our transparency dashboard
        </p>
        <h2 className="mx-auto mt-3 max-w-xl text-balance font-display text-2xl font-semibold sm:text-3xl">
          Ready to put your support where South Tongu can see it?
        </h2>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button href="/donate" size="lg">
            <Heart className="h-4 w-4" /> Donate now
          </Button>
          <Button href="/volunteer" size="lg" variant="outline">
            Become a volunteer
          </Button>
        </div>
      </div>
    </section>
  );
}
