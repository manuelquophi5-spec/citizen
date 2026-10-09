// Static content for the site. This project no longer has a database or API —
// every page reads from these fixtures instead of querying Prisma. Edit this
// file directly to change what appears on Initiatives, Events, Blog, Donate,
// Transparency, and the other data-driven pages.

export type InitiativeStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";
export type DonationMethod = "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER" | "PAYPAL";
export type DonationStatus = "PENDING" | "SUCCESS" | "FAILED";
export type PartnerStatus = "PENDING" | "APPROVED" | "REJECTED";
export type SurveyStatus = "SUBMITTED" | "IN_REVIEW" | "IN_PROGRESS" | "RESOLVED";
export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH";
export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ExpenditureCategory = "PROGRAMS" | "ADMINISTRATION" | "FUNDRAISING" | "OTHER";

export type MilestoneStatus = "complete" | "current" | "upcoming";

export interface Milestone {
  label: string;
  description: string;
  date: Date;
  status: MilestoneStatus;
}

export interface Initiative {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string | null;
  category: string;
  objectives: string[];
  sdgTags: string[];
  status: InitiativeStatus;
  budget: number;
  amountRaised: number;
  location: string | null;
  beneficiaries: string | null;
  volunteersInvolved: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  milestones: Milestone[];
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  initiativeId: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: Date;
  coverImage?: string;
}

export interface Donation {
  id: string;
  donorName: string | null;
  donorEmail: string;
  amount: number;
  method: DonationMethod;
  status: DonationStatus;
  reference: string;
  anonymous: boolean;
  corporate: boolean;
  initiativeId: string | null;
  createdAt: Date;
}

export interface Expenditure {
  id: string;
  category: ExpenditureCategory;
  description: string;
  amount: number;
  date: Date;
  initiativeId: string | null;
}

export interface Partner {
  id: string;
  name: string;
  organisation: string | null;
  position: string | null;
  email: string;
  category: string;
  purpose: string;
  status: PartnerStatus;
  createdAt: Date;
}

export interface SurveyReport {
  id: string;
  reporterName: string | null;
  phone: string | null;
  occupation: string | null;
  email: string | null;
  community: string;
  town: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  title: string;
  description: string;
  suggestedSolution: string | null;
  priority: PriorityLevel;
  urgency: UrgencyLevel;
  status: SurveyStatus;
  anonymous: boolean;
  createdAt: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  featured: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string | null;
  initiativeId: string;
}

export interface Interview {
  kind: "video" | "audio";
  durationLabel: string;
  transcriptExcerpt: string;
}

export interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  beneficiaryName: string | null;
  story: string;
  impactMetric: string | null;
  initiativeId: string | null;
  interview: Interview | null;
}

export interface Report {
  id: string;
  title: string;
  type: string;
  year: number;
  fileUrl: string | null;
  summary: string | null;
  publishedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  hours: number;
}

