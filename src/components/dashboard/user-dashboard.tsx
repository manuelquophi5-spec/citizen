"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Bookmark,
  AlertCircle,
  ArrowRight,
  MapPin,
  PlusCircle,
  Receipt,
  Printer,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Home,
  UserCheck,
  LogOut,
  Menu,
  Bell,
  Search,
  Check,
  FileText,
  AlertTriangle,
  Phone,
  Mail,
  Edit2,
  Trash2,
  Vote,
  RefreshCw,
  CreditCard,
  Target,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import type { LocalSession } from "@/lib/local-session";
import { clearSession, setSession, getSession } from "@/lib/local-session";
import { initiatives, getInitiativeBySlug, type SurveyReport, type PriorityLevel, type UrgencyLevel, type SurveyStatus } from "@/lib/mock-data";
import {
  getLocalReports,
  addLocalReport,
  updateLocalReport,
  deleteLocalReport,
  generateLocalReportId,
  REPORTS_CHANGED_EVENT,
  type LocalSurveyReport,
} from "@/lib/local-reports";
import {
  getReportsAction,
  createReportAction,
  deleteReportAction,
  updateReportStatusAction,
} from "@/app/actions/reports";
import { getDonationHistoryAction } from "@/app/actions/donations";
import {
  getPriorityVotesAction,
  getPriorityVoteCountsAction,
  castPriorityVoteAction,
} from "@/app/actions/votes";
import type { ReportRow } from "@/types/database";
import { getFavoriteSlugs, toggleFavoriteSlug } from "@/lib/local-favorites";
import { formatGHS, formatDate, percent } from "@/lib/utils";
import { FilamentStatsOverview, type FilamentStat } from "./filament/filament-stats";
import { FilamentBadge } from "./filament/filament-badge";
import { ThemeToggle } from "../layout/theme-toggle";

function convertReportRowToLocal(r: ReportRow): LocalSurveyReport {
  const loc = (typeof r.location === "object" && r.location !== null ? r.location : {}) as Record<string, any>;
  const community = loc.community || "Sogakope";
  const town = loc.town || "South Tongu";
  let lat: number | null = null;
  let lng: number | null = null;
  if (loc.gps && typeof loc.gps === "string") {
    const parts = loc.gps.split(",").map((s: string) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0];
      lng = parts[1];
    }
  }
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    urgency: r.priority === "HIGH" ? "HIGH" : r.priority === "LOW" ? "LOW" : "MEDIUM",
    priority: (r.priority as any) || "MEDIUM",
    community,
    town,
    description: r.description,
    reporterName: r.reporter_name,
    phone: r.reporter_phone,
    email: r.reporter_email,
    occupation: null,
    latitude: lat ?? 5.998,
    longitude: lng ?? 0.589,
    suggestedSolution: r.admin_notes || r.official_feedback || null,
    anonymous: !r.reporter_name,
    status: (r.status === "DISPATCHED" ? "IN_PROGRESS" : r.status) as any,
    createdAt: new Date(r.created_at),
    source: "local",
  };
}

export type CitizenTab = "overview" | "issues" | "donations" | "favorites" | "polls" | "profile";

export type DonationRecord = {
  id: string;
  initiativeSlug?: string;
  amount: number;
  date: string | Date;
  method?: string;
  recurring?: boolean;
  ref?: string;
  donorName?: string;
  donorEmail?: string;
};

const SEED_DONATIONS: DonationRecord[] = [
  {
    id: "sample-1",
    initiativeSlug: "global-citizenship-civic-education-programme",
    amount: 400,
    date: "2026-08-01",
    method: "Paystack (MTN MoMo)",
    ref: "pstk_live_883192014",
    donorName: "Kofi Mensah",
  },
  {
    id: "sample-2",
    initiativeSlug: "clean-communities-initiative",
    amount: 50,
    date: "2026-07-01",
    method: "Paystack (Telecel MoMo)",
    recurring: true,
    ref: "pstk_live_772910384",
    donorName: "Kofi Mensah",
  },
];

type RecurringPledge = {
  id: string;
  initiativeSlug?: string;
  amount: number;
  frequency: "MONTHLY" | "QUARTERLY";
  provider: "MTN MoMo" | "Telecel Cash" | "AT Money" | "Card";
  phone: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  nextDeduction: string;
};

const DEFAULT_PLEDGE: RecurringPledge = {
  id: "pledge-01",
  initiativeSlug: "clean-communities-initiative",
  amount: 50,
  frequency: "MONTHLY",
  provider: "MTN MoMo",
  phone: "+233 24 555 0192",
  status: "ACTIVE",
  nextDeduction: "2026-10-01",
};

const POLL_OPTIONS = [
  { id: "opt-1", title: "Agorkpo CHPS Compound Maternity Wing Expansion", votes: 412, category: "Healthcare" },
  { id: "opt-2", title: "Sogakope Waterfront Storm Drain Desilting & Culvert Upgrade", votes: 356, category: "Sanitation" },
  { id: "opt-3", title: "Dabala Market Pavement & Solar High-Mast Lighting", votes: 289, category: "Commerce" },
  { id: "opt-4", title: "South Tongu Youth Innovation & Basic Coding Hub", votes: 245, category: "Youth & ICT" },
];

