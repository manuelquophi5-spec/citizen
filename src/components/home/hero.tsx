"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, HandHeart, Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ocean-950">
      {/* Tideline motif — a nod to the Volta estuary that runs through South Tongu */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40">
        <motion.svg
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="h-full w-[140%]"
          initial={{ x: 0 }}
          animate={{ x: "-14%" }}
          transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <path
            d="M0,120 C150,180 350,60 600,110 C850,160 1000,60 1200,110 L1200,200 L0,200 Z"
            fill="url(#tide)"
          />
          <defs>
            <linearGradient id="tide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E8AA8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1E8AA8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      <div className="container-page relative section-y">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono text-xs font-medium uppercase tracking-[0.25em] text-ocean-300"
        >
          South Tongu District · Volta Region · Ghana
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 max-w-4xl text-balance text-3xl font-semibold leading-[1.2] text-white sm:text-5xl lg:text-5xl"
        >
          The Citizen Project unites <span className="text-gold-400">young people</span> and <span className="text-ocean-300">institutions</span> across South Tongu in building a more responsible, sustainable, and civically engaged Ghana — <span className="italic font-normal">one community at a time.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-2xl text-balance text-lg text-ocean-200"
        >
          Empowering citizens, resolving grassroots social challenges, and building transparent community partnerships across South Tongu District.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Button href="/donate" size="lg" variant="primary">
            <Heart className="h-4 w-4" /> Donate
          </Button>
          <Button href="/volunteer" size="lg" variant="secondary">
            <HandHeart className="h-4 w-4" /> Become a Volunteer
          </Button>
          <Button href="/survey" size="lg" variant="outline">
            <Megaphone className="h-4 w-4" /> Report a Social Issue
          </Button>
          <Button href="/about" size="lg" variant="ghost" className="!text-ocean-200 hover:!bg-white/10">
            Join Us <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Recent Outreach Field Proof Strip */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-12 flex flex-wrap items-center gap-4 border-t border-ocean-800/80 pt-8"
        >
          <div className="flex -space-x-3 overflow-hidden">
            <Image
              src="/images/outreach/IMG_9626.jpg"
              alt="South Tongu Community Outreach"
              width={44}
              height={44}
              className="inline-block h-11 w-11 rounded-full object-cover ring-2 ring-ocean-950"
            />
            <Image
              src="/images/outreach/IMG_9633.jpg"
              alt="South Tongu Community Outreach"
              width={44}
              height={44}
              className="inline-block h-11 w-11 rounded-full object-cover ring-2 ring-ocean-950"
            />
            <Image
              src="/images/outreach/IMG_9640.jpg"
              alt="South Tongu Community Outreach"
              width={44}
              height={44}
              className="inline-block h-11 w-11 rounded-full object-cover ring-2 ring-ocean-950"
            />
            <Image
              src="/images/outreach/IMG_9650.jpg"
              alt="South Tongu Community Outreach"
              width={44}
              height={44}
              className="inline-block h-11 w-11 rounded-full object-cover ring-2 ring-ocean-950"
            />
          </div>
          <div className="text-xs text-ocean-200">
            <p className="font-semibold text-white">Recent Donation Handover Completed</p>
            <p className="text-ocean-300">
              GH₵ 2,000 deployed in local youth & community support ·{" "}
              <Link href="/gallery" className="text-gold-400 font-semibold underline hover:text-gold-300">
                View 64 field photos &rarr;
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