export const initiatives: Initiative[] = [
  {
    id: "global-citizenship-civic-education-programme",
    slug: "global-citizenship-civic-education-programme",
    title: "Global Citizenship & Civic Education Programme",
    summary:
      "A five-part programme helping basic school learners understand global citizenship, personal responsibility, and the social issues shaping their communities.",
    description:
      "Delivered in partnership with the National Commission for Civic Education, this programme takes JHS and upper primary learners through a structured journey — from a launch seminar on global citizenship, through honest conversations about adolescence and social vices, into hands-on community responsibility projects, a national day of service, and a closing pledge ceremony. It is designed around UN SDG 4 (Targets 4.6 and 4.7) and complements NCCE's civic education mandate with a youth-first, participatory approach.",
    coverImage: null,
    category: "Education & Civic Responsibility",
    objectives: [
      "Build learners' understanding of global citizenship and civic duty",
      "Equip young people to recognise and resist social vices",
      "Translate civic knowledge into visible community action",
    ],
    sdgTags: ["SDG 4"],
    status: "ACTIVE",
    budget: 45000,
    amountRaised: 12900,
    location: "South Tongu District, Volta Region",
    beneficiaries: "Basic school learners, ages 9–15",
    volunteersInvolved: 18,
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-03-01"),
    createdAt: new Date("2026-07-01T10:00:00Z"),
    milestones: [
      { label: "Launch & Global Citizenship Seminar", description: "Public launch of the programme and an introductory seminar on global citizenship.", date: new Date("2026-09-12"), status: "complete" },
      { label: "Know Yourself, Know Your Path", description: "Facilitated dialogue on adolescence and social vices with health partners.", date: new Date("2026-10-17"), status: "current" },
      { label: "Our Community, Our Responsibility", description: "Play-based learning event on civic responsibility through drama and games.", date: new Date("2026-11-21"), status: "upcoming" },
      { label: "National Service Day", description: "A day of hands-on community service across participating communities.", date: new Date("2027-01-23"), status: "upcoming" },
      { label: "Citizens' Pledge & Showcase", description: "Closing symposium — learners present projects and take the Citizens' Pledge.", date: new Date("2027-02-27"), status: "upcoming" },
    ],
  },
  {
    id: "clean-communities-initiative",
    slug: "clean-communities-initiative",
    title: "Clean Communities Initiative",
    summary: "Volunteer-led clean-up and waste management education across riverside communities.",
    description:
      "South Tongu's communities live alongside the Volta estuary — a source of livelihood that also needs protecting. This initiative organises community clean-up days, basic waste segregation training, and youth-led environmental clubs in partnership with local assemblies.",
    coverImage: null,
    category: "Environmental Sustainability",
    objectives: [
      "Reduce plastic waste along the riverbanks",
      "Train youth environmental ambassadors in each community",
      "Partner with local assemblies on waste collection points",
    ],
    sdgTags: ["SDG 11", "SDG 13", "SDG 14"],
    status: "ACTIVE",
    budget: 20000,
    amountRaised: 6400,
    location: "Riverside communities, South Tongu",
    beneficiaries: "Riverside households and youth groups",
    volunteersInvolved: 32,
    startDate: new Date("2026-06-01"),
    endDate: null,
    createdAt: new Date("2026-07-01T10:00:01Z"),
    milestones: [
      { label: "Community clean-up launch", description: "First riverbank clean-up days across founding communities.", date: new Date("2026-06-01"), status: "complete" },
      { label: "Waste segregation training rollout", description: "Basic waste segregation training delivered community by community.", date: new Date("2026-07-15"), status: "complete" },
      { label: "Youth ambassador recruitment", description: "Youth environmental ambassadors recruited in each participating community.", date: new Date("2026-09-05"), status: "complete" },
      { label: "Assembly waste-point partnership", description: "Formal waste collection points agreed with local assemblies.", date: new Date("2026-10-15"), status: "current" },
      { label: "Riverbank restoration expansion", description: "Extend clean-up and restoration to two further riverside communities.", date: new Date("2027-01-01"), status: "upcoming" },
    ],
  },
  {
    id: "youth-skills-livelihood-initiative",
    slug: "youth-skills-livelihood-initiative",
    title: "Youth Skills & Livelihood Initiative",
    summary: "Practical vocational taster sessions and mentorship for out-of-school youth.",
    description:
      "For young people who have left school early, this initiative connects them with short vocational taster sessions, savings-group mentorship, and links to Ghana Enterprise Agency support — building a bridge back into productive, dignified work.",
    coverImage: null,
    category: "Youth Empowerment",
    objectives: [
      "Provide vocational taster sessions in trades with local demand",
      "Pair each participant with a community mentor",
      "Track participants into further training or employment",
    ],
    sdgTags: ["SDG 4", "SDG 8"],
    status: "UPCOMING",
    budget: 30000,
    amountRaised: 3000,
    location: "South Tongu District",
    beneficiaries: "Out-of-school youth, ages 16–24",
    volunteersInvolved: 9,
    startDate: new Date("2026-11-01"),
    endDate: null,
    createdAt: new Date("2026-07-01T10:00:02Z"),
    milestones: [
      { label: "Programme design & partner sign-off", description: "Finalise the trade taster curriculum with Ghana Enterprise Agency and local employers.", date: new Date("2026-10-01"), status: "upcoming" },
      { label: "Vocational taster sessions begin", description: "First round of short taster sessions across in-demand local trades.", date: new Date("2026-11-01"), status: "upcoming" },
      { label: "Mentor pairing", description: "Each participant paired with a community mentor and savings group.", date: new Date("2026-12-01"), status: "upcoming" },
      { label: "First placements tracked", description: "Track participants into further training or employment.", date: new Date("2027-02-01"), status: "upcoming" },
    ],
  },
];

