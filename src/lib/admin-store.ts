"use client";

import {
  initiatives as seedInitiatives,
  events as seedEvents,
  blogPosts as seedBlogPosts,
  partners as seedPartners,
  type Initiative,
  type Event,
  type BlogPost,
  type Partner,
  type Donation,
  type Expenditure,
} from "./mock-data";

// ---------------------------------------------------------------------------
// 1. Types & Interfaces
// ---------------------------------------------------------------------------

export type ApplicationType = "VOLUNTEER" | "PARTNER" | "AMBASSADOR";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApplicantEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: ApplicationType;
  organisation?: string;
  skillsOrFocus: string;
  community: string;
  statement: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: "ISSUE" | "VOLUNTEER" | "APPLICATION" | "INITIATIVE" | "EVENT" | "FINANCE" | "SETTINGS" | "SYSTEM";
  entityId: string;
  details: string;
}

export interface DistrictSettings {
  districtName: string;
  assemblyLiaisonName: string;
  assemblyContactPhone: string;
  emergencyWhatsApp: string;
  officeLocation: string;
  paystackPublicKey: string;
  paystackLiveMode: boolean;
  publicAlertBanner: string;
  alertBannerActive: boolean;
  momoMerchantNumber: string;
}

export interface SubscriberEntry {
  id: string;
  email: string;
  subscribedAt: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
  source: string;
}

// ---------------------------------------------------------------------------
// 2. Storage Keys
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  APPLICATIONS: "tcp_admin_applications_v1",
  INITIATIVES: "tcp_admin_initiatives_v1",
  EVENTS: "tcp_admin_events_v1",
  BLOG: "tcp_admin_blog_v1",
  MANUAL_DONATIONS: "tcp_admin_manual_donations_v1",
  EXPENDITURES: "tcp_admin_expenditures_v1",
  AUDIT_LOG: "tcp_admin_audit_log_v1",
  SETTINGS: "tcp_admin_settings_v1",
  SUBSCRIBERS: "tcp_admin_subscribers_v1",
};

// ---------------------------------------------------------------------------
// 3. Default Seed Data
// ---------------------------------------------------------------------------

const INITIAL_APPLICATIONS: ApplicantEntry[] = [
  {
    id: "app-vol-01",
    name: "Akosua Mensah",
    email: "akosua.mensah@gmail.com",
    phone: "+233 24 551 0921",
    type: "VOLUNTEER",
    skillsOrFocus: "Youth Tutoring, Digital Literacy",
    community: "Sogakope",
    statement: "Passionate about empowering rural girls with basic computing and literacy skills on weekends.",
    status: "PENDING",
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "app-vol-02",
    name: "Emmanuel Agbavor",
    email: "emmanuel.agbavor@outlook.com",
    phone: "+233 20 883 4102",
    type: "AMBASSADOR",
    skillsOrFocus: "Community Mobilization, Environmental Sanitation",
    community: "Dabala",
    statement: "Representing youth leaders across Dabala to organize bi-weekly gutter desilting and tree planting.",
    status: "PENDING",
    appliedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "app-part-01",
    name: "Dr. Kofi Nyarko",
    email: "nyarko@tonguhealthtrust.org",
    phone: "+233 24 990 1234",
    type: "PARTNER",
    organisation: "Tongu Health Outreach Trust",
    skillsOrFocus: "Preventive Healthcare & Maternal Clinics",
    community: "Agorkpo",
    statement: "Seeking collaborative outreach during maternal health screenings with logistics support from assembly.",
    status: "APPROVED",
    appliedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    reviewedBy: "Selorm Dzreke",
    reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "app-part-02",
    name: "Mercy Adzo Afelete",
    email: "afelete.textiles@yahoo.com",
    phone: "+233 55 123 7890",
    type: "PARTNER",
    organisation: "Volta Women Agro-Artisans Co-op",
    skillsOrFocus: "Vocational Skills & Tie-and-Dye Training",
    community: "Sogakope",
    statement: "Proposal to provide subsidized training equipment for 40 young women in South Tongu.",
    status: "PENDING",
    appliedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "audit-01",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    actor: "Selorm Dzreke",
    action: "DISPATCHED_STATUS",
    entityType: "ISSUE",
    entityId: "ISS-s1",
    details: "Changed status of Broken Bridge in Agorkpo to IN_PROGRESS and alerted Works Dept.",
  },
  {
    id: "audit-02",
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    actor: "Selorm Dzreke",
    action: "HOURS_APPROVED",
    entityType: "VOLUNTEER",
    entityId: "vol-entry-02",
    details: "Approved 24 community hours for Peace Kpodo on Health Outreach.",
  },
  {
    id: "audit-03",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    actor: "Selorm Dzreke",
    action: "CSV_EXPORT",
    entityType: "FINANCE",
    entityId: "fin-ledger",
    details: "Downloaded verified Paystack & expenditure audit CSV for South Tongu Assembly auditors.",
  },
  {
    id: "audit-04",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    actor: "Selorm Dzreke",
    action: "APPLICATION_APPROVED",
    entityType: "APPLICATION",
    entityId: "app-part-01",
    details: "Approved partnership MOU for Tongu Health Outreach Trust.",
  },
];

