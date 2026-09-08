"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import {
  calculateComprehensiveRoi,
  simulateRoiScenario,
  RoiBreakdown,
} from "@/lib/roi-engine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  Target,
  Percent,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  PhoneCall,
  Sliders,
  DollarSign,
  Clock,
  Zap,
  Globe,
  HelpCircle,
} from "lucide-react";

export default function AnalyticsPage() {
  const { currentSession } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Configurable Deal Size & Attribution Tuner
  const [avgDealValue, setAvgDealValue] = useState<number>(35000);
  const [humanSalarySetting, setHumanSalarySetting] = useState<number>(25000);

  // Scenario Simulator State
  const [simLeads, setSimLeads] = useState<number>(100);
  const [simDealValue, setSimDealValue] = useState<number>(40000);
  const [simCloseRate, setSimCloseRate] = useState<number>(25);
  const [simUseVoice, setSimUseVoice] = useState<boolean>(true);
  const [simUseWebsite, setSimUseWebsite] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lRes, aRes, vRes] = await Promise.all([
          fetch(`/api/leads?orgId=${currentSession.orgId}`),
          fetch(`/api/automations?orgId=${currentSession.orgId}`),
          fetch(`/api/voice-agent?orgId=${currentSession.orgId}`),
        ]);

        if (lRes.ok) {
          const lData = await lRes.json();
          setLeads(lData.leads || []);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAutomations(aData.activeAutomations || []);
        }
        if (vRes.ok) {
          const vData = await vRes.json();
          setCallLogs(vData.callLogs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentSession.orgId]);

  // Compute live comprehensive ROI
  const roi: RoiBreakdown = calculateComprehensiveRoi(leads, automations, callLogs, {
    avgDealValueInr: avgDealValue,
    humanTelecallerSalaryInr: humanSalarySetting,
  });

  // Compute live simulator projection
  const sim = simulateRoiScenario(
    simLeads,
    simDealValue,
    simCloseRate,
    simUseVoice,
    simUseWebsite
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Comprehensive ROI Engine</h1>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
              Audited Math
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Full revenue attribution, human telecaller labor replacement savings, and per-channel CPL for {currentSession.orgName}.
          </p>
        </div>

        {/* Real ROI Multiplier Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs py-1.5 px-3 gap-1.5 font-bold shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Realized ROI: {roi.roiMultiplier}x
          </Badge>
        </div>
      </div>

      {/* Deal Size & Model Customizer Bar */}
      <Card className="bg-card/75 border-border/80 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Sliders className="h-4 w-4 text-primary" />
            <span>Calibrate Attribution Model to Your Average Deal Size:</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {[
              { label: "Clinic / Care (₹15k)", value: 15000 },
              { label: "Real Estate Brokerage (₹35k)", value: 35000 },
              { label: "High-Ticket / Villas (₹75k)", value: 75000 },
              { label: "Custom SaaS / B2B (₹1.5L)", value: 150000 },
            ].map((preset) => (
              <button
                key={preset.value}
                onClick={() => setAvgDealValue(preset.value)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  avgDealValue === preset.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {preset.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 pl-2">
              <span className="text-xs text-muted-foreground font-mono">Custom ₹:</span>
              <Input
                type="number"
                value={avgDealValue}
                onChange={(e) => setAvgDealValue(Number(e.target.value) || 0)}
                className="h-8 w-24 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Top 4 ROI KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Net Realized ROI Multiplier */}
        <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Economic Return
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">{roi.roiMultiplier}x</div>
          <div className="text-[11px] text-muted-foreground">
            ₹{roi.roiMultiplier} generated per ₹1 spent on platform
          </div>
        </Card>

        {/* 2. Net Dollar Profit */}
        <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Net Value Created
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">{formatInr(roi.netProfitInr)}</div>
          <div className="text-[11px] text-muted-foreground">
            Attributed Deals ({formatInr(roi.attributedRevenueInr)}) + Labor Saved
          </div>
        </Card>

        {/* 3. Cost-Per-Lead (CPL) & CPA */}
        <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cost-Per-Lead (CPL)
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-foreground">₹{roi.costPerLeadOverall}</div>
          <div className="text-[11px] text-muted-foreground">
            CPA: ₹{roi.costPerAcquisition} / closed client • {roi.conversionRatePct}% conversion
          </div>
        </Card>

        {/* 4. Human Labor Replacement Savings */}
        <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Human Labor Replaced
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">{formatInr(roi.humanLaborSavingsInr)}</div>
          <div className="text-[11px] text-muted-foreground">
            {roi.humanHoursSaved} hours saved vs hiring manual SDR telecallers
          </div>
        </Card>
      </div>

      {/* Multi-Pillar Economic ROI Breakdown */}
      <Card className="bg-card/75 border-border/80 p-5 space-y-4">
        <div className="border-b border-border/60 pb-3">
          <h2 className="text-base font-bold text-foreground">
            Multi-Pillar Value Attribution Matrix
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Understanding the three mathematical drivers behind your {roi.roiMultiplier}x ROI return.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Pillar 1: Direct Revenue
            </div>
            <div className="text-2xl font-black">{formatInr(roi.attributedRevenueInr)}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Attributed from {roi.bookedLeads} closed / booked prospects at ₹{avgDealValue.toLocaleString()} average deal size.
            </p>
            <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              Pipeline acceleration value: {formatInr(roi.pipelineValueInr)}
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Pillar 2: Labor Cost Avoidance
            </div>
            <div className="text-2xl font-black">{formatInr(roi.humanLaborSavingsInr)}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Equivalent to replacing {roi.humanComparisonSavingsPct}% of human SDR telecalling overhead.
            </p>
            <div className="text-[11px] text-purple-400 pt-1 border-t border-border/40">
              {roi.totalVoiceMinutes} voice minutes processed without human fatigue
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Pillar 3: Net Cost Incurred
            </div>
            <div className="text-2xl font-black text-foreground">{formatInr(roi.totalCostInr)}</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              ₹{roi.totalCreditsSpent.toLocaleString()} credits spent on Sarvam Voice + WhatsApp conversations + retainers.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold pt-1 border-t border-border/40">
              Net Economic Gain: +{formatInr(roi.netProfitInr)}
            </div>
          </div>
        </div>
      </Card>

      {/* Channel CPL Breakdown Table */}
      <Card className="bg-card/75 border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Instrumented Channel CPL & Performance</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Cost-Per-Lead (CPL) and attributed ROI multiplier per automation engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Channel / Engine</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Credits Spent</th>
                  <th className="p-3">Leads Generated</th>
                  <th className="p-3">True Cost-Per-Lead (CPL)</th>
                  <th className="p-3">Attributed ROI</th>
                  <th className="p-3 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {roi.channels.map((ch) => (
                  <tr key={ch.name} className="hover:bg-muted/20">
                    <td className="p-3 pl-4 font-semibold text-foreground">{ch.name}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {ch.category}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono font-bold">₹{ch.spendInr}</td>
                    <td className="p-3 font-mono">{ch.leadsGenerated} leads</td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-400 font-mono text-sm">
                        ₹{ch.cplInr}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">/ lead</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-purple-400 font-mono">
                        {ch.roiMultiplier}x
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <Badge variant="success" className="text-[10px]">
                        {ch.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Scenario ROI Simulator */}
      <Card className="bg-card/75 border-border/80 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" /> Interactive ROI Growth & Scenario Simulator
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Forecast your business returns by simulating different lead volumes and ticket sizes.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            Interactive Model
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sliders Control Deck */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-foreground">Monthly Inbound Leads:</span>
                <span className="text-primary font-mono">{simLeads} leads/month</span>
              </div>
              <input
                type="range"
                min={20}
                max={500}
                step={10}
                value={simLeads}
                onChange={(e) => setSimLeads(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-foreground">Average Deal Value:</span>
                <span className="text-primary font-mono">₹{simDealValue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={200000}
                step={5000}
                value={simDealValue}
                onChange={(e) => setSimDealValue(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-foreground">Estimated Close Rate:</span>
                <span className="text-primary font-mono">{simCloseRate}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={simCloseRate}
                onChange={(e) => setSimCloseRate(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={simUseVoice}
                  onChange={(e) => setSimUseVoice(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Include Sarvam Voice AI Agent</span>
              </label>

              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={simUseWebsite}
                  onChange={(e) => setSimUseWebsite(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Include Custom Website / SaaS Funnel</span>
              </label>
            </div>
          </div>

          {/* Simulator Projected Outputs */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border/80 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Projected Deals Closed:</span>
                <span className="font-bold text-foreground font-mono">{sim.projectedDeals} deals</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Projected Gross Revenue:</span>
                <span className="font-bold text-foreground font-mono">{formatInr(sim.projectedRevenueInr)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Projected Staff Labor Saved:</span>
                <span className="font-bold text-amber-400 font-mono">+{formatInr(sim.projectedLaborSavings)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated Monthly Platform Cost:</span>
                <span className="font-mono text-muted-foreground">-{formatInr(sim.estimatedPlatformCostInr)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Projected Net Profit
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {formatInr(sim.projectedNetProfit)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                    Projected Return
                  </div>
                  <div className="text-2xl font-black text-primary">
                    {sim.projectedRoiMultiplier}x ROI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
