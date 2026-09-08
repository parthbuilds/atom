"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtomLogo } from "@/components/ui/atom-logo";
import { AtomWordmark } from "@/components/ui/atom-wordmark";
import {
  Sparkles,
  ArrowRight,
  Building,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  PhoneCall,
  Bot,
  Zap,
  ShieldCheck,
  Radio,
  Play,
  Pause,
  Layers,
  ChevronRight,
} from "lucide-react";

export interface LoginFormProps {
  initialMode?: "signin" | "signup";
}

export function LoginForm({ initialMode = "signin" }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSessionDirect } = useSession();

  const paramMode = searchParams?.get("mode");
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(
    paramMode === "signup" ? "signup" : initialMode
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synthio-style interactive voice simulation state
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(true);
  const [simulatedCallTime, setSimulatedCallTime] = useState("0:18");

  useEffect(() => {
    if (!isSimulatingAudio) return;
    const interval = setInterval(() => {
      setSimulatedCallTime((prev) => {
        const sec = parseInt(prev.split(":")[1] || "18") + 1;
        return `0:${sec < 10 ? "0" : ""}${sec % 60}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulatingAudio]);

  const handleAuthenticate = async (targetEmail?: string, targetPassword?: string) => {
    let cleanEmail = (targetEmail || email || "").trim().toLowerCase();
    
    // If user clicked submit with empty input, auto-fill with demo super admin so they can test instantly!
    if (!cleanEmail) {
      cleanEmail = "admin@atomplatform.io";
      setEmail("admin@atomplatform.io");
      setPassword("demo1234");
    }

    if (activeTab === "signup" && !companyName.trim()) {
      setCompanyName("My Automation Fleet");
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: targetPassword || password || "demo1234",
          companyName: activeTab === "signup" ? (companyName.trim() || "My Automation Fleet") : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      setSuccessMessage(
        activeTab === "signup"
          ? `Account ready! Launching ${data.org?.name || "Workspace"}...`
          : `Signed in as ${data.user?.name || "User"}. Redirecting...`
      );

      const sessionObj = {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        orgId: data.org.id,
        orgName: data.org.name,
        orgSlug: data.org.slug,
      };

      setSessionDirect(sessionObj);

      setTimeout(() => {
        if (data.isNewUser || activeTab === "signup") {
          window.location.href = "/onboarding";
        } else if (data.user.role === "SUPER_ADMIN" || data.user.role === "AGENCY_STAFF") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }, 300);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const fillAndLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setActiveTab("signin");
    setErrorMessage(null);
    handleAuthenticate(demoEmail, "demo1234");
  };

  return (
    <div className="synthio-scope min-h-screen bg-[#f8f7f3] text-neutral-900 flex flex-col justify-between relative overflow-hidden font-synthio-body">
      {/* Background blueprint dot pattern and subtle texture */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60 pointer-events-none" />
      <div className="absolute inset-0 hero-noise opacity-40 pointer-events-none" />

      {/* Synthio Blueprint Dashed Vertical Frame running top to bottom */}
      <div
        className="pointer-events-none fixed inset-0 z-10 mx-auto hidden max-w-[1240px] xl:block"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-0 w-px dashed-line-v opacity-30" />
        <div className="absolute top-0 bottom-0 right-0 w-px dashed-line-v opacity-30" />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <AtomWordmark size="md" showBadge badgeText="v2.4 Core" href="/" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 font-synthio-mono text-[11px] text-neutral-600 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-neutral-300/80 shadow-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SUB-180MS CORE ONLINE</span>
          </div>

          <Link href="/docs">
            <Button
              variant="outline"
              size="sm"
              className="font-synthio-mono text-xs gap-1.5 bg-white/90 border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 rounded-lg shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-neutral-600" />
              Docs
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="relative z-20 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Synthio Architectural Showcase */}
        <div className="lg:col-span-6 space-y-6">
          {/* Telemetry Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-neutral-300/80 text-neutral-800 shadow-xs font-synthio-mono text-[11px] tracking-wide">
            <span className="size-2 rounded-full bg-indigo-600 animate-ping" />
            <Radio className="size-3 text-indigo-600" />
            <span>ATOM KERNEL // AUTONOMOUS WORKFORCE ENGINE</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="font-synthio-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-neutral-950 tracking-tight leading-[1.1]">
              Autonomous AI Agents. <br className="hidden sm:inline" />
              <span className="text-neutral-500">Zero Human Lag.</span>
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-synthio-body max-w-lg">
              Deploy human-cadence Voice receptionists, 24/7 WhatsApp qualifying funnels, and automated appointment calendars into your business in under 60 seconds.
            </p>
          </div>

          {/* Interactive Voice Waveform Blueprint Card */}
          <div className="relative rounded-2xl bg-white/90 border border-neutral-300/90 p-5 shadow-sm backdrop-blur-md overflow-hidden">
            {/* Corner Crosshairs */}
            <span className="absolute top-2 left-2 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute top-2 right-2 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute bottom-2 left-2 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute bottom-2 right-2 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700">
                  <PhoneCall className="size-4" />
                </div>
                <div>
                  <div className="font-synthio-heading font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                    Live Telephony Stream
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-synthio-mono text-[10px] text-neutral-500">
                    CALL ID: #VOX-9284 • {simulatedCallTime}
                  </div>
                </div>
              </div>

              {/* Audio Visualizer Waves */}
              <div className="flex items-center gap-1 h-7 px-2">
                <div className={`w-1 bg-emerald-500 rounded-full ${isSimulatingAudio ? "animate-wave-1" : "h-1"}`} />
                <div className={`w-1 bg-emerald-500 rounded-full ${isSimulatingAudio ? "animate-wave-2" : "h-2"}`} />
                <div className={`w-1 bg-emerald-500 rounded-full ${isSimulatingAudio ? "animate-wave-3" : "h-3"}`} />
                <div className={`w-1 bg-emerald-500 rounded-full ${isSimulatingAudio ? "animate-wave-4" : "h-2"}`} />
                <div className={`w-1 bg-emerald-500 rounded-full ${isSimulatingAudio ? "animate-wave-5" : "h-1"}`} />
              </div>
            </div>

            <div className="rounded-xl bg-neutral-50 border border-neutral-200/80 p-3 space-y-1.5 font-synthio-mono text-xs">
              <div className="text-[11px] text-neutral-500 flex items-center justify-between">
                <span>INBOUND CALLER: +91 98201 ••••</span>
                <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px]">
                  QUALIFIED LEAD
                </span>
              </div>
              <p className="text-neutral-800 text-xs italic">
                &ldquo;Hello, I saw your residential property listing and would like to schedule a site tour this Saturday at 11 AM.&rdquo;
              </p>
              <div className="text-[11px] text-indigo-700 font-medium pt-1 flex items-center gap-1.5">
                <Bot className="size-3.5" />
                <span>AI Agent locked calendar slot and forwarded CRM lead (168ms latency).</span>
              </div>
            </div>

            {/* Quick Play / Pause Toggle */}
            <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-synthio-mono text-neutral-500">
              <span>LATENCY: 168ms // BITRATE: 64kbps HD</span>
              <button
                type="button"
                onClick={() => setIsSimulatingAudio(!isSimulatingAudio)}
                className="flex items-center gap-1 text-neutral-800 hover:text-black font-semibold cursor-pointer"
              >
                {isSimulatingAudio ? (
                  <>
                    <Pause className="size-3" /> Pause Simulator
                  </>
                ) : (
                  <>
                    <Play className="size-3" /> Resume Simulator
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Three Metric Pills */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-white/70 border border-neutral-300/80 shadow-xs">
              <div className="font-synthio-heading font-black text-xl text-neutral-900">
                99.4%
              </div>
              <div className="font-synthio-mono text-[10px] text-neutral-500 uppercase tracking-tight">
                Resolution Rate
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/70 border border-neutral-300/80 shadow-xs">
              <div className="font-synthio-heading font-black text-xl text-neutral-900">
                180ms
              </div>
              <div className="font-synthio-mono text-[10px] text-neutral-500 uppercase tracking-tight">
                Voice Latency
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/70 border border-neutral-300/80 shadow-xs">
              <div className="font-synthio-heading font-black text-xl text-neutral-900">
                24 / 7
              </div>
              <div className="font-synthio-mono text-[10px] text-neutral-500 uppercase tracking-tight">
                Zero Human Lag
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: High-End Synthio Auth Card */}
        <div className="lg:col-span-6 max-w-md w-full mx-auto">
          <div className="relative rounded-3xl bg-white border border-neutral-300 shadow-xl shadow-neutral-900/5 p-6 sm:p-8">
            {/* Top Corner Blueprint Markers */}
            <span className="absolute top-3 left-3 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute top-3 right-3 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute bottom-3 left-3 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>
            <span className="absolute bottom-3 right-3 font-synthio-mono text-[10px] text-neutral-400 select-none">+</span>

            {/* Card Header */}
            <div className="text-center space-y-1.5 pb-2">
              <div className="inline-flex items-center gap-1.5 font-synthio-mono text-[11px] text-neutral-500 uppercase tracking-wider mb-1">
                <Lock className="size-3 text-neutral-700" />
                <span>SECURE ACCESS GATEWAY</span>
              </div>
              <h2 className="font-synthio-heading font-black text-2xl sm:text-3xl text-neutral-950 tracking-tight">
                {activeTab === "signin" ? "Sign In to Atom" : "Create Workspace"}
              </h2>
              <p className="text-xs text-neutral-600 font-synthio-body">
                {activeTab === "signin"
                  ? "Access your autonomous bots, call records, and telemetry"
                  : "Launch your customized multi-tenant AI workforce suite"}
              </p>
            </div>

            {/* Synthio Pill Tab Switcher */}
            <div className="mt-4 mb-6 p-1 rounded-full bg-neutral-100 border border-neutral-300/80 grid grid-cols-2 text-xs font-synthio-heading font-bold relative z-10">
              <button
                type="button"
                id="tab-toggle-signin"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-full transition-all cursor-pointer text-center ${
                  activeTab === "signin"
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="tab-toggle-signup"
                onClick={() => {
                  setActiveTab("signup");
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-full transition-all cursor-pointer text-center ${
                  activeTab === "signup"
                    ? "bg-neutral-950 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-950"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Main Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthenticate();
              }}
              className="space-y-4"
            >
              {/* Company Name field (only for Sign Up) */}
              {activeTab === "signup" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="text-[11px] font-synthio-mono font-semibold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Building className="h-3 w-3 text-neutral-500" /> Company / Business Name
                  </label>
                  <Input
                    type="text"
                    id="input-company-name"
                    placeholder="e.g. Apex Realty or Innovate Labs"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="h-11 text-sm bg-neutral-50/70 border-neutral-300 rounded-xl focus-visible:ring-neutral-950"
                  />
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-synthio-mono font-semibold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-neutral-500" /> Work Email
                </label>
                <Input
                  type="email"
                  id="input-work-email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 text-sm bg-neutral-50/70 border-neutral-300 rounded-xl focus-visible:ring-neutral-950"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-synthio-mono font-semibold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-neutral-500" /> Password
                  </label>
                </div>
                <Input
                  type="password"
                  id="input-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 text-sm bg-neutral-50/70 border-neutral-300 rounded-xl focus-visible:ring-neutral-950"
                />
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 font-synthio-body animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 font-synthio-body animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p>{successMessage}</p>
                </div>
              )}

              {/* Submit Button with Synthio Black Pill Styling */}
              <Button
                type="submit"
                id="btn-auth-submit"
                disabled={loading}
                className="w-full h-12 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl font-synthio-heading font-bold text-sm shadow-md gap-2 cursor-pointer transition-all mt-1"
              >
                {loading ? (
                  "Authenticating..."
                ) : activeTab === "signup" ? (
                  <>
                    Sign Up & Launch Workspace <ArrowRight className="size-4" />
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick Demo Fill Pills for Testing (1-Click Instant Login) */}
            <div className="mt-5 pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-synthio-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                  1-Click Instant Demo Login
                </span>
                <span className="font-synthio-mono text-[10px] text-emerald-700 font-semibold">
                  Zero Typing Needed
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-demo-superadmin"
                  onClick={() => fillAndLogin("admin@atomplatform.io")}
                  className="font-synthio-mono text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-300 transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  id="btn-demo-agencystaff"
                  onClick={() => fillAndLogin("staff@atomplatform.io")}
                  className="font-synthio-mono text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-300 transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                >
                  Agency Staff
                </button>
                <button
                  type="button"
                  id="btn-demo-clientowner"
                  onClick={() => fillAndLogin("vikram@apexrealty.in")}
                  className="font-synthio-mono text-[11px] py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-300 transition-all text-center cursor-pointer shadow-2xs active:scale-95"
                >
                  Client Owner
                </button>
              </div>
            </div>

            {/* Switch Tab Hint */}
            <div className="text-center pt-4 font-synthio-body text-xs text-neutral-600">
              {activeTab === "signin" ? (
                <span>
                  Don&apos;t have an organization?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("signup");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-neutral-950 underline hover:text-black cursor-pointer"
                  >
                    Sign Up for free
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("signin");
                      setErrorMessage(null);
                    }}
                    className="font-bold text-neutral-950 underline hover:text-black cursor-pointer"
                  >
                    Sign In here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Details with Technical Spec */}
      <footer className="relative z-20 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-300/70 text-neutral-500 font-synthio-mono text-[11px]">
        <div>ATOM ENTERPRISE ENGINE • MULTI-TENANT RBAC</div>
        <div className="flex items-center gap-4">
          <Link href="/docs" className="hover:text-neutral-950 transition-colors">
            Documentation & API
          </Link>
          <span>•</span>
          <span>TLS 1.3 ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}
