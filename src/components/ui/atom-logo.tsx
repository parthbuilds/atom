import React from "react";

interface AtomLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function AtomLogo({ size = 32, className = "", ...props }: AtomLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="atomGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0ea5e9" />
          <stop offset="0.5" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="atomNodeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Orbit 1: Vertical ellipse tilted slightly */}
      <ellipse
        cx="20"
        cy="20"
        rx="7.5"
        ry="16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.85"
        transform="rotate(-28 20 20)"
      />

      {/* Orbit 2: Symmetrical opposite tilted ellipse */}
      <ellipse
        cx="20"
        cy="20"
        rx="7.5"
        ry="16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.85"
        transform="rotate(28 20 20)"
      />

      {/* Orbit 3: Horizontal stabilizing equator forming the 'A' crossbar */}
      <ellipse
        cx="20"
        cy="20"
        rx="16.5"
        ry="7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeOpacity="0.85"
      />

      {/* Central Nucleus Core */}
      <circle cx="20" cy="20" r="3.2" fill="url(#atomGrad)" />
      <circle cx="20" cy="20" r="1.4" fill="#ffffff" />

      {/* Orbital bonded component nodes (representing workforce components) */}
      {/* Top Apex Node */}
      <circle cx="20" cy="3.5" r="2.2" fill="url(#atomNodeGrad)" />
      <circle cx="20" cy="3.5" r="0.9" fill="#ffffff" />

      {/* Left Base Node */}
      <circle cx="6.5" cy="29" r="2.2" fill="url(#atomNodeGrad)" />
      <circle cx="6.5" cy="29" r="0.9" fill="#ffffff" />

      {/* Right Base Node */}
      <circle cx="33.5" cy="29" r="2.2" fill="url(#atomNodeGrad)" />
      <circle cx="33.5" cy="29" r="0.9" fill="#ffffff" />

      {/* Equator Bonding Nodes */}
      <circle cx="4.5" cy="18.5" r="1.8" fill="url(#atomNodeGrad)" />
      <circle cx="35.5" cy="18.5" r="1.8" fill="url(#atomNodeGrad)" />

      {/* Lower Center Node */}
      <circle cx="20" cy="36.5" r="1.8" fill="url(#atomNodeGrad)" />
    </svg>
  );
}
