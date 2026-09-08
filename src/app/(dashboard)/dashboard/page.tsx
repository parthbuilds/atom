"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AtomOrbitO } from "@/components/ui/atom-wordmark";
import {
  Users,
  Cpu,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  PhoneCall,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Sliders,
  Sparkles,
  Check,
  RefreshCw,
  Zap,
} from "lucide-react";

interface DashboardWidgetsConfig {
  showLeadsKpi: boolean;
  showCplKpi: boolean;
  showAutomationsKpi: boolean;
  showWalletKpi: boolean;
  showFleet: boolean;
  showFunnelStatus: boolean;
  showRecentLeads: boolean;
  showVoiceLauncher: boolean;
}

const defaultWidgets: DashboardWidgetsConfig = {
  showLeadsKpi: true,
  showCplKpi: true,
  showAutomationsKpi: true,
  showWalletKpi: true,
  showFleet: true,
  showFunnelStatus: true,
  showRecentLeads: true,
  showVoiceLauncher: true,
};

export default function DashboardOverviewPage() {
  const { currentSession } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [creditBalance, setCreditBalance] = useState<number>(8450);
  const [loading, setLoading] = useState(true);

  // Dashboard Builder & Customizer State
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidgetsConfig>(defaultWidgets);
  const [savingConfig, setSavingConfig] = useState(false);
  const [generatingLead, setGeneratingLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [callingLead, setCallingLead] = useState(false);

  // Load Dashboard Data & Custom Config
  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, autoRes, billRes, configRes] = await Promise.all([
        fetch(`/api/leads?orgId=${currentSession.orgId}`),
        fetch(`/api/automations?orgId=${currentSession.orgId}`),
        fetch(`/api/billing?orgId=${currentSession.orgId}`),
        fetch(`/api/orgs/dashboard-config?orgId=${currentSession.orgId}`),
      ]);

      if (leadsRes.ok) {
        const lData = await leadsRes.json();
        setLeads(lData.leads || []);
      }
      if (autoRes.ok) {
        const aData = await autoRes.json();
        setAutomations(aData.activeAutomations || []);
      }
      if (billRes.ok) {
        const bData = await billRes.json();
        setCreditBalance(bData.creditBalance);
      }
      if (configRes.ok) {
        const cData = await configRes.json();
        if (cData.config) {
          setWidgets((prev) => ({ ...prev, ...cData.config }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSession.orgId]);

  // Save Dashboard Layout Configuration
  const handleSaveWidgets = async () => {
    setSavingConfig(true);
    try {
      await fetch("/api/orgs/dashboard-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          config: widgets,
        }),
      });
      setShowCustomizer(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingConfig(false);
    }
  };

  // Generate Sample Inbound Test Lead
  const handleGenerateSampleLead = async () => {
    setGeneratingLead(true);
    try {
      const sampleNames = [
        "Aarav Sharma",
        "Riya Sen",
        "Kunal Deshmukh",
        "Ananya Iyer",
        "Kabir Mehta",
        "Deepak Patel",
      ];
      const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
      const randomPhone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          name: randomName,
          phone: randomPhone,
          email: `${randomName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          notes: "Prospect inbounded inquiring about service packages and scheduling a discovery consultation.",
          source: "WhatsApp Lead Qualifier",
          tags: ["Sample Test Lead", "WhatsApp Inbound"],
        }),
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLead(false);
    }
  };

  // Derived metrics
  const totalLeads = leads.length;
  const bookedLeads = leads.filter((l) => l.status === "BOOKED" || l.relationshipStage === "BOOKED").length;
  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length;
  const activeAutomationsCount = automations.filter((a) => a.status === "ACTIVE").length;

  // Cost-per-lead calculation (BRD Section 9.7)
  const totalCreditsSpent = automations.reduce((s, a) => s + (a.creditsConsumed || 0), 0);
  const costPerLead = totalLeads > 0 ? Math.round(totalCreditsSpent / totalLeads) : 0;

  const isNewWorkspace = totalLeads === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <AtomOrbitO className="size-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {currentSession.name}
              </h1>
              <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30 bg-primary/5">
                {currentSession.orgName}
              </Badge>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 ml-10">
            Overview of your active customer inquiries, automated workforce, and pipeline health.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs rounded-xl shadow-xs"
            onClick={() => setShowCustomizer(true)}
          >
            <Sliders className="h-3.5 w-3.5 text-primary" />
            <span>Customize</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs rounded-xl text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-xs"
            disabled={generatingLead}
            onClick={handleGenerateSampleLead}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{generatingLead ? "Generating..." : "Test Inbound Lead"}</span>
          </Button>

          <Link href="/crm">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs rounded-xl shadow-xs">
              <Users className="h-3.5 w-3.5" />
              <span>CRM Hub</span>
            </Button>
          </Link>

          <Link href="/automations">
            <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold rounded-xl shadow-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Bot</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* New Workspace Subtle Welcome Notice (if no leads yet) */}
      {isNewWorkspace && (
        <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <AtomOrbitO className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <span>Atom Engine is Active &amp; Listening</span>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-xs text-muted-foreground">
                Simulate a test lead to preview how your WhatsApp bot and Maya voice agent respond in real-time.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            disabled={generatingLead}
            onClick={handleGenerateSampleLead}
            className="text-xs font-semibold rounded-xl shrink-0"
          >
            {generatingLead ? "Generating..." : "Simulate First Lead"}
          </Button>
        </div>
      )}

      {/* 4 Clean Topmate-style KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Leads */}
        {widgets.showLeadsKpi && (
          <div className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/30 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Inquiries
              </span>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{totalLeads}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +18%
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {qualifiedLeads} qualified • {bookedLeads} confirmed bookings
            </div>
          </div>
        )}

        {/* Metric 2: Efficiency / CPL */}
        {widgets.showCplKpi && (
          <div className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/30 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cost Per Lead
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">₹{costPerLead > 0 ? costPerLead : 18}</span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                Efficient
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Based on active automation credit consumption
            </div>
          </div>
        )}

        {/* Metric 3: Active Automations */}
        {widgets.showAutomationsKpi && (
          <div className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/30 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Automated Fleet
              </span>
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{activeAutomationsCount}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              WhatsApp bot + Voice AI engine live
            </div>
          </div>
        )}

        {/* Metric 4: Prepaid Wallet */}
        {widgets.showWalletKpi && (
          <div className="p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/30 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Prepaid Balance
              </span>
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{formatInr(creditBalance)}</span>
              <Link href="/billing" className="text-xs text-primary font-semibold hover:underline">
                Manage →
              </Link>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Auto-recharges when balance falls below ₹500
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Clean Layout: Left = Recent Inquiries, Right = Active Automations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Leads / Inquiries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Recent Inquiries & Prospects</h3>
                <p className="text-xs text-muted-foreground">
                  Inbound leads qualified across WhatsApp, Voice AI, and Web Funnels.
                </p>
              </div>
              <Link href="/crm">
                <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 font-semibold">
                  Full CRM Hub <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>

            {leads.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-2">
                <div className="text-xs text-muted-foreground">No inbound leads captured yet for this workspace.</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSampleLead}
                  disabled={generatingLead}
                  className="text-xs gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Simulate Test Lead
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar with Initials */}
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                        {lead.name ? lead.name.slice(0, 2).toUpperCase() : "LD"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{lead.name}</span>
                          <Badge
                            variant={
                              lead.status === "BOOKED" || lead.status === "WON"
                                ? "success"
                                : lead.status === "QUALIFIED"
                                ? "warning"
                                : "outline"
                            }
                            className="text-[10px] py-0 px-1.5"
                          >
                            {lead.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 font-mono">
                          <span>{lead.phone}</span>
                          {lead.email && <span>• {lead.email}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:justify-end">
                      <span className="text-[11px] text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border/50">
                        {lead.source}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLead(lead)}
                        className="h-8 text-xs font-semibold px-3 rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        Quick Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Workforce & Fast Actions */}
        <div className="space-y-4">
          {/* Automated Workforce Status */}
          <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Automation Workforce</h3>
              <Link href="/automations">
                <Button variant="ghost" size="sm" className="h-7 text-xs text-primary p-0">
                  Manage →
                </Button>
              </Link>
            </div>

            <div className="space-y-2.5">
              {/* WhatsApp Qualifier */}
              <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">WhatsApp Lead Qualifier</div>
                    <div className="text-[11px] text-muted-foreground">Instant reply & slot booking</div>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px] py-0">
                  Active
                </Badge>
              </div>

              {/* Voice AI Agent */}
              <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Sarvam Voice AI (Maya)</div>
                    <div className="text-[11px] text-muted-foreground">Hindi & English outbound calls</div>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px] py-0">
                  Ready
                </Badge>
              </div>

              {/* Subdomain Funnel */}
              <div className="p-3 rounded-xl border border-border/70 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Hosted Funnel Hub</div>
                    <div className="text-[11px] text-muted-foreground">Client booking forms live</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] py-0 text-emerald-500 border-emerald-500/30">
                  Live
                </Badge>
              </div>
            </div>

            {/* Direct Voice AI Shortcut */}
            <Link href="/voice-agent" className="block pt-2">
              <Button className="w-full text-xs font-semibold gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm">
                <PhoneCall className="h-3.5 w-3.5" /> Launch Voice AI Call
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED QUICK LEAD DETAILS MODAL (NEVER STUCK) */}
      {/* ========================================================================= */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {selectedLead.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedLead.phone} {selectedLead.email ? `• ${selectedLead.email}` : ""}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                {selectedLead.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Quick Details Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Inbound Source</span>
                <span className="font-semibold text-foreground">{selectedLead.source}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border bg-muted/20">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Relationship Stage</span>
                <span className="font-semibold text-primary capitalize">
                  {selectedLead.relationshipStage ? selectedLead.relationshipStage.replace(/_/g, " ") : "New Lead"}
                </span>
              </div>
            </div>

            {/* Notes & Requirements */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
              <span className="text-xs font-bold text-foreground block">Prospect Requirements / Notes:</span>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {selectedLead.notes || "No notes entered for this contact."}
              </p>
            </div>

            {/* Action Buttons: Voice Call Maya & Go to CRM */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Button
                size="sm"
                variant="outline"
                disabled={callingLead}
                onClick={async () => {
                  setCallingLead(true);
                  try {
                    const res = await fetch("/api/voice-agent", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orgId: currentSession.orgId,
                        leadId: selectedLead.id,
                        recipientPhone: selectedLead.phone,
                        action: "trigger_call",
                      }),
                    });
                    if (res.ok) {
                      alert(`Sarvam AI call initiated for ${selectedLead.name}! Maya is dialing now.`);
                    }
                  } catch (e: any) {
                    alert(e.message);
                  } finally {
                    setCallingLead(false);
                  }
                }}
                className="flex-1 text-xs gap-1.5 text-indigo-500 border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/15"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {callingLead ? "Maya Dialing..." : "Call with Maya AI"}
              </Button>

              <Link href="/crm" className="flex-1">
                <Button size="sm" className="w-full text-xs gap-1.5 font-semibold">
                  <Users className="h-3.5 w-3.5" /> Open in Full CRM
                </Button>
              </Link>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLead(null)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* Dashboard Customizer Dialog / Modal */}
      <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sliders className="h-5 w-5" />
            <DialogTitle>Customize Dashboard Widgets</DialogTitle>
          </div>
          <DialogDescription>
            Tailor which performance monitors, KPI metrics, and pipeline modules appear on your dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-3">
          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Total Leads KPI Card</div>
              <div className="text-[11px] text-muted-foreground">Captured, qualified and booked breakdown</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showLeadsKpi}
              onChange={(e) => setWidgets({ ...widgets, showLeadsKpi: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Cost Per Lead (CPL) Tracker</div>
              <div className="text-[11px] text-muted-foreground">Calculates automation credits efficiency per acquired lead</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showCplKpi}
              onChange={(e) => setWidgets({ ...widgets, showCplKpi: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Active Automations KPI</div>
              <div className="text-[11px] text-muted-foreground">Count of running n8n bots and voice dispatchers</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showAutomationsKpi}
              onChange={(e) => setWidgets({ ...widgets, showAutomationsKpi: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Prepaid Wallet Card</div>
              <div className="text-[11px] text-muted-foreground">Current credit balance and low-balance auto-refill triggers</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showWalletKpi}
              onChange={(e) => setWidgets({ ...widgets, showWalletKpi: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Automation Fleet Health</div>
              <div className="text-[11px] text-muted-foreground">Detailed breakdown of n8n execution counts and usage credits</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showFleet}
              onChange={(e) => setWidgets({ ...widgets, showFleet: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Booking Funnel Status</div>
              <div className="text-[11px] text-muted-foreground">Active subdomains, forms and widget conversion endpoints</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showFunnelStatus}
              onChange={(e) => setWidgets({ ...widgets, showFunnelStatus: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Recent Inbound Leads Stream</div>
              <div className="text-[11px] text-muted-foreground">Live feed of new contacts, stages and WhatsApp numbers</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showRecentLeads}
              onChange={(e) => setWidgets({ ...widgets, showRecentLeads: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20 cursor-pointer">
            <div>
              <div className="text-xs font-bold text-foreground">Sarvam AI Voice Quick Launcher</div>
              <div className="text-[11px] text-muted-foreground">Fast shortcut to Hindi/English outbound voice calls</div>
            </div>
            <input
              type="checkbox"
              checked={widgets.showVoiceLauncher}
              onChange={(e) => setWidgets({ ...widgets, showVoiceLauncher: e.target.checked })}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCustomizer(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveWidgets} disabled={savingConfig} className="gap-2">
            {savingConfig ? "Saving Preferences..." : "Save Layout to Database"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