const INITIAL_SETTINGS: DistrictSettings = {
  districtName: "South Tongu District Assembly",
  assemblyLiaisonName: "Hon. Seth Agbenu",
  assemblyContactPhone: "+233 30 299 4410",
  emergencyWhatsApp: "+233 24 551 0921",
  officeLocation: "Sogakope Central Administrative Block, Opposite Volta River Authority",
  paystackPublicKey: "pk_test_88f912c904e578a1bc448a0",
  paystackLiveMode: false,
  publicAlertBanner: "Rainy season advisory: Report unpaved road washouts in South Tongu via the Community Survey.",
  alertBannerActive: true,
  momoMerchantNumber: "055 901 8823 (The Citizen Project)",
};

const INITIAL_SUBSCRIBERS: SubscriberEntry[] = [
  { id: "sub-01", email: "delali.sogakope@gmail.com", subscribedAt: "2026-08-10T09:15:00Z", status: "ACTIVE", source: "Website Footer" },
  { id: "sub-02", email: "dr.mensah.volta@gmail.com", subscribedAt: "2026-08-18T14:22:00Z", status: "ACTIVE", source: "Donate Page" },
  { id: "sub-03", email: "yaw.boakye@tonguassembly.gov.gh", subscribedAt: "2026-08-25T11:05:00Z", status: "ACTIVE", source: "Survey Submission" },
  { id: "sub-04", email: "mary.kpodo@yahoo.com", subscribedAt: "2026-09-02T16:40:00Z", status: "ACTIVE", source: "Volunteer Portal" },
  { id: "sub-05", email: "contact@agorkpoclinic.org", subscribedAt: "2026-09-08T08:30:00Z", status: "ACTIVE", source: "Partner Form" },
];

// ---------------------------------------------------------------------------
// 4. Store Getters & Setters (with safe localStorage fallback)
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getApplications(): ApplicantEntry[] {
  if (!isBrowser()) return INITIAL_APPLICATIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
      return INITIAL_APPLICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function updateApplicationStatus(id: string, status: ApplicationStatus, reviewer: string): ApplicantEntry[] {
  const current = getApplications();
  const updated = current.map((app) =>
    app.id === id
      ? {
          ...app,
          status,
          reviewedBy: reviewer,
          reviewedAt: new Date().toISOString(),
        }
      : app
  );
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor: reviewer,
    action: `APPLICATION_${status}`,
    entityType: "APPLICATION",
    entityId: id,
    details: `${status} application for ${updated.find((a) => a.id === id)?.name || id}`,
  });
  return updated;
}

export function createApplication(
  entry: Omit<ApplicantEntry, "id" | "appliedAt" | "status">,
  actor: string
): ApplicantEntry[] {
  const current = getApplications();
  const created: ApplicantEntry = {
    ...entry,
    id: `app-manual-${Date.now()}`,
    status: "PENDING",
    appliedAt: new Date().toISOString(),
  };
  const updated = [created, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "APPLICATION_CREATED",
    entityType: "APPLICATION",
    entityId: created.id,
    details: `Manually added ${created.type} application for ${created.name}`,
  });
  return updated;
}

export function updateApplication(
  id: string,
  updates: Partial<ApplicantEntry>,
  actor: string
): ApplicantEntry[] {
  const current = getApplications();
  const updated = current.map((app) => (app.id === id ? { ...app, ...updates } : app));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((a) => a.id === id);
  addAuditEntry({
    actor,
    action: "APPLICATION_UPDATED",
    entityType: "APPLICATION",
    entityId: id,
    details: `Updated details for ${target?.name || id}`,
  });
  return updated;
}

export function deleteApplication(id: string, actor: string): ApplicantEntry[] {
  const current = getApplications();
  const target = current.find((a) => a.id === id);
  const updated = current.filter((a) => a.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "APPLICATION_DELETED",
    entityType: "APPLICATION",
    entityId: id,
    details: `Deleted applicant entry for ${target?.name || id}`,
  });
  return updated;
}

