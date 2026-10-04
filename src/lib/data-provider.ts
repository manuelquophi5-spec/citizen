// ============================================================================
// THE CITIZEN PROJECT: RESILIENT DUAL-MODE DATA PROVIDER
// ============================================================================
// Supports live Supabase connectivity when configured and valid, while
// providing a fully functional, mutable, in-memory seed fixture layer during
// static builds (`npm run build`), offline testing, or demo mode.
// ============================================================================

import type {
  Database,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  InitiativeRow,
  InitiativeInsert,
  ReportRow,
  ReportInsert,
  ReportUpdate,
  DonationRow,
  DonationInsert,
  VolunteerHourRow,
  VolunteerHourInsert,
  PriorityVoteRow,
  PriorityVoteInsert,
  ReportStatus,
  VolunteerHourStatus,
  InitiativeStatus,
  DonationStatus,
} from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

// ----------------------------------------------------------------------------
// Live Credentials Detection
// ----------------------------------------------------------------------------
export function isLiveSupabaseAvailable(): boolean {
  if (process.env.NEXT_PUBLIC_INTEGRITY_MODE === "demo") {
    return false;
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  if (url.includes("demo-project") || url.includes("your-project") || anonKey.includes("demo_anon_key") || anonKey.includes("dummy")) {
    return false;
  }
  return true;
}

// ----------------------------------------------------------------------------
// Initial Seed Fixtures (Mirroring supabase/seed.sql)
// ----------------------------------------------------------------------------
const INITIAL_PROFILES: ProfileRow[] = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    email: "coordinator@thecitizenproject.org",
    full_name: "Selorm Dzreke",
    phone: "+233 24 100 0001",
    role: "admin",
    electoral_area: "Sogakope Central",
    skills: ["District Governance", "Project Monitoring", "Civic Coordination"],
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000002",
    email: "akua.volunteer@citizen.gh",
    full_name: "Akua Agbavitor",
    phone: "+233 24 100 0002",
    role: "volunteer",
    electoral_area: "Dabala Commercial",
    skills: ["Community Mobilization", "Health Screening", "Logistics", "Youth Engagement"],
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "d0000000-0000-0000-0000-000000000003",
    email: "kofi@citizen.gh",
    full_name: "Kofi Mensah",
    phone: "+233 24 100 0003",
    role: "citizen",
    electoral_area: "Tefle North",
    skills: ["Community Advocacy", "Public Infrastructure"],
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

const INITIAL_INITIATIVES: InitiativeRow[] = [
  {
    id: "i0000000-0000-0000-0000-000000000001",
    slug: "clean-communities-initiative",
    title: "Clean Communities Initiative",
    summary: "Community waste cleanup & drainage desilting across South Tongu.",
    description: "A district-wide initiative organizing bi-weekly clean-up exercises, desilting choked drains, and providing community waste receptacles in Sogakope, Dabala, and Tefle.",
    category: "ENVIRONMENT",
    target_amount: 45000.0,
    raised_amount: 32800.0,
    status: "ACTIVE",
    cover_image: "/images/initiatives/clean-water.jpg",
    location: "South Tongu District",
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "i0000000-0000-0000-0000-000000000002",
    slug: "global-citizenship-programme",
    title: "Global Citizenship & Civic Education",
    summary: "Empowering young leaders through civic education and rights awareness.",
    description: "Comprehensive civic literacy curriculum covering constitutional rights, community advocacy, and local governance engagement in 12 senior high and basic schools across South Tongu.",
    category: "CIVIC_EDUCATION",
    target_amount: 60000.0,
    raised_amount: 41200.0,
    status: "ACTIVE",
    cover_image: "/images/initiatives/civic-education.jpg",
    location: "Sogakope Senior High School",
    created_at: new Date(Date.now() - 35 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "i0000000-0000-0000-0000-000000000003",
    slug: "youth-skills-livelihood-initiative",
    title: "Youth Skills & Livelihoods Hub",
    summary: "Vocational training and modern digital skills for youth.",
    description: "Equipping 200 out-of-school and unemployed youth with vocational and digital skills including digital fabrication, mobile phone repair, and modern agro-processing.",
    category: "YOUTH_DEVELOPMENT",
    target_amount: 35000.0,
    raised_amount: 18500.0,
    status: "ACTIVE",
    cover_image: "/images/initiatives/youth-skills.jpg",
    location: "Dabala Innovation Centre",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_REPORTS: ReportRow[] = [
  {
    id: "r0000000-0000-0000-0000-000000000001",
    user_id: "d0000000-0000-0000-0000-000000000003",
    title: "Dabala Market Drainage Overflow",
    description: "During heavy rain, the concrete storm drain behind the fish market stalls fills up with debris and floods the access road.",
    category: "SANITATION",
    location: { community: "Dabala Market", town: "South Tongu", gps: "5.9921, 0.6841" },
    priority: "HIGH",
    status: "SUBMITTED",
    image_url: "/images/reports/drain-clog.jpg",
    reporter_name: "Kofi Mensah",
    reporter_phone: "+233 24 100 0003",
    reporter_email: "kofi@citizen.gh",
    admin_notes: null,
    official_feedback: "Report received by the District Desk. Awaiting assignment to environmental health inspector.",
    assigned_department: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "r0000000-0000-0000-0000-000000000002",
    user_id: "d0000000-0000-0000-0000-000000000003",
    title: "Sogakope Junction Broken Solar Streetlights",
    description: "Three consecutive solar street poles near the roundabout are dark at night, creating a hazardous crosswalk for pedestrians.",
    category: "ROADS",
    location: { community: "Sogakope Junction", town: "South Tongu", gps: "5.9984, 0.5982" },
    priority: "MEDIUM",
    status: "IN_REVIEW",
    image_url: "/images/reports/streetlight-out.jpg",
    reporter_name: "Kofi Mensah",
    reporter_phone: "+233 24 100 0003",
    reporter_email: "kofi@citizen.gh",
    admin_notes: "Desk review confirmed street light maintenance schedule with District Engineer.",
    official_feedback: "Issue assessed by District Works department. Technical inspection team slated for site visit.",
    assigned_department: "District Works & Engineering",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "r0000000-0000-0000-0000-000000000003",
    user_id: "d0000000-0000-0000-0000-000000000003",
    title: "Agorkpo CHPS Compound Borehole Pump Failure",
    description: "The mechanical handpump serving the maternal health clinic broke down, forcing staff to haul water from an untreated open source.",
    category: "WATER",
    location: { community: "Agorkpo CHPS", town: "South Tongu", gps: "6.0120, 0.6120" },
    priority: "HIGH",
    status: "DISPATCHED",
    image_url: "/images/reports/broken-pump.jpg",
    reporter_name: "Kofi Mensah",
    reporter_phone: "+233 24 100 0003",
    reporter_email: "kofi@citizen.gh",
    admin_notes: "Dispatched community water mechanic team with replacement seal cylinders and piping.",
    official_feedback: "Works crew dispatched under ticket #ST-WAT-402. Field technician arriving on site.",
    assigned_department: "Community Water & Sanitation Agency",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "r0000000-0000-0000-0000-000000000004",
    user_id: "d0000000-0000-0000-0000-000000000002",
    title: "Tefle Primary School Classroom Roofing Repairs",
    description: "Strong rain ripped off corrugated iron sheets on the JHS Block B roof, leaving two classrooms exposed to rain.",
    category: "EDUCATION",
    location: { community: "Tefle Central", town: "South Tongu", gps: "5.9870, 0.5890" },
    priority: "HIGH",
    status: "IN_PROGRESS",
    image_url: "/images/reports/roof-repair.jpg",
    reporter_name: "Akua Agbavitor",
    reporter_phone: "+233 24 100 0002",
    reporter_email: "akua.volunteer@citizen.gh",
    admin_notes: "Contractor mobilized on site with new treated timber and aluminum sheets.",
    official_feedback: "Active works underway. Rafters replaced, new sheets being installed this week.",
    assigned_department: "District Education Directorate",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "r0000000-0000-0000-0000-000000000005",
    user_id: "d0000000-0000-0000-0000-000000000003",
    title: "Sokpoe Public Water Standpipe Taphead Replacement",
    description: "Leaking brass taphead replaced with heavy-duty anti-vandalism faucet, eliminating water loss.",
    category: "WATER",
    location: { community: "Sokpoe Town", town: "South Tongu", gps: "5.9805, 0.5810" },
    priority: "LOW",
    status: "RESOLVED",
    image_url: "/images/reports/repaired-tap.jpg",
    reporter_name: "Kofi Mensah",
    reporter_phone: "+233 24 100 0003",
    reporter_email: "kofi@citizen.gh",
    admin_notes: "Verified by community elders and District Water Board.",
    official_feedback: "Works completed and verified. Standpipe fully operational with zero leakage.",
    assigned_department: "Community Water & Sanitation Agency",
    created_at: new Date(Date.now() - 21 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const INITIAL_VOLUNTEER_HOURS: VolunteerHourRow[] = [
  {
    id: "v0000000-0000-0000-0000-000000000001",
    volunteer_id: "d0000000-0000-0000-0000-000000000002",
    activity: "Sogakope Community Clean-Up & Drain Desilting",
    category: "Clean Communities",
    hours: 4.5,
    date: new Date(Date.now() - 14 * 86400000).toISOString().split("T")[0],
    supervisor: "Selorm Dzreke",
    status: "VERIFIED",
    field_notes: "Cleared 350m of storm drainage along Sogakope hospital road.",
    verified_by: "d0000000-0000-0000-0000-000000000001",
    verified_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "v0000000-0000-0000-0000-000000000002",
    volunteer_id: "d0000000-0000-0000-0000-000000000002",
    activity: "Civic Literacy Outreach at Dabala Basic School",
    category: "Civic Education",
    hours: 5.0,
    date: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    supervisor: "Selorm Dzreke",
    status: "VERIFIED",
    field_notes: "Facilitated voter and civic rights workshop for 75 students.",
    verified_by: "d0000000-0000-0000-0000-000000000001",
    verified_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "v0000000-0000-0000-0000-000000000003",
    volunteer_id: "d0000000-0000-0000-0000-000000000002",
    activity: "Health Outreach Data Collection in Agorkpo",
    category: "Health Outreach",
    hours: 4.5,
    date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0],
    supervisor: "Selorm Dzreke",
    status: "VERIFIED",
    field_notes: "Assisted community health nurses with patient intake registry.",
    verified_by: "d0000000-0000-0000-0000-000000000001",
    verified_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: "v0000000-0000-0000-0000-000000000004",
    volunteer_id: "d0000000-0000-0000-0000-000000000002",
    activity: "Youth Skills Registration Desk at Tefle Community Centre",
    category: "Youth Skills",
    hours: 4.0,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    supervisor: "Selorm Dzreke",
    status: "PENDING",
    field_notes: "Registered 42 participants for digital literacy cohort.",
    verified_by: null,
    verified_at: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_DONATIONS: DonationRow[] = [
  {
    id: "m0000000-0000-0000-0000-000000000001",
    user_id: "d0000000-0000-0000-0000-000000000003",
    amount: 250.0,
    currency: "GHS",
    frequency: "ONE_TIME",
    status: "SUCCESS",
    initiative_id: "i0000000-0000-0000-0000-000000000001",
    donor_name: "Kofi Mensah",
    donor_email: "kofi@citizen.gh",
    payment_method: "Mobile Money (MTN)",
    reference: "REF-TCP-DON-2026-001",
    anonymous: false,
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: "m0000000-0000-0000-0000-000000000002",
    user_id: "d0000000-0000-0000-0000-000000000003",
    amount: 100.0,
    currency: "GHS",
    frequency: "MONTHLY",
    status: "SUCCESS",
    initiative_id: "i0000000-0000-0000-0000-000000000002",
    donor_name: "Kofi Mensah",
    donor_email: "kofi@citizen.gh",
    payment_method: "Mobile Money (Telecel)",
    reference: "REF-TCP-DON-2026-002",
    anonymous: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "m0000000-0000-0000-0000-000000000003",
    user_id: null,
    amount: 500.0,
    currency: "GHS",
    frequency: "ONE_TIME",
    status: "SUCCESS",
    initiative_id: "i0000000-0000-0000-0000-000000000001",
    donor_name: "Anonymous Supporter",
    donor_email: "supporter@southtongu.org",
    payment_method: "Card (Visa)",
    reference: "REF-TCP-DON-2026-003",
    anonymous: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

const INITIAL_VOTES: PriorityVoteRow[] = [
  {
    id: "p0000000-0000-0000-0000-000000000001",
    user_id: "d0000000-0000-0000-0000-000000000003",
    project_name: "Agorkpo CHPS Compound Maternity Wing Expansion",
    category: "Healthcare",
    vote_date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "p0000000-0000-0000-0000-000000000002",
    user_id: "d0000000-0000-0000-0000-000000000002",
    project_name: "Sogakope Waterfront Storm Drain Desilting & Culvert Upgrade",
    category: "Sanitation",
    vote_date: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

// ----------------------------------------------------------------------------
// Persistent In-Memory Store (Resilient State)
// ----------------------------------------------------------------------------
class InMemoryDatabase {
  private profiles: ProfileRow[] = [...INITIAL_PROFILES];
  private initiatives: InitiativeRow[] = [...INITIAL_INITIATIVES];
  private reports: ReportRow[] = [...INITIAL_REPORTS];
  private volunteerHours: VolunteerHourRow[] = [...INITIAL_VOLUNTEER_HOURS];
  private donations: DonationRow[] = [...INITIAL_DONATIONS];
  private priorityVotes: PriorityVoteRow[] = [...INITIAL_VOTES];

  // Helper ID generator
  private nextId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // --- Profiles ---
  getProfileById(id: string): ProfileRow | null {
    return this.profiles.find((p) => p.id === id) || null;
  }

  getProfileByEmail(email: string): ProfileRow | null {
    return this.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  updateProfile(id: string, updates: ProfileUpdate): ProfileRow {
    const idx = this.profiles.findIndex((p) => p.id === id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        ...updates,
        updated_at: now,
      };
      return this.profiles[idx];
    }
    const newProfile: ProfileRow = {
      id,
      email: updates.email || `${id}@citizen.gh`,
      full_name: updates.full_name || "New Citizen",
      phone: updates.phone ?? null,
      role: updates.role || "citizen",
      electoral_area: updates.electoral_area || "Sogakope Central",
      skills: updates.skills || [],
      created_at: now,
      updated_at: now,
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  createProfile(profile: ProfileInsert): ProfileRow {
    const existing = this.profiles.find((p) => p.id === profile.id);
    if (existing) {
      return this.updateProfile(profile.id, profile);
    }
    const now = new Date().toISOString();
    const newProfile: ProfileRow = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || "New Citizen",
      phone: profile.phone ?? null,
      role: profile.role || "citizen",
      electoral_area: profile.electoral_area || "Sogakope Central",
      skills: profile.skills || [],
      created_at: profile.created_at || now,
      updated_at: profile.updated_at || now,
    };
    this.profiles.push(newProfile);
    return newProfile;
  }

  getAllProfiles(): ProfileRow[] {
    return [...this.profiles];
  }

  // --- Reports ---
  getReports(filter?: { status?: ReportStatus; category?: string; userId?: string }): ReportRow[] {
    return this.reports
      .filter((r) => {
        if (filter?.status && r.status !== filter.status) return false;
        if (filter?.category && r.category !== filter.category) return false;
        if (filter?.userId && r.user_id !== filter.userId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getReportById(id: string): ReportRow | null {
    return this.reports.find((r) => r.id === id) || null;
  }

  createReport(report: ReportInsert): ReportRow {
    const now = new Date().toISOString();
    const newReport: ReportRow = {
      id: report.id || this.nextId("rep"),
      user_id: report.user_id ?? null,
      title: report.title,
      description: report.description,
      category: report.category,
      location: report.location || { community: "Sogakope", town: "South Tongu" },
      priority: report.priority || "MEDIUM",
      status: report.status || "SUBMITTED",
      image_url: report.image_url ?? null,
      reporter_name: report.reporter_name ?? null,
      reporter_phone: report.reporter_phone ?? null,
      reporter_email: report.reporter_email ?? null,
      admin_notes: report.admin_notes ?? null,
      official_feedback: report.official_feedback ?? "Report received and logged in district records.",
      assigned_department: report.assigned_department ?? null,
      created_at: report.created_at || now,
      updated_at: report.updated_at || now,
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  updateReportStatus(
    id: string,
    status: ReportStatus,
    adminNotes?: string,
    officialFeedback?: string,
    assignedDepartment?: string
  ): ReportRow {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Report not found with id ${id}`);
    const now = new Date().toISOString();
    this.reports[idx] = {
      ...this.reports[idx],
      status,
      admin_notes: adminNotes !== undefined ? adminNotes : this.reports[idx].admin_notes,
      official_feedback: officialFeedback !== undefined ? officialFeedback : this.reports[idx].official_feedback,
      assigned_department: assignedDepartment !== undefined ? assignedDepartment : this.reports[idx].assigned_department,
      updated_at: now,
    };
    return this.reports[idx];
  }

  updateReport(id: string, updates: ReportUpdate): ReportRow {
    const idx = this.reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Report not found with id ${id}`);
    const now = new Date().toISOString();
    this.reports[idx] = {
      ...this.reports[idx],
      ...updates,
      updated_at: now,
    };
    return this.reports[idx];
  }

  deleteReport(id: string): boolean {
    const initialLen = this.reports.length;
    this.reports = this.reports.filter((r) => r.id !== id);
    return this.reports.length < initialLen;
  }

  // --- Initiatives ---
  getInitiatives(filter?: { status?: InitiativeStatus; category?: string }): InitiativeRow[] {
    return this.initiatives.filter((i) => {
      if (filter?.status && i.status !== filter.status) return false;
      if (filter?.category && i.category !== filter.category) return false;
      return true;
    });
  }

  getInitiativeBySlug(slug: string): InitiativeRow | null {
    return this.initiatives.find((i) => i.slug === slug) || null;
  }

  getInitiativeById(id: string): InitiativeRow | null {
    return this.initiatives.find((i) => i.id === id) || null;
  }

  updateInitiativeRaised(id: string, additionalAmount: number): InitiativeRow {
    const idx = this.initiatives.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error(`Initiative not found with id ${id}`);
    const now = new Date().toISOString();
    this.initiatives[idx] = {
      ...this.initiatives[idx],
      raised_amount: Math.round((this.initiatives[idx].raised_amount + additionalAmount) * 100) / 100,
      updated_at: now,
    };
    return this.initiatives[idx];
  }

  // --- Volunteer Hours ---
  getVolunteerHours(filter?: { volunteerId?: string; status?: VolunteerHourStatus }): VolunteerHourRow[] {
    return this.volunteerHours
      .filter((vh) => {
        if (filter?.volunteerId && vh.volunteer_id !== filter.volunteerId) return false;
        if (filter?.status && vh.status !== filter.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getVolunteerHourById(id: string): VolunteerHourRow | null {
    return this.volunteerHours.find((vh) => vh.id === id) || null;
  }

  logVolunteerHours(hours: VolunteerHourInsert): VolunteerHourRow {
    const now = new Date().toISOString();
    const newHour: VolunteerHourRow = {
      id: hours.id || this.nextId("vol"),
      volunteer_id: hours.volunteer_id,
      activity: hours.activity,
      category: hours.category || "Community Service",
      hours: Number(hours.hours),
      date: hours.date,
      supervisor: hours.supervisor,
      status: hours.status || "PENDING",
      field_notes: hours.field_notes ?? null,
      verified_by: hours.verified_by ?? null,
      verified_at: hours.verified_at ?? null,
      created_at: hours.created_at || now,
    };
    this.volunteerHours.unshift(newHour);
    return newHour;
  }

  updateVolunteerHourStatus(
    id: string,
    status: VolunteerHourStatus,
    verifiedBy?: string,
    fieldNotes?: string
  ): VolunteerHourRow {
    const idx = this.volunteerHours.findIndex((vh) => vh.id === id);
    if (idx === -1) throw new Error(`Volunteer hour record not found with id ${id}`);
    const now = new Date().toISOString();
    this.volunteerHours[idx] = {
      ...this.volunteerHours[idx],
      status,
      verified_by: verifiedBy ?? this.volunteerHours[idx].verified_by,
      verified_at: status === "VERIFIED" ? now : this.volunteerHours[idx].verified_at,
      field_notes: fieldNotes !== undefined ? fieldNotes : this.volunteerHours[idx].field_notes,
    };
    return this.volunteerHours[idx];
  }

  voidVolunteerHours(id: string, notes?: string): VolunteerHourRow {
    return this.updateVolunteerHourStatus(id, "VOIDED", undefined, notes);
  }

  getApprovedHoursTotal(volunteerId: string): number {
    return this.volunteerHours
      .filter((vh) => vh.volunteer_id === volunteerId && vh.status === "VERIFIED")
      .reduce((sum, vh) => sum + Number(vh.hours), 0);
  }

  // --- Donations ---
  getDonations(filter?: { userId?: string; initiativeId?: string }): DonationRow[] {
    return this.donations
      .filter((d) => {
        if (filter?.userId && d.user_id !== filter.userId) return false;
        if (filter?.initiativeId && d.initiative_id !== filter.initiativeId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createDonation(donation: DonationInsert): DonationRow {
    const now = new Date().toISOString();
    const newDonation: DonationRow = {
      id: donation.id || this.nextId("don"),
      user_id: donation.user_id ?? null,
      amount: Number(donation.amount),
      currency: donation.currency || "GHS",
      frequency: donation.frequency || "ONE_TIME",
      status: donation.status || "SUCCESS",
      initiative_id: donation.initiative_id ?? null,
      donor_name: donation.donor_name ?? null,
      donor_email: donation.donor_email,
      payment_method: donation.payment_method ?? "Mobile Money",
      reference: donation.reference || `REF-TCP-${Date.now()}`,
      anonymous: donation.anonymous ?? false,
      created_at: donation.created_at || now,
    };
    this.donations.unshift(newDonation);

    // If successful and tied to an initiative, auto-increment
    if (newDonation.status === "SUCCESS" && newDonation.initiative_id) {
      try {
        this.updateInitiativeRaised(newDonation.initiative_id, newDonation.amount);
      } catch {
        // initiative may not exist
      }
    }

    return newDonation;
  }

  updateDonationStatus(id: string, status: DonationStatus): DonationRow {
    const idx = this.donations.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error(`Donation not found with id ${id}`);
    const prevStatus = this.donations[idx].status;
    this.donations[idx] = {
      ...this.donations[idx],
      status,
    };
    if (status === "SUCCESS" && prevStatus !== "SUCCESS" && this.donations[idx].initiative_id) {
      try {
        this.updateInitiativeRaised(this.donations[idx].initiative_id!, this.donations[idx].amount);
      } catch {
        // ignore
      }
    }
    return this.donations[idx];
  }

  // --- Priority Votes ---
  getPriorityVotes(userId?: string): PriorityVoteRow[] {
    if (userId) {
      return this.priorityVotes.filter((pv) => pv.user_id === userId);
    }
    return [...this.priorityVotes];
  }

  castPriorityVote(vote: PriorityVoteInsert): PriorityVoteRow {
    const now = new Date().toISOString();
    // Enforce 1 vote per project per user
    const existingIdx = this.priorityVotes.findIndex(
      (pv) => pv.user_id === vote.user_id && pv.project_name === vote.project_name
    );
    if (existingIdx >= 0) {
      this.priorityVotes[existingIdx].vote_date = now;
      return this.priorityVotes[existingIdx];
    }
    const newVote: PriorityVoteRow = {
      id: vote.id || this.nextId("vote"),
      user_id: vote.user_id,
      project_name: vote.project_name,
      category: vote.category,
      vote_date: vote.vote_date || now,
    };
    this.priorityVotes.push(newVote);
    return newVote;
  }

  getPriorityVoteCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const v of this.priorityVotes) {
      counts[v.project_name] = (counts[v.project_name] || 0) + 1;
    }
    return counts;
  }

  deletePriorityVote(id: string): boolean {
    const initialLen = this.priorityVotes.length;
    this.priorityVotes = this.priorityVotes.filter((pv) => pv.id !== id);
    return this.priorityVotes.length < initialLen;
  }
}

// Global In-Memory Singleton across hot-reloads
const globalStoreKey = Symbol.for("the_citizen_project.in_memory_db");
type GlobalWithDb = typeof globalThis & { [globalStoreKey]?: InMemoryDatabase };

function getMemoryDb(): InMemoryDatabase {
  const g = globalThis as GlobalWithDb;
  if (!g[globalStoreKey]) {
    g[globalStoreKey] = new InMemoryDatabase();
  }
  return g[globalStoreKey]!;
}

// ----------------------------------------------------------------------------
// Unified Dual-Mode Data Provider Implementation
// ----------------------------------------------------------------------------
export const DataProvider = {
  // Profiles
  async getProfileById(id: string): Promise<ProfileRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
        if (!error && data) return data as ProfileRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getProfileById(id);
  },

  async getProfileByEmail(email: string): Promise<ProfileRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("profiles").select("*").eq("email", email).maybeSingle();
        if (!error && data) return data as ProfileRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getProfileByEmail(email);
  },

  async updateProfile(id: string, updates: ProfileUpdate): Promise<ProfileRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data as ProfileRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateProfile(id, updates);
  },

  async createProfile(profile: ProfileInsert): Promise<ProfileRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("profiles")
          .insert(profile)
          .select()
          .single();
        if (!error && data) return data as ProfileRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().createProfile(profile);
  },

  async getAllProfiles(): Promise<ProfileRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (!error && data) return data as ProfileRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getAllProfiles();
  },

  // Reports
  async getReports(filter?: { status?: ReportStatus; category?: string; userId?: string }): Promise<ReportRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from("reports").select("*");
        if (filter?.status) query = query.eq("status", filter.status);
        if (filter?.category) query = query.eq("category", filter.category);
        if (filter?.userId) query = query.eq("user_id", filter.userId);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data) return data as ReportRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getReports(filter);
  },

  async getReportById(id: string): Promise<ReportRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("reports").select("*").eq("id", id).maybeSingle();
        if (!error && data) return data as ReportRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getReportById(id);
  },

  async createReport(report: ReportInsert): Promise<ReportRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("reports").insert(report).select().single();
        if (!error && data) return data as ReportRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().createReport(report);
  },

  async updateReportStatus(
    id: string,
    status: ReportStatus,
    adminNotes?: string,
    officialFeedback?: string,
    assignedDepartment?: string
  ): Promise<ReportRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const payload: Record<string, unknown> = { status };
        if (adminNotes !== undefined) payload.admin_notes = adminNotes;
        if (officialFeedback !== undefined) payload.official_feedback = officialFeedback;
        if (assignedDepartment !== undefined) payload.assigned_department = assignedDepartment;
        const { data, error } = await supabase.from("reports").update(payload).eq("id", id).select().single();
        if (!error && data) return data as ReportRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateReportStatus(id, status, adminNotes, officialFeedback, assignedDepartment);
  },

  async updateReport(id: string, updates: ReportUpdate): Promise<ReportRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("reports").update(updates).eq("id", id).select().single();
        if (!error && data) return data as ReportRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateReport(id, updates);
  },

  async deleteReport(id: string): Promise<boolean> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("reports").delete().eq("id", id);
        if (!error) return true;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().deleteReport(id);
  },

  // Initiatives
  async getInitiatives(filter?: { status?: InitiativeStatus; category?: string }): Promise<InitiativeRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from("initiatives").select("*");
        if (filter?.status) query = query.eq("status", filter.status);
        if (filter?.category) query = query.eq("category", filter.category);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data) return data as InitiativeRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getInitiatives(filter);
  },

  async getInitiativeBySlug(slug: string): Promise<InitiativeRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("initiatives").select("*").eq("slug", slug).maybeSingle();
        if (!error && data) return data as InitiativeRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getInitiativeBySlug(slug);
  },

  async getInitiativeById(id: string): Promise<InitiativeRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("initiatives").select("*").eq("id", id).maybeSingle();
        if (!error && data) return data as InitiativeRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getInitiativeById(id);
  },

  async updateInitiativeRaised(id: string, additionalAmount: number): Promise<InitiativeRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const current = await this.getInitiativeById(id);
        if (current) {
          const supabase = createAdminClient();
          const { data, error } = await supabase
            .from("initiatives")
            .update({ raised_amount: current.raised_amount + additionalAmount })
            .eq("id", id)
            .select()
            .single();
          if (!error && data) return data as InitiativeRow;
        }
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateInitiativeRaised(id, additionalAmount);
  },

  // Volunteer Hours
  async getVolunteerHours(filter?: { volunteerId?: string; status?: VolunteerHourStatus }): Promise<VolunteerHourRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from("volunteer_hours").select("*");
        if (filter?.volunteerId) query = query.eq("volunteer_id", filter.volunteerId);
        if (filter?.status) query = query.eq("status", filter.status);
        const { data, error } = await query.order("date", { ascending: false });
        if (!error && data) return data as VolunteerHourRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getVolunteerHours(filter);
  },

  async getVolunteerHourById(id: string): Promise<VolunteerHourRow | null> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("volunteer_hours").select("*").eq("id", id).maybeSingle();
        if (!error && data) return data as VolunteerHourRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getVolunteerHourById(id);
  },

  async logVolunteerHours(hours: VolunteerHourInsert): Promise<VolunteerHourRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("volunteer_hours").insert(hours).select().single();
        if (!error && data) return data as VolunteerHourRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().logVolunteerHours(hours);
  },

  async updateVolunteerHourStatus(
    id: string,
    status: VolunteerHourStatus,
    verifiedBy?: string,
    fieldNotes?: string
  ): Promise<VolunteerHourRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const payload: Record<string, unknown> = { status };
        if (verifiedBy) {
          payload.verified_by = verifiedBy;
          payload.verified_at = new Date().toISOString();
        }
        if (fieldNotes !== undefined) payload.field_notes = fieldNotes;
        const { data, error } = await supabase.from("volunteer_hours").update(payload).eq("id", id).select().single();
        if (!error && data) return data as VolunteerHourRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateVolunteerHourStatus(id, status, verifiedBy, fieldNotes);
  },

  async voidVolunteerHours(id: string, notes?: string): Promise<VolunteerHourRow> {
    return this.updateVolunteerHourStatus(id, "VOIDED", undefined, notes);
  },

  async getApprovedHoursTotal(volunteerId: string): Promise<number> {
    if (isLiveSupabaseAvailable()) {
      try {
        const list = await this.getVolunteerHours({ volunteerId, status: "VERIFIED" });
        return list.reduce((sum, item) => sum + Number(item.hours), 0);
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getApprovedHoursTotal(volunteerId);
  },

  // Donations
  async getDonations(filter?: { userId?: string; initiativeId?: string }): Promise<DonationRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from("donations").select("*");
        if (filter?.userId) query = query.eq("user_id", filter.userId);
        if (filter?.initiativeId) query = query.eq("initiative_id", filter.initiativeId);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (!error && data) return data as DonationRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getDonations(filter);
  },

  async createDonation(donation: DonationInsert): Promise<DonationRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("donations").insert(donation).select().single();
        if (!error && data) return data as DonationRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().createDonation(donation);
  },

  async updateDonationStatus(id: string, status: DonationStatus): Promise<DonationRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from("donations").update({ status }).eq("id", id).select().single();
        if (!error && data) return data as DonationRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().updateDonationStatus(id, status);
  },

  // Priority Votes
  async getPriorityVotes(userId?: string): Promise<PriorityVoteRow[]> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        let query = supabase.from("priority_votes").select("*");
        if (userId) query = query.eq("user_id", userId);
        const { data, error } = await query.order("vote_date", { ascending: false });
        if (!error && data) return data as PriorityVoteRow[];
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().getPriorityVotes(userId);
  },

  async castPriorityVote(vote: PriorityVoteInsert): Promise<PriorityVoteRow> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("priority_votes")
          .upsert(vote, { onConflict: "user_id, project_name" })
          .select()
          .single();
        if (!error && data) return data as PriorityVoteRow;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().castPriorityVote(vote);
  },

  async getPriorityVoteCounts(): Promise<Record<string, number>> {
    const votes = await this.getPriorityVotes();
    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.project_name] = (counts[v.project_name] || 0) + 1;
    }
    return counts;
  },

  async deletePriorityVote(id: string): Promise<boolean> {
    if (isLiveSupabaseAvailable()) {
      try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("priority_votes").delete().eq("id", id);
        if (!error) return true;
      } catch {
        // Fall back to memory DB
      }
    }
    return getMemoryDb().deletePriorityVote(id);
  },
};
