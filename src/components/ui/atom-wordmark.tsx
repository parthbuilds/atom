"use client";

import React from "react";
import Link from "next/link";

interface AtomWordmarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  badgeText?: string;
  href?: string;
  dark?: boolean;
}

export function AtomOrbitO({
  className = "size-5",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={`inline-flex items-center justify-center relative mx-[1px] ${className} align-middle`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
        aria-label="Atomic Orbit O"
      >
        <defs>
          <linearGradient id="nucleusGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor={dark ? "#60a5fa" : "#3b82f6"} stopOpacity="0.8" />
            <stop offset="1" stopColor={dark ? "#a78bfa" : "#6366f1"} stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Primary elliptical orbital path representing the letter O */}
        <ellipse
          cx="16"
          cy="16"
          rx="13"
          ry="7.5"
          transform="rotate(-30 16 16)"
          stroke="url(#orbitGrad)"
          strokeWidth="1.8"
          strokeDasharray="2 1"
          className="opacity-75"
        />

        {/* Complementary transverse orbital ring */}
        <ellipse
          cx="16"
          cy="16"
          rx="13"
          ry="7.5"
          transform="rotate(45 16 16)"
          stroke={dark ? "#94a3b8" : "#64748b"}
          strokeWidth="1.2"
          strokeDasharray="1.5 2"
          className="opacity-40"
        />

        {/* Central Core Nucleus */}
        <circle cx="16" cy="16" r="3" fill="url(#nucleusGrad)" />
        <circle cx="15.2" cy="15.2" r="1.1" fill="#ffffff" className="opacity-90" />

        {/* Orbiting Electron 1 (Primary - animated along elliptical transform) */}
        <g className="origin-[16px_16px] animate-[spin_4s_linear_infinite]">
          <ellipse
            cx="16"
            cy="16"
            rx="13"
            ry="7.5"
            transform="rotate(-30 16 16)"
            fill="none"
          />
          {/* Electron positioned along path */}
          <circle
            cx="27.5"
            cy="9.5"
            r="1.8"
            fill="#2563eb"
            className="filter drop-shadow-[0_0_4px_rgba(37,99,235,0.8)]"
          />
          <circle cx="27.5" cy="9.5" r="0.7" fill="#ffffff" />
        </g>

        {/* Orbiting Electron 2 (Secondary counter-motion) */}
        <g className="origin-[16px_16px] animate-[spin_6s_linear_infinite_reverse]">
          <circle
            cx="5.5"
            cy="21.5"
            r="1.4"
            fill={dark ? "#38bdf8" : "#0284c7"}
            className="filter drop-shadow-[0_0_3px_rgba(2,132,199,0.7)]"
          />
          <circle cx="5.5" cy="21.5" r="0.5" fill="#ffffff" />
        </g>
      </svg>
    </span>
  );
}

export function AtomWordmark({
  className = "",
  size = "md",
  showBadge = false,
  badgeText = "SaaS Platform",
  href,
  dark = false,
}: AtomWordmarkProps) {
  const sizeStyles = {
    sm: {
      text: "text-base tracking-tight",
      orbit: "size-4 -top-[1px]",
      badge: "text-[9px] px-1.5 py-0.2",
    },
    md: {
      text: "text-xl tracking-tight",
      orbit: "size-5 -top-[1px]",
      badge: "text-[10px] px-2 py-0.5",
    },
    lg: {
      text: "text-2xl sm:text-3xl tracking-tight",
      orbit: "size-7 sm:size-8 -top-[2px]",
      badge: "text-xs px-2.5 py-0.5",
    },
    xl: {
      text: "text-4xl sm:text-5xl tracking-tight",
      orbit: "size-10 sm:size-12 -top-[3px]",
      badge: "text-xs px-3 py-1",
    },
  };

  const currentSize = sizeStyles[size];

  const content = (
    <div className={`inline-flex items-center gap-2 group select-none ${className}`}>
      <span
        className={`font-synthio-heading font-black flex items-center ${currentSize.text} ${
          dark ? "text-white" : "text-neutral-950"
        }`}
      >
        <span className="tracking-tight">AT</span>
        <AtomOrbitO className={`${currentSize.orbit} relative`} dark={dark} />
        <span className="tracking-tight">M</span>
      </span>

      {showBadge && (
        <span
          className={`font-synthio-mono uppercase font-medium rounded-md border tracking-wider ${currentSize.badge} ${
            dark
              ? "bg-white/10 text-neutral-300 border-white/15"
              : "bg-neutral-100 text-neutral-600 border-neutral-200"
          }`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

export default AtomWordmark;
