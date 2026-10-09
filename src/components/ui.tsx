"use client";

import Link from "next/link";
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export function Button({
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:opacity-50 disabled:pointer-events-none",
    size === "sm" && "px-4 py-2 text-sm",
    size === "md" && "px-5 py-2.5 text-sm",
    size === "lg" && "px-7 py-3.5 text-base",
    variant === "primary" && "bg-gold-500 text-ocean-950 hover:bg-gold-400 shadow-sm",
    variant === "secondary" && "bg-ocean-700 text-white hover:bg-ocean-600",
    variant === "outline" && "border border-white/40 text-white hover:bg-white/10",
    variant === "ghost" && "text-ocean-800 hover:bg-ocean-50 dark:text-ocean-100 dark:hover:bg-ocean-900",
    className
  );
  if (href) return <Link href={href} className={styles}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={styles}>{children}</button>;
}

export function Card({
  id,
  className,
  onClick,
  children,
}: {
  id?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-ocean-100 bg-white shadow-sm shadow-ocean-950/[0.03] dark:border-ocean-800 dark:bg-ocean-900",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "ocean" }: { children: ReactNode; tone?: "ocean" | "gold" | "leaf" }) {
  const tones = {
    ocean: "bg-ocean-100 text-ocean-800 dark:bg-ocean-800 dark:text-ocean-100",
    gold: "bg-gold-300/40 text-gold-600 dark:text-gold-400",
    leaf: "bg-leaf-400/15 text-leaf-600 dark:text-leaf-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ocean-100 dark:bg-ocean-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-ocean-500 to-leaf-500 transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <div className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 dark:text-gold-400", align === "center" && "justify-center")}>
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="mt-2 text-balance text-2xl font-semibold text-ocean-950 dark:text-white sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-balance text-sm sm:text-base text-ocean-600 dark:text-ocean-300 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref}>
      <p className="font-mono text-4xl font-medium text-white sm:text-5xl tabular-nums">
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-ocean-300">{label}</p>
    </div>
  );
}

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}
