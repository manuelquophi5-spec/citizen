"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X, Sparkles, Heart, FileText, Clock, UserCheck } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  icon?: "report" | "volunteer" | "account" | "donation" | "initiative" | "vote" | "standard";
}

interface ToastContextValue {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const GLOBAL_TOAST_EVENT = "tcp:global-toast";

// Standalone global trigger (can be called from anywhere, even outside React components)
export const toast = {
  success: (message: string, title?: string, duration?: number) => {
    dispatchGlobalToast({ message, title, type: "success", duration });
  },
  error: (message: string, title?: string, duration?: number) => {
    dispatchGlobalToast({ message, title, type: "error", duration: duration || 5000 });
  },
  info: (message: string, title?: string, duration?: number) => {
    dispatchGlobalToast({ message, title, type: "info", duration });
  },
  warning: (message: string, title?: string, duration?: number) => {
    dispatchGlobalToast({ message, title, type: "warning", duration });
  },
};

// Specialized Creation Message Helpers for resource creation across portals
export const toastCreated = {
  report: (title: string, ticketId?: string) => {
    const tracking = ticketId ? ` (Ticket #${ticketId.slice(0, 8).toUpperCase()})` : "";
    dispatchGlobalToast({
      title: "Civic Report Submitted",
      message: `Your report "${title}" has been filed and routed to the District Desk${tracking}.`,
      type: "success",
      icon: "report",
      duration: 5000,
    });
  },

  volunteerHours: (hours: number, activity: string) => {
    dispatchGlobalToast({
      title: "Volunteer Service Hours Logged",
      message: `Logged ${hours}h for "${activity}". Submitted to District Coordinator for verification.`,
      type: "success",
      icon: "volunteer",
      duration: 5000,
    });
  },

  account: (name: string, role: string) => {
    const roleLabel = role === "volunteer" ? "Volunteer Ambassador" : role === "admin" ? "District Administrator" : "Citizen Supporter";
    dispatchGlobalToast({
      title: "Account Created Successfully",
      message: `Welcome to The Citizen Project, ${name}! Your ${roleLabel} account is now active.`,
      type: "success",
      icon: "account",
      duration: 5500,
    });
  },

  donation: (amount: number, currency = "GHS", donorName?: string) => {
    const formatted = `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    dispatchGlobalToast({
      title: "Donation Recorded",
      message: `Thank you${donorName ? `, ${donorName}` : ""}! Your contribution of ${formatted} has been credited to community projects.`,
      type: "success",
      icon: "donation",
      duration: 6000,
    });
  },

  initiative: (title: string) => {
    dispatchGlobalToast({
      title: "New Initiative Published",
      message: `Community initiative "${title}" is now live and accepting citizen support.`,
      type: "success",
      icon: "initiative",
      duration: 5000,
    });
  },

  vote: (projectName: string) => {
    dispatchGlobalToast({
      title: "Participatory Budgeting Vote Cast",
      message: `Your priority ballot vote for "${projectName}" has been registered in District tallies.`,
      type: "success",
      icon: "vote",
      duration: 5000,
    });
  },
};

function dispatchGlobalToast(detail: Omit<ToastMessage, "id">) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(GLOBAL_TOAST_EVENT, { detail }));
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toastData: Omit<ToastMessage, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { ...toastData, id };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep maximum 5 on screen

    const dur = toastData.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, dur);

    return id;
  }, [removeToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<ToastMessage, "id">>;
      if (customEvent.detail) {
        addToast(customEvent.detail);
      }
    };

    window.addEventListener(GLOBAL_TOAST_EVENT, handleEvent);
    return () => window.removeEventListener(GLOBAL_TOAST_EVENT, handleEvent);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toasts: [],
      addToast: (t: Omit<ToastMessage, "id">) => {
        dispatchGlobalToast(t);
        return "";
      },
      removeToast: () => {},
      clearAll: () => {},
      toast,
      toastCreated,
    };
  }
  return { ...context, toast, toastCreated };
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex max-w-md w-full flex-col gap-2.5 px-3 pointer-events-none sm:px-0"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const getBadgeStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-emerald-500/40 dark:border-emerald-500/30",
          bg: "bg-white/95 dark:bg-[#0c1815]/95 shadow-emerald-500/10",
          accent: "text-emerald-600 dark:text-emerald-400",
          iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
        };
      case "error":
        return {
          border: "border-rose-500/40 dark:border-rose-500/30",
          bg: "bg-white/95 dark:bg-[#1a0f12]/95 shadow-rose-500/10",
          accent: "text-rose-600 dark:text-rose-400",
          iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
        };
      case "warning":
        return {
          border: "border-amber-500/40 dark:border-amber-500/30",
          bg: "bg-white/95 dark:bg-[#1a150c]/95 shadow-amber-500/10",
          accent: "text-amber-600 dark:text-amber-400",
          iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
        };
      case "info":
      default:
        return {
          border: "border-ocean-500/40 dark:border-ocean-500/30",
          bg: "bg-white/95 dark:bg-[#0d1624]/95 shadow-ocean-500/10",
          accent: "text-ocean-600 dark:text-ocean-400",
          iconBg: "bg-ocean-100 text-ocean-700 dark:bg-ocean-950/80 dark:text-ocean-300",
        };
    }
  };

  const style = getBadgeStyle();

  const renderIcon = () => {
    if (toast.icon === "report") return <FileText className="h-5 w-5" />;
    if (toast.icon === "volunteer") return <Clock className="h-5 w-5" />;
    if (toast.icon === "account") return <UserCheck className="h-5 w-5" />;
    if (toast.icon === "donation") return <Heart className="h-5 w-5" />;
    if (toast.icon === "initiative") return <Sparkles className="h-5 w-5" />;
    if (toast.icon === "vote") return <CheckCircle2 className="h-5 w-5" />;

    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5" />;
      case "error":
        return <XCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-3 ${style.border} ${style.bg}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
        {renderIcon()}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {toast.title && (
          <h4 className="text-xs font-bold text-ocean-950 dark:text-white leading-tight mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs text-ocean-700 dark:text-ocean-300 leading-relaxed break-words">
          {toast.message}
        </p>
      </div>

      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-lg p-1 text-ocean-400 hover:text-ocean-700 hover:bg-ocean-100 dark:hover:bg-ocean-800/60 dark:hover:text-white transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
