"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  KeyRound,
  Building,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { signInAction } from "@/app/actions/auth";
import { getSession, setSession } from "@/lib/local-session";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "@/components/ui/toast";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const existing = getSession();
    if (existing && existing.role === "admin") {
      setCurrentSession({ name: existing.name, email: existing.email });
    }
  }, []);

  const fillDemoCredentials = () => {
    setEmail("coordinator@thecitizenproject.org");
    setPin("STDA-2026");
    setError(null);
    toast.info("Filled official District Coordinator demo credentials (PIN: STDA-2026)", "Credentials Loaded");
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your official Assembly or District Officer email.");
      return;
    }
    if (!pin.trim()) {
      setError("Please enter your security authorization PIN.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const res = await signInAction({
        email: email.trim(),
        password: pin.trim(),
        role: "admin",
      });

      if (!res.success || !res.data) {
        setError(res.error || "Authentication failed. Please verify your credentials.");
        toast.error(res.error || "Authentication failed. Please verify credentials.", "Access Denied");
        setPending(false);
        return;
      }

      if (res.data.role !== "admin") {
        setError("Access restricted: This account does not have administrative privileges.");
        toast.error("Access restricted: Non-administrative account.", "Unauthorized");
        setPending(false);
        return;
      }

      setSession({
        name: res.data.name,
        email: res.data.email,
        role: "admin",
        userId: res.data.userId,
      });

      toast.success(
        `Welcome, ${res.data.name}! District Operations Console unlocked.`,
        "Administrator Verified"
      );

      const target = redirectParam || "/admin";
      router.replace(target);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to authenticate.";
      setError(message);
      toast.error(message, "Authentication Error");
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Active Admin Session Quick-Resume Banner */}
      {currentSession && (
        <div className="mb-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                Logged in as {currentSession.name}
              </p>
              <p className="text-[11px] text-emerald-300/80 truncate">
                {currentSession.email}
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="shrink-0 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
          >
            Open Console &rarr;
          </Link>
        </div>
      )}

      {/* Official Emblem & Title */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-amber-600 text-ocean-950 shadow-xl shadow-gold-500/10 mb-4 ring-4 ring-gold-400/20">
          <ShieldCheck className="h-9 w-9" />
        </div>

        <p className="font-mono text-xs uppercase tracking-widest text-gold-400 font-bold">
          Republic of Ghana · South Tongu District Assembly
        </p>
        <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
          District Operations Console
        </h1>
        <p className="mt-2 text-xs text-ocean-300 max-w-md mx-auto leading-relaxed">
          Administrative authentication terminal for District Coordinators, Assembly Officers, and Civic Triage Liaisons.
        </p>
      </div>

      {/* Official Credentials Form */}
      <div className="rounded-3xl border border-ocean-800/80 bg-ocean-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ocean-200 mb-1.5">
              Official Officer Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinator@thecitizenproject.org"
                className="w-full rounded-xl border border-ocean-700 bg-ocean-950/80 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-ocean-500 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-ocean-200">
                Security Authorization PIN / Password
              </label>
              <span className="text-[10px] font-mono text-gold-400/80 bg-gold-400/10 px-2 py-0.5 rounded border border-gold-400/20">
                Default PIN: STDA-2026
              </span>
            </div>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. STDA-2026"
                className="w-full rounded-xl border border-ocean-700 bg-ocean-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-ocean-500 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? "Hide authorization PIN" : "Show authorization PIN"}
                className="absolute right-3 top-2.5 text-ocean-400 hover:text-white"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ocean-200 mb-1.5">
              Two-Factor Security Token (Optional / Hardware Key)
            </label>
            <input
              type="text"
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value)}
              placeholder="e.g. 849 201"
              className="w-full rounded-xl border border-ocean-700 bg-ocean-950/80 px-3.5 py-2.5 text-xs font-mono text-white placeholder:text-ocean-500 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 outline-none transition"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 active:scale-[0.99] transition disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>{pending ? "Verifying Authorization…" : "Unlock District Operations Console"}</span>
            </button>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-ocean-700/80 bg-ocean-800/40 px-3 py-2 text-xs font-medium text-ocean-300 hover:bg-ocean-800 hover:text-white transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              <span>One-Click Fill Demo Coordinator Credentials</span>
            </button>
          </div>
        </form>

        {/* Security Audit Warning Box */}
        <div className="mt-6 rounded-xl border border-ocean-800 bg-ocean-950/60 p-3.5 text-[11px] text-ocean-300">
          <div className="flex items-center gap-1.5 font-bold text-gold-400 mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Authorized Assembly Personnel Only</span>
          </div>
          <p className="leading-relaxed text-ocean-400">
            All logins, report dispositions, volunteer hours approvals, and financial exports are recorded in the
            immutable South Tongu district audit log with IP verification.
          </p>
        </div>
      </div>

      {/* Shared User & Volunteer Link Footnote */}
      <div className="mt-6 text-center text-xs text-ocean-400">
        <span>Not a District Coordinator or Assembly staff? </span>
        <Link
          href="/login"
          className="font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-4"
        >
          Sign in to the Citizen &amp; Volunteer Portal &rarr;
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-900 via-ocean-950 to-slate-950 text-white font-sans selection:bg-gold-500 selection:text-ocean-950">
      {/* Top Security Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-ocean-800/60 px-6 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-ocean-300 hover:text-white transition"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          <span>Return to The Citizen Project</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gold-400/10 px-2.5 py-1 text-[11px] font-mono text-gold-400 border border-gold-400/30">
            <Lock className="h-3 w-3" />
            <span>SECURE RESTRICTED ACCESS GATE</span>
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Terminal Login Canvas */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="h-14 border-t border-ocean-800/60 px-6 flex items-center justify-between text-[11px] text-ocean-400 font-mono">
        <span>The Citizen Project · South Tongu District Assembly</span>
        <span>Secure Terminal v2.4</span>
      </footer>
    </div>
  );
}
