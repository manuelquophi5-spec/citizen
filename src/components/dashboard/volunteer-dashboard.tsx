"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Clock,
  CalendarDays,
  PlusCircle,
  CheckCircle2,
  Trophy,
  X,
  ArrowRight,
  Shield,
  Printer,
  Check,
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  Phone,
  Mail,
  Edit2,
  Trash2,
  SlidersHorizontal,
  MapPin,
  Layers,
  Radio,
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCheck,
  LogOut,
  Menu,
  Bell,
  FileText,
  Heart,
  ShieldAlert,
  Send,
} from "lucide-react";
import type { LocalSession } from "@/lib/local-session";
import { clearSession, setSession, getSession } from "@/lib/local-session";
import { toast, toastCreated } from "@/components/ui/toast";
import { signOutAction } from "@/app/actions/auth";
import { initiatives, events } from "@/lib/mock-data";
import {
  getVolunteerHoursAction,
  logVolunteerHoursAction,
  voidVolunteerHoursAction,
  updateVolunteerHoursAction,
} from "@/app/actions/volunteer";
import { getInitiativesAction } from "@/app/actions/donations";
import { formatDate, cn } from "@/lib/utils";
import { FilamentStatsOverview, type FilamentStat } from "./filament/filament-stats";
import { FilamentBadge } from "./filament/filament-badge";
import { ThemeToggle } from "../layout/theme-toggle";

export type VolunteerTab = "overview" | "ledger" | "events" | "skills" | "transcript" | "profile";

export type VolunteerHourEntry = {
  id: string;
  volunteerName?: string;
  description: string;
  initiativeTitle: string;
  date: string;
  hours: number;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  supervisor?: string;
  fieldNotes?: string;
};

const INITIAL_HOURS: VolunteerHourEntry[] = [
  {
    id: "vh-1",
    volunteerName: "Akua Agbavitor",
    description: "Civic Education facilitation at Sogakope Basic School",
    initiativeTitle: "Global Citizenship Programme",
    date: "2026-08-12",
    hours: 6,
    approved: true,
    approvedBy: "Selorm Dzreke (District Coordinator)",
    approvedAt: "2026-08-14",
    supervisor: "Mr. Kwaku Baah",
    fieldNotes: "Trained 45 JHS students on youth civic rights and voter registration responsibilities.",
  },
  {
    id: "vh-2",
    volunteerName: "Akua Agbavitor",
    description: "Estuary bank cleanup team coordination & plastic collation",
    initiativeTitle: "Clean Communities Initiative",
    date: "2026-07-20",
    hours: 4,
    approved: true,
    approvedBy: "Selorm Dzreke (District Coordinator)",
    approvedAt: "2026-07-22",
    supervisor: "Madam Cecilia Agbo",
    fieldNotes: "Supervised 12 volunteers clearing plastic waste along the Sogakope riverside dock.",
  },
  {
    id: "vh-3",
    volunteerName: "Akua Agbavitor",
    description: "Voter dialogue workshop ushering & attendee check-in",
    initiativeTitle: "Know Yourself, Know Your Path",
    date: "2026-08-28",
    hours: 4,
    approved: true,
    approvedBy: "Selorm Dzreke (District Coordinator)",
    approvedAt: "2026-08-29",
    supervisor: "Rev. E. T. Mensah",
    fieldNotes: "Coordinated registration desk for 110 participants at Sogakope Community Centre.",
  },
  {
    id: "vh-4",
    volunteerName: "Akua Agbavitor",
    description: "Community survey data verification in Dabala Market",
    initiativeTitle: "Inside Community Survey",
    date: "2026-09-08",
    hours: 4,
    approved: false,
    supervisor: "Assemblyman Gakpetor",
    fieldNotes: "Field verification of 30 sanitation feedback survey sheets from market stall owners.",
  },
];

const STORAGE_HOURS_KEY = "tcp:volunteer-hours";
const STORAGE_SIGNUPS_KEY = "tcp:volunteer-signups";
const STORAGE_SKILLS_KEY = "tcp:volunteer-skills";
const STORAGE_EMERGENCY_KEY = "tcp:volunteer-emergency";
const STORAGE_ROLES_KEY = "tcp:volunteer-event-roles";

type ShiftType = "Morning (07:00 - 11:00)" | "Afternoon (12:00 - 16:00)" | "Full Day (08:00 - 16:00)";
type RoleType = "Translation & Interpretation (Ewe/English)" | "Ushering & Logistics" | "First Aid & Field Safety" | "Civic Facilitator";

interface EventSignupConfig {
  shift: ShiftType;
  role: RoleType;
  checkedIn: boolean;
  checkInTime?: string;
  reflectionNotes?: string;
}

const LEADERBOARD_STANDINGS = [
  { rank: 1, name: "Selorm Kofi Adzaho", hours: 82, tier: "Gold Ambassador", community: "Sogakope Central" },
  { rank: 2, name: "Dzifa Evelyn Mensah", hours: 68, tier: "Gold Ambassador", community: "Dabala" },
  { rank: 3, name: "Elikem Kwami Dogbe", hours: 54, tier: "Silver Ambassador", community: "Tefle" },
  { rank: 4, name: "Akua Agbavitor (You)", hours: 18, tier: "Bronze Ambassador", community: "Sogakope South", isUser: true },
  { rank: 5, name: "Mawuli Bright Attipoe", hours: 16, tier: "Bronze Ambassador", community: "Agorkpo" },
  { rank: 6, name: "Enyonam Peace Gidi", hours: 12, tier: "Bronze Ambassador", community: "Sokpoe" },
];