export function UserDashboard({
  session: initialSession,
  favoriteSlugs: initialFavoriteSlugs,
}: {
  session: LocalSession;
  favoriteSlugs: string[];
}) {
  const router = useRouter();
  const [session, setSessionState] = useState<LocalSession>(initialSession);
  const [activeTab, setActiveTab] = useState<CitizenTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile state
  const [residentName, setResidentName] = useState(session.name || "Kofi Mensah");
  const [residentEmail, setResidentEmail] = useState(session.email || "citizen@thecitizenproject.org");
  const [residentPhone, setResidentPhone] = useState("+233 24 555 0192");
  const [residentArea, setResidentArea] = useState("Sogakope Central");
  const [residentCommChannel, setResidentCommChannel] = useState("SMS & WhatsApp");
  const [residentPin, setResidentPin] = useState("••••");

  // Notifications Popover
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications] = useState([
    { id: "notif-1", title: "Works Order Dispatched", time: "2h ago", read: false, desc: "District Works team assigned to your Dabala culvert inquiry." },
    { id: "notif-2", title: "Monthly Contribution Verified", time: "1d ago", read: false, desc: "GHS 50 MoMo contribution credited to Clean Communities." },
    { id: "notif-3", title: "New Priority Poll Live", time: "3d ago", read: true, desc: "South Tongu Q4 Participatory Budgeting ballot opened for voting." },
  ]);

  // Reports state (CRUD + Stepper)
  const [reports, setReports] = useState<LocalSurveyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<LocalSurveyReport | null>(null);
  const [newReportModalOpen, setNewReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<LocalSurveyReport | null>(null);
  const [withdrawingReportId, setWithdrawingReportId] = useState<string | null>(null);

  // New report form state
  const [repTitle, setRepTitle] = useState("");
  const [repCategory, setRepCategory] = useState("roads");
  const [repUrgency, setRepUrgency] = useState<UrgencyLevel>("HIGH");
  const [repCommunity, setRepCommunity] = useState("Sogakope");
  const [repTown, setRepTown] = useState("Central Market Square");
  const [repDesc, setRepDesc] = useState("");
  const [repPhone, setRepPhone] = useState(residentPhone);

  // Edit report form state
  const [editRepTitle, setEditRepTitle] = useState("");
  const [editRepCategory, setEditRepCategory] = useState("roads");
  const [editRepUrgency, setEditRepUrgency] = useState<UrgencyLevel>("MEDIUM");
  const [editRepTown, setEditRepTown] = useState("");
  const [editRepDesc, setEditRepDesc] = useState("");
  const [editRepPhone, setEditRepPhone] = useState("");

  // Donations state
  const [donationsList, setDonationsList] = useState<DonationRecord[]>(SEED_DONATIONS);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationRecord | null>(null);
  const [showTaxStatementModal, setShowTaxStatementModal] = useState(false);

  // Recurring Pledge state
  const [recurringPledge, setRecurringPledge] = useState<RecurringPledge>(DEFAULT_PLEDGE);
  const [editPledgeModalOpen, setEditPledgeModalOpen] = useState(false);
  const [pledgeAmountInput, setPledgeAmountInput] = useState(50);
  const [pledgeProviderInput, setPledgeProviderInput] = useState<"MTN MoMo" | "Telecel Cash" | "AT Money" | "Card">("MTN MoMo");

  // Favorites state & targets (CRUD)
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>(initialFavoriteSlugs);
  const [initiativeTargets, setInitiativeTargets] = useState<Record<string, number>>({
    "youth-skills-livelihood-initiative": 500,
    "clean-communities-initiative": 250,
  });
  const [editingTargetSlug, setEditingTargetSlug] = useState<string | null>(null);
  const [newTargetAmount, setNewTargetAmount] = useState(500);
  const [addFavoriteModalOpen, setAddFavoriteModalOpen] = useState(false);

  // Polls state
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({
    "opt-1": 412,
    "opt-2": 356,
    "opt-3": 289,
    "opt-4": 245,
  });
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";

  const fetchLiveUserData = useCallback(async () => {
    try {
      // 1. Live reports
      const reportsRes = await getReportsAction(session.userId ? { userId: session.userId } : undefined);
      if (reportsRes.success && reportsRes.data) {
        setReports(reportsRes.data.map(convertReportRowToLocal));
      }

      // 2. Live donations
      const donRes = await getDonationHistoryAction(session.userId ? { userId: session.userId } : undefined);
      if (donRes.success && donRes.data) {
        const mappedDonations: DonationRecord[] = donRes.data.map((d) => ({
          id: d.id,
          initiativeSlug: d.initiative_id || undefined,
          amount: Number(d.amount),
          date: d.created_at,
          method: d.payment_method || undefined,
          recurring: d.frequency !== "ONE_TIME",
          ref: d.reference || undefined,
          donorName: d.donor_name || undefined,
          donorEmail: d.donor_email,
        }));
        setDonationsList(mappedDonations);
      }

      // 3. Live votes & tallies
      const countsRes = await getPriorityVoteCountsAction();
      if (countsRes.success && countsRes.data) {
        const tallies: Record<string, number> = {};
        POLL_OPTIONS.forEach((opt) => {
          tallies[opt.id] = countsRes.data?.[opt.title] ?? opt.votes;
        });
        setPollVotes(tallies);
      }

      if (session.userId) {
        const userVotesRes = await getPriorityVotesAction(session.userId);
        if (userVotesRes.success && userVotesRes.data && userVotesRes.data.length > 0) {
          const matchOpt = POLL_OPTIONS.find((o) => o.title === userVotesRes.data?.[0]?.project_name);
          if (matchOpt) {
            setUserVotedOption(matchOpt.id);
          }
        }
      }
    } catch (err) {
      console.warn("Could not fetch live user dashboard data:", err);
    }
  }, [session.userId]);

  // Load initial data
  useEffect(() => {
    if (isLive) {
      fetchLiveUserData();
    } else {
      try {
        setReports(getLocalReports());
        const rawDonations = window.localStorage.getItem("tcp:local-donations");
        if (rawDonations) {
          setDonationsList([...JSON.parse(rawDonations), ...SEED_DONATIONS]);
        } else {
          setDonationsList(SEED_DONATIONS);
        }
        const rawVote = window.localStorage.getItem("tcp:user-poll-vote");
        if (rawVote) setUserVotedOption(rawVote);
      } catch {}
    }

    try {
      const rawProfile = window.localStorage.getItem("tcp:citizen-profile");
      if (rawProfile) {
        const p = JSON.parse(rawProfile);
        if (p.name) setResidentName(p.name);
        if (p.email) setResidentEmail(p.email);
        if (p.phone) setResidentPhone(p.phone);
        if (p.area) setResidentArea(p.area);
        if (p.commChannel) setResidentCommChannel(p.commChannel);
      }

      const rawPledge = window.localStorage.getItem("tcp:user-recurring-pledge");
      if (rawPledge) setRecurringPledge(JSON.parse(rawPledge));

      const savedFavorites = getFavoriteSlugs();
      if (savedFavorites.length > 0) setFavoriteSlugs(savedFavorites);

      const rawTargets = window.localStorage.getItem("tcp:user-initiative-targets");
      if (rawTargets) setInitiativeTargets(JSON.parse(rawTargets));
    } catch {}

    const handleSyncReports = () => {
      if (isLive) {
        fetchLiveUserData();
      } else {
        setReports(getLocalReports());
      }
    };

    window.addEventListener(REPORTS_CHANGED_EVENT, handleSyncReports);
    window.addEventListener("tcp:admin-issue-statuses-changed", handleSyncReports);

    return () => {
      window.removeEventListener(REPORTS_CHANGED_EVENT, handleSyncReports);
      window.removeEventListener("tcp:admin-issue-statuses-changed", handleSyncReports);
    };
  }, [isLive, fetchLiveUserData]);

  const totalDonated = donationsList.reduce((sum, d) => sum + d.amount, 0);
  const resolvedReportsCount = reports.filter((r) => r.status === "RESOLVED").length;
  const activeReportsCount = reports.filter((r) => r.status !== "RESOLVED").length;

  const citizenStats: FilamentStat[] = [
    {
      id: "stat-donations",
      label: "Total Contributions",
      value: formatGHS(totalDonated),
      description: "Paystack verified",
      descriptionIcon: "up",
      chart: [50, 100, 150, 250, 450],
      chartTone: "amber",
    },
    {
      id: "stat-reports",
      label: "Civic Reports Filed",
      value: `${reports.length} Reports`,
      description: `${resolvedReportsCount} verified resolved`,
      descriptionIcon: "up",
      chart: [0, 1, 2, reports.length],
      chartTone: "emerald",
    },
    {
      id: "stat-favorites",
      label: "Watchlist Initiatives",
      value: `${favoriteSlugs.length} Projects`,
      description: "Monitored community targets",
      descriptionIcon: "neutral",
      chart: [1, 2, 2, favoriteSlugs.length],
      chartTone: "sky",
    },
    {
      id: "stat-polls",
      label: "Civic Ballots Cast",
      value: userVotedOption ? "1 Vote Active" : "No Ballot Cast",
      description: "Participatory budgeting",
      descriptionIcon: "up",
      chart: [0, 1, 1, 1],
      chartTone: "emerald",
    },
  ];

  // Report CRUD handlers
  // Report CRUD handlers
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repTitle.trim() || !repDesc.trim()) return;

    if (isLive) {
      try {
        const res = await createReportAction({
          title: repTitle.trim(),
          category: repCategory,
          description: repDesc.trim(),
          user_id: session.userId || null,
          priority: repUrgency === "CRITICAL" || repUrgency === "HIGH" ? "HIGH" : "MEDIUM",
          status: "SUBMITTED",
          reporter_name: residentName,
          reporter_phone: repPhone || residentPhone,
          reporter_email: residentEmail,
          location: { community: repCommunity, town: repTown },
        });
        if (res.success && res.data) {
          const converted = convertReportRowToLocal(res.data);
          setReports((prev) => [converted, ...prev]);
        }
      } catch (err) {
        console.warn("Failed to create report live:", err);
      }
    } else {
      const newRep = addLocalReport({
        id: generateLocalReportId(),
        title: repTitle.trim(),
        category: repCategory,
        urgency: repUrgency,
        priority: repUrgency === "CRITICAL" ? "HIGH" : repUrgency === "HIGH" ? "HIGH" : "MEDIUM",
        community: repCommunity,
        town: repTown,
        description: repDesc.trim(),
        reporterName: residentName,
        phone: repPhone || residentPhone,
        occupation: null,
        email: residentEmail,
        latitude: 5.998,
        longitude: 0.589,
        suggestedSolution: null,
        anonymous: false,
        status: "SUBMITTED",
        createdAt: new Date(),
      });
      setReports(getLocalReports());
    }

    setNewReportModalOpen(false);
    setRepTitle("");
    setRepDesc("");
    showToast(`Filed civic report: "${repTitle.trim()}"`);
  };

  const handleOpenEditReport = (rep: LocalSurveyReport) => {
    setEditingReport(rep);
    setEditRepTitle(rep.title);
    setEditRepCategory(rep.category);
    setEditRepUrgency(rep.urgency);
    setEditRepTown(rep.town);
    setEditRepDesc(rep.description);
    setEditRepPhone(rep.phone || residentPhone);
  };

  const handleSaveEditReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    const updates = {
      title: editRepTitle,
      category: editRepCategory,
      urgency: editRepUrgency,
      town: editRepTown,
      description: editRepDesc,
      phone: editRepPhone,
    };

    updateLocalReport(editingReport.id, updates);
    setReports(getLocalReports());
    if (selectedReport && selectedReport.id === editingReport.id) {
      setSelectedReport({ ...selectedReport, ...updates });
    }
    setEditingReport(null);
    showToast(`Updated civic report details for "${editRepTitle}"`);
  };

  const handleWithdrawReport = async (id: string) => {
    if (isLive) {
      try {
        await deleteReportAction(id);
      } catch (err) {
        console.warn("Failed to delete report live:", err);
      }
    } else {
      deleteLocalReport(id);
    }
    setReports((prev) => prev.filter((r) => r.id !== id));
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport(null);
    }
    setWithdrawingReportId(null);
    showToast("Civic report withdrawn and dismissed.");
  };

  // Recurring Pledge Handlers
  const handleSavePledge = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RecurringPledge = {
      ...recurringPledge,
      amount: Number(pledgeAmountInput),
      provider: pledgeProviderInput,
      status: "ACTIVE",
    };
    setRecurringPledge(updated);
    try {
      window.localStorage.setItem("tcp:user-recurring-pledge", JSON.stringify(updated));
    } catch {}
    setEditPledgeModalOpen(false);
    showToast(`Updated recurring pledge to ${formatGHS(updated.amount)}/mo`);
  };

  const handleTogglePledgeStatus = () => {
    const nextStatus = recurringPledge.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const updated: RecurringPledge = { ...recurringPledge, status: nextStatus };
    setRecurringPledge(updated);
    try {
      window.localStorage.setItem("tcp:user-recurring-pledge", JSON.stringify(updated));
    } catch {}
    showToast(`Recurring monthly pledge is now ${nextStatus}`);
  };

  const handleCancelPledge = () => {
    const updated: RecurringPledge = { ...recurringPledge, status: "CANCELLED" };
    setRecurringPledge(updated);
    try {
      window.localStorage.setItem("tcp:user-recurring-pledge", JSON.stringify(updated));
    } catch {}
    showToast("Recurring pledge cancelled.");
  };

  // Favorites & Target Handlers
  const handleRemoveFavorite = (slug: string) => {
    toggleFavoriteSlug(slug);
    const next = getFavoriteSlugs();
    setFavoriteSlugs(next);
    showToast("Initiative removed from watchlist.");
  };

  const handleAddFavorite = (slug: string) => {
    toggleFavoriteSlug(slug);
    const next = getFavoriteSlugs();
    setFavoriteSlugs(next);
    setAddFavoriteModalOpen(false);
    showToast("Initiative added to watchlist.");
  };

  const handleSaveTargetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetSlug) return;
    const nextTargets = { ...initiativeTargets, [editingTargetSlug]: Number(newTargetAmount) };
    setInitiativeTargets(nextTargets);
    try {
      window.localStorage.setItem("tcp:user-initiative-targets", JSON.stringify(nextTargets));
    } catch {}
    setEditingTargetSlug(null);
    showToast(`Personal giving goal set to ${formatGHS(newTargetAmount)}`);
  };

  // Poll Vote Handler
  const handleCastVote = async (optId: string) => {
    if (userVotedOption === optId) return;
    const nextVotes = { ...pollVotes, [optId]: (pollVotes[optId] || 0) + 1 };
    if (userVotedOption && pollVotes[userVotedOption]) {
      nextVotes[userVotedOption] = Math.max(0, pollVotes[userVotedOption] - 1);
    }
    setPollVotes(nextVotes);
    setUserVotedOption(optId);
    try {
      window.localStorage.setItem("tcp:user-poll-vote", optId);
    } catch {}

    const selected = POLL_OPTIONS.find((o) => o.id === optId);
    if (isLive && selected && session.userId) {
      try {
        await castPriorityVoteAction({
          user_id: session.userId,
          project_name: selected.title,
          category: selected.category,
        });
      } catch (err) {
        console.warn("Failed to cast priority vote live:", err);
      }
    }

    showToast("Your participatory budgeting vote has been recorded!");
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      name: residentName,
      email: residentEmail,
      phone: residentPhone,
      area: residentArea,
      commChannel: residentCommChannel,
    };
    try {
      window.localStorage.setItem("tcp:citizen-profile", JSON.stringify(updatedProfile));
      setSession({
        name: residentName,
        email: residentEmail,
        role: "user",
      });
      setSessionState(
        getSession() || {
          name: residentName,
          email: residentEmail,
          role: "user",
          loggedInAt: new Date().toISOString(),
        }
      );
    } catch {}
    showToast("Resident profile preferences saved!");
  };

  const handleLogout = () => {
    clearSession();
    router.push("/user/login");
  };

  // Stepper helper
  const getStepperIndex = (status: SurveyStatus) => {
    switch (status) {
      case "SUBMITTED": return 0;
      case "IN_REVIEW": return 1;
      case "IN_PROGRESS": return 3;
      case "RESOLVED": return 4;
      default: return 0;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ocean-50/50 text-ocean-900 dark:bg-[#070d18] dark:text-ocean-100 font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-ocean-950 px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-ocean-800 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 1. FILAMENT-STYLE SIDEBAR NAVIGATION */}
      {/* ----------------------------------------------------------------- */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between border-r border-ocean-200/80 bg-white dark:border-ocean-800 dark:bg-[#0c1322] z-30`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-ocean-200/80 dark:border-ocean-800">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ocean-800 text-white font-bold text-xs shadow-sm">
                TCP
              </div>
              {sidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-xs font-bold tracking-tight text-ocean-950 dark:text-white truncate">
                    Citizen Portal
                  </span>
                  <span className="text-[10px] font-mono text-ocean-500 uppercase tracking-wider">
                    South Tongu District
                  </span>
                </div>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-ocean-500 hover:bg-ocean-100 hover:text-ocean-900 dark:hover:bg-ocean-800 dark:hover:text-white"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Mini Badge */}
          {sidebarOpen && (
            <div className="p-3 mx-3 my-3 rounded-xl border border-ocean-100 bg-ocean-50/50 dark:border-ocean-800/80 dark:bg-ocean-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
                  {session.name ? session.name.charAt(0) : "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ocean-950 dark:text-white">
                    {residentName}
                  </p>
                  <p className="truncate text-[10px] text-ocean-500 font-mono">
                    {residentArea}
                  </p>
                </div>
                <FilamentBadge color="info">CITIZEN</FilamentBadge>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-2 space-y-1">
            {[
              { id: "overview", label: "Overview & Metrics", icon: Home },
              { id: "issues", label: "My Civic Reports", icon: AlertCircle, badge: activeReportsCount > 0 ? `${activeReportsCount} Active` : undefined, badgeTone: "warning" as const },
              { id: "donations", label: "Giving & Pledges", icon: Receipt },
              { id: "favorites", label: "Watchlist Projects", icon: Heart, badge: `${favoriteSlugs.length}` },
              { id: "polls", label: "Priority Ballots", icon: Vote, badge: userVotedOption ? "Voted" : "New", badgeTone: userVotedOption ? "success" as const : "info" as const },
              { id: "profile", label: "Resident Settings", icon: SlidersHorizontal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as CitizenTab)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                    isActive
                      ? "bg-amber-500 text-ocean-950 font-bold shadow-xs"
                      : "text-ocean-700 hover:bg-ocean-100 hover:text-ocean-950 dark:text-ocean-300 dark:hover:bg-ocean-900/60 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{tab.label}</span>}
                  </div>
                  {sidebarOpen && tab.badge && (
                    <FilamentBadge color={tab.badgeTone || "gray"}>
                      {tab.badge}
                    </FilamentBadge>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-ocean-200/80 dark:border-ocean-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ocean-600 hover:bg-ocean-100 hover:text-ocean-950 dark:text-ocean-400 dark:hover:bg-ocean-900 dark:hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            {sidebarOpen && <span>Return to Website</span>}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------------------- */}
      {/* 2. MAIN CONSOLE WORKSPACE */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 shrink-0 flex items-center justify-between border-b border-ocean-200/80 bg-white px-6 dark:border-ocean-800 dark:bg-[#0c1322] z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ocean-500 uppercase tracking-wider">Citizen Portal</span>
            <span className="text-ocean-300 dark:text-ocean-700">/</span>
            <h1 className="font-display text-base font-bold text-ocean-950 dark:text-white capitalize">
              {activeTab === "overview" && "Resident Overview & Civic Activity"}
              {activeTab === "issues" && "My Civic Reports & Works Tracker"}
              {activeTab === "donations" && "Contributions & Recurring Pledges"}
              {activeTab === "favorites" && "Watchlist Initiatives & Targets"}
              {activeTab === "polls" && "Participatory Budgeting Priority Poll"}
              {activeTab === "profile" && "Citizen Profile & Resident Settings"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick action buttons */}
            <button
              type="button"
              onClick={() => setNewReportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" /> File Report
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-lg border border-ocean-200 p-2 text-ocean-600 hover:bg-ocean-50 dark:border-ocean-800 dark:text-ocean-400 dark:hover:bg-ocean-900"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-ocean-200 bg-white p-4 shadow-xl dark:border-ocean-800 dark:bg-ocean-950 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-ocean-100 pb-2 dark:border-ocean-800">
                    <span className="font-display text-xs font-bold text-ocean-950 dark:text-white">
                      Community Notifications
                    </span>
                    <span className="text-[10px] font-mono text-ocean-500">3 Alerts</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="rounded-lg p-2 hover:bg-ocean-50 dark:hover:bg-ocean-900/60 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ocean-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-ocean-400 font-mono">{n.time}</span>
                        </div>
                        <p className="mt-0.5 text-ocean-600 dark:text-ocean-300 text-[11px] leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ThemeToggle />

            <div className="h-6 w-px bg-ocean-200 dark:bg-ocean-800" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ocean-800 text-white font-bold text-xs">
                {residentName.charAt(0)}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-ocean-900 dark:text-white">
                {residentName}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <FilamentStatsOverview stats={citizenStats} />

              {/* Quick Action Shortcuts Banner */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div
                  onClick={() => setNewReportModalOpen(true)}
                  className="cursor-pointer rounded-2xl border border-amber-200 bg-amber-50/50 p-5 transition hover:shadow-md dark:border-amber-900/40 dark:bg-amber-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-ocean-950">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-ocean-950 dark:text-white">
                    Report a Neighborhood Issue
                  </h3>
                  <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
                    Submit water pipes, broken culverts, or road potholes in South Tongu.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("donations")}
                  className="cursor-pointer rounded-2xl border border-sky-200 bg-sky-50/50 p-5 transition hover:shadow-md dark:border-sky-900/40 dark:bg-sky-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-sky-600" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-ocean-950 dark:text-white">
                    Manage Contributions &amp; Receipts
                  </h3>
                  <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
                    View official Paystack receipts and manage monthly MoMo pledges.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("polls")}
                  className="cursor-pointer rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 transition hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-950/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <Vote className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-ocean-950 dark:text-white">
                    Participatory Budgeting Vote
                  </h3>
                  <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400">
                    Cast your resident ballot for 2026 priority infrastructure.
                  </p>
                </div>
              </div>

              {/* Recent Civic Issues preview & Watchlist preview */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Reports summary */}
                <div className="rounded-2xl border border-ocean-200/80 bg-white p-5 dark:border-ocean-800 dark:bg-[#0c1322]">
                  <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
                    <h3 className="font-display text-sm font-bold text-ocean-950 dark:text-white">
                      My Reported Incidents ({reports.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("issues")}
                      className="text-xs font-semibold text-amber-600 hover:underline"
                    >
                      View All &rarr;
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {reports.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedReport(r);
                          setActiveTab("issues");
                        }}
                        className="cursor-pointer flex items-center justify-between rounded-xl border border-ocean-100 p-3 hover:bg-ocean-50 dark:border-ocean-800 dark:hover:bg-ocean-900/50"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="truncate text-xs font-semibold text-ocean-950 dark:text-white">{r.title}</p>
                          <p className="text-[11px] text-ocean-500 font-mono mt-0.5">
                            {r.community}, {r.town} · {formatDate(r.createdAt)}
                          </p>
                        </div>
                        <FilamentBadge color={r.status === "RESOLVED" ? "success" : r.status === "IN_PROGRESS" ? "warning" : "gray"}>
                          {r.status}
                        </FilamentBadge>
                      </div>
                    ))}
                    {reports.length === 0 && (
                      <p className="py-6 text-center text-xs text-ocean-500">No community reports filed yet.</p>
                    )}
                  </div>
                </div>

                {/* Watchlist initiatives summary */}
                <div className="rounded-2xl border border-ocean-200/80 bg-white p-5 dark:border-ocean-800 dark:bg-[#0c1322]">
                  <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
                    <h3 className="font-display text-sm font-bold text-ocean-950 dark:text-white">
                      Watchlist Projects ({favoriteSlugs.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("favorites")}
                      className="text-xs font-semibold text-amber-600 hover:underline"
                    >
                      Manage Targets &rarr;
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    {favoriteSlugs.slice(0, 3).map((slug) => {
                      const init = getInitiativeBySlug(slug);
                      if (!init) return null;
                      const target = initiativeTargets[slug] || 500;
                      return (
                        <div key={slug} className="rounded-xl border border-ocean-100 p-3 dark:border-ocean-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-ocean-950 dark:text-white truncate">{init.title}</span>
                            <span className="text-xs font-mono text-ocean-500">{percent(init.amountRaised, init.budget)}%</span>
                          </div>
                          <div className="mt-2 h-1.5 w-full rounded-full bg-ocean-100 dark:bg-ocean-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${Math.min(100, percent(init.amountRaised, init.budget))}%` }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-ocean-500 font-mono">
                            <span>Target: {formatGHS(target)}</span>
                            <span>{formatGHS(init.amountRaised)} raised</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY CIVIC REPORTS (FULL CRUD & STEPPER) */}
          {activeTab === "issues" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                    Civic Reports &amp; Resolution Tracking
                  </h2>
                  <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                    Track the lifecycle of problems you reported to the South Tongu District Works &amp; Sanitation teams.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewReportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" /> File New Incident Report
                </button>
              </div>

              {/* Reports Table & Actions */}
              <div className="rounded-2xl border border-ocean-200/80 bg-white overflow-hidden shadow-xs dark:border-ocean-800 dark:bg-[#0c1322]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ocean-200 bg-ocean-50/75 dark:border-ocean-800 dark:bg-ocean-900/50 font-semibold text-ocean-700 dark:text-ocean-300">
                    <tr>
                      <th className="px-4 py-3">Incident Reference</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Urgency</th>
                      <th className="px-4 py-3">Status Stepper</th>
                      <th className="px-4 py-3">Filed Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-100 dark:divide-ocean-800">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-ocean-50/50 dark:hover:bg-ocean-900/40">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-ocean-950 dark:text-white">{rep.title}</p>
                          <p className="text-[11px] font-mono text-ocean-400">#{rep.id.replace("survey-", "REP-").slice(0, 10)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-medium text-ocean-800 dark:text-ocean-200">{rep.community}</span>
                          <span className="block text-[11px] text-ocean-500">{rep.town}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <FilamentBadge color={rep.urgency === "CRITICAL" ? "danger" : rep.urgency === "HIGH" ? "warning" : "info"}>
                            {rep.urgency}
                          </FilamentBadge>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReport(rep)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-ocean-200 bg-white px-2 py-1 text-xs font-semibold text-ocean-800 hover:border-amber-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-200"
                          >
                            <TrendingUp className="h-3 w-3 text-amber-500" />
                            <span>Step {getStepperIndex(rep.status) + 1}/5: {rep.status.replace("_", " ")}</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-ocean-500">
                          {formatDate(rep.createdAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedReport(rep)}
                              title="Track Incident Timeline"
                              className="rounded-md border border-ocean-200 bg-white p-1.5 text-ocean-700 hover:text-amber-600 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-300"
                            >
                              <TrendingUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditReport(rep)}
                              title="Edit Report Details"
                              className="rounded-md border border-ocean-200 bg-white p-1.5 text-ocean-700 hover:text-amber-600 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-300"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setWithdrawingReportId(rep.id)}
                              title="Withdraw / Dismiss Report"
                              className="rounded-md border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-ocean-500">
                          You haven&apos;t filed any community issues yet. Click &quot;File New Incident Report&quot; to report road, water, or lighting problems.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Interactive Stepper Details Drawer */}
              {selectedReport && (
                <div className="rounded-2xl border border-amber-200/80 bg-white p-6 shadow-sm dark:border-amber-900/50 dark:bg-[#0c1322]">
                  <div className="flex items-start justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600">
                          #{selectedReport.id.replace("survey-", "REP-").slice(0, 10)}
                        </span>
                        <FilamentBadge color={selectedReport.urgency === "CRITICAL" ? "danger" : "warning"}>
                          {selectedReport.urgency}
                        </FilamentBadge>
                      </div>
                      <h3 className="mt-1 font-display text-base font-bold text-ocean-950 dark:text-white">
                        {selectedReport.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                        📍 {selectedReport.community}, {selectedReport.town} · Filed on {formatDate(selectedReport.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReport(null)}
                      className="rounded-lg p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* 5-Stage Visual Stepper */}
                  <div className="my-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ocean-500 mb-3 font-mono">
                      Assembly Resolution Pipeline
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { step: 1, label: "Submitted", desc: "Logged on device" },
                        { step: 2, label: "In Review", desc: "Coordinator review" },
                        { step: 3, label: "Dispatched", desc: "Inspector assigned" },
                        { step: 4, label: "Works in Progress", desc: "Repairs active" },
                        { step: 5, label: "Resolved", desc: "Publicly verified" },
                      ].map((st, idx) => {
                        const currentIdx = getStepperIndex(selectedReport.status);
                        const isComplete = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={st.step} className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-xs ${
                                isComplete
                                  ? "bg-amber-500 text-ocean-950 shadow-xs"
                                  : "border border-ocean-200 bg-white text-ocean-400 dark:border-ocean-800 dark:bg-ocean-900"
                              } ${isCurrent ? "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-ocean-950" : ""}`}
                            >
                              {isComplete ? <Check className="h-4 w-4" /> : st.step}
                            </div>
                            <span className="mt-2 font-semibold text-ocean-950 dark:text-white text-[11px] truncate w-full">
                              {st.label}
                            </span>
                            <span className="text-[10px] text-ocean-500 hidden sm:inline">{st.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field narrative & Official Notes */}
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-ocean-100 bg-ocean-50/50 p-4 dark:border-ocean-800 dark:bg-ocean-900/40">
                      <span className="font-bold text-ocean-900 dark:text-white">Citizen Narrative</span>
                      <p className="mt-1 leading-relaxed text-ocean-700 dark:text-ocean-300">
                        {selectedReport.description}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300">
                        District Works Department &amp; Coordinator Memo
                      </span>
                      <p className="mt-1 leading-relaxed text-emerald-800 dark:text-emerald-200">
                        {selectedReport.status === "RESOLVED"
                          ? "Official inspection completed by South Tongu District Works on 14 Sept. Replaced broken culvert and reinforced drainage basin."
                          : "Case assigned to South Tongu District Engineer. Field inspection scheduled within 48 hours. WhatsApp SMS alert dispatched."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GIVING & RECURRING PLEDGES */}
          {activeTab === "donations" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                    Contributions &amp; Recurring MoMo Pledges
                  </h2>
                  <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                    Review your Paystack verified donations, manage recurring monthly pledges, and download annual tax statements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTaxStatementModal(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-ocean-200 bg-white px-3 py-1.5 text-xs font-semibold text-ocean-800 hover:bg-ocean-50 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-200"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-500" /> Annual Giving Statement
                  </button>
                  <Link
                    href="/donate"
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
                  >
                    <PlusCircle className="h-3.5 w-3.5" /> Make a Gift
                  </Link>
                </div>
              </div>

              {/* Active Recurring Pledge Manager Card */}
              <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 p-6 dark:border-amber-900/50 dark:from-amber-950/20 dark:via-[#0c1322] dark:to-amber-950/20 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-ocean-950 shadow-sm">
                      <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base font-bold text-ocean-950 dark:text-white">
                          Automated Monthly MoMo Pledge
                        </h3>
                        <FilamentBadge color={recurringPledge.status === "ACTIVE" ? "success" : "gray"}>
                          {recurringPledge.status}
                        </FilamentBadge>
                      </div>
                      <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                        {formatGHS(recurringPledge.amount)} per month via {recurringPledge.provider} ({recurringPledge.phone})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTogglePledgeStatus}
                      className="rounded-lg border border-ocean-200 bg-white px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-300"
                    >
                      {recurringPledge.status === "ACTIVE" ? "Pause Pledge" : "Resume Pledge"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPledgeAmountInput(recurringPledge.amount);
                        setPledgeProviderInput(recurringPledge.provider);
                        setEditPledgeModalOpen(true);
                      }}
                      className="rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
                    >
                      Update Amount
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-amber-900/30 flex flex-wrap items-center justify-between text-xs text-ocean-600 dark:text-ocean-400">
                  <span>Next Scheduled Processing Date: <strong className="font-mono text-ocean-950 dark:text-white">{recurringPledge.nextDeduction}</strong></span>
                  <button
                    type="button"
                    onClick={handleCancelPledge}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Cancel Monthly Pledge
                  </button>
                </div>
              </div>

              {/* Verified Donations Ledger */}
              <div className="rounded-2xl border border-ocean-200/80 bg-white overflow-hidden shadow-xs dark:border-ocean-800 dark:bg-[#0c1322]">
                <div className="p-4 border-b border-ocean-100 dark:border-ocean-800 flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-ocean-950 dark:text-white">
                    Verified Contribution Records ({donationsList.length})
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Audited Paystack Receipts
                  </span>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-ocean-200 bg-ocean-50/75 dark:border-ocean-800 dark:bg-ocean-900/50 font-semibold text-ocean-700 dark:text-ocean-300">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Initiative Allocation</th>
                      <th className="px-4 py-3">Channel / Method</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-100 dark:divide-ocean-800">
                    {donationsList.map((d) => {
                      const initiative = d.initiativeSlug ? getInitiativeBySlug(d.initiativeSlug) : null;
                      return (
                        <tr key={d.id} className="hover:bg-ocean-50/50 dark:hover:bg-ocean-900/40">
                          <td className="px-4 py-3.5 font-mono text-[11px] text-ocean-600 dark:text-ocean-400">
                            {d.ref || `pstk_live_${d.id}`}
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-ocean-950 dark:text-white">
                            {initiative?.title ?? "South Tongu General Civic Fund"}
                            {d.recurring && <span className="ml-2 inline-block"><FilamentBadge color="warning">Monthly</FilamentBadge></span>}
                          </td>
                          <td className="px-4 py-3.5 text-ocean-700 dark:text-ocean-300">
                            {d.method || "Paystack MoMo"}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px] text-ocean-500">
                            {formatDate(d.date)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono font-bold text-ocean-950 dark:text-white">
                            {formatGHS(d.amount)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReceipt(d)}
                              className="inline-flex items-center gap-1 rounded-md border border-ocean-200 bg-white px-2 py-1 text-xs font-semibold text-ocean-800 hover:border-amber-500 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-200"
                            >
                              <Receipt className="h-3.5 w-3.5 text-amber-500" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WATCHLIST INITIATIVES & TARGETS */}
          {activeTab === "favorites" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                    Watchlist Projects &amp; Personal Giving Targets
                  </h2>
                  <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                    Set and track personal sponsorship milestones toward community development projects in South Tongu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddFavoriteModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
                >
                  <PlusCircle className="h-3.5 w-3.5" /> Watch Another Initiative
                </button>
              </div>

              {/* Grid of Watchlist Initiatives */}
              <div className="grid gap-6 sm:grid-cols-2">
                {favoriteSlugs.map((slug) => {
                  const init = getInitiativeBySlug(slug);
                  if (!init) return null;
                  const personalGoal = initiativeTargets[slug] || 500;
                  const currentContribution = donationsList
                    .filter((d) => d.initiativeSlug === slug)
                    .reduce((s, d) => s + d.amount, 0);
                  const goalPercent = Math.min(100, Math.round((currentContribution / personalGoal) * 100));

                  return (
                    <div
                      key={slug}
                      className="rounded-2xl border border-ocean-200/80 bg-white p-5 shadow-xs dark:border-ocean-800 dark:bg-[#0c1322] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <FilamentBadge color="info">{init.category}</FilamentBadge>
                          <button
                            type="button"
                            onClick={() => handleRemoveFavorite(slug)}
                            className="rounded p-1 text-ocean-400 hover:text-rose-600"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <h3 className="mt-2 font-display text-base font-bold text-ocean-950 dark:text-white">
                          {init.title}
                        </h3>
                        <p className="mt-1 text-xs text-ocean-600 dark:text-ocean-400 line-clamp-2">
                          {init.summary}
                        </p>

                        {/* District Campaign Progress */}
                        <div className="mt-4 pt-3 border-t border-ocean-100 dark:border-ocean-800">
                          <div className="flex justify-between text-xs font-mono text-ocean-500">
                            <span>District Campaign</span>
                            <span>{percent(init.amountRaised, init.budget)}% funded</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-ocean-100 dark:bg-ocean-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${Math.min(100, percent(init.amountRaised, init.budget))}%` }}
                            />
                          </div>
                        </div>

                        {/* Personal Giving Target Progress */}
                        <div className="mt-3 rounded-xl bg-amber-50/50 p-3 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-ocean-950 dark:text-white">
                              My Target Goal: {formatGHS(personalGoal)}
                            </span>
                            <span className="font-mono text-amber-600 font-bold">{goalPercent}%</span>
                          </div>
                          <div className="mt-1.5 h-2 w-full rounded-full bg-ocean-200/50 dark:bg-ocean-800 overflow-hidden">
                            <div
                              className="h-full bg-amber-500"
                              style={{ width: `${goalPercent}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-[10px] text-ocean-500 font-mono">
                            Contributed: {formatGHS(currentContribution)} of {formatGHS(personalGoal)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-ocean-100 pt-3 dark:border-ocean-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTargetSlug(slug);
                            setNewTargetAmount(personalGoal);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-ocean-700 hover:text-amber-600 dark:text-ocean-300"
                        >
                          <Target className="h-3.5 w-3.5" /> Edit Goal
                        </button>
                        <Link
                          href={`/donate?initiative=${slug}`}
                          className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                        >
                          Contribute &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PARTICIPATORY BUDGETING PRIORITY POLL */}
          {activeTab === "polls" && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                  South Tongu Participatory Budgeting Ballot
                </h2>
                <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                  Every resident vote shapes where district development funding is allocated. Cast your verified civic ballot below.
                </p>
              </div>

              <div className="rounded-2xl border border-ocean-200/80 bg-white p-6 dark:border-ocean-800 dark:bg-[#0c1322] shadow-xs">
                <div className="flex items-center justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-amber-600 font-bold">
                      Q4 2026 District Priority Ballot
                    </span>
                    <h3 className="text-base font-bold text-ocean-950 dark:text-white mt-1">
                      Which community project should receive priority assembly matching funds?
                    </h3>
                  </div>
                  {userVotedOption && (
                    <FilamentBadge color="success">
                      ✓ Ballot Verified
                    </FilamentBadge>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  {POLL_OPTIONS.map((opt) => {
                    const count = pollVotes[opt.id] || 0;
                    const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);
                    const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
                    const isSelected = userVotedOption === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleCastVote(opt.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                            : "border-ocean-200 hover:border-ocean-400 dark:border-ocean-800 dark:hover:border-ocean-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500 text-ocean-950"
                                  : "border-ocean-300 dark:border-ocean-700"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold text-ocean-950 dark:text-white">{opt.title}</span>
                          </div>
                          <span className="font-mono text-xs font-bold text-ocean-900 dark:text-white">{pct}%</span>
                        </div>

                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-ocean-100 dark:bg-ocean-800 overflow-hidden">
                          <div
                            className={`h-full ${isSelected ? "bg-amber-500" : "bg-ocean-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-ocean-500 font-mono">
                          <span>Category: {opt.category}</span>
                          <span>{count} verified resident votes</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: RESIDENT ACCOUNT SETTINGS */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="font-display text-lg font-bold text-ocean-950 dark:text-white">
                  Resident Profile &amp; Preferences
                </h2>
                <p className="mt-0.5 text-xs text-ocean-600 dark:text-ocean-400">
                  Update your contact details, electoral zone, and alert preferences for district communications.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="rounded-2xl border border-ocean-200/80 bg-white p-6 shadow-xs dark:border-ocean-800 dark:bg-[#0c1322] space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                    Resident Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={residentName}
                    onChange={(e) => setResidentName(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={residentEmail}
                      onChange={(e) => setResidentEmail(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                      Phone Number (MoMo &amp; SMS)
                    </label>
                    <input
                      type="text"
                      required
                      value={residentPhone}
                      onChange={(e) => setResidentPhone(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                      Residential Community / Area
                    </label>
                    <select
                      value={residentArea}
                      onChange={(e) => setResidentArea(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                    >
                      <option value="Sogakope Central">Sogakope Central</option>
                      <option value="Dabala Market Zone">Dabala Market Zone</option>
                      <option value="Agorkpo">Agorkpo</option>
                      <option value="Sukladzi">Sukladzi</option>
                      <option value="Tefle">Tefle</option>
                      <option value="Sokpoe">Sokpoe</option>
                      <option value="Vume">Vume</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                      Notification Dispatch
                    </label>
                    <select
                      value={residentCommChannel}
                      onChange={(e) => setResidentCommChannel(e.target.value)}
                      className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                    >
                      <option value="SMS & WhatsApp">SMS &amp; WhatsApp</option>
                      <option value="Email Only">Email Only</option>
                      <option value="All Channels">All Channels (SMS, WhatsApp, Email)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. MODALS & SLIDE-OVERS */}
      {/* ----------------------------------------------------------------- */}

      {/* CREATE CIVIC REPORT MODAL */}
      {newReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setNewReportModalOpen(false)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Report a Neighborhood Issue</h3>
              <button onClick={() => setNewReportModalOpen(false)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Issue Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken water pipeline leaking near Dabala Health Center"
                  value={repTitle}
                  onChange={(e) => setRepTitle(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Category</label>
                  <select
                    value={repCategory}
                    onChange={(e) => setRepCategory(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  >
                    <option value="roads">Roads &amp; Drainage</option>
                    <option value="water">Clean Water &amp; Boreholes</option>
                    <option value="health">Healthcare / CHPS</option>
                    <option value="sanitation">Waste &amp; Sanitation</option>
                    <option value="lighting">Street Lighting</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Urgency</label>
                  <select
                    value={repUrgency}
                    onChange={(e) => setRepUrgency(e.target.value as UrgencyLevel)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate safety)</option>
                    <option value="HIGH">HIGH (Impacting community)</option>
                    <option value="MEDIUM">MEDIUM (Moderate issue)</option>
                    <option value="LOW">LOW (Minor maintenance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Community</label>
                  <input
                    type="text"
                    required
                    value={repCommunity}
                    onChange={(e) => setRepCommunity(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Town / Landmark</label>
                  <input
                    type="text"
                    required
                    value={repTown}
                    onChange={(e) => setRepTown(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Incident Description &amp; Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe location details, affected residents, and urgency..."
                  value={repDesc}
                  onChange={(e) => setRepDesc(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setNewReportModalOpen(false)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CIVIC REPORT MODAL */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingReport(null)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Edit Civic Report Details</h3>
              <button onClick={() => setEditingReport(null)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReport} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={editRepTitle}
                  onChange={(e) => setEditRepTitle(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Landmark / Town</label>
                  <input
                    type="text"
                    required
                    value={editRepTown}
                    onChange={(e) => setEditRepTown(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Callback Phone</label>
                  <input
                    type="text"
                    value={editRepPhone}
                    onChange={(e) => setEditRepPhone(e.target.value)}
                    className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">Narrative / Updates</label>
                <textarea
                  rows={3}
                  required
                  value={editRepDesc}
                  onChange={(e) => setEditRepDesc(e.target.value)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW REPORT CONFIRM MODAL */}
      {withdrawingReportId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setWithdrawingReportId(null)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ocean-950 dark:text-white">Withdraw Report?</h3>
                <p className="text-xs text-ocean-600 dark:text-ocean-400">
                  Are you sure you want to dismiss this civic ticket? It will be removed from your active incident tracking.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWithdrawingReportId(null)}
                className="rounded-lg border border-ocean-200 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
              >
                Keep Report
              </button>
              <button
                type="button"
                onClick={() => handleWithdrawReport(withdrawingReportId)}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-sm"
              >
                Confirm Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE RECURRING PLEDGE MODAL */}
      {editPledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditPledgeModalOpen(false)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Update Monthly Pledge</h3>
              <button onClick={() => setEditPledgeModalOpen(false)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePledge} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Monthly Gift Amount (GHS)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[25, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPledgeAmountInput(amt)}
                      className={`rounded-lg py-1.5 font-bold ${
                        pledgeAmountInput === amt
                          ? "bg-amber-500 text-ocean-950"
                          : "border border-ocean-200 bg-white text-ocean-700 dark:border-ocean-700 dark:bg-ocean-900 dark:text-ocean-300"
                      }`}
                    >
                      GHS {amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={5}
                  required
                  value={pledgeAmountInput}
                  onChange={(e) => setPledgeAmountInput(Number(e.target.value))}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={pledgeProviderInput}
                  onChange={(e) => setPledgeProviderInput(e.target.value as any)}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white"
                >
                  <option value="MTN MoMo">MTN Mobile Money</option>
                  <option value="Telecel Cash">Telecel Cash</option>
                  <option value="AT Money">AT Money</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setEditPledgeModalOpen(false)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Save Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GIVING TARGET MODAL */}
      {editingTargetSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setEditingTargetSlug(null)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Set Personal Giving Target</h3>
              <button onClick={() => setEditingTargetSlug(null)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTargetGoal} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-ocean-700 dark:text-ocean-300 mb-1">
                  Target Amount for 2026 (GHS)
                </label>
                <input
                  type="number"
                  min={10}
                  step={50}
                  required
                  value={newTargetAmount}
                  onChange={(e) => setNewTargetAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-ocean-200 bg-white p-2.5 text-ocean-900 focus:border-amber-500 focus:outline-none dark:border-ocean-700 dark:bg-ocean-900 dark:text-white font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-ocean-100 dark:border-ocean-800">
                <button
                  type="button"
                  onClick={() => setEditingTargetSlug(null)}
                  className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400"
                >
                  Set Goal Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD FAVORITE FROM INVENTORY MODAL */}
      {addFavoriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAddFavoriteModalOpen(false)}
            className="fixed inset-0 bg-ocean-950/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-ocean-100 pb-3 dark:border-ocean-800">
              <h3 className="text-base font-bold text-ocean-950 dark:text-white">Add Project to Watchlist</h3>
              <button onClick={() => setAddFavoriteModalOpen(false)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1 text-xs">
              {initiatives
                .filter((i) => !favoriteSlugs.includes(i.slug))
                .map((init) => (
                  <div key={init.id} className="flex items-center justify-between p-3 rounded-xl border border-ocean-100 dark:border-ocean-800 hover:bg-ocean-50 dark:hover:bg-ocean-900/40">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-ocean-950 dark:text-white truncate">{init.title}</p>
                      <p className="text-[11px] text-ocean-500 font-mono mt-0.5">{init.category} · Budget: {formatGHS(init.budget)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddFavorite(init.slug)}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shrink-0"
                    >
                      + Watch
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PAYSTACK DONATION RECEIPT MODAL */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-ocean-200 bg-white p-6 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 relative print:border-none print:shadow-none animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-ocean-950 font-bold text-xs">
                  TCP
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-ocean-950 dark:text-white">
                    Official Donation Receipt
                  </h3>
                  <p className="text-[10px] font-mono text-ocean-500">
                    Verified Paystack Transfer · South Tongu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-full p-1 text-ocean-500 hover:bg-ocean-100 dark:hover:bg-ocean-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> Payment Status: SUCCESS
                </div>
                <p className="mt-1 font-mono text-2xl font-bold text-ocean-950 dark:text-white">
                  {formatGHS(selectedReceipt.amount)}
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-ocean-100 bg-ocean-50/50 p-4 text-xs dark:border-ocean-800 dark:bg-ocean-900/50">
                <div className="flex justify-between py-1 border-b border-ocean-100 dark:border-ocean-800">
                  <span className="text-ocean-600 dark:text-ocean-400">Paystack Reference</span>
                  <span className="font-mono font-medium text-ocean-950 dark:text-white">
                    {selectedReceipt.ref || `pstk_live_${selectedReceipt.id}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-ocean-100 dark:border-ocean-800">
                  <span className="text-ocean-600 dark:text-ocean-400">Donor Name</span>
                  <span className="font-medium text-ocean-950 dark:text-white">
                    {selectedReceipt.donorName || residentName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-ocean-100 dark:border-ocean-800">
                  <span className="text-ocean-600 dark:text-ocean-400">Payment Channel</span>
                  <span className="font-medium text-ocean-950 dark:text-white">
                    {selectedReceipt.method || "MTN Mobile Money"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-ocean-100 dark:border-ocean-800">
                  <span className="text-ocean-600 dark:text-ocean-400">Date Issued</span>
                  <span className="font-mono text-ocean-950 dark:text-white">
                    {formatDate(selectedReceipt.date)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ocean-600 dark:text-ocean-400">Project Allocation</span>
                  <span className="font-medium text-ocean-950 dark:text-white">
                    {selectedReceipt.initiativeSlug
                      ? getInitiativeBySlug(selectedReceipt.initiativeSlug)?.title ?? "South Tongu Civic Fund"
                      : "South Tongu Civic Fund"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-ocean-100 pt-4 dark:border-ocean-800">
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg border border-ocean-200 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONSOLIDATED ANNUAL GIVING STATEMENT MODAL */}
      {showTaxStatementModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-xs"
          onClick={() => setShowTaxStatementModal(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl border border-ocean-200 bg-white p-8 shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 relative print:border-none print:shadow-none animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ocean-100 pb-4 dark:border-ocean-800">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-amber-600">
                  South Tongu Civic Giving
                </span>
                <h3 className="font-display text-lg font-bold text-ocean-950 dark:text-white mt-0.5">
                  Annual Donor Contribution Statement (2026)
                </h3>
              </div>
              <button onClick={() => setShowTaxStatementModal(false)} className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-ocean-50 dark:bg-ocean-900/50">
                <div>
                  <span className="text-ocean-500 font-mono">Contributor:</span>
                  <p className="font-bold text-ocean-950 dark:text-white text-sm">{residentName}</p>
                  <p className="text-ocean-500 font-mono mt-0.5">{residentEmail}</p>
                </div>
                <div>
                  <span className="text-ocean-500 font-mono">District Residence:</span>
                  <p className="font-bold text-ocean-950 dark:text-white text-sm">{residentArea}</p>
                  <p className="text-ocean-500 font-mono mt-0.5">Electoral Area · South Tongu</p>
                </div>
              </div>

              <div className="border border-ocean-100 dark:border-ocean-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-ocean-50 dark:bg-ocean-900 border-b border-ocean-100 dark:border-ocean-800 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Project Allocation</th>
                      <th className="p-2.5">Reference</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-100 dark:divide-ocean-800">
                    {donationsList.map((d) => (
                      <tr key={d.id}>
                        <td className="p-2.5 font-mono text-[11px]">{formatDate(d.date)}</td>
                        <td className="p-2.5 font-medium">{d.initiativeSlug ? getInitiativeBySlug(d.initiativeSlug)?.title : "Civic Fund"}</td>
                        <td className="p-2.5 font-mono text-[10px] text-ocean-400">{d.ref || d.id}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{formatGHS(d.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-ocean-50/50 dark:bg-ocean-900/30 font-bold">
                      <td colSpan={3} className="p-2.5 text-right font-display text-sm">Total 2026 Contributions:</td>
                      <td className="p-2.5 text-right font-mono text-sm text-emerald-600 dark:text-emerald-400">{formatGHS(totalDonated)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl border border-ocean-100 bg-ocean-50/40 text-[11px] text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
                This document serves as an audited statement of charitable civic contributions processed for The Citizen Project via Paystack Ghana.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-ocean-100 pt-4 dark:border-ocean-800">
              <button
                type="button"
                onClick={() => setShowTaxStatementModal(false)}
                className="rounded-lg border border-ocean-200 px-3.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 dark:border-ocean-700 dark:text-ocean-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-ocean-950 hover:bg-amber-400 shadow-xs"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