export function getAuditLog(): AuditLogEntry[] {
  if (!isBrowser()) return INITIAL_AUDIT_LOG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(INITIAL_AUDIT_LOG));
      return INITIAL_AUDIT_LOG;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_AUDIT_LOG;
  }
}

export function addAuditEntry(entry: Omit<AuditLogEntry, "id" | "timestamp">): void {
  const current = getAuditLog();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const next = [newEntry, ...current].slice(0, 100);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(next));
    } catch {}
  }
}

export function getDistrictSettings(): DistrictSettings {
  if (!isBrowser()) return INITIAL_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveDistrictSettings(settings: DistrictSettings, actor: string): void {
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "SETTINGS_UPDATED",
    entityType: "SETTINGS",
    entityId: "district-config",
    details: "Updated district configuration and Paystack gateway keys.",
  });
}

export function getSubscribers(): SubscriberEntry[] {
  if (!isBrowser()) return INITIAL_SUBSCRIBERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(INITIAL_SUBSCRIBERS));
      return INITIAL_SUBSCRIBERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIBERS;
  }
}

export function addSubscriber(email: string, source = "Admin Console"): SubscriberEntry[] {
  const current = getSubscribers();
  if (current.some((s) => s.email.toLowerCase() === email.toLowerCase())) return current;
  const newEntry: SubscriberEntry = {
    id: `sub-${Date.now()}`,
    email,
    subscribedAt: new Date().toISOString(),
    status: "ACTIVE",
    source,
  };
  const next = [newEntry, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(next));
    } catch {}
  }
  return next;
}

