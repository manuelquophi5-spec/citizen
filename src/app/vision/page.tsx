import type { Metadata } from "next";
import { SectionHeading, Card, Button } from "@/components/ui";
import { Compass, Sparkles, Sprout, HeartHandshake, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Vision · The Citizen Project",
  description: "A South Tongu where every young person understands their power as a citizen in building a more responsible, sustainable, and civically engaged Ghana.",
};

const visionPillars = [
  {
    icon: Compass,
    title: "Responsive Grassroots Democracy",
    desc: "A constituency where community challenges are actively reported and addressed with transparent accountability, rather than quietly endured.",
  },
  {
    icon: Sparkles,
    title: "Youth-Driven Civic Leadership",
    desc: "Young people across Sogakope, Dabala, and all 7 electoral areas actively initiating solutions and participating in local governance.",
  },
  {
    icon: Sprout,
    title: "Sustainable District Ecology",
    desc: "Preserved Volta riverbanks, clean town centers, and sustainable environmental practices championed by basic school clubs and volunteer brigades.",
  },
];

export default function VisionPage() {
  return (
    <section className="section-y">
      <div className="container-page max-w-4xl">
        <SectionHeading
          eyebrow="Looking Ahead"
          title="Our Vision for South Tongu"
          description="A self-reliant, civically vibrant South Tongu where active citizenship, environmental care, and community solidarity are how people live every day."
        />

        <div className="mt-8 rounded-2xl border border-ocean-100 bg-ocean-50/70 p-6 dark:border-ocean-800 dark:bg-ocean-900/40 sm:p-8">
          <p className="font-display text-xl sm:text-2xl font-semibold text-ocean-950 dark:text-white leading-relaxed">
            &ldquo;We envision a South Tongu where every young person understands their innate power as a citizen — where the gains of one generation&apos;s civic education are permanently visible in the next generation&apos;s communities.&rdquo;
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {visionPillars.map((p) => (
            <Card key={p.title} className="p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-100 text-ocean-700 dark:bg-ocean-800 dark:text-gold-400">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-semibold text-ocean-950 dark:text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-xs text-ocean-600 dark:text-ocean-300 leading-relaxed">
                {p.desc}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-ocean-100 pt-8 dark:border-ocean-800">
          <Button href="/volunteer" size="md" variant="primary">
            <HeartHandshake className="h-4 w-4" /> Become a Volunteer
          </Button>
          <Button href="/donate" size="md" variant="secondary">
            Support the Community Fund
          </Button>
        </div>
      </div>
    </section>
  );
}
