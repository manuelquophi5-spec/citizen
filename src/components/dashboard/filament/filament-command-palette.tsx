"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { surveyReports } from "@/lib/mock-data";
import {
  Search,
  X,
  AlertTriangle,
  Users,
  FolderGit2,
  Receipt,
  ArrowRight,
  CornerDownLeft,
  Sparkles,
  MapPin,
  Award,
  Calendar,
  BookOpen,
  ShieldCheck,
  Mail,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  category: "Navigation" | "Community Issues" | "Actions";
  title: string;
  subtitle?: string;
  badge?: string;
  badgeTone?: "danger" | "warning" | "success" | "info" | "gray";
  icon: any;
  action: () => void;
}

export function FilamentCommandPalette({
  isOpen,
  onClose,
  onNavigateTab,
  onSelectIssue,
  reports,
}: {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onSelectIssue?: (issueId: string) => void;
  reports?: any[];
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: "nav-overview",
        category: "Navigation",
        title: "Operations Overview",
        subtitle: "District KPIs, triage stats, and quick charts",
        icon: Sparkles,
        action: () => {
          onNavigateTab("overview");
          onClose();
        },
      },
      {
        id: "nav-issues",
        category: "Navigation",
        title: "Community Issues Desk",
        subtitle: "Triage emergency reports, dispatch teams, track resolution",
        badge: "3 Critical",
        badgeTone: "danger",
        icon: AlertTriangle,
        action: () => {
          onNavigateTab("issues");
          onClose();
        },
      },
      {
        id: "nav-map",
        category: "Navigation",
        title: "Geospatial Hotspots Map",
        subtitle: "Interactive South Tongu incident map & coordinates",
        icon: MapPin,
        action: () => {
          onNavigateTab("map");
          onClose();
        },
      },
      {
        id: "nav-volunteers",
        category: "Navigation",
        title: "Volunteer Service Ledger",
        subtitle: "Audit field service hours and certify ambassadors",
        badge: "Pending Logs",
        badgeTone: "warning",
        icon: Users,
        action: () => {
          onNavigateTab("volunteers");
          onClose();
        },
      },
      {
        id: "nav-applications",
        category: "Navigation",
        title: "Applications Review Desk",
        subtitle: "Volunteer signups & institutional partnership proposals",
        icon: Users,
        action: () => {
          onNavigateTab("applications");
          onClose();
        },
      },
      {
        id: "nav-certificates",
        category: "Navigation",
        title: "Certificate & Commendation Issuer",
        subtitle: "Generate cryptographically verifiable volunteer certificates",
        icon: Award,
        action: () => {
          onNavigateTab("certificates");
          onClose();
        },
      },
      {
        id: "nav-initiatives",
        category: "Navigation",
        title: "Initiatives & Capital Projects",
        subtitle: "Monitor milestone delivery and funding thresholds",
        icon: FolderGit2,
        action: () => {
          onNavigateTab("initiatives");
          onClose();
        },
      },
      {
        id: "nav-events",
        category: "Navigation",
        title: "Community Outreach Events",
        subtitle: "Schedule town halls, cleanup drives & manage RSVPs",
        icon: Calendar,
        action: () => {
          onNavigateTab("events");
          onClose();
        },
      },
      {
        id: "nav-blog",
        category: "Navigation",
        title: "Civic News & Editorial CMS",
        subtitle: "Draft and publish community bulletins & impact stories",
        icon: BookOpen,
        action: () => {
          onNavigateTab("blog");
          onClose();
        },
      },
      {
        id: "nav-finances",
        category: "Navigation",
        title: "Financial Ledger & Offline Donations",
        subtitle: "Audited disbursements, transparency reporting, and CSV exports",
        icon: Receipt,
        action: () => {
          onNavigateTab("finances");
          onClose();
        },
      },
      {
        id: "nav-audit",
        category: "Navigation",
        title: "System Audit Trail & Log",
        subtitle: "Immutable chronological record of coordinator actions",
        icon: ShieldCheck,
        action: () => {
          onNavigateTab("audit");
          onClose();
        },
      },
      {
        id: "nav-subscribers",
        category: "Navigation",
        title: "Newsletter & Citizen Subscribers",
        subtitle: "Subscriber list and community bulletin broadcast",
        icon: Mail,
        action: () => {
          onNavigateTab("subscribers");
          onClose();
        },
      },
      {
        id: "nav-settings",
        category: "Navigation",
        title: "District & Gateway Settings",
        subtitle: "Assembly contacts, emergency hotlines & Paystack keys",
        icon: SlidersHorizontal,
        action: () => {
          onNavigateTab("settings");
          onClose();
        },
      },
    ];

    // Add search results from issues
    const isLive = process.env.NEXT_PUBLIC_INTEGRITY_MODE === "live";
    const issuesSource = reports && reports.length > 0 ? reports : (isLive ? [] : surveyReports);
    issuesSource.slice(0, 15).forEach((issue: any) => {
      const urgency = issue.urgency || issue.priority || "MEDIUM";
      const community = issue.community || (typeof issue.location === "object" ? issue.location?.community : "South Tongu") || "South Tongu";
      const town = issue.town || (typeof issue.location === "object" ? issue.location?.town : "") || "";
      list.push({
        id: `issue-${issue.id}`,
        category: "Community Issues",
        title: issue.title,
        subtitle: `${community}${town ? ` · ${town}` : ""}`,
        badge: urgency,
        badgeTone: urgency === "CRITICAL" ? "danger" : urgency === "HIGH" ? "warning" : "info",
        icon: AlertTriangle,
        action: () => {
          onNavigateTab("issues");
          if (onSelectIssue) onSelectIssue(issue.id);
          onClose();
        },
      });
    });

    return list;
  }, [onNavigateTab, onClose, onSelectIssue, reports]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Keyboard navigation within list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ocean-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-2xl dark:border-ocean-800 dark:bg-ocean-950 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-ocean-100 px-4 py-3.5 dark:border-ocean-800">
          <Search className="h-5 w-5 text-ocean-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search records, jump to tabs, or filter actions... (Type 'issue', 'overview', etc.)"
            className="flex-1 bg-transparent text-sm text-ocean-950 outline-none placeholder:text-ocean-400 dark:text-white"
          />
          <kbd className="hidden rounded bg-ocean-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-ocean-600 dark:bg-ocean-800 dark:text-ocean-300 sm:inline-block">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ocean-500">
              No matching records or actions found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition",
                      isSelected
                        ? "bg-amber-500/10 text-ocean-950 dark:bg-amber-500/20 dark:text-white"
                        : "text-ocean-700 hover:bg-ocean-50 dark:text-ocean-300 dark:hover:bg-ocean-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          isSelected
                            ? "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "border-ocean-200 bg-white text-ocean-600 dark:border-ocean-800 dark:bg-ocean-900 dark:text-ocean-400"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.2 text-[10px] font-bold uppercase",
                                item.badgeTone === "danger"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-xs text-ocean-500 dark:text-ocean-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-ocean-400">
                      <span className="text-[11px] uppercase tracking-wider">{item.category}</span>
                      {isSelected && <CornerDownLeft className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-ocean-100 bg-ocean-50/50 px-4 py-2 text-[11px] text-ocean-500 dark:border-ocean-800 dark:bg-ocean-900/50">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-ocean-800">↑</kbd>{" "}
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-ocean-800">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-ocean-800">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[10px] text-ocean-400">Filament Global Command</span>
        </div>
      </div>
    </div>
  );
}
