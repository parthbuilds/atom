"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AtomWordmark } from "@/components/ui/atom-wordmark";
import { useSession } from "@/components/auth/session-provider";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Cpu,
  Mic,
  CreditCard,
  BarChart3,
  Palette,
  ShieldAlert,
  BrainCircuit,
  Lock,
  Compass,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Building,
  ExternalLink,
  Search,
  Code,
  Terminal,
  Layers,
  ShieldCheck,
  AlertCircle,
  PhoneCall,
  Server,
  Database,
  HelpCircle,
  Activity,
  ArrowRight,
  ArrowUpRight,
  Radio,
  Sliders,
  Sparkles,
  Bot,
  Laptop,
  CheckCheck,
  ChevronRight,
} from "lucide-react";

export default function DocsPage() {
  const { isAuthenticated, logout } = useSession();
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    { id: "overview", label: "1. System Architecture & Tech Stack", icon: Compass, tag: "CORE" },
    { id: "quickstart", label: "2. 3-Minute Quickstart & Onboarding", icon: Zap, tag: "SETUP" },
    { id: "credentials", label: "3. Credentials, Auth & Security", icon: Lock, tag: "AUTH" },
    { id: "modules", label: "4. Complete 13-Module Platform Guide", icon: LayoutDashboard, tag: "MODULES" },
    { id: "human-studio", label: "5. Human-in-the-Loop Studio & Websites", icon: Laptop, tag: "HYBRID" },
    { id: "rbac", label: "6. RBAC Role Matrix & Job Governance", icon: ShieldAlert, tag: "SECURITY" },
    { id: "api-webhooks", label: "7. API Endpoints & Webhooks", icon: Cpu, tag: "DEVELOPER" },
    { id: "billing-metering", label: "8. INR Credit Wallet & Usage Metering", icon: CreditCard, tag: "BILLING" },
    { id: "troubleshooting", label: "9. Operations, Diagnostics & FAQ", icon: Server, tag: "OPS" },
  ];

  const filteredSections = searchQuery.trim()
    ? sections.filter(
        (s) =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  return (
    <div className="synthio-scope min-h-screen bg-[#f8f7f3] text-neutral-950 flex flex-col font-synthio-body selection:bg-neutral-900 selection:text-white relative">
      {/* Background blueprint dot pattern - Soft and subtle */}
      <div className="absolute inset-0 bg-dot-pattern opacity-25 pointer-events-none" />

      {/* Blueprint Dashed Vertical Margin Guides - Refined and light */}
      <div
        className="pointer-events-none fixed inset-0 z-30 mx-auto hidden max-w-[1240px] xl:block"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-0 w-px dashed-line-v opacity-25" />
        <div className="absolute top-0 bottom-0 right-0 w-px dashed-line-v opacity-25" />
      </div>

      {/* Floating Header */}
      <header className="sticky top-0 z-40 bg-[#f8f7f3]/90 backdrop-blur-md border-b border-[#e2e0d8] px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <AtomWordmark size="md" showBadge badgeText="Platform Docs" href="/" />
          <span className="hidden lg:inline text-xs font-synthio-mono text-neutral-400">|</span>
          <span className="hidden lg:inline text-xs font-synthio-mono text-neutral-600">
            Autonomous Workforce &amp; CRM Architecture Guide
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex text-xs font-medium text-neutral-600 hover:text-neutral-950 px-3 py-1.5 transition-colors"
          >
            Landing
          </Link>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex text-xs font-medium text-neutral-600 hover:text-neutral-950 px-3 py-1.5 transition-colors items-center gap-1"
          >
            <span>Synthio Studio</span>
            <ArrowUpRight className="size-3 text-neutral-400" />
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 px-4 py-2 rounded-full shadow-2xs transition-all"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Open Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-950 px-3 py-1.5 rounded-full hover:bg-neutral-200/50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-neutral-800 hover:text-neutral-950 px-3 py-1.5 rounded-md hover:bg-neutral-200/50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 px-4 py-2 rounded-full shadow-2xs transition-all active:scale-95"
              >
                <span>Sign Up for Free</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Documentation Split Container */}
      <div className="flex-1 max-w-[1240px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8 relative z-10">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-72 shrink-0 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="size-3.5 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e2e0d8] rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 shadow-2xs font-synthio-body"
            />
          </div>

          <div className="flex items-center justify-between px-2 pt-2">
            <span className="text-[11px] font-synthio-mono font-bold uppercase tracking-wider text-neutral-500">
              Documentation Modules
            </span>
            <span className="text-[10px] font-synthio-mono text-emerald-700 bg-[#edf5f0] px-1.5 py-0.2 rounded border border-emerald-200">
              9 Sections
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {filteredSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-950 text-white shadow-xs font-semibold"
                      : "text-neutral-700 hover:text-neutral-950 hover:bg-white border border-transparent hover:border-[#e2e0d8]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`size-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-neutral-500"}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  <span
                    className={`text-[9px] font-synthio-mono uppercase px-1.5 py-0.2 rounded shrink-0 ${
                      isActive ? "bg-white/20 text-neutral-200" : "bg-neutral-200/70 text-neutral-600"
                    }`}
                  >
                    {sec.tag}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2 text-xs">
            <div className="font-synthio-heading font-bold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Multi-Tenant Guarantee</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed font-synthio-body">
              Every business tenant operates within an isolated workspace. Inbound leads, call recordings, and credit balances are scoped by deterministic <code className="font-synthio-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-800">orgId</code> schema filters.
            </p>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* ========================================================================= */}
          {/* SECTION 1: SYSTEM ARCHITECTURE & TECH STACK                              */}
          {/* ========================================================================= */}
          {activeSection === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#edf5f0] text-emerald-800 border border-emerald-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Compass className="size-3.5" /> Core Architecture &amp; Foundations
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  System Architecture &amp; Technical Specifications
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Deterministic multi-tenant foundation powering autonomous voice synthesis, WhatsApp lead intake, and unified client CRM operations.
                </p>
              </div>

              {/* DETAILED SVG ARCHITECTURE DIAGRAM */}
              <div className="rounded-2xl border border-[#e2e0d8] bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2 font-synthio-mono text-xs font-bold text-neutral-800">
                    <Layers className="size-4 text-blue-600" />
                    <span>END-TO-END AUTONOMOUS DATAFLOW TOPOLOGY</span>
                  </div>
                  <span className="font-synthio-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    Latency: &lt;180ms
                  </span>
                </div>

                {/* Responsive Detailed SVG Diagram */}
                <div className="w-full overflow-x-auto py-2">
                  <svg
                    viewBox="0 0 900 320"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full min-w-[700px] h-auto font-synthio-mono text-xs"
                  >
                    {/* Layer 1: Inbound Traffic */}
                    <g>
                      <rect x="20" y="30" width="160" height="260" rx="12" fill="#faf9f6" stroke="#d8d6ce" strokeWidth="1.5" />
                      <text x="35" y="60" fill="#0f172a" fontWeight="bold" fontSize="12" fontFamily="sans-serif">1. Inbound Sources</text>
                      <rect x="35" y="80" width="130" height="42" rx="8" fill="#ffffff" stroke="#e2e0d8" />
                      <text x="45" y="105" fill="#166534" fontSize="10">WhatsApp (+91...)</text>
                      <rect x="35" y="132" width="130" height="42" rx="8" fill="#ffffff" stroke="#e2e0d8" />
                      <text x="45" y="157" fill="#b45309" fontSize="10">Inbound Phone Call</text>
                      <rect x="35" y="184" width="130" height="42" rx="8" fill="#ffffff" stroke="#e2e0d8" />
                      <text x="45" y="209" fill="#1d4ed8" fontSize="10">Hosted Landing Page</text>
                      <rect x="35" y="236" width="130" height="42" rx="8" fill="#ffffff" stroke="#e2e0d8" />
                      <text x="45" y="261" fill="#7c3aed" fontSize="10">Meta Ads Webhook</text>
                    </g>

                    {/* Connecting Arrows 1 -> 2 */}
                    <path d="M180 155 L240 155" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow)" />

                    {/* Layer 2: Ingestion & Telephony */}
                    <g>
                      <rect x="240" y="30" width="190" height="260" rx="12" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
                      <text x="255" y="60" fill="#1e3a8a" fontWeight="bold" fontSize="12" fontFamily="sans-serif">2. AI Telephony Kernel</text>
                      <rect x="255" y="80" width="160" height="56" rx="8" fill="#ffffff" stroke="#dbeafe" />
                      <text x="265" y="103" fill="#1e40af" fontSize="10" fontWeight="bold">Meta Cloud API</text>
                      <text x="265" y="122" fill="#64748b" fontSize="9">Sub-2s Webhook Dispatch</text>
                      <rect x="255" y="146" width="160" height="56" rx="8" fill="#ffffff" stroke="#dbeafe" />
                      <text x="265" y="169" fill="#b45309" fontSize="10" fontWeight="bold">Sarvam Saaras Speech</text>
                      <text x="265" y="188" fill="#64748b" fontSize="9">&lt;180ms Hinglish Audio</text>
                      <rect x="255" y="212" width="160" height="66" rx="8" fill="#ffffff" stroke="#dbeafe" />
                      <text x="265" y="235" fill="#4338ca" fontSize="10" fontWeight="bold">Deterministic n8n</text>
                      <text x="265" y="254" fill="#64748b" fontSize="9">Intent &amp; Budget Extractor</text>
                      <text x="265" y="268" fill="#166534" fontSize="9">Slot Lock: Google / Cal</text>
                    </g>

                    {/* Connecting Arrows 2 -> 3 */}
                    <path d="M430 155 L490 155" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Layer 3: Atom Core & Multi-Tenant CRM */}
                    <g>
                      <rect x="490" y="30" width="190" height="260" rx="12" fill="#edf5f0" stroke="#bbf7d0" strokeWidth="1.5" />
                      <text x="505" y="60" fill="#14532d" fontWeight="bold" fontSize="12" fontFamily="sans-serif">3. Atom Central Core</text>
                      <rect x="505" y="80" width="160" height="56" rx="8" fill="#ffffff" stroke="#dcfce7" />
                      <text x="515" y="103" fill="#15803d" fontSize="10" fontWeight="bold">Prisma ORM Scoping</text>
                      <text x="515" y="122" fill="#64748b" fontSize="9">Strict orgId Isolation</text>
                      <rect x="505" y="146" width="160" height="56" rx="8" fill="#ffffff" stroke="#dcfce7" />
                      <text x="515" y="169" fill="#1e3a8a" fontSize="10" fontWeight="bold">Prepaid INR Wallet</text>
                      <text x="515" y="188" fill="#64748b" fontSize="9">Razorpay Auto-Alerts</text>
                      <rect x="505" y="212" width="160" height="66" rx="8" fill="#ffffff" stroke="#dcfce7" />
                      <text x="515" y="235" fill="#701a75" fontSize="10" fontWeight="bold">Role-Based RBAC</text>
                      <text x="515" y="254" fill="#64748b" fontSize="9">Owner, Staff &amp; Admin</text>
                      <text x="515" y="268" fill="#15803d" fontSize="9">Live CSS Whitelabel</text>
                    </g>

                    {/* Connecting Arrows 3 -> 4 */}
                    <path d="M680 155 L740 155" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />

                    {/* Layer 4: Human-in-the-Loop Studio */}
                    <g>
                      <rect x="740" y="30" width="140" height="260" rx="12" fill="#faf5ea" stroke="#fde68a" strokeWidth="1.5" />
                      <text x="752" y="60" fill="#78350f" fontWeight="bold" fontSize="11" fontFamily="sans-serif">4. Human Studio</text>
                      <rect x="752" y="80" width="116" height="85" rx="8" fill="#ffffff" stroke="#fef3c7" />
                      <text x="760" y="105" fill="#92400e" fontSize="10" fontWeight="bold">1-Week Website</text>
                      <text x="760" y="123" fill="#64748b" fontSize="8">Next.js 16 Flagship</text>
                      <text x="760" y="137" fill="#64748b" fontSize="8">Framer Motion 60fps</text>
                      <text x="760" y="151" fill="#15803d" fontSize="8">100/100 Lighthouse</text>

                      <rect x="752" y="175" width="116" height="103" rx="8" fill="#ffffff" stroke="#fef3c7" />
                      <text x="760" y="200" fill="#4338ca" fontSize="10" fontWeight="bold">Custom Software</text>
                      <text x="760" y="218" fill="#64748b" fontSize="8">Proprietary CRM Sync</text>
                      <text x="760" y="232" fill="#64748b" fontSize="8">Dedicated ERP Hooks</text>
                      <text x="760" y="246" fill="#64748b" fontSize="8">Custom n8n Logic</text>
                      <text x="760" y="260" fill="#92400e" fontSize="8">Human Developers</text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* 3 Foundation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                    <Code className="size-4" />
                  </div>
                  <div className="font-synthio-heading text-sm font-bold text-neutral-900">
                    Next.js 14 App Router
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">
                    React Server &amp; Client Components, Route Handlers, TypeScript, and CSS tokens for live runtime whitelabel theming.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="size-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                    <Database className="size-4" />
                  </div>
                  <div className="font-synthio-heading text-sm font-bold text-neutral-900">
                    Prisma ORM &amp; SQLite
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">
                    Relational schema with cascade safety across Organizations, Users, Inbound Leads, Voice Call Logs, and Audit Trails.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="size-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <PhoneCall className="size-4" />
                  </div>
                  <div className="font-synthio-heading text-sm font-bold text-neutral-900">
                    Sarvam AI &amp; ElevenLabs
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">
                    Hinglish speech synthesis engine with &lt;180ms first-token latency, human conversational cadence, and automated calendar locking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: 3-MINUTE QUICKSTART & ONBOARDING                              */}
          {/* ========================================================================= */}
          {activeSection === "quickstart" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#faf5ea] text-amber-900 border border-amber-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Zap className="size-3.5" /> Getting Started Guide
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  From Zero to Production in 3 Minutes
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  How businesses and agency clients self-onboard onto Atom, calibrate their AI workforce, and launch automated lead pipelines.
                </p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    title: "Access the Self-Serve Onboarding Wizard",
                    desc: "Navigate directly to http://localhost:3000/onboarding. The 6-stage blueprint wizard guides you through company profiling without requiring upfront credit card details.",
                    code: "GET /onboarding",
                  },
                  {
                    step: "02",
                    title: "Calibrate Business DNA & Industry",
                    desc: "Select from pre-calibrated industry profiles (Clinics & Healthcare, Real Estate, D2C, Home Services, or custom 'Other'). If 'Other' is chosen, provide your exact brand type and brief description.",
                    code: "POST /api/onboarding/calibrate",
                  },
                  {
                    step: "03",
                    title: "Select Operational Bottlenecks",
                    desc: "Pick the bottlenecks bleeding revenue (e.g., missed inbound calls after hours, slow WhatsApp response, no-shows). Atom automatically selects matching automation templates.",
                    code: "SELECT: ['wa-lead-qualifier', 'voice-appointment-booker']",
                  },
                  {
                    step: "04",
                    title: "Calibrate Hinglish Voice Model & WhatsApp Webhook",
                    desc: "Listen to Maya, your Sarvam AI voice receptionist. Test audio pronunciation, adjust tone cadence (<180ms latency), and map Meta Cloud API WhatsApp webhooks.",
                    code: "SARVAM_VOICE_MODEL: 'saaras-v2' (Latency: 142ms)",
                  },
                  {
                    step: "05",
                    title: "1-Week Starter Website Option",
                    desc: "If your business lacks a high-converting website, capture a tailored brief for our human engineering studio. Atom automatically creates a temporary hosted booking page.",
                    code: "HOSTED_FUNNEL: https://yourbrand.atomplatform.io",
                  },
                  {
                    step: "06",
                    title: "Fund Prepaid INR Wallet & Launch",
                    desc: "Recharge your prepaid credit wallet via Razorpay (default ₹5,000 trial credits seeded). All automations switch to ACTIVE status immediately.",
                    code: "WALLET_BALANCE: ₹5,000.00 (Ready to dispatch)",
                  },
                ].map((s) => (
                  <div key={s.step} className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs flex flex-col sm:flex-row items-start gap-4">
                    <span className="font-synthio-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 shrink-0">
                      STEP {s.step}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-synthio-heading font-bold text-base text-neutral-950">{s.title}</h3>
                      <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">{s.desc}</p>
                      <div className="font-synthio-mono text-[10px] text-neutral-500 bg-[#faf9f6] border border-neutral-200 px-2 py-1 rounded inline-block">
                        {s.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-[#edf5f0] border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-synthio-heading font-bold text-emerald-950">Ready to test onboarding?</h4>
                  <p className="text-xs text-emerald-800">Launch the live onboarding sequence in your browser right now.</p>
                </div>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-xs"
                >
                  <span>Launch /onboarding</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: CREDENTIALS, AUTH & SECURITY                                  */}
          {/* ========================================================================= */}
          {activeSection === "credentials" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#eff6ff] text-blue-900 border border-blue-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Lock className="size-3.5" /> Demo Credentials &amp; Access
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  Credentials, Authentication &amp; 1-Click Access
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Pre-configured demo accounts in the database. Use 1-click copy buttons or test directly on the Login page.
                </p>
              </div>

              {/* Demo Accounts Grid with Working Copy Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    role: "SUPER_ADMIN",
                    title: "Super Admin (Agency Master)",
                    name: "Parth (Agency Founder)",
                    org: "Synthex Automation Agency",
                    email: "admin@atomplatform.io",
                    pass: "demo1234",
                    desc: "Complete oversight across all client fleets, global billing, n8n template management, and audit logs.",
                    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
                  },
                  {
                    role: "AGENCY_STAFF",
                    title: "Agency Operations Staff",
                    name: "Neha Mehta (Ops Lead)",
                    org: "Synthex Automation Agency",
                    email: "staff@atomplatform.io",
                    pass: "demo1234",
                    desc: "Assists clients with bot setup, checks CRM pipelines, and triggers test voice calls. No billing edit access.",
                    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
                  },
                  {
                    role: "CLIENT_OWNER",
                    title: "Client Business Owner",
                    name: "Vikram Malhotra",
                    org: "Apex Luxury Properties",
                    email: "vikram@apexrealty.in",
                    pass: "demo1234",
                    desc: "Full autonomy over own workspace, WhatsApp bot settings, credit wallet recharge, and CRM lead table.",
                    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
                  },
                  {
                    role: "CLIENT_TEAM_MEMBER",
                    title: "Client Sales Exec",
                    name: "Rohan Varma",
                    org: "Apex Luxury Properties",
                    email: "rohan@apexrealty.in",
                    pass: "demo1234",
                    desc: "Views and manages inbound leads, schedules Maya voice calls, logs consultation notes and to-dos.",
                    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  },
                ].map((acc, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-synthio-mono font-bold border ${acc.badgeClass}`}>
                        {acc.role}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium">{acc.title}</span>
                    </div>

                    <div>
                      <div className="font-synthio-heading text-sm font-bold text-neutral-900">{acc.name}</div>
                      <div className="text-xs text-neutral-500">{acc.org}</div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">{acc.desc}</p>

                    <div className="p-3 rounded-xl bg-[#faf9f6] border border-neutral-200 font-synthio-mono text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Email:</span>
                        <span className="text-neutral-900 font-semibold">{acc.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Password:</span>
                        <span className="text-blue-600 font-bold">{acc.pass}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(acc.email, `email-${idx}`)}
                        className="flex-1 py-1.5 px-3 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedKey === `email-${idx}` ? (
                          <>
                            <Check className="size-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied Email</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-neutral-500" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/login"
                        className="py-1.5 px-3 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white space-y-2">
                <h3 className="font-synthio-heading font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Zero-Lockout Guarantee</span>
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  If you enter any custom email on the login page (e.g. <code className="font-synthio-mono text-neutral-800">yourname@brand.com</code>), Atom automatically provisions a brand-new tenant workspace with ₹5,000 trial credits so you can test all features without interruption.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: COMPLETE 13-MODULE PLATFORM GUIDE                              */}
          {/* ========================================================================= */}
          {activeSection === "modules" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#f5f3ff] text-indigo-900 border border-indigo-200 font-synthio-mono text-xs font-semibold mb-2">
                  <LayoutDashboard className="size-3.5" /> Application Modules
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  Complete 13-Module Platform Architecture Guide
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Route specifications, permission roles, and interactive components for every screen in Atom.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    route: "/dashboard",
                    name: "Executive Cockpit",
                    badge: "Core Operations",
                    purpose: "Top-level mission control displaying real-time inbound lead volume, blended CPL, and automated bot health.",
                    features: ["4 KPI cards with live deltas", "Recent lead feed with intent pills", "Workforce health monitoring"],
                  },
                  {
                    route: "/dashboard/leads",
                    name: "Inbound CRM Lead Fleet",
                    badge: "CRM Core",
                    purpose: "Central relational table capturing all inquiries from WhatsApp, telephony calls, and web booking funnels.",
                    features: ["Stage transitions (NEW → QUALIFIED → BOOKED)", "1-click trigger Maya voice call", "Consultation notes & to-dos"],
                  },
                  {
                    route: "/dashboard/calls",
                    name: "Real-Time Telephony Call Center",
                    badge: "Voice Telephony",
                    purpose: "Comprehensive call logging showing call duration, Sarvam Hinglish speech latency, audio recordings, and sentiment scores.",
                    features: ["Audio player waveform simulation", "Paise-level call cost calculation", "Sentiment classification"],
                  },
                  {
                    route: "/dashboard/billing",
                    name: "Prepaid INR Credit Wallet",
                    badge: "Finance & Metering",
                    purpose: "Transparent usage tracking per conversation and call minute with automated low-balance webhook notifications.",
                    features: ["Razorpay instant wallet top-up", "Itemized transaction ledger", "Low balance threshold alert configuration"],
                  },
                  {
                    route: "/dashboard/funnels",
                    name: "Hosted Funnel & Booking Pages",
                    badge: "Conversion",
                    purpose: "Hosted appointment booking pages with live calendar time-slot selection and custom branding.",
                    features: ["1-Week starter website launchpad", "Custom domain routing", "Google Calendar two-way sync"],
                  },
                  {
                    route: "/admin",
                    name: "Super-Admin Fleet Command",
                    badge: "Agency Only",
                    purpose: "Command center for our agency to oversee client fleets, track global ARR/MRR, manage the n8n template catalog, and support businesses.",
                    features: ["Cross-tenant tenant switcher", "Global MRR / ARR aggregator", "n8n template management studio"],
                  },
                  {
                    route: "/onboarding",
                    name: "6-Stage Blueprint Wizard",
                    badge: "Self-Serve",
                    purpose: "Frictionless 3-minute self-onboarding allowing clients to calibrate AI personas, test voice samples, and select automation templates.",
                    features: ["Compact industry selector", "Dynamic 'Other' brand capture", "Live Hinglish voice sample player"],
                  },
                ].map((mod) => (
                  <div key={mod.route} className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-synthio-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {mod.route}
                        </span>
                        <h3 className="font-synthio-heading font-bold text-neutral-900 text-sm">{mod.name}</h3>
                      </div>
                      <span className="text-[10px] font-synthio-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                        {mod.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">{mod.purpose}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {mod.features.map((f, i) => (
                        <span key={i} className="text-[10px] font-synthio-mono bg-[#faf9f6] border border-neutral-200 px-2 py-0.5 rounded text-neutral-700">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: HUMAN-IN-THE-LOOP STUDIO & BESPOKE WEBSITES                   */}
          {/* ========================================================================= */}
          {activeSection === "human-studio" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#faf5ea] text-amber-900 border border-amber-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Laptop className="size-3.5" /> Hybrid Model (AI + Human Engineers)
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  Bespoke Websites &amp; Custom Software On-Demand
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  How clients leverage Synthio’s dedicated human software engineers through Atom to build bespoke websites and proprietary software tools.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1-Week Website */}
                <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-3">
                  <div className="size-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                    <Laptop className="size-5" />
                  </div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    1-Week Bespoke Website by Human Engineers
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    AI cannot replace bespoke craft. During Atom onboarding or from your dashboard, submit your branding brief. Synthio’s human designers and senior Next.js engineers architect, build, and deploy your custom digital flagship in 7 days.
                  </p>
                  <ul className="space-y-1.5 text-xs text-neutral-700 pt-2 border-t border-neutral-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Next.js 16 + React 19 decoupled edge architecture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>60fps Framer Motion &amp; custom typography</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Google Lighthouse 100 / 100 performance guarantee</span>
                    </li>
                  </ul>
                </div>

                {/* Custom Software */}
                <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-3">
                  <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                    <Code className="size-5" />
                  </div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    Bespoke Software &amp; ERP Workflows
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Don’t bend your operations to rigid SaaS constraints. Request custom Zoho, Salesforce, Clio, or Dentrix two-way syncs, bespoke PDF generators, or proprietary internal tools built specifically for your team.
                  </p>
                  <ul className="space-y-1.5 text-xs text-neutral-700 pt-2 border-t border-neutral-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Submit requests directly in your Atom dashboard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Dedicated human software architect assigned</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Continuous iteration &amp; self-healing webhook retries</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Client Workflow Blueprint */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-[#faf9f6] space-y-3">
                <h4 className="font-synthio-heading font-bold text-sm text-neutral-900">
                  How The Request Pipeline Works:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-neutral-700">
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                    <div className="font-mono text-[10px] text-neutral-500 font-bold">STEP 1</div>
                    <div className="font-bold">Submit Brief</div>
                    <div className="text-[11px] text-neutral-600">Provide requirements via dashboard form.</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                    <div className="font-mono text-[10px] text-neutral-500 font-bold">STEP 2</div>
                    <div className="font-bold">Human Architect</div>
                    <div className="text-[11px] text-neutral-600">Synthio engineer reviews &amp; writes specs.</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                    <div className="font-mono text-[10px] text-neutral-500 font-bold">STEP 3</div>
                    <div className="font-bold">Rapid Build</div>
                    <div className="text-[11px] text-neutral-600">Delivered within 7 days with live preview.</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-neutral-200 space-y-1">
                    <div className="font-mono text-[10px] text-neutral-500 font-bold">STEP 4</div>
                    <div className="font-bold">Live Hookup</div>
                    <div className="text-[11px] text-neutral-600">Connected to Atom CRM and telephony automatically.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: RBAC ROLE MATRIX                                               */}
          {/* ========================================================================= */}
          {activeSection === "rbac" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#fdf2f8] text-rose-900 border border-rose-200 font-synthio-mono text-xs font-semibold mb-2">
                  <ShieldAlert className="size-3.5" /> Security &amp; Permissions
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  Deterministic RBAC Role Matrix
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Security permissions table enforced at both Next.js Route Handler and Prisma middleware layers.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs">
                <table className="w-full text-left text-xs border-collapse font-synthio-body">
                  <thead>
                    <tr className="bg-[#faf9f6] border-b border-neutral-200 text-neutral-600 font-synthio-mono text-[11px]">
                      <th className="p-3.5 font-bold">Permission Action</th>
                      <th className="p-3.5 font-bold">Super Admin</th>
                      <th className="p-3.5 font-bold">Agency Staff</th>
                      <th className="p-3.5 font-bold">Client Owner</th>
                      <th className="p-3.5 font-bold">Team Member</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {[
                      { action: "agency:manage_all", sa: true, as: false, co: false, tm: false },
                      { action: "billing:recharge_wallet", sa: true, as: false, co: true, tm: false },
                      { action: "automations:toggle_status", sa: true, as: true, co: true, tm: false },
                      { action: "leads:view_and_export", sa: true, as: true, co: true, tm: true },
                      { action: "leads:trigger_voice_call", sa: true, as: true, co: true, tm: true },
                      { action: "theme:live_whitelabel", sa: true, as: false, co: true, tm: false },
                      { action: "website:submit_brief", sa: true, as: true, co: true, tm: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-neutral-50/50">
                        <td className="p-3.5 font-synthio-mono text-neutral-800 font-semibold">{row.action}</td>
                        <td className="p-3.5">{row.sa ? <Check className="size-4 text-emerald-600" /> : <span className="text-neutral-300">-</span>}</td>
                        <td className="p-3.5">{row.as ? <Check className="size-4 text-emerald-600" /> : <span className="text-neutral-300">-</span>}</td>
                        <td className="p-3.5">{row.co ? <Check className="size-4 text-emerald-600" /> : <span className="text-neutral-300">-</span>}</td>
                        <td className="p-3.5">{row.tm ? <Check className="size-4 text-emerald-600" /> : <span className="text-neutral-300">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 7: API ENDPOINTS & WEBHOOKS                                       */}
          {/* ========================================================================= */}
          {activeSection === "api-webhooks" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#eff6ff] text-blue-900 border border-blue-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Cpu className="size-3.5" /> Integration Specifications
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  API Endpoints &amp; Webhook Catalog
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  JSON REST contracts for programmatic lead ingestion, telephony dispatches, and balance synchronization.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    method: "POST",
                    path: "/api/auth/login",
                    desc: "Authenticates or auto-provisions a business organization and user session.",
                    payload: `{\n  "email": "admin@atomplatform.io",\n  "companyName": "Apex Realty"\n}`,
                  },
                  {
                    method: "POST",
                    path: "/api/webhooks/whatsapp",
                    desc: "Meta Cloud API webhook receiving inbound customer messages and dispatching sub-2s qualification.",
                    payload: `{\n  "from": "+919876543210",\n  "message": "Hi, I want to book an appointment",\n  "orgId": "org-apex-realty"\n}`,
                  },
                  {
                    method: "POST",
                    path: "/api/leads/voice-call",
                    desc: "Triggers Maya Sarvam AI voice telephony call with real-time Hinglish speech synthesis.",
                    payload: `{\n  "leadId": "lead-4129",\n  "agentVoice": "saaras-v2",\n  "customPrompt": "Confirm appointment for tomorrow 5pm"\n}`,
                  },
                ].map((api, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-synthio-mono text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {api.method}
                        </span>
                        <code className="font-synthio-mono text-xs font-bold text-neutral-900">{api.path}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(api.payload, `api-${i}`)}
                        className="text-xs font-synthio-mono text-neutral-600 hover:text-neutral-950 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `api-${i}` ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                        <span>Copy Payload</span>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-600">{api.desc}</p>
                    <pre className="p-3 rounded-xl bg-[#faf9f6] border border-neutral-200 font-synthio-mono text-xs text-neutral-800 overflow-x-auto">
                      {api.payload}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 8: INR CREDIT WALLET & USAGE METERING                             */}
          {/* ========================================================================= */}
          {activeSection === "billing-metering" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#edf5f0] text-emerald-900 border border-emerald-200 font-synthio-mono text-xs font-semibold mb-2">
                  <CreditCard className="size-3.5" /> Granular Billing
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  INR Usage Metering &amp; Auto-Recharge Formulas
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Transparent paise-level deductions per interaction. No arbitrary monthly markups.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="font-synthio-mono text-xs text-neutral-500 uppercase">Voice AI Calls</div>
                  <div className="font-synthio-heading text-3xl font-black text-neutral-950">₹2.40</div>
                  <div className="text-xs text-neutral-600">Per connected minute (Sarvam + ElevenLabs)</div>
                </div>

                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="font-synthio-mono text-xs text-neutral-500 uppercase">WhatsApp Intake</div>
                  <div className="font-synthio-heading text-3xl font-black text-neutral-950">₹0.18</div>
                  <div className="text-xs text-neutral-600">Per inbound message qualified by LLM</div>
                </div>

                <div className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                  <div className="font-synthio-mono text-xs text-neutral-500 uppercase">Low-Balance Alert</div>
                  <div className="font-synthio-heading text-3xl font-black text-amber-700">₹250</div>
                  <div className="text-xs text-neutral-600">Threshold triggers SMS/WhatsApp reminder</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 9: OPERATIONS, DIAGNOSTICS & FAQ                                  */}
          {/* ========================================================================= */}
          {activeSection === "troubleshooting" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-[#e2e0d8]">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#faf9f6] text-neutral-900 border border-neutral-200 font-synthio-mono text-xs font-semibold mb-2">
                  <Server className="size-3.5" /> Reliability &amp; FAQ
                </div>
                <h1 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950">
                  Operations, Diagnostics &amp; Operational FAQ
                </h1>
                <p className="text-sm text-neutral-600 mt-1.5 leading-relaxed">
                  Common questions, self-healing fallbacks, and webhook health inspection.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    q: "What happens if an inbound voice call loses connectivity?",
                    a: "The telephony kernel utilizes automated SIP fallbacks. If packet loss exceeds 200ms, the system gracefully terminates the voice call, logs the transcript gathered so far, and dispatches an immediate WhatsApp follow-up with calendar booking links.",
                  },
                  {
                    q: "How do human engineers collaborate with my team on custom websites?",
                    a: "When you request a website in Atom, a dedicated Slack/WhatsApp channel is provisioned with Synthio’s engineering team. You receive continuous staging previews on Vercel Edge within 48 hours, with final handover within 7 days.",
                  },
                  {
                    q: "Do I own my data and custom code?",
                    a: "Yes, 100%. All client tables, leads, call recordings, and bespoke Next.js codebase repositories are 100% client property with zero proprietary lock-in.",
                  },
                ].map((faq, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs space-y-2">
                    <h3 className="font-synthio-heading font-bold text-sm text-neutral-950">{faq.q}</h3>
                    <p className="text-xs text-neutral-600 leading-relaxed font-synthio-body">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modern Comprehensive Synthio & Atom Blueprint Footer */}
      <footer className="border-t border-[#e2e0d8] bg-[#f4f3ee] pt-14 pb-12 mt-16 relative z-10 text-xs text-neutral-600">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Pre-Footer Architecture & Developer Callout Card */}
          <div className="rounded-3xl border border-[#e2e0d8] bg-white p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#edf5f0] text-emerald-800 border border-emerald-200 font-synthio-mono text-[11px] font-semibold">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>HYBRID WORKFORCE &amp; CUSTOM ARCHITECTURE</span>
              </div>
              <h3 className="font-synthio-heading text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight">
                Need a Custom Automation Pipeline or Dedicated Engineering?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-synthio-body">
                Deploy production Sarvam Hinglish voice receptionists, Meta WhatsApp Cloud webhooks, or request a bespoke Next.js web application engineered directly by Synthio’s technical studio.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-neutral-950 text-white font-medium text-xs hover:bg-neutral-800 transition-all shadow-xs"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href="/onboarding/website"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-[#f8f7f3] border border-[#d8d6ce] text-neutral-800 font-medium text-xs hover:bg-neutral-100 transition-all"
              >
                <Laptop className="size-3.5 text-neutral-600" />
                <span>Request Custom Website</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white border border-[#d8d6ce] text-neutral-700 font-medium text-xs hover:bg-neutral-50 transition-all"
              >
                <span>Open Dashboard →</span>
              </Link>
            </div>
          </div>

          {/* Multi-Column Technical Directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pt-2">
            {/* Column 1: Brand & Blueprint Architecture (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <AtomWordmark size="md" showBadge badgeText="Documentation" href="/" />
              <p className="text-xs text-neutral-600 leading-relaxed max-w-sm font-synthio-body">
                Atom is an enterprise multi-tenant automation OS and conversational AI workforce platform. Deterministic bot dispatching, Sarvam Voice AI outreach, Meta Cloud WhatsApp routing, and prepaid INR credit telemetry.
              </p>
              <div className="space-y-1.5 text-[11px] font-synthio-mono text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>Stack: Next.js 14 • Tailwind CSS • Prisma • Meta Cloud API</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  <span>Telephony: Sarvam AI Hinglish STT/TTS • ElevenLabs Neural</span>
                </div>
              </div>
            </div>

            {/* Column 2: Documentation Guide */}
            <div className="space-y-3">
              <div className="font-synthio-heading text-xs font-bold uppercase tracking-wider text-neutral-900">
                Docs Sections
              </div>
              <ul className="space-y-2 text-xs">
                {sections.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(s.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-neutral-600 hover:text-neutral-950 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="text-[10px] font-synthio-mono text-neutral-400">#</span>
                      <span className="truncate">{s.label.replace(/^\d+\.\s*/, "")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Advanced Modules */}
            <div className="space-y-3">
              <div className="font-synthio-heading text-xs font-bold uppercase tracking-wider text-neutral-900">
                Architecture &amp; Ops
              </div>
              <ul className="space-y-2 text-xs">
                {sections.slice(5).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection(s.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-neutral-600 hover:text-neutral-950 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="text-[10px] font-synthio-mono text-neutral-400">#</span>
                      <span className="truncate">{s.label.replace(/^\d+\.\s*/, "")}</span>
                    </button>
                  </li>
                ))}
                <li>
                  <Link
                    href="/status/tok_elxptc_mtt74bas"
                    className="text-neutral-600 hover:text-neutral-950 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[10px] font-synthio-mono text-emerald-600">●</span>
                    <span>Live Client Portal Demo</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Platform Apps */}
            <div className="space-y-3">
              <div className="font-synthio-heading text-xs font-bold uppercase tracking-wider text-neutral-900">
                Platform Console
              </div>
              <ul className="space-y-2 text-xs text-neutral-600">
                <li>
                  <Link href="/dashboard" className="hover:text-neutral-950 transition-colors">
                    Executive Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/crm" className="hover:text-neutral-950 transition-colors">
                    CRM Leads &amp; Pipeline
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-neutral-950 transition-colors">
                    Projects &amp; Client Updates
                  </Link>
                </li>
                <li>
                  <Link href="/voice-agent" className="hover:text-neutral-950 transition-colors">
                    Voice AI Outbound Agent
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-neutral-950 transition-colors">
                    Analytics &amp; ROI Engine
                  </Link>
                </li>
                <li>
                  <Link href="/billing" className="hover:text-neutral-950 transition-colors">
                    Credits &amp; Billing
                  </Link>
                </li>
                <li>
                  <Link href="/settings/theme" className="hover:text-neutral-950 transition-colors">
                    White-Label Theming
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-Footer Strip with Status & Legal */}
          <div className="pt-6 border-t border-[#e2e0d8] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-synthio-mono text-neutral-500">
            <div className="flex flex-wrap items-center gap-3">
              <span>Atom Platform © 2026. Backed by Synthio Engineering Studio.</span>
              <span className="hidden sm:inline text-neutral-300">•</span>
              <span className="text-neutral-400">All rights reserved.</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Telephony &amp; Webhook Pipelines Operational (99.98%)</span>
              </div>
              <span className="text-neutral-300">•</span>
              <Link href="/login" className="hover:text-neutral-950 transition-colors">
                Sign In
              </Link>
              <span className="text-neutral-300">•</span>
              <Link href="/signup" className="hover:text-neutral-950 transition-colors">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
