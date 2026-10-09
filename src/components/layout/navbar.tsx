"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Heart, Search, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSession, type LocalSession } from "@/lib/local-session";
import { ThemeToggle } from "./theme-toggle";

type NavItem = { label: string; href: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: (NavItem | NavGroup)[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    items: [
      { label: "Our Story", href: "/about" },
      { label: "Vision", href: "/vision" },
      { label: "Mission", href: "/mission" },
      { label: "Success Stories", href: "/success-stories" },
      { label: "Media Gallery", href: "/gallery" },
      { label: "Blog", href: "/blog" },
      { label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Our Work",
    items: [
      { label: "Initiatives", href: "/initiatives" },
      { label: "Events", href: "/events" },
      { label: "Impact", href: "/impact" },
      { label: "Transparency", href: "/transparency" },
    ],
  },
  {
    label: "Get Involved",
    items: [
      { label: "Volunteer", href: "/volunteer" },
      { label: "Become an Ambassador", href: "/ambassadors" },
      { label: "Partner With Us", href: "/partners" },
      { label: "Report a Social Issue", href: "/survey" },
      { label: "Community Map", href: "/community-map" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

function isGroup(item: NavItem | NavGroup | undefined): item is NavGroup {
  return !!item && "items" in item;
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<LocalSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  if (
    pathname?.startsWith("/admin") ||
    pathname === "/user" ||
    pathname?.startsWith("/user/dashboard") ||
    (pathname?.startsWith("/volunteer") && session?.role === "volunteer")
  ) {
    return null;
  }

  const portalHref = session
    ? session.role === "admin"
      ? "/admin"
      : session.role === "volunteer"
      ? "/volunteer"
      : "/user"
    : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-ocean-100 bg-white/90 backdrop-blur-md dark:border-ocean-900 dark:bg-ocean-950/90">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-lg font-semibold text-ocean-900 dark:text-ocean-50">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean-700 text-sm text-white">TC</span>
          The Citizen Project
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="group relative">
                <button className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900">
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                </button>
                <div className="invisible absolute left-0 top-full z-10 w-64 translate-y-1 rounded-xl border border-ocean-100 bg-white p-2 opacity-0 shadow-xl shadow-ocean-950/5 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-ocean-800 dark:bg-ocean-900">
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-800/60",
                        pathname === sub.href && "bg-ocean-50 text-ocean-900 font-semibold dark:bg-ocean-800 dark:text-white"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-md px-3 py-2 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900",
                  pathname === item.href && "bg-ocean-50 text-ocean-900 font-semibold dark:bg-ocean-800 dark:text-white"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/search" aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900">
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <Link
              href={portalHref}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900"
            >
              <User className="h-4 w-4" /> {session.name.split(" ")[0] || "Portal"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
          <ThemeToggle />
          <Link
            href="/donate"
            className="flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ocean-950 shadow-sm transition hover:bg-gold-400"
          >
            <Heart className="h-4 w-4" /> Donate
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/donate"
            className="flex h-9 items-center gap-1.5 rounded-full bg-gold-500 px-3.5 text-xs font-semibold text-ocean-950 shadow-sm transition hover:bg-gold-400"
          >
            <Heart className="h-3.5 w-3.5" /> Donate
          </Link>
          <button
            className="rounded-md p-2 text-ocean-800 dark:text-ocean-100"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ocean-100 bg-white px-5 py-4 dark:border-ocean-900 dark:bg-ocean-950 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) =>
              isGroup(item) ? (
                <div key={item.label} className="pt-3 first:pt-0">
                  <p className="px-3 pb-1 font-mono text-xs font-medium uppercase tracking-[0.2em] text-ocean-600 dark:text-ocean-400">
                    {item.label}
                  </p>
                  {item.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2.5 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900",
                    isGroup(NAV[NAV.indexOf(item) - 1]) && "mt-2 border-t border-ocean-100 pt-3 dark:border-ocean-900"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-2 border-t border-ocean-100 pt-3 dark:border-ocean-900">
              {session ? (
                <Link
                  href={portalHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900"
                >
                  <User className="h-4 w-4" /> {session.name || "Portal"}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium text-ocean-800 hover:bg-ocean-50 dark:text-ocean-200 dark:hover:bg-ocean-900"
                >
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              )}
              <div className="mt-2 flex items-center justify-between">
                <ThemeToggle />
                <Link
                  href="/donate"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ocean-950"
                >
                  <Heart className="h-4 w-4" /> Donate
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
