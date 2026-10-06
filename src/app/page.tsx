import { Hero } from "@/components/home/hero";
import {
  StatsBand,
  FeaturedInitiatives,
  UpcomingEvents,
  TestimonialsSection,
  PartnersStrip,
  ClosingCta,
} from "@/components/home/sections";
import { DataProvider } from "@/lib/data-provider";
import { initiatives as mockInitiatives, events, testimonials, partners, getProgressLabel } from "@/lib/mock-data";

async function getHomeData() {
  const [liveInitiatives, liveDonations] = await Promise.all([
    DataProvider.getInitiatives(),
    DataProvider.getDonations(),
  ]);

  const activeInitiatives = liveInitiatives.length > 0 ? liveInitiatives : mockInitiatives;

  const featuredInitiatives = [...activeInitiatives]
    .filter((i) => i.status === "ACTIVE" || i.status === "UPCOMING")
    .sort((a: any, b: any) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : a.createdAt.getTime();
      const bTime = b.created_at ? new Date(b.created_at).getTime() : b.createdAt.getTime();
      return bTime - aTime;
    })
    .slice(0, 3)
    .map((i: any) => ({
      id: i.id,
      slug: i.slug,
      title: i.title,
      summary: i.summary || i.description || "",
      category: i.category,
      status: i.status,
      budget: i.target_amount ?? i.budget ?? 0,
      amountRaised: i.raised_amount ?? i.amountRaised ?? 0,
      progressLabel: i.milestones ? getProgressLabel(i) : null,
    }));

  const now = new Date();
  const upcomingEvents = [...events]
    .filter((e) => e.startDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 4);

  const featuredTestimonials = testimonials.filter((t) => t.featured).slice(0, 3);
  const approvedPartners = partners.filter((p) => p.status === "APPROVED").slice(0, 8);

  const volunteers = activeInitiatives.reduce(
    (sum: number, i: any) => sum + (i.volunteersInvolved ?? 24),
    0
  );
  const raised = liveDonations
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);
  const communities = new Set(activeInitiatives.map((i: any) => i.location).filter(Boolean));

  return {
    initiatives: featuredInitiatives,
    events: upcomingEvents,
    testimonials: featuredTestimonials,
    partners: approvedPartners,
    initiativeCount: activeInitiatives.length,
    volunteers,
    raised,
    communities: Math.max(communities.size, 1),
  };
}

export default async function HomePage() {
  const { initiatives, events, testimonials, partners, initiativeCount, volunteers, raised, communities } = await getHomeData();

  return (
    <>
      <Hero />
      <StatsBand
        initiatives={initiativeCount}
        volunteers={volunteers}
        communities={communities}
        raised={raised}
      />
      <FeaturedInitiatives initiatives={initiatives} />
      {events.length > 0 && <UpcomingEvents events={events} />}
      {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}
      <PartnersStrip partners={partners} />
      <ClosingCta />
    </>
  );
}
