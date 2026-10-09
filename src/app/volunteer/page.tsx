"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getSession,
  setSession,
  SESSION_CHANGED_EVENT,
  type LocalSession,
} from "@/lib/local-session";
import { VolunteerDashboard } from "@/components/dashboard/volunteer-dashboard";
import { SectionHeading, Card, Button, Badge } from "@/components/ui";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

const VOLUNTEER_AREAS = [
  {
    icon: BookOpen,
    title: "Classroom Civic Education",
    desc: "Facilitate interactive citizenship and life-skills workshops for basic school students across South Tongu.",
  },
  {
    icon: Sparkles,
    title: "Community Cleanups & Sanitation",
    desc: "Coordinate grassroots environmental stewardship, waste management, and riverbank cleanups.",
  },
  {
    icon: MapPin,
    title: "Field Issue Verification",
    desc: "Enumerate local social challenges, verify community reports, and map priority needs in your electoral area.",
  },
  {
    icon: Award,
    title: "Certified Service & Leadership",
    desc: "Earn verified service hours, official volunteer transcripts, and district civic leadership recognition.",
  },
];

export default function DedicatedVolunteerPage() {
  const [session, setSessionState] = useState<LocalSession | null | "checking">("checking");

  useEffect(() => {
    const existing = getSession();
    setSessionState(existing);

    const handleSessionSync = () => {
      setSessionState(getSession());
    };

    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionSync);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionSync);
  }, []);

  if (session === "checking") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-[#0c1322]">
        <div className="flex items-center gap-3 text-sm text-ocean-600 dark:text-ocean-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span>Loading Volunteer Portal…</span>
        </div>
      </div>
    );
  }

  // If user is already authenticated as a volunteer, show the dedicated portal dashboard
  if (session && session.role === "volunteer") {
    return (
      <div className="h-screen w-full overflow-hidden bg-white dark:bg-[#0c1322]">
        <VolunteerDashboard session={session} />
      </div>
    );
  }

  // Otherwise, present the welcoming public Volunteer Hub
  return (
    <div className="space-y-16 py-12 sm:space-y-20 sm:py-16">
      {/* Hero Section */}
      <section className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              eyebrow="Grassroots Civic Leadership"
              title="Volunteer with The Citizen Project in South Tongu"
              description="Join an energetic constituency-wide movement of youth leaders, students, and citizens dedicated to accountable communities, clean towns, and quality education."
            />

            {session && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                    {session.name ? session.name.charAt(0).toUpperCase() : "V"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950 dark:text-emerald-100">
                      Signed in as {session.name} ({session.role === "user" ? "Citizen Supporter" : session.role})
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Activate your volunteer persona to log service hours, track shifts, and earn ambassador tiers.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const upgraded: LocalSession = { ...session, role: "volunteer" };
                    setSession(upgraded);
                    setSessionState(upgraded);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition cursor-pointer"
                >
                  <Award className="h-4 w-4" /> Enter Volunteer Console
                </button>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {session ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const upgraded: LocalSession = { ...session, role: "volunteer" };
                      setSession(upgraded);
                      setSessionState(upgraded);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
                  >
                    <HeartHandshake className="h-4 w-4" /> Open Volunteer Ambassador Portal
                  </button>
                  <Button href="/user" size="lg" variant="secondary">
                    Return to Citizen Dashboard &rarr;
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/register?role=volunteer" size="lg" variant="primary">
                    <HeartHandshake className="h-4 w-4" /> Register as a Volunteer
                  </Button>
                  <Button href="/login?role=volunteer&redirect=/volunteer" size="lg" variant="secondary">
                    Sign In to Volunteer Portal
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-ocean-600 dark:text-ocean-400">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-leaf-500" /> All 7 Electoral Areas
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-gold-500" /> Flexible Service Hours
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="h-4 w-4 text-ocean-500" /> Certified Service Transcripts
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-ocean-200/80 bg-ocean-900 shadow-xl dark:border-ocean-800">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/outreach/IMG_9633.jpg"
                  alt="South Tongu Youth Volunteers in Session"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Badge tone="gold">Field Leadership</Badge>
                  <p className="mt-2 font-display text-base font-semibold">
                    Youth Dialogue &amp; Civic Orientation
                  </p>
                  <p className="text-xs text-ocean-300">
                    Sogakope Central · Volunteers leading community consultations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pathways Grid */}
      <section className="bg-ocean-50/70 py-16 dark:bg-ocean-900/30">
        <div className="container-page">
          <SectionHeading
            eyebrow="Areas of Service"
            title="How you will make an impact"
            description="Whether in school classrooms, along the Volta riverbanks, or organizing town halls, there is a role for every skill and background."
            align="left"
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VOLUNTEER_AREAS.map((area) => (
              <Card key={area.title} className="p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean-100 text-ocean-700 dark:bg-ocean-800 dark:text-gold-400">
                  <area.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ocean-950 dark:text-white">
                  {area.title}
                </h3>
                <p className="mt-2 text-xs text-ocean-600 dark:text-ocean-300 leading-relaxed">
                  {area.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ambassador Recognition & Next Step CTA */}
      <section className="container-page">
        <div className="rounded-3xl border border-ocean-200 bg-white p-8 shadow-sm dark:border-ocean-800 dark:bg-ocean-900/60 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400/20 px-3 py-1 text-xs font-semibold text-gold-600 dark:text-gold-400">
                <Award className="h-3.5 w-3.5" /> District Ambassador Program
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ocean-950 dark:text-white sm:text-3xl">
                Ready to stand up for your community?
              </h2>
              <p className="mt-3 text-sm text-ocean-700 dark:text-ocean-300 sm:text-base leading-relaxed">
                Volunteers who achieve 10+, 30+, and 60+ verified hours unlock Bronze, Silver, and Gold Ambassador certifications with official recommendations from district leadership.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button href="/register?role=volunteer" size="md" variant="primary">
                  Sign Up as Volunteer Now
                </Button>
                <Link
                  href="/ambassadors"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 hover:underline dark:text-gold-400"
                >
                  View District Leaderboard &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-ocean-100 bg-ocean-50/80 p-5 dark:border-ocean-800 dark:bg-ocean-950/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-ocean-500">
                  {session ? "Access Your Volunteer Console" : "Already a registered volunteer?"}
                </p>
                <p className="mt-2 text-xs text-ocean-700 dark:text-ocean-300">
                  {session
                    ? "Log your service hours, inspect your official verified transcript, or sign up for upcoming community drives."
                    : "Sign in to log your service hours, inspect your official verified transcript, or sign up for upcoming community drives."}
                </p>
                <div className="mt-4">
                  {session ? (
                    <button
                      type="button"
                      onClick={() => {
                        const upgraded: LocalSession = { ...session, role: "volunteer" };
                        setSession(upgraded);
                        setSessionState(upgraded);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                    >
                      <Award className="h-4 w-4" /> Open Volunteer Portal
                    </button>
                  ) : (
                    <Button href="/login?role=volunteer&redirect=/volunteer" size="sm" variant="secondary" className="w-full">
                      Open Volunteer Portal
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
