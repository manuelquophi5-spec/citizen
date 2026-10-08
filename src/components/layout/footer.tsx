"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Youtube, MessageCircle, Twitter } from "lucide-react";
import { NewsletterForm } from "@/components/forms/newsletter-form";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Initiatives", href: "/initiatives" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Transparency", href: "/transparency" },
];

const getInvolved = [
  { label: "Donate", href: "/donate" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Become an Ambassador", href: "/ambassadors" },
  { label: "Partner With Us", href: "/partners" },
  { label: "Report a Social Issue", href: "/survey" },
];

const social = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "X" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export function Footer() {
  const pathname = usePathname();

  if (
    pathname?.startsWith("/admin") ||
    pathname === "/user" ||
    pathname?.startsWith("/user/dashboard") ||
    pathname === "/volunteer" ||
    pathname?.startsWith("/volunteer/dashboard")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-ocean-100 bg-ocean-950 text-ocean-100 dark:border-ocean-900">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-white">The Citizen Project</p>
          <p className="mt-3 max-w-xs text-sm text-ocean-300">
            One citizen. One community. One responsibility. Building civic participation and sustainable
            development across South Tongu District, Ghana.
          </p>
          <div className="mt-5 flex gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-900 text-ocean-200 transition hover:bg-ocean-800 hover:text-white"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-400">Quick Links</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ocean-200 hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-400">Get Involved</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {getInvolved.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ocean-200 hover:text-white">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean-400">Stay Informed</p>
          <p className="mt-4 text-sm text-ocean-300">Get updates on new initiatives, events, and reports.</p>
          <div className="mt-3">
            <NewsletterForm dark />
          </div>
        </div>
      </div>

      <div className="border-t border-ocean-900">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-ocean-400 sm:flex-row">
          <p>© {new Date().getFullYear()} The Citizen Project. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-white">Cookie Policy</Link>
            <Link href="/admin/login" className="hover:text-gold-400 text-ocean-400/80 font-mono transition">Assembly Terminal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
