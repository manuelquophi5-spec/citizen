"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  Heart,
  Award,
  ShieldAlert,
  Check,
  MapPin,
  Lock,
  Mail,
  User,
  Radio,
  Sparkles,
  Users,
} from "lucide-react";
import { setSession, nameFromEmail } from "@/lib/local-session";
import { signUpAction } from "@/app/actions/auth";
import { toast, toastCreated } from "@/components/ui/toast";

const ELECTORAL_AREAS = [
  "Sogakope Central",
  "Sogakope South",
  "Tefle",
  "Dabala",
  "Agorkpo",
  "Sokpoe",
  "Fieve",
];

const VOLUNTEER_SKILL_OPTIONS = [
  "First Aid Certified",
  "Ewe-English Bilingual Translation",
  "Community Survey Enumeration",
  "Youth Civic Facilitation",
  "Disaster Relief Operations",
  "Logistics & Field Coordination",
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [activeRole, setActiveRole] = useState<"user" | "volunteer">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [electoralArea, setElectoralArea] = useState(ELECTORAL_AREAS[0]);

  // Citizen-specific fields
  const [commChannel, setCommChannel] = useState("SMS & Email");

  // Volunteer-specific fields
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "First Aid Certified",
    "Ewe-English Bilingual Translation",
  ]);
  const [emergencyReady, setEmergencyReady] = useState(true);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === "volunteer") {
      setActiveRole("volunteer");
    } else if (roleParam === "user") {
      setActiveRole("user");
    }
  }, [roleParam]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const res = await signUpAction({
        email: email.trim(),
        fullName: name.trim(),
        role: activeRole === "volunteer" ? "volunteer" : "citizen",
        electoralArea,
        skills: activeRole === "volunteer" ? selectedSkills : [],
      });

      if (!res.success || !res.data) {
        const errMsg = res.error || "Registration failed. Please try again.";
        setError(errMsg);
        toast.error(errMsg, "Registration Error");
        setPending(false);
        return;
      }

      setSession({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        userId: res.data.userId,
      });

      try {
        if (activeRole === "user") {
          window.localStorage.setItem(
            "tcp:citizen-profile",
            JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              area: electoralArea,
              commChannel,
            })
          );
        } else {
          window.localStorage.setItem(
            "tcp:volunteer-skills",
            JSON.stringify(selectedSkills)
          );
          window.localStorage.setItem(
            "tcp:volunteer-emergency",
            JSON.stringify(emergencyReady)
          );
        }
      } catch {}

      toastCreated.account(res.data.name, res.data.role);

      const target = activeRole === "volunteer" ? "/volunteer" : "/user";
      router.push(target);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to create account.";
      setError(errMsg);
      toast.error(errMsg, "Registration Error");
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-leaf-600 text-white shadow-lg shadow-emerald-500/10 mb-4">
          <UserPlus className="h-7 w-7" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          Join South Tongu District Network
        </span>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ocean-950 dark:text-white sm:text-3xl">
          Create Your Civic Account
        </h1>
        <p className="mt-1.5 text-xs text-ocean-600 dark:text-ocean-400">
          Sign up as a community supporter or volunteer ambassador.
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
        <div className="mt-2 px-3 pb-1 text-[11px] text-ocean-500 text-center">
          {activeRole === "user" ? (
            <span>Report community infrastructure issues, support projects, and participate in district ballots.</span>
          ) : (
            <span>Earn verified volunteer hours, join rapid response missions, and earn official commendation credentials.</span>
          )}
        </div>
      </div>

      {/* Registration Card */}
      <div className="rounded-3xl border border-ocean-200 bg-white p-6 sm:p-8 shadow-xl dark:border-ocean-800 dark:bg-ocean-900">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ama Serwaa Donkor"
              className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@citizen.gh"
                className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 placeholder:text-ocean-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
              Primary Electoral Area / Town in South Tongu
            </label>
            <select
              value={electoralArea}
              onChange={(e) => setElectoralArea(e.target.value)}
              className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
            >
              {ELECTORAL_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Citizen-Specific Fields */}
          {activeRole === "user" && (
            <div>
              <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-1.5">
                Preferred Community Alert Channel
              </label>
              <select
                value={commChannel}
                onChange={(e) => setCommChannel(e.target.value)}
                className="w-full rounded-xl border border-ocean-200 bg-ocean-50/40 px-3.5 py-2.5 text-xs text-ocean-950 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none transition dark:border-ocean-700 dark:bg-ocean-800 dark:text-white"
              >
                <option value="SMS & Email">SMS &amp; Email Notifications</option>
                <option value="SMS Only">SMS Notifications Only (Fast Alerts)</option>
                <option value="Email Only">Email Digest Only</option>
              </select>
            </div>
          )}

          {/* Volunteer-Specific Fields */}
          {activeRole === "volunteer" && (
            <div className="space-y-3 pt-1 border-t border-ocean-100 dark:border-ocean-800">
              <div>
                <label className="block text-xs font-semibold text-ocean-800 dark:text-ocean-200 mb-2">
                  Select Your Field Capabilities / Skills
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOLUNTEER_SKILL_OPTIONS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                          isSelected
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                            : "bg-ocean-50 text-ocean-600 border border-ocean-200 hover:bg-ocean-100 dark:bg-ocean-800/60 dark:text-ocean-400 dark:border-ocean-700"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Emergency Rapid Response Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <Radio className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ocean-950 dark:text-white">
                      Emergency Rapid Response Team (ERRT)
                    </p>
                    <p className="text-[11px] text-ocean-600 dark:text-ocean-400">
                      Available for urgent district SMS alerts (floods, sanitation relief).
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={emergencyReady}
                  onChange={(e) => setEmergencyReady(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              <span>
                {pending
                  ? "Creating Account…"
                  : activeRole === "user"
                  ? "Complete Citizen Registration"
                  : "Register as Community Ambassador"}
              </span>
            </button>
          </div>
        </form>

        {/* Existing account link */}
        <div className="mt-6 pt-4 border-t border-ocean-100 text-center text-xs text-ocean-600 dark:border-ocean-800 dark:text-ocean-400">
          <span>Already registered? </span>
          <Link
            href={`/login?role=${activeRole}`}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 dark:text-emerald-400"
          >
            Sign in to your account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
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
          <RegisterForm />
        </Suspense>
      </div>
    </section>
  );
}