export const events: Event[] = [
  {
    id: "launch-and-global-citizenship-seminar",
    slug: "launch-and-global-citizenship-seminar",
    title: "Launch & Global Citizenship Seminar",
    summary: "The public launch of The Citizen Project, followed by an interactive seminar on global citizenship.",
    description:
      "Community leaders, learners, and partner institutions gather to launch the programme, with a seminar introducing global citizenship concepts and how they connect to everyday life in South Tongu.",
    location: "South Tongu District",
    startDate: new Date("2026-09-12T09:00:00Z"),
    endDate: null,
    initiativeId: "global-citizenship-civic-education-programme",
  },
  {
    id: "know-yourself-know-your-path",
    slug: "know-yourself-know-your-path",
    title: "Know Yourself, Know Your Path",
    summary: "An interactive dialogue on adolescence and social vices, led by facilitators and health partners.",
    description:
      "A candid, age-appropriate dialogue exploring the pressures of adolescence — peer pressure, examination malpractice, and other social vices — and how learners can chart a confident, healthy path forward.",
    location: "South Tongu District",
    startDate: new Date("2026-10-17T09:00:00Z"),
    endDate: null,
    initiativeId: "global-citizenship-civic-education-programme",
  },
  {
    id: "our-community-our-responsibility",
    slug: "our-community-our-responsibility",
    title: "Our Community, Our Responsibility",
    summary: "A play-based learning event exploring community responsibility through drama and games.",
    description:
      "Learners take part in role-play and structured games designed to make civic responsibility tangible — practising the everyday choices that keep a community healthy, safe, and fair.",
    location: "South Tongu District",
    startDate: new Date("2026-11-21T09:00:00Z"),
    endDate: null,
    initiativeId: "global-citizenship-civic-education-programme",
  },
  {
    id: "national-service-day",
    slug: "national-service-day",
    title: "National Service Day",
    summary: "A day of hands-on volunteering and patriotism-building activities across participating communities.",
    description:
      "Learners and volunteers spend the day on visible community service projects — from clean-ups to helping elders — anchored in volunteerism and national pride.",
    location: "South Tongu District",
    startDate: new Date("2027-01-23T08:00:00Z"),
    endDate: null,
    initiativeId: "global-citizenship-civic-education-programme",
  },
  {
    id: "citizens-pledge-and-showcase",
    slug: "citizens-pledge-and-showcase",
    title: "Citizens' Pledge & Showcase",
    summary: "The closing symposium, where learners take the Citizens' Pledge and showcase what they've built.",
    description:
      "The programme concludes with learners presenting projects from across the five events and publicly reciting the Citizens' Pledge — a personal commitment to civic responsibility.",
    location: "South Tongu District",
    startDate: new Date("2027-02-27T09:00:00Z"),
    endDate: null,
    initiativeId: "global-citizenship-civic-education-programme",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "JHS Form 2 learner",
    role: "Programme participant",
    content:
      "I used to think civic education was just a subject to pass. Now I actually point out when something in my community needs fixing — and I know who to tell.",
    featured: true,
  },
  {
    id: "t2",
    name: "Community volunteer",
    role: "Clean Communities Initiative",
    content:
      "Seeing the riverbank clear after our clean-up day, with the kids who did the work standing right there proud of it — that's the whole point of this project.",
    featured: true,
  },
  {
    id: "t3",
    name: "School headteacher",
    role: "Partner institution",
    content:
      "The five-event structure gave our students a full arc, not a one-off talk. They still bring up 'Know Yourself, Know Your Path' months later.",
    featured: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "why-civic-education-matters-for-ghanas-youth",
    slug: "why-civic-education-matters-for-ghanas-youth",
    title: "Why Civic Education Matters for Ghana's Youth",
    excerpt: "Civic knowledge means little without the chance to practise it. Here's how we're closing that gap in South Tongu.",
    content:
      "Civic education has long lived inside a classroom subject. But knowing what a good citizen looks like is different from being one. This post walks through why The Citizen Project pairs every civic lesson with a real community action — and what we're seeing change as a result.",
    category: "Civic Education",
    tags: ["SDG4", "civic-education"],
    published: true,
    publishedAt: new Date("2026-07-10"),
  },
  {
    id: "five-ways-to-get-involved-this-season",
    slug: "five-ways-to-get-involved-this-season",
    title: "Five Ways to Get Involved This Season",
    excerpt: "From a single afternoon to an ongoing role — here's where your time or support goes furthest right now.",
    content:
      "Not everyone can commit to a weekly volunteer shift, and that's fine. This post breaks down five concrete ways to support The Citizen Project this season, matched to how much time you actually have.",
    category: "Volunteering",
    tags: ["volunteering", "get-involved"],
    published: true,
    publishedAt: new Date("2026-07-20"),
  },
  {
    id: "inside-our-community-survey-early-findings",
    slug: "inside-our-community-survey-early-findings",
    title: "Inside Our Community Survey: Early Findings",
    excerpt: "The first reports are in. Here's what South Tongu residents are telling us — and what happens next.",
    content:
      "Our community reporting tool has been live for a few weeks, and the early pattern of submissions is already shaping where we focus. This post shares what residents are raising, without naming individual reporters, and how each report moves from submission to follow-up.",
    category: "Transparency",
    tags: ["community-survey", "transparency"],
    published: true,
    publishedAt: new Date("2026-08-01"),
  },
];

