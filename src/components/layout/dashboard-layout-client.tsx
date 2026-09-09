"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AtomOrbitO } from "@/components/ui/atom-wordmark";
import { ProtonLogo } from "@/components/ui/proton-logo";
import { AtomAiPanel } from "@/components/layout/atom-ai-panel";
import {
  LayoutDashboard,
  Users,
  Cpu,
  Mic,
  Filter,
  CreditCard,
  BarChart3,
  Palette,
  ShieldAlert,
  Sun,
  Moon,
  PlusCircle,
  AlertTriangle,
  ChevronDown,
  Building,
  Zap,
  ExternalLink,
  LogIn,
  LogOut,
  BrainCircuit,
  ShieldCheck,
  Check,
  BookOpen,
  Layers,
  Settings,
  MessageSquare,
} from "lucide-react";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentSession, isAuthenticated, setRole, setOrg, availableRoles, logout } = useSession();
  const { tokens, toggleMode } = useTheme();

  // Redirect to login if user is unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("atom_active_session") : null;
      if (!saved) {
        window.location.href = "/login";
      }
    }
  }, [isAuthenticated]);

  const [creditBalance, setCreditBalance] = useState<number>(8450);
  const [isLowBalance, setIsLowBalance] = useState<boolean>(false);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);
  const [topupAmount, setTopupAmount] = useState<number>(2000);
  const [isTopupProcessing, setIsTopupProcessing] = useState<boolean>(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Listen for Cmd+K / Ctrl+K or Cmd+J to toggle Atom AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K" || e.key === "j" || e.key === "J")) {
        e.preventDefault();
        setShowAiPanel((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch current org credits
  const fetchBalance = async () => {
    try {
      const res = await fetch(`/api/billing?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        setCreditBalance(data.creditBalance);
        setIsLowBalance(data.isLowBalance);
      }
    } catch {
      // fallback to state
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [currentSession.orgId]);

  const handleTopup = async () => {
    setIsTopupProcessing(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          orgId: currentSession.orgId,
          amountInr: topupAmount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreditBalance(data.newBalance);
        setIsLowBalance(data.newBalance < 500);
        setShowTopupModal(false);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsTopupProcessing(false);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, minRole: "ALL" },
    { label: "CRM Leads & Pipeline", href: "/crm", icon: Users, minRole: "ALL" },
    { label: "Projects & Client Updates", href: "/projects", icon: Layers, minRole: "ALL" },
    { label: "Messages & Client Queue", href: "/messages", icon: MessageSquare, minRole: "ALL" },
    { label: "AI Knowledge Hub", href: "/knowledge", icon: BrainCircuit, minRole: "ALL" },
    { label: "Automations", href: "/automations", icon: Cpu, minRole: "ALL" },
    { label: "Voice AI Agent", href: "/voice-agent", icon: Mic, minRole: "ALL" },
    { label: "Funnel Hub", href: "/funnels", icon: Filter, minRole: "ALL" },
    {
      label: "Credits & Billing",
      href: "/billing",
      icon: CreditCard,
      minRole: "OWNER_ONLY", // Hidden or disabled for team member & viewer per RBAC
    },
    { label: "Analytics & CPL", href: "/analytics", icon: BarChart3, minRole: "ALL" },
  ];

  const isAgencyRole =
    currentSession.role === "SUPER_ADMIN" || currentSession.role === "AGENCY_STAFF";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - Fixed to 100vh, never pushed down by long page content */}
      <aside className="w-64 h-screen border-r border-border bg-card/60 backdrop-blur-md flex flex-col justify-between shrink-0 hidden md:flex overflow-hidden">
        {/* Scrollable Navigation Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo & Org */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <NextLink href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-primary/10 border border-border/80 flex items-center justify-center shadow-2xs group-hover:border-primary/50 transition-colors shrink-0">
                  <AtomOrbitO className="size-5" dark={tokens.mode === "dark"} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1 leading-none">
                    <span className="font-heading font-black tracking-tight text-foreground text-base flex items-center">
                      <span>AT</span>
                      <AtomOrbitO className="size-3.5 -top-[1px]" dark={tokens.mode === "dark"} />
                      <span>M</span>
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground font-mono">CORE</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-sans mt-1 truncate">Self-Serve Automation</div>
                </div>
              </NextLink>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono text-muted-foreground shrink-0">
                v2.4
              </Badge>
            </div>

            {/* Current Org Badge */}
            <div className="mt-3 p-2 rounded-lg bg-muted/40 border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> Org:
                </span>
                <span className="font-semibold text-foreground truncate max-w-[130px]">
                  {currentSession.orgName}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isBlocked =
                item.minRole === "OWNER_ONLY" &&
                currentSession.role !== "CLIENT_OWNER" &&
                currentSession.role !== "SUPER_ADMIN";

              return (
                <NextLink
                  key={item.href}
                  href={isBlocked ? "#" : item.href}
                  onClick={(e) => {
                    if (isBlocked) {
                      e.preventDefault();
                      alert(
                        `Access Restricted by RBAC: '${item.label}' requires Client Owner or Super Admin role. Current role: ${currentSession.role}`
                      );
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : isBlocked
                        ? "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {isBlocked && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 opacity-60">
                      Locked
                    </Badge>
                  )}
                </NextLink>
              );
            })}

            {/* Agency Super-Admin Tab */}
            {isAgencyRole && (
              <div className="pt-2">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                  Agency Command
                </div>
                <NextLink
                  href="/admin"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/admin"
                      ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Agency Admin</span>
                </NextLink>
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Credits Pill & User Profile - Fixed pinned at bottom */}
        <div className="p-3 border-t border-border space-y-3 shrink-0 bg-card/80 backdrop-blur-md">
          {/* Credit Wallet Card */}
          <div
            className={`p-3 rounded-xl border transition-all ${isLowBalance
                ? "border-destructive/60 bg-destructive/10"
                : "border-border/80 bg-muted/30"
              }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Wallet Balance
              </span>
              {isLowBalance && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-destructive">
                  <AlertTriangle className="h-3 w-3" /> Low
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold text-foreground tracking-tight">
                {formatInr(creditBalance)}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2"
                onClick={() => setShowTopupModal(true)}
              >
                + Top Up
              </Button>
            </div>
          </div>

          {/* User Profile & Settings Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfilePopup(!showProfilePopup);
                setShowOrgDropdown(false);
                setShowRoleDropdown(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all text-left group cursor-pointer ${
                showProfilePopup
                  ? "bg-muted/80 border-primary/50 shadow-xs"
                  : "bg-muted/40 hover:bg-muted/70 border-border/70 hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0 pr-2">
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {currentSession.name ? currentSession.name.slice(0, 2).toUpperCase() : "US"}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-card" />
                </div>
                <div className="truncate min-w-0">
                  <div className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                    {currentSession.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground capitalize truncate">
                    {currentSession.role.toLowerCase().replace(/_/g, " ")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-muted-foreground group-hover:text-foreground">
                <Settings className={`h-4 w-4 transition-transform duration-200 ${showProfilePopup ? "text-primary rotate-45" : ""}`} />
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${showProfilePopup ? "rotate-180 text-primary" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Strictly h-screen and overflow-hidden so only main scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Floating Bar for Navigation & High-Level Controls */}
        <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Atom Logo Link */}
            <NextLink
              href="/dashboard"
              className="flex md:hidden items-center gap-1.5 mr-1 group p-1 rounded-lg hover:bg-muted/50 transition-colors shrink-0"
              title="Atom Dashboard"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <AtomOrbitO className="size-4" dark={tokens.mode === "dark"} />
              </div>
              <span className="font-heading font-black tracking-tight text-foreground text-sm flex items-center leading-none">
                <span>AT</span>
                <AtomOrbitO className="size-3.5 -top-[1px]" dark={tokens.mode === "dark"} />
                <span>M</span>
              </span>
            </NextLink>

            {/* Prominent Organization Selector Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowOrgDropdown(!showOrgDropdown);
                  setShowRoleDropdown(false);
                }}
                className="h-10 px-3 sm:px-4 rounded-xl border border-border/80 bg-background/90 hover:bg-muted/60 hover:border-primary/40 transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs text-foreground cursor-pointer"
                title="Switch Active Organization"
              >
                <div className="h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  <Building className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none hidden sm:block">
                    Organization
                  </span>
                  <span className="truncate max-w-[120px] sm:max-w-[180px] leading-tight">
                    {currentSession.orgName}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showOrgDropdown ? "rotate-180 text-primary" : ""}`} />
              </button>

              {/* Organization Dropdown Menu */}
              {showOrgDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowOrgDropdown(false)}
                  />
                  <div className="absolute left-0 top-12 z-50 w-72 sm:w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-border/60">
                      <div className="text-xs font-bold text-foreground">Switch Active Organization</div>
                      <div className="text-[11px] text-muted-foreground">Select workspace to view leads & automations</div>
                    </div>
                    <div className="py-1 space-y-1">
                      {[
                        {
                          id: "org-apex-realty",
                          name: "Apex Luxury Properties",
                          slug: "apex-realty",
                          desc: "Real Estate • Active Website Funnel",
                          badge: "Live Website",
                        },
                        {
                          id: "org-dr-sharma-dental",
                          name: "Dr. Sharma Dental Aesthetics",
                          slug: "dr-sharma-dental",
                          desc: "Healthcare Clinic • 1-Week Launch",
                          badge: "Inbound Funnel",
                        },
                        {
                          id: "org-agency-master",
                          name: "Synthex Automation Agency",
                          slug: "synthex-agency",
                          desc: "Agency Master Account • Multi-Tenant",
                          badge: "Master",
                        },
                      ].map((org) => {
                        const isSelected = currentSession.orgId === org.id;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              setOrg(org.id, org.name, org.slug);
                              setShowOrgDropdown(false);
                            }}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer ${isSelected
                                ? "bg-primary/10 border border-primary/30 text-primary"
                                : "hover:bg-muted/60 text-foreground"
                              }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-bold truncate">{org.name}</div>
                              <div className="text-[11px] text-muted-foreground truncate">{org.desc}</div>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Prominent Persona / Role Simulator Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowRoleDropdown(!showRoleDropdown);
                  setShowOrgDropdown(false);
                }}
                className="h-10 px-3 sm:px-4 rounded-xl border border-border/80 bg-background/90 hover:bg-muted/60 hover:border-primary/40 transition-all text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs text-foreground cursor-pointer"
                title="Switch Access Role (RBAC)"
              >
                <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground leading-none hidden sm:block">
                    Access Role
                  </span>
                  <span className="capitalize leading-tight">
                    {currentSession.role.toLowerCase().replace(/_/g, " ")}
                  </span>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showRoleDropdown ? "rotate-180 text-primary" : ""}`} />
              </button>

              {/* Role Dropdown Menu */}
              {showRoleDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleDropdown(false)}
                  />
                  <div className="absolute left-0 top-12 z-50 w-72 sm:w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-border/60">
                      <div className="text-xs font-bold text-foreground">Switch RBAC Persona</div>
                      <div className="text-[11px] text-muted-foreground">Test permissions and UI guards instantly</div>
                    </div>
                    <div className="py-1 space-y-1">
                      {availableRoles.map((r) => {
                        const isSelected = currentSession.role === r.role;
                        return (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => {
                              setRole(r.role as any);
                              setShowRoleDropdown(false);
                            }}
                            className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start justify-between cursor-pointer ${isSelected
                                ? "bg-primary/10 border border-primary/30 text-primary"
                                : "hover:bg-muted/60 text-foreground"
                              }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-bold">{r.label}</div>
                              <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                            </div>
                            {isSelected && (
                              <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Subtle & Refined Proton AI Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`h-10 px-3 sm:px-3.5 rounded-xl transition-all gap-2 text-xs sm:text-sm font-medium cursor-pointer shadow-2xs ${
                showAiPanel
                  ? "bg-muted text-foreground border-primary/40 ring-1 ring-primary/20 shadow-xs"
                  : "bg-background/90 hover:bg-muted/60 border-border/80 hover:border-border text-foreground/90 hover:text-foreground"
              }`}
              title="Toggle Proton Assistant [⌘K]"
            >
              <div className="relative flex items-center justify-center">
                <ProtonLogo className="size-4" />
                <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <span className="font-semibold tracking-tight">Proton</span>
              <span className="hidden lg:inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border/60">
                ⌘K
              </span>
            </Button>

            {/* Direct Documentation Link */}
            <NextLink href="/docs">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-3 rounded-xl border-border/80 bg-background shadow-xs hover:bg-muted/60 text-xs sm:text-sm font-semibold gap-1.5"
                title="Documentation & Architecture"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="hidden md:inline">Docs</span>
              </Button>
            </NextLink>

            {/* Dark/Light mode toggle */}
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-xl border-border/80 bg-background shadow-xs hover:bg-muted/60"
              onClick={toggleMode}
              title="Toggle Dark / Light Theme"
            >
              {tokens.mode === "light" ? (
                <Moon className="h-4 w-4 text-slate-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </Button>
          </div>
        </header>

        {/* Low-Balance Banner if triggered */}
        {isLowBalance && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong>Low Credit Balance Notice:</strong> Your balance is {formatInr(creditBalance)}. Automations will pause if balance reaches ₹0.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[11px] border-amber-500/50 bg-amber-500/20 text-amber-200"
              onClick={() => setShowTopupModal(true)}
            >
              Top Up Now
            </Button>
          </div>
        )}

        {/* Page Children - Always full width, never squeezed or cramped */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-0">{children}</main>
      </div>

      {/* Atom AI Floating Slide-Over Drawer - Pure overlay so it NEVER cramps the dashboard */}
      <AtomAiPanel
        isOpen={showAiPanel}
        onClose={() => setShowAiPanel(false)}
        orgId={currentSession.orgId}
        orgName={currentSession.orgName}
        role={currentSession.role}
        onOpenTopup={() => setShowTopupModal(true)}
        onLeadGenerated={fetchBalance}
      />

      {/* Quick Top-up Modal */}
      <Dialog open={showTopupModal} onOpenChange={setShowTopupModal}>
        <DialogHeader>
          <DialogTitle>Quick Wallet Top-up (Razorpay)</DialogTitle>
          <DialogDescription>
            Add usage credits to keep your WhatsApp bots, Voice AI agents, and funnels running 24/7.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 my-2">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Select Top-Up Amount (INR)</div>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-all ${topupAmount === amt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/20 text-muted-foreground"
                    }`}
                >
                  {formatInr(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Custom Amount (₹)</div>
            <Input
              type="number"
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="h-10"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            Approximate usage power: <strong>{Math.round(topupAmount / 5)}</strong> WhatsApp qualified conversations or <strong>{Math.round(topupAmount / 30)}</strong> Voice AI calling minutes.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTopupModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTopup}
            disabled={isTopupProcessing}
            className="gap-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isTopupProcessing ? "Processing..." : `Pay ${formatInr(topupAmount)} via Razorpay`}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Profile & Settings Floating Popover - Rendered at root level so it is NEVER clipped by aside overflow or backdrop-filter */}
      {showProfilePopup && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
            onClick={() => setShowProfilePopup(false)}
          />
          <div className="fixed bottom-3 left-[calc(16rem+20px)] w-80 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150 space-y-3">
            {/* Profile Header Card */}
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {currentSession.name ? currentSession.name.slice(0, 2).toUpperCase() : "US"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-xs text-foreground truncate">
                    {currentSession.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {currentSession.email || "client@atomcrm.in"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
                      {currentSession.role.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Items */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5">
                Settings &amp; Preferences
              </div>

              {/* White-Label Theming Link */}
              <NextLink
                href="/settings/theme"
                onClick={() => setShowProfilePopup(false)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  pathname === "/settings/theme"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-foreground hover:bg-muted/60"
                }`}
              >
                <Palette className={`h-4 w-4 shrink-0 ${
                  pathname === "/settings/theme" ? "text-primary-foreground" : "text-indigo-500 dark:text-indigo-400"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className={pathname === "/settings/theme" ? "text-primary-foreground font-semibold" : "text-foreground"}>
                    White-Label Theming
                  </div>
                  <div className={`text-[10px] leading-tight ${
                    pathname === "/settings/theme" ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    Branding, colors &amp; custom domain
                  </div>
                </div>
              </NextLink>

              {/* Quick Appearance Mode Toggle */}
              <button
                type="button"
                onClick={toggleMode}
                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-foreground hover:bg-muted/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {tokens.mode === "light" ? (
                    <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300 shrink-0" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-400 shrink-0" />
                  )}
                  <span>Theme: {tokens.mode === "light" ? "Light Mode" : "Dark Mode"}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                  Toggle
                </span>
              </button>
            </div>

            {/* Workspace Identifier */}
            <div className="pt-2 border-t border-border/60">
              <div className="px-2 py-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" /> Workspace:
                </span>
                <span className="font-semibold text-foreground truncate max-w-[130px]">
                  {currentSession.orgName}
                </span>
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.href = "/login";
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out of Atom</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