export function VolunteerDashboard({ session: initialSession }: { session: LocalSession }) {
  const router = useRouter();
  const [session, setSessionState] = useState<LocalSession>(initialSession);
  const [activeTab, setActiveTab] = useState<VolunteerTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hours Ledger State
  const [entries, setEntries] = useState<VolunteerHourEntry[]>([]);
  const [ledgerFilter, setLedgerFilter] = useState<"ALL" | "APPROVED" | "PENDING">("ALL");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<VolunteerHourEntry | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [activeEventForReflection, setActiveEventForReflection] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");

  // Create / Edit Form State
  const [formDescription, setFormDescription] = useState("");
  const [formInitiative, setFormInitiative] = useState(initiatives[0]?.title ?? "General Volunteering");
  const [activeInitiatives, setActiveInitiatives] = useState<Array<{ id: string; title: string }>>([]);
  const [formHours, setFormHours] = useState("4");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formSupervisor, setFormSupervisor] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    getInitiativesAction().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setActiveInitiatives(res.data.map((i) => ({ id: i.id, title: i.title })));
      }
    });
  }, []);

  // Event Deployments & Shift Management
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [eventConfigs, setEventConfigs] = useState<Record<string, EventSignupConfig>>({});

  // Skills & Emergency Readiness
  const [skills, setSkills] = useState<string[]>([
    "First Aid Certified",
    "Ewe-English Bilingual Translation",
    "Community Survey Enumeration",
    "Youth Civic Facilitation",
    "Disaster Relief Operations",
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [emergencyReady, setEmergencyReady] = useState(true);
  const [emergencyArea, setEmergencyArea] = useState("Sogakope Central & South");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("+233 24 888 9102");

  // Profile Form State
  const [profileName, setProfileName] = useState(session.name || "Akua Agbavitor");
  const [profileEmail, setProfileEmail] = useState(session.email || "akua.volunteer@citizen.gh");
  const [profilePhone, setProfilePhone] = useState("+233 24 888 9102");
  const [profileElectoralArea, setProfileElectoralArea] = useState("Sogakope South");
  const [profileVestSize, setProfileVestSize] = useState("Medium (M)");
  const [profileEmergencyName, setProfileEmergencyName] = useState("Kwame Agbavitor (Brother)");
  const [profileEmergencyContact, setProfileEmergencyContact] = useState("+233 20 444 1920");
  const [profileBio, setProfileBio] = useState(
    "Passionate grassroots community mobilizer with 3+ years active participation in youth voter civic education, flood response assistance, and community cleanup drives in South Tongu."
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";

  const fetchLiveHours = useCallback(async () => {
    try {
      const res = await getVolunteerHoursAction(session.userId ? { volunteerId: session.userId } : undefined);
      if (res.success && res.data) {
        const mapped: VolunteerHourEntry[] = res.data.map((r) => ({
          id: r.id,
          volunteerName: session.name || "Akua Agbavitor",
          description: r.activity,
          initiativeTitle: r.category || "General Volunteering",
          date: r.date,
          hours: Number(r.hours),
          approved: r.status === "VERIFIED",
          supervisor: r.supervisor || undefined,
          fieldNotes: r.field_notes || undefined,
        }));
        setEntries(mapped);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch live volunteer hours:", err);
    }
  }, [session.userId, session.name]);

  // Hydrate entries & settings
  useEffect(() => {
    if (isLive) {
      fetchLiveHours();
    } else {
      try {
        const rawHours = window.localStorage.getItem(STORAGE_HOURS_KEY);
        if (rawHours) {
          setEntries(JSON.parse(rawHours));
        } else {
          setEntries(INITIAL_HOURS);
          window.localStorage.setItem(STORAGE_HOURS_KEY, JSON.stringify(INITIAL_HOURS));
        }
      } catch {
        setEntries(INITIAL_HOURS);
      }
    }

    try {
      const rawSignups = window.localStorage.getItem(STORAGE_SIGNUPS_KEY);
      if (rawSignups) {
        setRegisteredEventIds(JSON.parse(rawSignups));
      }

      const rawConfigs = window.localStorage.getItem(STORAGE_ROLES_KEY);
      if (rawConfigs) {
        setEventConfigs(JSON.parse(rawConfigs));
      }

      const rawSkills = window.localStorage.getItem(STORAGE_SKILLS_KEY);
      if (rawSkills) {
        setSkills(JSON.parse(rawSkills));
      }

      const rawEmergency = window.localStorage.getItem(STORAGE_EMERGENCY_KEY);
      if (rawEmergency !== null) {
        setEmergencyReady(JSON.parse(rawEmergency));
      }
    } catch {}

    const handleSyncHours = () => {
      if (isLive) {
        fetchLiveHours();
      } else {
        try {
          const raw = window.localStorage.getItem(STORAGE_HOURS_KEY);
          if (raw) setEntries(JSON.parse(raw));
        } catch {}
      }
    };

    window.addEventListener("tcp:volunteer-hours-changed", handleSyncHours);
    return () => {
      window.removeEventListener("tcp:volunteer-hours-changed", handleSyncHours);
    };
  }, [isLive, fetchLiveHours]);

  const saveEntries = (updated: VolunteerHourEntry[]) => {
    setEntries(updated);
    try {
      window.localStorage.setItem(STORAGE_HOURS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("tcp:volunteer-hours-changed", { detail: updated }));
    } catch {
      // no-op
    }
  };

  const handleLogout = async () => {
    clearSession();
    await signOutAction();
    toast.info("Signed out of Volunteer Portal.", "Session Ended");
    router.push("/volunteer/login");
  };

  // Metrics calculations
  const approvedHours = useMemo(
    () => entries.filter((e) => e.approved).reduce((sum, e) => sum + e.hours, 0),
    [entries]
  );
  const pendingHours = useMemo(
    () => entries.filter((e) => !e.approved).reduce((sum, e) => sum + e.hours, 0),
    [entries]
  );
  const totalLoggedHours = approvedHours + pendingHours;

  // Ambassador tier tiering: Bronze 10h, Silver 30h, Gold 60h, Distinguished 100h
  let currentTier = "Volunteer";
  let currentTone: "ocean" | "leaf" | "gold" = "ocean";
  let nextTier = "Bronze Ambassador (10h)";
  let targetHours = 10;
  let progressPercent = Math.min(100, Math.round((approvedHours / 10) * 100));

  if (approvedHours >= 100) {
    currentTier = "Distinguished Leader";
    currentTone = "gold";
    nextTier = "Max Tier Achieved";
    targetHours = 100;
    progressPercent = 100;
  } else if (approvedHours >= 60) {
    currentTier = "Gold Ambassador";
    currentTone = "gold";
    nextTier = "Distinguished Leader (100h)";
    targetHours = 100;
    progressPercent = Math.min(100, Math.round((approvedHours / 100) * 100));
  } else if (approvedHours >= 30) {
    currentTier = "Silver Ambassador";
    currentTone = "leaf";
    nextTier = "Gold Ambassador (60h)";
    targetHours = 60;
    progressPercent = Math.min(100, Math.round((approvedHours / 60) * 100));
  } else if (approvedHours >= 10) {
    currentTier = "Bronze Ambassador";
    currentTone = "ocean";
    nextTier = "Silver Ambassador (30h)";
    targetHours = 30;
    progressPercent = Math.min(100, Math.round((approvedHours / 30) * 100));
  }

  // Filament stats overview
  const statsOverview: FilamentStat[] = [
    {
      id: "stat-verified-hours",
      label: "Verified Service Hours",
      value: `${approvedHours} hrs`,
      description: "Accredited by District Assembly",
      descriptionIcon: "up",
      chart: [4, 8, 12, 14, 18],
      chartTone: "emerald",
    },
    {
      id: "stat-pending-hours",
      label: "Pending Verification",
      value: `${pendingHours} hrs`,
      description: `${entries.filter((e) => !e.approved).length} log sheets submitted`,
      descriptionIcon: "neutral",
      chart: [0, 2, 4],
      chartTone: "amber",
    },
    {
      id: "stat-ambassador-rank",
      label: "Ambassador Status",
      value: currentTier,
      description: `${Math.max(0, targetHours - approvedHours)}h to ${nextTier.split(" ")[0]} tier`,
      descriptionIcon: "up",
      chart: [10, 30, 60],
      chartTone: "sky",
    },
    {
      id: "stat-field-missions",
      label: "Field Deployments",
      value: `${registeredEventIds.length} Scheduled`,
      description: emergencyReady ? "Emergency Alert: READY" : "Standard Standing",
      descriptionIcon: "up",
      chart: [1, 2, 3, 4],
      chartTone: "emerald",
    },
  ];

  // Hours Ledger CRUD Handlers
  const openCreateModal = () => {
    setFormDescription("");
    setFormInitiative(initiatives[0]?.title ?? "General Volunteering");
    setFormHours("4");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormSupervisor("Selorm Dzreke");
    setFormNotes("");
    setShowLogModal(true);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = Number(formHours) || 1;
    const desc = formDescription.trim();
    const init = formInitiative;
    const dateVal = formDate;
    const sup = formSupervisor.trim() || "District Coordinator";
    const notes = formNotes.trim() || undefined;

    let createdId = `vh-${Date.now()}`;
    if (isLive) {
      try {
        const res = await logVolunteerHoursAction({
          volunteer_id: session.userId || "d0000000-0000-0000-0000-000000000002",
          activity: desc,
          category: init,
          hours: hoursNum,
          date: dateVal,
          supervisor: sup,
          field_notes: notes || null,
        });
        if (res.success && res.data) {
          createdId = res.data.id;
        }
      } catch (err) {
        console.warn("Failed to persist volunteer hours live:", err);
      }
    }

    const newEntry: VolunteerHourEntry = {
      id: createdId,
      volunteerName: session.name || "Akua Agbavitor",
      description: desc,
      initiativeTitle: init,
      date: dateVal,
      hours: hoursNum,
      approved: false,
      supervisor: sup,
      fieldNotes: notes,
    };
    const updated = [newEntry, ...entries];
    saveEntries(updated);
    setShowLogModal(false);
    toastCreated.volunteerHours(newEntry.hours, newEntry.description);
    showToast(`Logged ${newEntry.hours}h for review by District Coordinator`);
  };

  const openEditModal = (entry: VolunteerHourEntry) => {
    setSelectedEntry(entry);
    setFormDescription(entry.description);
    setFormInitiative(entry.initiativeTitle);
    setFormHours(String(entry.hours));
    setFormDate(entry.date);
    setFormSupervisor(entry.supervisor || "");
    setFormNotes(entry.fieldNotes || "");
    setShowEditModal(true);
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;

    if (isLive) {
      try {
        await updateVolunteerHoursAction(selectedEntry.id, {
          activity: formDescription.trim(),
          category: formInitiative,
          hours: Number(formHours) || 1,
          date: formDate,
          supervisor: formSupervisor.trim() || undefined,
          field_notes: formNotes.trim() || null,
          status: "PENDING",
        });
      } catch (err) {
        console.warn("Failed to update volunteer hours live:", err);
      }
    }

    const updated = entries.map((item) => {
      if (item.id === selectedEntry.id) {
        return {
          ...item,
          description: formDescription.trim(),
          initiativeTitle: formInitiative,
          hours: Number(formHours) || 1,
          date: formDate,
          supervisor: formSupervisor.trim() || undefined,
          fieldNotes: formNotes.trim() || undefined,
          // If edited, reset approved status if it was approved to guarantee review integrity
          approved: false,
        };
      }
      return item;
    });

    saveEntries(updated);
    setShowEditModal(false);
    setSelectedEntry(null);
    showToast("Volunteer log entry updated successfully");
  };

  const openDeleteModal = (entry: VolunteerHourEntry) => {
    setSelectedEntry(entry);
    setShowDeleteModal(true);
  };

  const handleDeleteEntry = async () => {
    if (!selectedEntry) return;

    if (isLive) {
      try {
        await voidVolunteerHoursAction(selectedEntry.id, "Voided by volunteer");
      } catch (err) {
        console.warn("Failed to void volunteer hours live:", err);
      }
    }

    const updated = entries.filter((item) => item.id !== selectedEntry.id);
    saveEntries(updated);
    setShowDeleteModal(false);
    setSelectedEntry(null);
    showToast("Hours log record voided from official ledger");
  };

  // Filtered Ledger Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (ledgerFilter === "APPROVED" && !item.approved) return false;
      if (ledgerFilter === "PENDING" && item.approved) return false;
      if (ledgerSearch.trim()) {
        const query = ledgerSearch.toLowerCase();
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchInit = item.initiativeTitle.toLowerCase().includes(query);
        const matchSup = (item.supervisor || "").toLowerCase().includes(query);
        return matchDesc || matchInit || matchSup;
      }
      return true;
    });
  }, [entries, ledgerFilter, ledgerSearch]);

  // Event & Shift Handlers
  const handleToggleEventSignup = (eventId: string) => {
    let nextSignups: string[];
    let nextConfigs = { ...eventConfigs };

    if (registeredEventIds.includes(eventId)) {
      nextSignups = registeredEventIds.filter((id) => id !== eventId);
      delete nextConfigs[eventId];
      showToast("Withdrew from event deployment roster");
    } else {
      nextSignups = [...registeredEventIds, eventId];
      nextConfigs[eventId] = {
        shift: "Morning (07:00 - 11:00)",
        role: "Ushering & Logistics",
        checkedIn: false,
      };
      showToast("Registered for deployment! Shift confirmed.");
    }

    setRegisteredEventIds(nextSignups);
    setEventConfigs(nextConfigs);
    try {
      window.localStorage.setItem(STORAGE_SIGNUPS_KEY, JSON.stringify(nextSignups));
      window.localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(nextConfigs));
    } catch {
      // no-op
    }
  };

  const handleUpdateEventConfig = (eventId: string, shift: ShiftType, role: RoleType) => {
    const nextConfigs = {
      ...eventConfigs,
      [eventId]: {
        ...(eventConfigs[eventId] || { checkedIn: false }),
        shift,
        role,
      },
    };
    setEventConfigs(nextConfigs);
    try {
      window.localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(nextConfigs));
      showToast("Shift & role preference updated");
    } catch {
      // no-op
    }
  };

  const handleEventCheckIn = (eventId: string) => {
    const current = eventConfigs[eventId] || {
      shift: "Morning (07:00 - 11:00)",
      role: "Ushering & Logistics",
      checkedIn: false,
    };

    const nextConfigs = {
      ...eventConfigs,
      [eventId]: {
        ...current,
        checkedIn: true,
        checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    };
    setEventConfigs(nextConfigs);
    try {
      window.localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(nextConfigs));
      showToast("✓ Checked in! Field coordinator notified of your arrival.");
    } catch {
      // no-op
    }
  };

  const handleOpenReflectionModal = (eventId: string) => {
    setActiveEventForReflection(eventId);
    setReflectionText(eventConfigs[eventId]?.reflectionNotes || "");
    setShowReflectionModal(true);
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventForReflection) return;
    const current = eventConfigs[activeEventForReflection] || {
      shift: "Morning (07:00 - 11:00)",
      role: "Ushering & Logistics",
      checkedIn: true,
    };

    const nextConfigs = {
      ...eventConfigs,
      [activeEventForReflection]: {
        ...current,
        reflectionNotes: reflectionText.trim(),
      },
    };
    setEventConfigs(nextConfigs);
    try {
      window.localStorage.setItem(STORAGE_ROLES_KEY, JSON.stringify(nextConfigs));
      showToast("Field reflection submitted to Assembly database");
    } catch {
      // no-op
    }
    setShowReflectionModal(false);
    setActiveEventForReflection(null);
  };

  // Skills & Emergency Readiness Handlers
  const handleToggleEmergencyReady = () => {
    const next = !emergencyReady;
    setEmergencyReady(next);
    try {
      window.localStorage.setItem(STORAGE_EMERGENCY_KEY, JSON.stringify(next));
      showToast(
        next
          ? "🚨 Emergency Readiness ACTIVATED. You are marked available for SMS dispatch."
          : "Emergency readiness paused. Set to standard schedule."
      );
    } catch {
      // no-op
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    const nextSkills = [...skills, trimmed];
    setSkills(nextSkills);
    setNewSkillInput("");
    try {
      window.localStorage.setItem(STORAGE_SKILLS_KEY, JSON.stringify(nextSkills));
      showToast(`Skill "${trimmed}" added to official volunteer record`);
    } catch {
      // no-op
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const nextSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(nextSkills);
    try {
      window.localStorage.setItem(STORAGE_SKILLS_KEY, JSON.stringify(nextSkills));
      showToast(`Removed "${skillToRemove}"`);
    } catch {
      // no-op
    }
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSession = {
      name: profileName.trim(),
      email: profileEmail.trim(),
      role: session.role,
    };
    setSession(updatedSession);
    setSessionState({
      ...session,
      ...updatedSession,
    });
    showToast("Volunteer ambassador profile details saved");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ocean-50/50 font-sans text-ocean-950 dark:bg-ocean-950 dark:text-ocean-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-ocean-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3 dark:bg-ocean-100 dark:text-ocean-950">
          <Sparkles className="h-4 w-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filament Collapsible Sidebar */}
      <aside
        className={cn(
          "relative flex flex-col border-r border-ocean-200/80 bg-white transition-all duration-300 dark:border-ocean-800/80 dark:bg-ocean-900/90",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Portal Branding Header */}
        <div className="flex h-16 items-center justify-between border-b border-ocean-100 px-4 dark:border-ocean-800">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-leaf-600 text-white shadow-sm font-bold">
              <Award className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate">
                <span className="font-display text-sm font-bold tracking-tight text-ocean-950 dark:text-white truncate">
                  Volunteer Console
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  Ambassador Operations
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-ocean-500 hover:bg-ocean-100 hover:text-ocean-900 dark:hover:bg-ocean-800 dark:hover:text-ocean-100"
            title="Toggle navigation sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {/* Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "overview"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Overview & Standings"
          >
            <Trophy className="h-4 w-4 shrink-0 text-gold-500" />
            {sidebarOpen && <span>Overview & Rank</span>}
          </button>

          {/* Service Hours Ledger */}
          <button
            onClick={() => setActiveTab("ledger")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "ledger"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Service Hours Ledger"
          >
            <div className="flex items-center gap-3 truncate">
              <Clock className="h-4 w-4 shrink-0 text-emerald-500" />
              {sidebarOpen && <span>Hours Ledger (CRUD)</span>}
            </div>
            {sidebarOpen && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                {approvedHours}h
              </span>
            )}
          </button>

          {/* Field Events & Shifts */}
          <button
            onClick={() => setActiveTab("events")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "events"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Deployments & Shifts"
          >
            <div className="flex items-center gap-3 truncate">
              <CalendarDays className="h-4 w-4 shrink-0 text-ocean-500" />
              {sidebarOpen && <span>Deployments & Shifts</span>}
            </div>
            {sidebarOpen && registeredEventIds.length > 0 && (
              <span className="rounded-full bg-ocean-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ocean-800 dark:bg-ocean-800 dark:text-ocean-200">
                {registeredEventIds.length}
              </span>
            )}
          </button>

          {/* Skills & Emergency Readiness */}
          <button
            onClick={() => setActiveTab("skills")}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "skills"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Skills & Emergency Response"
          >
            <div className="flex items-center gap-3 truncate">
              <ShieldAlert className={cn("h-4 w-4 shrink-0", emergencyReady ? "text-emerald-500 animate-pulse" : "text-ocean-400")} />
              {sidebarOpen && <span>Skills & Rapid Response</span>}
            </div>
            {sidebarOpen && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold",
                  emergencyReady
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                    : "bg-ocean-100 text-ocean-600 dark:bg-ocean-800 dark:text-ocean-400"
                )}
              >
                {emergencyReady ? "ALERT" : "OFF"}
              </span>
            )}
          </button>

          {/* Official Transcript & Certificate */}
          <button
            onClick={() => setActiveTab("transcript")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "transcript"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Service Transcript & Credentials"
          >
            <FileText className="h-4 w-4 shrink-0 text-leaf-500" />
            {sidebarOpen && <span>Official Transcript</span>}
          </button>

          {/* Ambassador Profile */}
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition",
              activeTab === "profile"
                ? "bg-ocean-100 text-ocean-900 dark:bg-ocean-800 dark:text-white shadow-sm"
                : "text-ocean-600 hover:bg-ocean-50 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800/50 dark:hover:text-ocean-100"
            )}
            title="Ambassador Profile Settings"
          >
            <UserCheck className="h-4 w-4 shrink-0 text-ocean-500" />
            {sidebarOpen && <span>Ambassador Profile</span>}
          </button>
        </nav>

        {/* Sidebar Footer: User Info & Back Link */}
        <div className="border-t border-ocean-100 p-3 dark:border-ocean-800">
          <div className="flex items-center gap-3 rounded-xl bg-ocean-50/80 p-2 dark:bg-ocean-800/40">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-700 font-bold text-xs text-white">
              {session.name ? session.name.charAt(0) : "A"}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col truncate leading-tight">
                <span className="font-semibold text-xs text-ocean-950 dark:text-white truncate">
                  {session.name || "Akua Agbavitor"}
                </span>
                <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  {currentTier}
                </span>
              </div>
            )}
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ocean-600 hover:bg-ocean-100 hover:text-ocean-900 dark:text-ocean-400 dark:hover:bg-ocean-800 dark:hover:text-ocean-200"
              title="Return to Public Website"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              {sidebarOpen && <span>Return to Website</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Console Content Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Console Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-ocean-200/80 bg-white px-6 dark:border-ocean-800/80 dark:bg-ocean-900">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-base font-bold text-ocean-950 dark:text-white sm:text-lg">
              {activeTab === "overview" && "Ambassador Command Center"}
              {activeTab === "ledger" && "Service Hours Ledger (Full CRUD)"}
              {activeTab === "events" && "Deployments, Shifts & Field Reflections"}
              {activeTab === "skills" && "Skills Matrix & Rapid Emergency Response"}
              {activeTab === "transcript" && "Official Service Transcript & Credentials"}
              {activeTab === "profile" && "Ambassador Profile & Dispatch Registry"}
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              South Tongu District
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action Button */}
            <button
              onClick={openCreateModal}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Service Hours</span>
            </button>

            {/* Emergency Status Quick Beacon */}
            <button
              onClick={handleToggleEmergencyReady}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition",
                emergencyReady
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-ocean-100 text-ocean-600 border-ocean-200 hover:bg-ocean-200 dark:bg-ocean-800 dark:text-ocean-400 dark:border-ocean-700"
              )}
              title="Toggle Emergency Dispatch Readiness"
            >
              <Radio className={cn("h-3.5 w-3.5", emergencyReady && "text-emerald-600 animate-pulse")} />
              <span className="hidden md:inline">
                {emergencyReady ? "ERRT: Ready" : "ERRT: Standby"}
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </header>

        {/* Scrollable Work Desk */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Filament KPI Stats Widgets */}
              <FilamentStatsOverview stats={statsOverview} />

              {/* Ambassador Tier Banner Card */}
              <div className="rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/20 text-gold-600 dark:text-gold-400 shadow-inner">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white sm:text-xl">
                          {currentTier}
                        </h2>
                        <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-xs font-semibold text-gold-800 border border-gold-300 dark:bg-gold-950/60 dark:text-gold-300 dark:border-gold-800">
                          {approvedHours} Verified Hours
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
                        Official civic recognition accredited by the South Tongu District Assembly & The Citizen Project.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCertModal(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-ocean-200 bg-ocean-50 px-3 py-2 text-xs font-semibold text-ocean-800 hover:bg-ocean-100 dark:border-ocean-700 dark:bg-ocean-800 dark:text-ocean-200 dark:hover:bg-ocean-700 transition"
                    >
                      <Award className="h-4 w-4 text-gold-500" />
                      <span>View Certificate</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("transcript")}
                      className="flex items-center gap-1.5 rounded-lg border border-ocean-200 bg-white px-3 py-2 text-xs font-semibold text-ocean-800 hover:bg-ocean-50 dark:border-ocean-700 dark:bg-ocean-800 dark:text-ocean-200 dark:hover:bg-ocean-700 transition"
                    >
                      <Printer className="h-4 w-4 text-ocean-600 dark:text-ocean-400" />
                      <span>Print Transcript</span>
                    </button>
                    <button
                      onClick={openCreateModal}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Log Hours</span>
                    </button>
                  </div>
                </div>

                {/* Tier Progress Meter */}
                <div className="mt-6 border-t border-ocean-100 pt-5 dark:border-ocean-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ocean-700 dark:text-ocean-300">
                      Next Progression: <strong className="font-semibold text-ocean-950 dark:text-white">{nextTier}</strong>
                    </span>
                    <span className="font-mono text-ocean-600 dark:text-ocean-400">
                      {approvedHours} / {targetHours} hours ({progressPercent}%)
                    </span>
                  </div>
                  <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-ocean-100 dark:bg-ocean-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-leaf-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Alert Banner if Ready */}
              {emergencyReady ? (
                <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-r from-emerald-50/90 via-leaf-50/70 to-white p-5 shadow-sm dark:border-emerald-800/80 dark:from-emerald-950/40 dark:via-ocean-900/60 dark:to-ocean-900">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white animate-pulse">
                        <Radio className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-bold text-emerald-950 dark:text-emerald-100">
                            Emergency Rapid Response Team (ERRT) - ACTIVE DISPATCH
                          </h3>
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                            ON-CALL
                          </span>
                        </div>
                        <p className="text-xs text-emerald-800 dark:text-emerald-300">
                          Target Zone: <strong>{emergencyArea}</strong>. SMS dispatch alerts routed to{" "}
                          <span className="font-mono font-semibold">{emergencyContactPhone}</span>.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("skills")}
                      className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                    >
                      Manage Response Radius
                    </button>
                  </div>
                </div>
              ) : null}

              {/* District Leaderboard & Recent Activity Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* District Leaderboard Standings */}
                <div className="lg:col-span-2 rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
                  <div className="flex items-center justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
                    <div>
                      <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                        South Tongu Ambassador Standings
                      </h3>
                      <p className="text-xs text-ocean-500">Official district volunteer service ranking</p>
                    </div>
                    <Link
                      href="/ambassadors"
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <span>Public Leaderboard</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="mt-4 divide-y divide-ocean-100 dark:divide-ocean-800">
                    {LEADERBOARD_STANDINGS.map((ambassador) => (
                      <div
                        key={ambassador.rank}
                        className={cn(
                          "flex items-center justify-between py-3 px-2 rounded-xl transition",
                          ambassador.isUser
                            ? "bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80"
                            : "hover:bg-ocean-50/50 dark:hover:bg-ocean-800/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold",
                              ambassador.rank === 1
                                ? "bg-gold-400 text-gold-950"
                                : ambassador.rank === 2
                                ? "bg-slate-300 text-slate-800"
                                : ambassador.rank === 3
                                ? "bg-amber-600 text-white"
                                : "bg-ocean-100 text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300"
                            )}
                          >
                            #{ambassador.rank}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-ocean-950 dark:text-white flex items-center gap-1.5">
                              {ambassador.name}
                              {ambassador.isUser && (
                                <span className="rounded bg-emerald-600 px-1 py-0.2 text-[9px] font-mono text-white">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-ocean-500">
                              {ambassador.community} · {ambassador.tier}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          {ambassador.hours} hrs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Deployments Overview */}
                <div className="rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
                  <div className="flex items-center justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
                    <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                      Field Calendar
                    </h3>
                    <button
                      onClick={() => setActiveTab("events")}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      View All
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {events.slice(0, 3).map((evt) => {
                      const isRegistered = registeredEventIds.includes(evt.id);
                      return (
                        <div
                          key={evt.id}
                          className="rounded-xl border border-ocean-100 p-3 hover:border-ocean-200 dark:border-ocean-800 dark:hover:border-ocean-700 transition"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-ocean-500">
                              {formatDate(evt.startDate)}
                            </span>
                            {isRegistered ? (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                ✓ Registered
                              </span>
                            ) : (
                              <span className="text-[10px] text-ocean-400">Open Task</span>
                            )}
                          </div>
                          <h4 className="mt-1 font-display text-xs font-bold text-ocean-950 dark:text-white line-clamp-1">
                            {evt.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-ocean-500 truncate">
                            📍 {evt.location || "Sogakope"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 pt-4 border-t border-ocean-100 dark:border-ocean-800">
                    <button
                      onClick={() => setActiveTab("events")}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ocean-200 py-2 text-xs font-semibold text-ocean-800 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-200 dark:hover:bg-ocean-800 transition"
                    >
                      <span>Manage Shifts & Check-ins</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOURS LEDGER (FULL CRUD) */}
          {activeTab === "ledger" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-ocean-950 dark:text-white">
                    Service Hours Ledger
                  </h2>
                  <p className="text-xs text-ocean-500">
                    Official time-sheet records submitted for South Tongu District Assembly verification.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Log Service Hours</span>
                  </button>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ocean-200 bg-white p-3 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setLedgerFilter("ALL")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      ledgerFilter === "ALL"
                        ? "bg-ocean-900 text-white dark:bg-white dark:text-ocean-950"
                        : "text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
                    )}
                  >
                    All Records ({entries.length})
                  </button>
                  <button
                    onClick={() => setLedgerFilter("APPROVED")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      ledgerFilter === "APPROVED"
                        ? "bg-emerald-600 text-white"
                        : "text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
                    )}
                  >
                    Verified ({entries.filter((e) => e.approved).length})
                  </button>
                  <button
                    onClick={() => setLedgerFilter("PENDING")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      ledgerFilter === "PENDING"
                        ? "bg-amber-600 text-white"
                        : "text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
                    )}
                  >
                    Pending Review ({entries.filter((e) => !e.approved).length})
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-ocean-400" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search by activity, initiative..."
                    className="w-full rounded-lg border border-ocean-200 bg-ocean-50/50 py-1.5 pl-8 pr-3 text-xs placeholder:text-ocean-400 focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800/60 dark:text-white"
                  />
                  {ledgerSearch && (
                    <button
                      onClick={() => setLedgerSearch("")}
                      className="absolute right-2.5 top-2.5 text-ocean-400 hover:text-ocean-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Hours Ledger Table / Cards */}
              <div className="space-y-3">
                {filteredEntries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ocean-200 p-12 text-center dark:border-ocean-800">
                    <Clock className="mx-auto h-8 w-8 text-ocean-400" />
                    <h3 className="mt-3 text-sm font-semibold text-ocean-950 dark:text-white">
                      No hour entries match your criteria
                    </h3>
                    <p className="mt-1 text-xs text-ocean-500">
                      Try adjusting the filter or search query, or log a new service session.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Log Service Hours</span>
                    </button>
                  </div>
                ) : (
                  filteredEntries.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-ocean-200 bg-white p-5 shadow-sm transition hover:border-ocean-300 dark:border-ocean-800 dark:bg-ocean-900 dark:hover:border-ocean-700"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-[280px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                item.approved
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                                  : "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                              )}
                            >
                              {item.approved ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Verified & Accredited</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Pending Coordinator Review</span>
                                </>
                              )}
                            </span>
                            <span className="font-mono text-xs text-ocean-500">
                              Date: {formatDate(item.date)}
                            </span>
                            <span className="rounded bg-ocean-100 px-2 py-0.5 text-[11px] font-medium text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300">
                              {item.initiativeTitle}
                            </span>
                          </div>

                          <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                            {item.description}
                          </h3>

                          {item.fieldNotes && (
                            <p className="text-xs text-ocean-600 dark:text-ocean-400 italic bg-ocean-50/70 dark:bg-ocean-800/40 p-2.5 rounded-xl border border-ocean-100 dark:border-ocean-800">
                              &ldquo;{item.fieldNotes}&rdquo;
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-ocean-500 pt-1">
                            {item.supervisor && (
                              <span>
                                Supervisor: <strong className="text-ocean-700 dark:text-ocean-300">{item.supervisor}</strong>
                              </span>
                            )}
                            {item.approvedBy && (
                              <span>
                                Approved By: <strong className="text-emerald-700 dark:text-emerald-300">{item.approvedBy}</strong> ({formatDate(item.approvedAt || item.date)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Hours Sum & CRUD Action Buttons */}
                        <div className="flex flex-col sm:items-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">
                              {item.hours}h
                            </span>
                            <p className="text-[10px] font-mono text-ocean-400 uppercase tracking-wider">
                              Credit Logged
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal(item)}
                              className="flex items-center gap-1 rounded-lg border border-ocean-200 px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300 dark:hover:bg-ocean-800 transition"
                              title="Edit hours record"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-ocean-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                              title="Void entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Void</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEPLOYMENTS, SHIFTS & REFLECTIONS */}
          {activeTab === "events" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="font-display text-xl font-bold text-ocean-950 dark:text-white">
                  Field Deployments & Shift Management
                </h2>
                <p className="text-xs text-ocean-500">
                  Select your duty shifts, designate field roles, check in at event venues, and submit field reflections.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {events.map((evt) => {
                  const isRegistered = registeredEventIds.includes(evt.id);
                  const config = eventConfigs[evt.id] || {
                    shift: "Morning (07:00 - 11:00)",
                    role: "Ushering & Logistics",
                    checkedIn: false,
                  };

                  return (
                    <div
                      key={evt.id}
                      className={cn(
                        "rounded-2xl border bg-white p-6 shadow-sm transition dark:bg-ocean-900",
                        isRegistered
                          ? "border-emerald-300/80 ring-1 ring-emerald-500/20 dark:border-emerald-800"
                          : "border-ocean-200 dark:border-ocean-800"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-ocean-100 pb-3 dark:border-ocean-800">
                        <span className="font-mono text-xs font-bold text-ocean-500">
                          {formatDate(evt.startDate)}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                            isRegistered
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : "bg-ocean-100 text-ocean-600 dark:bg-ocean-800 dark:text-ocean-400"
                          )}
                        >
                          {isRegistered ? "✓ Active Assignment" : "Open Volunteer Opportunity"}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-base font-bold text-ocean-950 dark:text-white">
                        {evt.title}
                      </h3>
                      <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400 leading-relaxed">
                        {evt.summary}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-ocean-500">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>{evt.location || "South Tongu District Assembly Ground, Sogakope"}</span>
                      </div>

                      {/* Shift & Role Selection (Available when registered) */}
                      {isRegistered ? (
                        <div className="mt-4 space-y-3 rounded-xl bg-ocean-50/70 p-4 dark:bg-ocean-800/40 border border-ocean-100 dark:border-ocean-800">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                                Assigned Shift
                              </label>
                              <select
                                value={config.shift}
                                onChange={(e) =>
                                  handleUpdateEventConfig(
                                    evt.id,
                                    e.target.value as ShiftType,
                                    config.role
                                  )
                                }
                                className="w-full rounded-lg border border-ocean-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                              >
                                <option value="Morning (07:00 - 11:00)">Morning (07:00 - 11:00)</option>
                                <option value="Afternoon (12:00 - 16:00)">Afternoon (12:00 - 16:00)</option>
                                <option value="Full Day (08:00 - 16:00)">Full Day (08:00 - 16:00)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                                Field Role Assignment
                              </label>
                              <select
                                value={config.role}
                                onChange={(e) =>
                                  handleUpdateEventConfig(
                                    evt.id,
                                    config.shift,
                                    e.target.value as RoleType
                                  )
                                }
                                className="w-full rounded-lg border border-ocean-200 bg-white px-2.5 py-1.5 text-xs font-medium focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                              >
                                <option value="Ushering & Logistics">Ushering & Logistics</option>
                                <option value="Translation & Interpretation (Ewe/English)">
                                  Translation (Ewe / English)
                                </option>
                                <option value="Civic Facilitator">Civic Facilitator</option>
                                <option value="First Aid & Field Safety">First Aid & Safety</option>
                              </select>
                            </div>
                          </div>

                          {/* Digital Check-in & Post-Event Reflection */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ocean-200/60 dark:border-ocean-700/60">
                            {config.checkedIn ? (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Checked in at venue ({config.checkInTime})</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEventCheckIn(evt.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span>Check In at Venue</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenReflectionModal(evt.id)}
                              className="flex items-center gap-1 text-xs font-semibold text-ocean-700 hover:text-ocean-900 underline dark:text-ocean-300"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              <span>{config.reflectionNotes ? "Edit Reflection" : "Submit Reflection"}</span>
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Registration Action Buttons */}
                      <div className="mt-4 pt-3 flex items-center justify-between border-t border-ocean-100 dark:border-ocean-800">
                        <span className="text-[11px] text-ocean-500">
                          {isRegistered ? "Status: Roster Confirmed" : "Open for Volunteer Enrollment"}
                        </span>
                        <button
                          onClick={() => handleToggleEventSignup(evt.id)}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                            isRegistered
                              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          )}
                        >
                          {isRegistered ? "Withdraw / Leave Task" : "RSVP to Volunteer"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS MATRIX & EMERGENCY READINESS */}
          {activeTab === "skills" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h2 className="font-display text-xl font-bold text-ocean-950 dark:text-white">
                  Skills Matrix & Rapid Emergency Response
                </h2>
                <p className="text-xs text-ocean-500">
                  Manage your verified volunteer capability badges and rapid incident dispatch standing.
                </p>
              </div>

              {/* Emergency Rapid Response Toggle Banner */}
              <div
                className={cn(
                  "rounded-2xl border p-6 shadow-sm transition",
                  emergencyReady
                    ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-leaf-50/40 to-white dark:border-emerald-800 dark:from-emerald-950/40 dark:via-ocean-900 dark:to-ocean-900"
                    : "border-ocean-200 bg-white dark:border-ocean-800 dark:bg-ocean-900"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        emergencyReady
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 animate-pulse"
                          : "bg-ocean-100 text-ocean-500 dark:bg-ocean-800"
                      )}
                    >
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                          Emergency Rapid Response Team (ERRT)
                        </h3>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-bold font-mono",
                            emergencyReady
                              ? "bg-emerald-600 text-white"
                              : "bg-ocean-200 text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300"
                          )}
                        >
                          {emergencyReady ? "ACTIVATED" : "STANDBY"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400 max-w-xl">
                        When activated, you agree to receive instant automated SMS/voice alerts from the District Assembly
                        during critical situations (floods, market fire relief, emergency sanitation desilting).
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleEmergencyReady}
                    className={cn(
                      "rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition",
                      emergencyReady
                        ? "bg-rose-600 text-white hover:bg-rose-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    {emergencyReady ? "Deactivate Emergency Alert" : "Activate Immediate Readiness"}
                  </button>
                </div>

                {/* Dispatch Parameters */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-ocean-100 pt-5 dark:border-ocean-800">
                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Designated Dispatch Coverage Area
                    </label>
                    <input
                      type="text"
                      value={emergencyArea}
                      onChange={(e) => setEmergencyArea(e.target.value)}
                      placeholder="e.g. Sogakope Central, Dabala, Tefle"
                      className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Emergency Alert SMS Number
                    </label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="+233 24 888 9102"
                      className="w-full rounded-lg border border-ocean-200 bg-white px-3 py-2 text-xs font-mono focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Matrix Inventory */}
              <div className="rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ocean-100 pb-4 dark:border-ocean-800">
                  <div>
                    <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                      Verified Field Competencies
                    </h3>
                    <p className="text-xs text-ocean-500">
                      Skills recorded for matching you to specialized grassroots field tasks.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {skills.length} Endorsed Skills
                  </span>
                </div>

                {/* Skill Badges List */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1.5 rounded-xl border border-ocean-200 bg-ocean-50/70 px-3 py-1.5 text-xs font-semibold text-ocean-800 dark:border-ocean-700 dark:bg-ocean-800/60 dark:text-ocean-200"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 rounded-full p-0.5 text-ocean-400 hover:bg-ocean-200 hover:text-ocean-700 dark:hover:bg-ocean-700"
                        title="Remove skill"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Skill Form */}
                <form onSubmit={handleAddSkill} className="mt-6 flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Add specialized skill (e.g. Drone Piloting, Ewe Sign Language)..."
                    className="flex-1 rounded-lg border border-ocean-200 bg-ocean-50/50 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800/60 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Skill</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL TRANSCRIPT & CERTIFICATE */}
          {activeTab === "transcript" && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-ocean-950 dark:text-white">
                    Official Volunteer Service Transcript
                  </h2>
                  <p className="text-xs text-ocean-500">
                    Accredited multi-page formal credential issued under the seal of South Tongu District.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-gold-300 bg-gold-50 px-3.5 py-2 text-xs font-semibold text-gold-900 hover:bg-gold-100 dark:border-gold-800 dark:bg-gold-950/40 dark:text-gold-300 transition"
                  >
                    <Trophy className="h-4 w-4 text-gold-600" />
                    <span>View Certificate Frame</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Official Transcript</span>
                  </button>
                </div>
              </div>

              {/* Printable Formal Transcript Document Frame */}
              <div className="rounded-2xl border border-ocean-300/80 bg-white p-8 shadow-md dark:border-ocean-700 dark:bg-ocean-900 print:border-none print:shadow-none print:p-0">
                {/* Government / Assembly Header */}
                <div className="border-b-2 border-ocean-900 pb-6 text-center dark:border-white">
                  <p className="font-mono text-xs uppercase tracking-widest text-ocean-600 dark:text-ocean-400">
                    Republic of Ghana · Ministry of Local Government & Rural Development
                  </p>
                  <h1 className="mt-2 font-display text-xl font-extrabold uppercase tracking-tight text-ocean-950 dark:text-white sm:text-2xl">
                    South Tongu District Assembly
                  </h1>
                  <p className="font-display text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Department of Community Development & Civic Engagement
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ocean-500">
                    P.O. Box 24, Sogakope, Volta Region · Ref: STDA/CD/VOL/2026/084
                  </p>
                </div>

                {/* Document Title & Volunteer Summary */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-ocean-100 pb-6 dark:border-ocean-800">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                      Official Record of Voluntary Civic Service
                    </h2>
                    <p className="text-xs text-ocean-600 dark:text-ocean-400">
                      Ambassador Name: <strong className="font-semibold text-ocean-950 dark:text-white">{session.name || "Akua Agbavitor"}</strong>
                    </p>
                    <p className="text-xs text-ocean-600 dark:text-ocean-400">
                      Community: <strong>{profileElectoralArea}</strong> · Registration ID:{" "}
                      <span className="font-mono font-semibold">TCP-VOL-2026-084</span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-ocean-50 p-3 text-right dark:bg-ocean-800/60 border border-ocean-200/80 dark:border-ocean-700">
                    <span className="block text-[10px] font-mono text-ocean-500 uppercase">
                      Total Accredited Hours
                    </span>
                    <span className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">
                      {approvedHours} hrs
                    </span>
                    <span className="block text-[10px] font-semibold text-gold-700 dark:text-gold-300">
                      Rank: {currentTier}
                    </span>
                  </div>
                </div>

                {/* Itemized Transcript Table */}
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-ocean-200 font-semibold text-ocean-700 dark:border-ocean-700 dark:text-ocean-300">
                        <th className="py-2.5 pr-4">Date</th>
                        <th className="py-2.5 pr-4">Initiative / Project</th>
                        <th className="py-2.5 pr-4">Activity Description & Impact</th>
                        <th className="py-2.5 pr-4">Verified By</th>
                        <th className="py-2.5 text-right">Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ocean-100 dark:divide-ocean-800">
                      {entries
                        .filter((e) => e.approved)
                        .map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 pr-4 font-mono text-ocean-600 dark:text-ocean-400">
                              {formatDate(row.date)}
                            </td>
                            <td className="py-3 pr-4 font-semibold text-ocean-950 dark:text-white">
                              {row.initiativeTitle}
                            </td>
                            <td className="py-3 pr-4 text-ocean-700 dark:text-ocean-300 max-w-xs">
                              {row.description}
                            </td>
                            <td className="py-3 pr-4 text-emerald-700 dark:text-emerald-400 font-medium">
                              {row.approvedBy || "District Coordinator"}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-ocean-950 dark:text-white">
                              {row.hours}.0
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-ocean-200 font-bold dark:border-ocean-700">
                        <td colSpan={4} className="py-3 text-right font-semibold text-ocean-900 dark:text-white">
                          Total Accredited Civic Hours:
                        </td>
                        <td className="py-3 text-right font-mono text-sm text-emerald-700 dark:text-emerald-400">
                          {approvedHours}.0 hrs
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Sign-off Seals & Signatures */}
                <div className="mt-12 grid grid-cols-2 gap-8 border-t border-ocean-200/80 pt-8 text-center text-xs dark:border-ocean-700">
                  <div>
                    <p className="font-serif italic text-base text-ocean-950 dark:text-white">Selorm Dzreke</p>
                    <div className="mx-auto mt-1 h-px w-36 bg-ocean-400 dark:bg-ocean-600" />
                    <p className="mt-1 font-semibold text-ocean-800 dark:text-ocean-200">
                      District Coordinator & Civic Director
                    </p>
                    <p className="font-mono text-[10px] text-ocean-500">The Citizen Project · South Tongu</p>
                  </div>

                  <div>
                    <p className="font-serif italic text-base text-ocean-950 dark:text-white">Hon. Emmanuel Dogbe</p>
                    <div className="mx-auto mt-1 h-px w-36 bg-ocean-400 dark:bg-ocean-600" />
                    <p className="mt-1 font-semibold text-ocean-800 dark:text-ocean-200">
                      Presiding Member & Assembly Liaison
                    </p>
                    <p className="font-mono text-[10px] text-ocean-500">South Tongu District Assembly</p>
                  </div>
                </div>

                {/* Assembly Watermark & Security Code */}
                <div className="mt-8 flex items-center justify-between border-t border-ocean-100 pt-4 text-[10px] font-mono text-ocean-400 dark:border-ocean-800">
                  <span>Official Transcript Document · Public Registry Security ID: #GH-STDA-{approvedHours}H</span>
                  <span>Digitally Signed & Certified</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h2 className="font-display text-xl font-bold text-ocean-950 dark:text-white">
                  Ambassador Profile & Dispatch Registry
                </h2>
                <p className="text-xs text-ocean-500">
                  Keep your field contact info, emergency numbers, and equipment sizes up to date for official deployments.
                </p>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm dark:border-ocean-800 dark:bg-ocean-900 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Field Mobile Phone (For Dispatch Calls & SMS)
                    </label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs font-mono focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Primary Electoral Area / Town
                    </label>
                    <select
                      value={profileElectoralArea}
                      onChange={(e) => setProfileElectoralArea(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    >
                      <option value="Sogakope Central">Sogakope Central</option>
                      <option value="Sogakope South">Sogakope South</option>
                      <option value="Tefle">Tefle</option>
                      <option value="Dabala">Dabala</option>
                      <option value="Agorkpo">Agorkpo</option>
                      <option value="Sokpoe">Sokpoe</option>
                      <option value="Fieve">Fieve</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Official Field Vest / T-Shirt Size
                    </label>
                    <select
                      value={profileVestSize}
                      onChange={(e) => setProfileVestSize(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    >
                      <option value="Small (S)">Small (S)</option>
                      <option value="Medium (M)">Medium (M)</option>
                      <option value="Large (L)">Large (L)</option>
                      <option value="Extra Large (XL)">Extra Large (XL)</option>
                      <option value="Double XL (XXL)">Double XL (XXL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                      Emergency Contact Person & Relation
                    </label>
                    <input
                      type="text"
                      value={profileEmergencyName}
                      onChange={(e) => setProfileEmergencyName(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profileEmergencyContact}
                    onChange={(e) => setProfileEmergencyContact(e.target.value)}
                    className="w-full max-w-sm rounded-lg border border-ocean-200 px-3 py-2 text-xs font-mono focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Ambassador Civic Bio & Motivation
                  </label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* CREATE MODAL: LOG SERVICE HOURS */}
      {showLogModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowLogModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <PlusCircle className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                  Log Volunteer Service Hours
                </h3>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="rounded-lg p-1 text-ocean-400 hover:bg-ocean-100 hover:text-ocean-700 dark:hover:bg-ocean-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Activity Title & Key Actions *
                </label>
                <input
                  required
                  placeholder="e.g. Conducted basic civic rights session with JHS learners"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Associated Project / Initiative *
                </label>
                <select
                  value={formInitiative}
                  onChange={(e) => setFormInitiative(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                >
                  {(activeInitiatives.length > 0 ? activeInitiatives : initiatives).map((i) => (
                    <option key={i.id} value={i.title}>
                      {i.title}
                    </option>
                  ))}
                  <option value="General District Voluntary Service">
                    General District Voluntary Service
                  </option>
                  <option value="Emergency Flood Relief Operation">
                    Emergency Flood Relief Operation
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Hours Served *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs font-mono focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Date Completed *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Field Supervisor / Coordinator Name
                </label>
                <input
                  placeholder="e.g. Mr. Kwaku Baah / Assemblyman Gakpetor"
                  value={formSupervisor}
                  onChange={(e) => setFormSupervisor(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Field Reflection / Impact Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly note outcomes, participant count, or community response..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL: EDIT SERVICE HOURS ENTRY */}
      {showEditModal && selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-100 text-ocean-700 dark:bg-ocean-800 dark:text-ocean-300">
                  <Edit2 className="h-4 w-4" />
                </div>
                <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                  Edit Hours Record
                </h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1 text-ocean-400 hover:bg-ocean-100 hover:text-ocean-700 dark:hover:bg-ocean-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEntry} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Activity Title & Key Actions *
                </label>
                <input
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Associated Project / Initiative *
                </label>
                <select
                  value={formInitiative}
                  onChange={(e) => setFormInitiative(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                >
                  {(activeInitiatives.length > 0 ? activeInitiatives : initiatives).map((i) => (
                    <option key={i.id} value={i.title}>
                      {i.title}
                    </option>
                  ))}
                  <option value="General District Voluntary Service">
                    General District Voluntary Service
                  </option>
                  <option value="Emergency Flood Relief Operation">
                    Emergency Flood Relief Operation
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Hours Served *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs font-mono focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                    Date Completed *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Field Supervisor / Coordinator Name
                </label>
                <input
                  value={formSupervisor}
                  onChange={(e) => setFormSupervisor(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Field Reflection / Impact Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / VOID MODAL */}
      {showDeleteModal && selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/60 dark:bg-ocean-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                Void Hours Log Record?
              </h3>
            </div>

            <p className="mt-3 text-xs text-ocean-600 dark:text-ocean-400 leading-relaxed">
              Are you sure you want to void this record of{" "}
              <strong className="text-ocean-950 dark:text-white">{selectedEntry.hours} hours</strong> for{" "}
              <span className="font-semibold">&ldquo;{selectedEntry.description}&rdquo;</span>? This will remove the entry from
              your transcript and recalculate your ambassador standing.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400 dark:hover:bg-ocean-800"
              >
                Keep Record
              </button>
              <button
                type="button"
                onClick={handleDeleteEntry}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Yes, Void Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST-EVENT FIELD REFLECTION MODAL */}
      {showReflectionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowReflectionModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                Submit Field Reflection Notes
              </h3>
              <button
                onClick={() => setShowReflectionModal(false)}
                className="rounded-lg p-1 text-ocean-400 hover:bg-ocean-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReflection} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1">
                  Field Observations, Citizen Turnout & Challenges
                </label>
                <textarea
                  rows={4}
                  required
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="e.g. Turnout was strong in Sogakope South. High demand for youth voter registration guidance. Recommended to provide more water points next time."
                  className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-xs focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AMBASSADOR CERTIFICATE PREVIEW MODAL */}
      {showCertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/70 p-4 backdrop-blur-sm"
          onClick={() => setShowCertModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border-4 border-double border-gold-400/80 bg-gradient-to-b from-white via-amber-50/20 to-white p-8 shadow-2xl dark:from-ocean-900 dark:via-ocean-950 dark:to-ocean-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <span className="font-mono text-xs uppercase tracking-widest text-gold-700 dark:text-gold-400 font-bold">
                Official Credential Preview
              </span>
              <button
                onClick={() => setShowCertModal(false)}
                className="rounded-full p-1 text-ocean-500 hover:bg-ocean-100 dark:hover:bg-ocean-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Certificate Frame Inner */}
            <div className="my-6 rounded-2xl border-2 border-gold-300/60 p-8 text-center bg-white/60 dark:bg-ocean-950/60 shadow-inner">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/20 text-gold-600 dark:text-gold-400 mb-4">
                <Shield className="h-7 w-7" />
              </div>

              <p className="font-mono text-xs uppercase tracking-widest text-ocean-600 dark:text-ocean-400">
                The Citizen Project · South Tongu District
              </p>

              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ocean-950 dark:text-white sm:text-3xl">
                Certificate of Civic Ambassador Recognition
              </h2>

              <p className="mt-4 text-xs italic text-ocean-600 dark:text-ocean-400">
                This certifies that
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-gold-700 dark:text-gold-400 underline decoration-gold-300 decoration-1 underline-offset-8">
                {session.name || "Akua Agbavitor"}
              </p>

              <p className="mx-auto mt-4 max-w-lg text-xs leading-relaxed text-ocean-700 dark:text-ocean-300">
                has demonstrated exemplary dedication to grassroots democratic accountability and community development across South Tongu District, having completed{" "}
                <strong className="font-mono text-ocean-950 dark:text-white">{approvedHours} verified hours</strong>{" "}
                of voluntary civic service and attaining the prestigious status of{" "}
                <strong className="text-ocean-950 dark:text-white">{currentTier}</strong>.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-8 border-t border-ocean-200/60 pt-6 text-xs text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
                <div>
                  <p className="font-serif italic text-base text-ocean-800 dark:text-ocean-200">Selorm Dzreke</p>
                  <div className="mx-auto mt-1 h-px w-28 bg-ocean-300 dark:bg-ocean-700" />
                  <p className="mt-1 font-mono text-[10px]">District Coordinator · South Tongu</p>
                </div>
                <div>
                  <p className="font-serif italic text-base text-ocean-800 dark:text-ocean-200">A. Mensah-Bonsu</p>
                  <div className="mx-auto mt-1 h-px w-28 bg-ocean-300 dark:bg-ocean-700" />
                  <p className="mt-1 font-mono text-[10px]">Assembly Liaison · Sogakope</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-[10px] font-mono text-ocean-400 border-t border-ocean-100 pt-3 dark:border-ocean-800">
                <span>Certificate Ref: TCP-AMB-{approvedHours}H-2026</span>
                <span>Verified in Public Ledger</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 dark:text-ocean-400"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