export function toggleSubscriberStatus(id: string, actor: string): SubscriberEntry[] {
  const current = getSubscribers();
  const updated = current.map((s) =>
    s.id === id
      ? { ...s, status: (s.status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE") as "ACTIVE" | "UNSUBSCRIBED" }
      : s
  );
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((s) => s.id === id);
  addAuditEntry({
    actor,
    action: target?.status === "ACTIVE" ? "SUBSCRIBER_ACTIVATED" : "SUBSCRIBER_UNSUBSCRIBED",
    entityType: "SYSTEM",
    entityId: id,
    details: `Updated subscription status for ${target?.email} to ${target?.status}`,
  });
  return updated;
}

export function deleteSubscriber(id: string, actor: string): SubscriberEntry[] {
  const current = getSubscribers();
  const target = current.find((s) => s.id === id);
  const updated = current.filter((s) => s.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "SUBSCRIBER_DELETED",
    entityType: "SYSTEM",
    entityId: id,
    details: `Removed subscriber ${target?.email || id}`,
  });
  return updated;
}

// ---------------------------------------------------------------------------
// 5. Offline Donations & Expenditures Logger
// ---------------------------------------------------------------------------

export interface ManualDonationEntry {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  method: "CASH" | "DIRECT_MOMO" | "BANK_WIRE" | "ASSEMBLY_GRANT";
  reference: string;
  notes: string;
  createdAt: string;
  recordedBy: string;
}

export interface ManualExpenditureEntry {
  id: string;
  category: "PROGRAMS" | "ADMINISTRATION" | "FUNDRAISING" | "COMMUNITY_WORKS";
  description: string;
  amount: number;
  date: string;
  initiativeTitle: string;
  receiptFileName?: string;
  recordedBy: string;
}

export function getManualDonations(): ManualDonationEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.MANUAL_DONATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveManualDonation(entry: Omit<ManualDonationEntry, "id" | "createdAt">, actor: string): ManualDonationEntry[] {
  const current = getManualDonations();
  const created: ManualDonationEntry = {
    ...entry,
    id: `offline-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const next = [created, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.MANUAL_DONATIONS, JSON.stringify(next));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "OFFLINE_DONATION_LOGGED",
    entityType: "FINANCE",
    entityId: created.id,
    details: `Logged offline donation of GHS ${entry.amount.toLocaleString()} via ${entry.method} from ${entry.donorName}`,
  });
  return next;
}

export function getManualExpenditures(): ManualExpenditureEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.EXPENDITURES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveManualExpenditure(entry: Omit<ManualExpenditureEntry, "id">, actor: string): ManualExpenditureEntry[] {
  const current = getManualExpenditures();
  const created: ManualExpenditureEntry = {
    ...entry,
    id: `exp-${Date.now()}`,
  };
  const next = [created, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EXPENDITURES, JSON.stringify(next));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "EXPENDITURE_LOGGED",
    entityType: "FINANCE",
    entityId: created.id,
    details: `Recorded expenditure of GHS ${entry.amount.toLocaleString()} for ${entry.description}`,
  });
  return next;
}

export function deleteManualDonation(id: string, actor: string): ManualDonationEntry[] {
  const current = getManualDonations();
  const target = current.find((d) => d.id === id);
  const updated = current.filter((d) => d.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.MANUAL_DONATIONS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "DONATION_VOIDED",
    entityType: "FINANCE",
    entityId: id,
    details: `Voided offline donation of GHS ${target?.amount.toLocaleString() || 0} from ${target?.donorName || id}`,
  });
  return updated;
}

export function updateManualDonation(
  id: string,
  updates: Partial<ManualDonationEntry>,
  actor: string
): ManualDonationEntry[] {
  const current = getManualDonations();
  const updated = current.map((d) => (d.id === id ? { ...d, ...updates } : d));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.MANUAL_DONATIONS, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((d) => d.id === id);
  addAuditEntry({
    actor,
    action: "DONATION_UPDATED",
    entityType: "FINANCE",
    entityId: id,
    details: `Updated offline donation record for ${target?.donorName || id}`,
  });
  return updated;
}

export function deleteManualExpenditure(id: string, actor: string): ManualExpenditureEntry[] {
  const current = getManualExpenditures();
  const target = current.find((e) => e.id === id);
  const updated = current.filter((e) => e.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EXPENDITURES, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "EXPENDITURE_VOIDED",
    entityType: "FINANCE",
    entityId: id,
    details: `Voided expenditure entry of GHS ${target?.amount.toLocaleString() || 0} for ${target?.description || id}`,
  });
  return updated;
}

export function updateManualExpenditure(
  id: string,
  updates: Partial<ManualExpenditureEntry>,
  actor: string
): ManualExpenditureEntry[] {
  const current = getManualExpenditures();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EXPENDITURES, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((e) => e.id === id);
  addAuditEntry({
    actor,
    action: "EXPENDITURE_UPDATED",
    entityType: "FINANCE",
    entityId: id,
    details: `Updated expenditure record for ${target?.description || id}`,
  });
  return updated;
}

// ---------------------------------------------------------------------------
// 6. Community Events Store
// ---------------------------------------------------------------------------

export interface CommunityEventEntry {
  id: string;
  title: string;
  summary: string;
  location: string;
  startDate: string;
  endDate?: string;
  rsvpsCount: number;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
}

export function getCommunityEvents(): CommunityEventEntry[] {
  if (!isBrowser()) {
    return seedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      summary: e.summary,
      location: e.location || "Sogakope",
      startDate: e.startDate.toISOString(),
      endDate: e.endDate?.toISOString(),
      rsvpsCount: 28,
      status: "UPCOMING",
    }));
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      const initial = seedEvents.map((e, idx) => ({
        id: e.id,
        title: e.title,
        summary: e.summary,
        location: e.location || "Sogakope Community Centre",
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString(),
        rsvpsCount: 15 + idx * 12,
        status: (idx === 0 ? "UPCOMING" : idx === 1 ? "IN_PROGRESS" : "COMPLETED") as any,
      }));
      window.localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCommunityEvent(entry: Omit<CommunityEventEntry, "id" | "rsvpsCount">, actor: string): CommunityEventEntry[] {
  const current = getCommunityEvents();
  const created: CommunityEventEntry = {
    ...entry,
    id: `event-${Date.now()}`,
    rsvpsCount: 0,
  };
  const next = [created, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "EVENT_CREATED",
    entityType: "EVENT",
    entityId: created.id,
    details: `Scheduled event: "${entry.title}" at ${entry.location}`,
  });
  return next;
}

export function updateCommunityEvent(
  id: string,
  updates: Partial<CommunityEventEntry>,
  actor: string
): CommunityEventEntry[] {
  const current = getCommunityEvents();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((e) => e.id === id);
  addAuditEntry({
    actor,
    action: "EVENT_UPDATED",
    entityType: "EVENT",
    entityId: id,
    details: `Updated event details for "${target?.title || id}"`,
  });
  return updated;
}

export function deleteCommunityEvent(id: string, actor: string): CommunityEventEntry[] {
  const current = getCommunityEvents();
  const target = current.find((e) => e.id === id);
  const updated = current.filter((e) => e.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "EVENT_DELETED",
    entityType: "EVENT",
    entityId: id,
    details: `Cancelled/deleted event "${target?.title || id}"`,
  });
  return updated;
}

// ---------------------------------------------------------------------------
// 7. Editorial Blog Posts Store
// ---------------------------------------------------------------------------

export interface EditorialPostEntry {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt: string;
  views: number;
  coverImage?: string;
}

export function getEditorialPosts(): EditorialPostEntry[] {
  if (!isBrowser()) {
    return seedBlogPosts.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt,
      category: b.category,
      tags: b.tags,
      published: b.published,
      publishedAt: b.publishedAt.toISOString(),
      views: 140,
    }));
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BLOG);
    if (!raw) {
      const initial = seedBlogPosts.map((b, idx) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        category: b.category,
        tags: b.tags,
        published: b.published,
        publishedAt: b.publishedAt.toISOString(),
        views: 120 + idx * 85,
      }));
      window.localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function togglePostPublished(id: string, actor: string): EditorialPostEntry[] {
  const current = getEditorialPosts();
  const updated = current.map((p) =>
    p.id === id ? { ...p, published: !p.published, publishedAt: new Date().toISOString() } : p
  );
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((p) => p.id === id);
  addAuditEntry({
    actor,
    action: target?.published ? "POST_PUBLISHED" : "POST_UNPUBLISHED",
    entityType: "SYSTEM",
    entityId: id,
    details: `${target?.published ? "Published" : "Unpublished"} article: "${target?.title}"`,
  });
  return updated;
}

export function saveEditorialPost(
  entry: Omit<EditorialPostEntry, "id" | "views" | "publishedAt">,
  actor: string
): EditorialPostEntry[] {
  const current = getEditorialPosts();
  const created: EditorialPostEntry = {
    ...entry,
    id: `post-${Date.now()}`,
    views: 0,
    publishedAt: new Date().toISOString(),
  };
  const next = [created, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(next));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "POST_CREATED",
    entityType: "SYSTEM",
    entityId: created.id,
    details: `Drafted article: "${entry.title}" (${entry.category})`,
  });
  return next;
}

export function updateEditorialPost(
  id: string,
  updates: Partial<EditorialPostEntry>,
  actor: string
): EditorialPostEntry[] {
  const current = getEditorialPosts();
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((p) => p.id === id);
  addAuditEntry({
    actor,
    action: "POST_UPDATED",
    entityType: "SYSTEM",
    entityId: id,
    details: `Updated editorial article: "${target?.title || id}"`,
  });
  return updated;
}

export function deleteEditorialPost(id: string, actor: string): EditorialPostEntry[] {
  const current = getEditorialPosts();
  const target = current.find((p) => p.id === id);
  const updated = current.filter((p) => p.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOG, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "POST_DELETED",
    entityType: "SYSTEM",
    entityId: id,
    details: `Deleted editorial article: "${target?.title || id}"`,
  });
  return updated;
}

// ---------------------------------------------------------------------------
// 8. Initiatives CRUD Store
// ---------------------------------------------------------------------------

export function getAdminInitiatives(): Initiative[] {
  if (!isBrowser()) return seedInitiatives;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.INITIATIVES);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.INITIATIVES, JSON.stringify(seedInitiatives));
      return seedInitiatives;
    }
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => ({
      ...item,
      startDate: item.startDate ? new Date(item.startDate) : null,
      endDate: item.endDate ? new Date(item.endDate) : null,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    }));
  } catch {
    return seedInitiatives;
  }
}

export function saveAdminInitiative(entry: Initiative, actor: string): Initiative[] {
  const current = getAdminInitiatives();
  const updated = [entry, ...current];
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.INITIATIVES, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "INITIATIVE_CREATED",
    entityType: "INITIATIVE",
    entityId: entry.id,
    details: `Created initiative "${entry.title}" with target budget GHS ${entry.budget.toLocaleString()}`,
  });
  return updated;
}

export function updateAdminInitiative(id: string, updates: Partial<Initiative>, actor: string): Initiative[] {
  const current = getAdminInitiatives();
  const updated = current.map((init) => (init.id === id ? { ...init, ...updates } : init));
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.INITIATIVES, JSON.stringify(updated));
    } catch {}
  }
  const target = updated.find((init) => init.id === id);
  addAuditEntry({
    actor,
    action: "INITIATIVE_UPDATED",
    entityType: "INITIATIVE",
    entityId: id,
    details: `Updated initiative details for "${target?.title || id}"`,
  });
  return updated;
}

export function deleteAdminInitiative(id: string, actor: string): Initiative[] {
  const current = getAdminInitiatives();
  const target = current.find((init) => init.id === id);
  const updated = current.filter((init) => init.id !== id);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.INITIATIVES, JSON.stringify(updated));
    } catch {}
  }
  addAuditEntry({
    actor,
    action: "INITIATIVE_DELETED",
    entityType: "INITIATIVE",
    entityId: id,
    details: `Deleted initiative "${target?.title || id}"`,
  });
  return updated;
}
