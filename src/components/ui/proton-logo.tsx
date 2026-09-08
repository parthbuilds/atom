"use client";

import React from "react";

interface ProtonLogoProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
  dark?: boolean;
}

export function ProtonLogo({
  className = "w-4 h-4",
  glow = false,
  dark = false,
}: ProtonLogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center relative ${className} select-none shrink-0 align-middle overflow-hidden`}
      aria-label="Proton Logo"
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full block"
      >
        <defs>
          <linearGradient id="protonBondGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="protonCoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Ambient Subtle Halo (when enabled) */}
        {glow && (
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="url(#protonBondGrad)"
            className="opacity-20 animate-pulse"
          />
        )}

        {/* Outer 3-Axis Quantum Orbital Rings - Synergized with Atom & Synthio */}
        {/* Ring 1: Primary Horizontal Tilted Loop */}
        <ellipse
          cx="18"
          cy="18"
          rx="13.5"
          ry="6.5"
          transform="rotate(-30 18 18)"
          stroke={dark ? "#60a5fa" : "#3b82f6"}
          strokeWidth="1.5"
          strokeDasharray="2 1.5"
          className="opacity-75"
        />

        {/* Ring 2: Complementary Transverse Loop */}
        <ellipse
          cx="18"
          cy="18"
          rx="13.5"
          ry="6.5"
          transform="rotate(45 18 18)"
          stroke={dark ? "#c084fc" : "#8b5cf6"}
          strokeWidth="1.4"
          strokeDasharray="2.5 2"
          className="opacity-65"
        />

        {/* Ring 3: Vertical Polar Binding Ring (Synthio Molecular Axis) */}
        <ellipse
          cx="18"
          cy="18"
          rx="13.5"
          ry="6.5"
          transform="rotate(90 18 18)"
          stroke={dark ? "#94a3b8" : "#64748b"}
          strokeWidth="1.1"
          strokeDasharray="1.5 2.5"
          className="opacity-45"
        />

        {/* Central Tri-Quark Proton Core Nucleus */}
        <circle cx="18" cy="18" r="3.2" fill="url(#protonCoreGrad)" />
        <circle cx="17.2" cy="17.2" r="1.1" fill="#ffffff" className="opacity-95" />

        {/* Bonded Valence Node 1 (Top Left) */}
        <circle cx="13" cy="13.5" r="1.5" fill="#3b82f6" />
        <circle cx="13" cy="13.5" r="0.6" fill="#ffffff" />

        {/* Bonded Valence Node 2 (Bottom Right) */}
        <circle cx="23" cy="22.5" r="1.5" fill="#8b5cf6" />
        <circle cx="23" cy="22.5" r="0.6" fill="#ffffff" />

        {/* Orbiting High-Energy Quantum Sparklet (Atom Orbit Animation) */}
        <g className="origin-[18px_18px] animate-[spin_4s_linear_infinite]">
          <circle cx="29.5" cy="11.5" r="1.6" fill="#2563eb" className="filter drop-shadow-[0_0_3px_rgba(37,99,235,0.7)]" />
          <circle cx="29.5" cy="11.5" r="0.6" fill="#ffffff" />
        </g>
      </svg>
    </span>
  );
}

export function ProtonBadge({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-muted/60 border border-border/80 text-muted-foreground shadow-2xs ${className}`}
    >
      <ProtonLogo className="size-3" glow={false} dark={dark} />
      <span>PROTON</span>
    </div>
  );
}
