"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LogIn,
  Heart,
  Award,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Users,
} from "lucide-react";
import { setSession } from "@/lib/local-session";
import { signInAction } from "@/app/actions/auth";
import { toast } from "@/components/ui/toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");

  const [activeRole, setActiveRole] = useState<"user" | "volunteer">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === "volunteer") {
      setActiveRole("volunteer");
    } else if (roleParam === "user") {
      setActiveRole("user");
    }
  }, [roleParam]);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const res = await signInAction({
        email: email.trim(),
        role: activeRole === "volunteer" ? "volunteer" : "citizen",
        password: password.trim() || undefined,
      });

      if (!res.success || !res.data) {
        const errMsg = res.error || "Authentication failed. Please verify your email.";
        setError(errMsg);
        toast.error(errMsg, "Sign In Failed");
        setPending(false);
        return;
      }

      setSession({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role === "citizen" ? "user" : res.data.role,
        userId: res.data.userId,
      });

      toast.success(`Welcome back, ${res.data.name}!`, "Signed In Successfully");

      const target =
        redirectParam ||
        (res.data.role === "admin"
          ? "/admin"
          : res.data.role === "volunteer"
          ? "/volunteer"
          : "/user");

      router.replace(target);
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Authentication error.";
      setError(errMsg);
      toast.error(errMsg, "Sign In Error");
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-leaf-600 text-white shadow-lg shadow-emerald-500/10 mb-4">
          <Users className="h-7 w-7" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          South Tongu Community Network
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ocean-950 dark:text-white sm:text-3xl">
          Welcome to The Citizen Project
        </h1>
        <p className="mt-1.5 text-xs text-ocean-600 dark:text-ocean-400">
          Single sign-in portal for Citizen Supporters and District Volunteers.
        </p>
      </div>

      {/* Segmented Persona / Role Switcher */}
      <div className="mb-6 rounded-2xl border border-ocean-200 bg-white p-1.5 shadow-sm dark:border-ocean-800 dark:bg-ocean-900">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setActiveRole("user");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              activeRole === "user"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-ocean-600 hover:text-ocean-950 dark:text-ocean-400 dark:hover:text-white"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Citizen Supporter</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole("volunteer");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-bold transition ${
              activeRole === "volunteer"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-ocean-600 hover:text-ocean-950 dark:text-ocean-400 dark:hover:text-white"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Volunteer &amp; Ambassador</span>
          </button>
        </div>

        {/* Dynamic Persona Description */}
        <div className="mt-2.5 px-2.5 pb-1 text-[11px] text-ocean-500 leading-relaxed text-center">
          {activeRole === "user" ? (
            <span>
              Access your submitted civic reports, Paystack giving records, and vote on district budget priorities.
            </span>
          ) : (
            <span>
              Log voluntary service hours, RSVP to field deployments, manage shifts, and download official transcripts.
            </span>
          )}
        </div>
      </div>

      {/* Login Credentials Form Card */}
      <div className="rounded-3xl border border-ocean-200 bg-white p-6 sm:p-8 shadow-xl dark:border-ocean-800 dark:bg-ocean-900">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Quick Fill Demo Credentials */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-ocean-400">Quick Test:</span>
          <button
            type="button"
            onClick={() => {
              setActiveRole("user");
              setEmail("kofi@citizen.gh");
              setPassword("citizen2026");
              setError(null);
            }}
            className="rounded-lg border border-ocean-200 bg-ocean-50/70 px-2.5 py-1 text-[11px] font-medium text-ocean-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-ocean-700 dark:bg-ocean-800 dark:text-ocean-300 dark:hover:bg-emerald-950/40 transition cursor-pointer"
          >
            Kofi (Citizen)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRole("volunteer");
              setEmail("akua.volunteer@citizen.gh");
              setPassword("volunteer2026");
              setError(null);
            }}
            className="rounded-lg border border-ocean-200 bg-ocean-50/70 px-2.5 py-1 text-[11px] font-medium text-ocean-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-ocean-700 dark:bg-ocean-800 dark:text-ocean-300 dark:hover:bg-emerald-950/40 transition cursor-pointer"
          >
            Akua (Volunteer)
          </button>
        </div>

        <form onSubmit={handleFormLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeRole === "user" ? "kofi@citizen.gh" : "akua.volunteer@citizen.gh"}
                className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200">
                Password
              </label>
              <span className="text-[11px] text-ocean-500 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-ocean-400 hover:text-ocean-700 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>
                {pending
                  ? "Signing in…"
                  : activeRole === "user"
                  ? "Sign In to Citizen Portal"
                  : "Sign In to Volunteer Portal"}
              </span>
            </button>
          </div>
        </form>

        {/* Signup Link */}
        <div className="mt-6 pt-4 border-t border-ocean-100 text-center text-xs text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
          <span>Don&apos;t have an account yet? </span>
          <Link
            href={`/register?role=${activeRole}`}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 dark:text-emerald-400"
          >
            Create {activeRole === "user" ? "Citizen" : "Volunteer"} Account &rarr;
          </Link>
        </div>
      </div>

      {/* Administrative Terminal Footnote */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-white/80 px-4 py-1.5 text-xs text-ocean-600 shadow-sm backdrop-blur-sm dark:border-ocean-800 dark:bg-ocean-900/80 dark:text-ocean-400">
          <ShieldCheck className="h-4 w-4 text-gold-500" />
          <span>District Coordinator or Staff?</span>
          <Link
            href="/admin/login"
            className="font-semibold text-ocean-900 hover:text-gold-600 underline dark:text-white dark:hover:text-gold-400"
          >
            Access Operations Terminal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <section className="section-y min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
      <div className="container-page flex justify-center">
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