export const partners: Partner[] = [
  {
    id: "p1",
    name: "Ama Serwaa",
    organisation: "Ghana Health Service — South Tongu",
    position: "District Health Promotion Officer",
    email: "partnerships@example.org",
    category: "GOVERNMENT_AGENCY",
    purpose: "Co-facilitate the adolescent health dialogue sessions.",
    status: "APPROVED",
    createdAt: new Date("2026-06-01"),
  },
  {
    id: "p2",
    name: "Kofi Mensah",
    organisation: "Volta Traders Union",
    position: "Chairman",
    email: "kofi@example.org",
    category: "COMMUNITY_GROUP",
    purpose: "Sponsor learning materials for the civic education programme.",
    status: "APPROVED",
    createdAt: new Date("2026-06-05"),
  },
  {
    id: "p3",
    name: "Efua Asante",
    organisation: "Riverside Basic School",
    position: "Headteacher",
    email: "efua@example.org",
    category: "SCHOOL",
    purpose: "Host programme events and provide facilitation space.",
    status: "PENDING",
    createdAt: new Date("2026-06-10"),
  },
];

export const donations: Donation[] = [
  { id: "d1", donorName: "Anonymous", donorEmail: "a1@example.org", amount: 500, method: "MOBILE_MONEY", status: "SUCCESS", reference: "SEED-D1", anonymous: true, corporate: false, initiativeId: "global-citizenship-civic-education-programme", createdAt: new Date("2026-07-15") },
  { id: "d2", donorName: "Efo Attipoe", donorEmail: "a2@example.org", amount: 1200, method: "CARD", status: "SUCCESS", reference: "SEED-D2", anonymous: false, corporate: false, initiativeId: "clean-communities-initiative", createdAt: new Date("2026-07-18") },
  { id: "d3", donorName: "Diaspora Friends of South Tongu", donorEmail: "a3@example.org", amount: 3000, method: "PAYPAL", status: "SUCCESS", reference: "SEED-D3", anonymous: false, corporate: true, initiativeId: "youth-skills-livelihood-initiative", createdAt: new Date("2026-07-22") },
  { id: "d4", donorName: "Anonymous", donorEmail: "a4@example.org", amount: 250, method: "MOBILE_MONEY", status: "SUCCESS", reference: "SEED-D4", anonymous: true, corporate: false, initiativeId: null, createdAt: new Date("2026-07-25") },
  { id: "d5", donorName: "Ama Donkor", donorEmail: "ama.donor@example.org", amount: 400, method: "MOBILE_MONEY", status: "SUCCESS", reference: "SEED-D5", anonymous: false, corporate: false, initiativeId: "global-citizenship-civic-education-programme", createdAt: new Date("2026-08-01") },
];

export const expenditures: Expenditure[] = [
  { id: "e1", category: "PROGRAMS", description: "Facilitation & event materials", amount: 8200, date: new Date("2026-06-15"), initiativeId: "global-citizenship-civic-education-programme" },
  { id: "e2", category: "PROGRAMS", description: "Clean-up equipment & transport", amount: 3100, date: new Date("2026-06-20"), initiativeId: "clean-communities-initiative" },
  { id: "e3", category: "ADMINISTRATION", description: "Coordination & communications", amount: 1400, date: new Date("2026-07-01"), initiativeId: null },
  { id: "e4", category: "FUNDRAISING", description: "Donor outreach materials", amount: 600, date: new Date("2026-07-05"), initiativeId: null },
];

export const surveyReports: SurveyReport[] = [
  {
    id: "s1",
    reporterName: null,
    phone: null,
    occupation: null,
    email: null,
    community: "Agorkpo",
    town: "Agorkpo",
    latitude: null,
    longitude: null,
    category: "INFRASTRUCTURE",
    title: "Broken bridge",
    description: "The community bridge is broken, cutting off safe access for residents and schoolchildren during the rainy season.",
    suggestedSolution: "Temporary footbridge while a permanent repair is scoped and funded.",
    priority: "HIGH",
    urgency: "HIGH",
    status: "SUBMITTED",
    anonymous: true,
    createdAt: new Date("2026-08-05"),
  },
  {
    id: "s2",
    reporterName: null,
    phone: null,
    occupation: null,
    email: null,
    community: "Dabala",
    town: "Dabala",
    latitude: null,
    longitude: null,
    category: "SANITATION",
    title: "Poor sanitation",
    description: "Waste is accumulating faster than it can be cleared, creating health risks near the market area.",
    suggestedSolution: "More frequent collection and an additional skip near the market.",
    priority: "HIGH",
    urgency: "HIGH",
    status: "IN_REVIEW",
    anonymous: true,
    createdAt: new Date("2026-08-10"),
  },
  {
    id: "s3",
    reporterName: null,
    phone: null,
    occupation: null,
    email: null,
    community: "Sogakope",
    town: "Sogakope",
    latitude: null,
    longitude: null,
    category: "EDUCATION",
    title: "School furniture shortage",
    description: "Several classrooms have far more learners than desks, forcing some children to sit on the floor.",
    suggestedSolution: null,
    priority: "MEDIUM",
    urgency: "MEDIUM",
    status: "SUBMITTED",
    anonymous: true,
    createdAt: new Date("2026-08-12"),
  },
];

// Seed data never populated any gallery photos (they were meant to come from
// Cloudinary). Left empty here for the same reason — the page already has a
// friendly empty state.
export const galleryImages: GalleryImage[] = [];

export const successStories: SuccessStory[] = [
  {
    id: "from-classroom-to-community-action",
    slug: "from-classroom-to-community-action",
    title: "From classroom lesson to community action",
    beneficiaryName: "A JHS 2 learner, Sogakope",
    story: "After the 'Our Community, Our Responsibility' event, a small group of learners organised their own weekend litter-picking round — unprompted. It's now a monthly fixture.",
    impactMetric: "30+ learners now volunteering monthly",
    initiativeId: "global-citizenship-civic-education-programme",
    interview: {
      kind: "video",
      durationLabel: "3:42",
      transcriptExcerpt: "We didn't wait to be told. We just picked a Saturday and started. Now other classes ask when it's their turn.",
    },
  },
  {
    id: "clearer-water-safer-fishing",
    slug: "clearer-water-safer-fishing",
    title: "Clearer water, safer fishing",
    beneficiaryName: "Fishing households, riverside communities",
    story: "Three clean-up days later, households along the clean-up stretch report fewer snagged nets and a noticeably clearer bank at low tide.",
    impactMetric: "3 clean-up days, 1.2km of riverbank cleared",
    initiativeId: "clean-communities-initiative",
    interview: null,
  },
];

export const reports: Report[] = [
  { id: "r1", title: "The Citizen Project — Year One Impact Report", type: "IMPACT", year: 2026, fileUrl: null, summary: "Our first full programme cycle: reach, spend, and what changed on the ground.", publishedAt: new Date("2026-08-15") },
  { id: "r2", title: "Financial Statement — H1 2026", type: "FINANCIAL", year: 2026, fileUrl: null, summary: "Income and expenditure for the first half of the year, matching the live Transparency dashboard.", publishedAt: new Date("2026-08-20") },
];

// Volunteer-hours leaderboard for the Ambassadors page — pre-sorted, highest first.
export const ambassadorLeaderboard: LeaderboardEntry[] = [
  { id: "u-kwame", name: "Kwame Asare", hours: 42 },
  { id: "u-esi", name: "Esi Mensah", hours: 18 },
  { id: "u-ama", name: "Ama Donkor", hours: 6 },
];

export function getInitiativeBySlug(slug: string): Initiative | undefined {
  return initiatives.find((i) => i.slug === slug);
}

export function getEventsForInitiative(initiativeId: string): Event[] {
  return events
    .filter((e) => e.initiativeId === initiativeId)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getCurrentMilestone(initiative: Initiative): { milestone: Milestone; index: number } | null {
  const index = initiative.milestones.findIndex((m) => m.status === "current");
  if (index === -1) return null;
  return { milestone: initiative.milestones[index], index };
}

export function getProgressLabel(initiative: Initiative): string | null {
  const total = initiative.milestones.length;
  if (total === 0) return null;
  const current = getCurrentMilestone(initiative);
  if (current) return `Phase ${current.index + 1} of ${total} — ${current.milestone.label}`;
  if (initiative.milestones.every((m) => m.status === "complete")) return "All milestones complete";
  return `Starting soon — ${initiative.milestones[0].label}`;
}
