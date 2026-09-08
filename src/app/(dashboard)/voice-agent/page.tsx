"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Mic,
  PhoneCall,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Settings,
  Users,
  AlertCircle,
  Volume2,
  Send,
  Zap,
  TrendingUp,
  Percent,
  DollarSign,
  HeartHandshake,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from "lucide-react";

export default function VoiceAgentPage() {
  const { currentSession } = useSession();
  const [config, setConfig] = useState<any>({
    provider: "SARVAM",
    promptScript:
      "Namaste, I am Maya from Apex Luxury Properties. I noticed your interest in our 3 BHK villa listings in Whitefield. Are you available for a 15-minute site visit this Saturday or Sunday?",
    callingHours: "10:30 AM - 07:00 PM",
    language: "Hindi + English (Hinglish)",
    targetStatus: "NEW",
  });
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [voiceStats, setVoiceStats] = useState<any | null>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Call simulation state
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<any>(null);

  const fetchVoiceData = async () => {
    setLoading(true);
    try {
      const [vRes, lRes] = await Promise.all([
        fetch(`/api/voice-agent?orgId=${currentSession.orgId}`),
        fetch(`/api/leads?orgId=${currentSession.orgId}`),
      ]);

      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.config) setConfig(vData.config);
        setCallLogs(vData.callLogs || []);
        setVoiceStats(vData.voiceStats || null);
      }
      if (lRes.ok) {
        const lData = await lRes.json();
        setLeads(lData.leads || []);
        if (lData.leads && lData.leads.length > 0 && !selectedLeadId) {
          setSelectedLeadId(lData.leads[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoiceData();
  }, [currentSession.orgId]);

  const handleSaveConfig = async () => {
    try {
      const res = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_config",
          orgId: currentSession.orgId,
          ...config,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSimulateCall = async () => {
    if (!selectedLeadId) {
      alert("Please select a lead to dial.");
      return;
    }
    setIsCalling(true);
    setCallResult(null);
    try {
      const res = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_call",
          orgId: currentSession.orgId,
          leadId: selectedLeadId,
          provider: config.provider,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCallResult(data);
        fetchVoiceData();
      } else {
        const d = await res.json();
        alert(d.error || "Call simulation failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voice AI Agent Studio & Analytics</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Autonomous multi-lingual calling with Sarvam AI (Hinglish/Hindi) & ElevenLabs, tracking conversion performance, actions taken, and labor savings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setCallResult(null);
              setShowCallModal(true);
            }}
            className="text-xs font-semibold gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <PhoneCall className="h-4 w-4" /> Dispatch Test Voice Call
          </Button>
        </div>
      </div>

      {/* Voice Performance KPI Deck */}
      {voiceStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              <span>Calls & Connection Rate</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <PhoneCall className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">{voiceStats.connectionRatePct}%</div>
            <div className="text-[11px] text-muted-foreground">
              {voiceStats.connectedCalls} connected of {voiceStats.totalCalls} dispatched calls
            </div>
          </Card>

          <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              <span>Appointment Lock Rate</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400">{voiceStats.bookingRatePct}%</div>
            <div className="text-[11px] text-muted-foreground">
              {voiceStats.bookedCalls} booked visits on calendar
            </div>
          </Card>

          <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              <span>Talk Time & Efficiency</span>
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">{voiceStats.totalMinutes} mins</div>
            <div className="text-[11px] text-muted-foreground">
              Avg {voiceStats.avgDurationSec}s per call • ₹{voiceStats.costPerCallInr}/call
            </div>
          </Card>

          <Card className="bg-card/75 border-border/80 p-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              <span>Human Labor Savings</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="text-2xl font-black text-foreground">{formatInr(voiceStats.laborSavingsInr)}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              {voiceStats.voiceRoiMultiplier}x ROI vs ₹125/call human telecaller
            </div>
          </Card>
        </div>
      )}

      {/* "What the Voice Agents Have Done" Executive Summary Banner */}
      {voiceStats && (
        <Card className="bg-card/75 border-border/80 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" /> What The Voice Agent Has Done
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Breakdown of autonomous actions, lead conversations, and sentiment classification across all calls.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30">
              Provider: {config.provider} AI
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-emerald-400" /> Appointments Locked
              </div>
              <div className="text-xl font-bold text-foreground">{voiceStats.actionsTaken.appointmentsLocked}</div>
              <div className="text-[10px] text-emerald-400">Confirmed & synced to CRM</div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3 text-blue-400" /> Brochures Dispatched
              </div>
              <div className="text-xl font-bold text-foreground">{voiceStats.actionsTaken.brochuresSent}</div>
              <div className="text-[10px] text-blue-400">Auto-sent via WhatsApp</div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-400" /> Follow-ups Scheduled
              </div>
              <div className="text-xl font-bold text-foreground">{voiceStats.actionsTaken.followupsQueued}</div>
              <div className="text-[10px] text-amber-400">Scheduled for best callbacks</div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/60 space-y-1">
              <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <HeartHandshake className="h-3 w-3 text-purple-400" /> High Intent Sentiment
              </div>
              <div className="text-xl font-bold text-purple-400">
                {voiceStats.totalCalls > 0
                  ? `${Math.round((voiceStats.sentimentStats.positive / voiceStats.totalCalls) * 100)}%`
                  : "80%"}
              </div>
              <div className="text-[10px] text-muted-foreground">Positive engagement rate</div>
            </div>
          </div>
        </Card>
      )}

      {/* Provider Picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sarvam AI Card */}
        <div
          onClick={() => setConfig({ ...config, provider: "SARVAM" })}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            config.provider === "SARVAM"
              ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
              : "border-border bg-card/60 hover:bg-card"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                🇮🇳
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  Sarvam AI (India-First Default)
                  <Badge variant="success" className="text-[10px]">
                    Recommended
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Hindi, Hinglish & Regional Indian Dialects</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-foreground">~₹10 / min</div>
              <div className="text-[10px] text-muted-foreground">Budget-friendly INR</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Native Indian accent modeling. Sub-180ms latency comprehension of colloquial Hindi/English expressions like &quot;Haan bhai sham ko call karo&quot;.
          </p>
        </div>

        {/* ElevenLabs Card */}
        <div
          onClick={() => setConfig({ ...config, provider: "ELEVENLABS" })}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            config.provider === "ELEVENLABS"
              ? "border-purple-500 bg-purple-500/10 shadow-md ring-1 ring-purple-500/40"
              : "border-border bg-card/60 hover:bg-card"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                🎙️
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  ElevenLabs (Premium English)
                  <Badge variant="secondary" className="text-[10px]">
                    Enterprise
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">Hyper-realistic natural English pacing</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-foreground">~₹35 / min</div>
              <div className="text-[10px] text-muted-foreground">High-Ticket B2B</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            State-of-the-art voice naturalness and emotional inflections. Ideal for luxury real estate and executive consulting.
          </p>
        </div>
      </div>

      {/* Script & Prompt Configuration */}
      <Card className="bg-card/75 border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Agent Persona & Calling Script</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Dynamic lead variables supported: <code className="text-primary font-mono text-[11px]">&#123;&#123;lead_name&#125;&#125;</code>, <code className="text-primary font-mono text-[11px]">&#123;&#123;relationship_stage&#125;&#125;</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Outbound Conversation Prompt / Script
            </label>
            <textarea
              className="w-full h-28 px-3 py-2 rounded-md border border-input bg-muted/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed font-sans"
              value={config.promptScript}
              onChange={(e) => setConfig({ ...config, promptScript: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Calling Window
              </label>
              <Input
                value={config.callingHours}
                onChange={(e) => setConfig({ ...config, callingHours: e.target.value })}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Spoken Language
              </label>
              <Input
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Target CRM Status
              </label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-muted/40 text-foreground text-xs"
                value={config.targetStatus}
                onChange={(e) => setConfig({ ...config, targetStatus: e.target.value })}
              >
                <option value="NEW">NEW (Fresh inbound leads)</option>
                <option value="CONTACTED">CONTACTED (Follow-up sequence)</option>
                <option value="QUALIFIED">QUALIFIED (Appointment locking)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button size="sm" onClick={handleSaveConfig} className="text-xs gap-1.5">
              {savedSuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Settings className="h-4 w-4" />}
              {savedSuccess ? "Configuration Saved ✓" : "Save Voice AI Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Call History Table & Detailed Action Audit */}
      <Card className="bg-card/70 border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Autonomous Call History & CRM Synced Outcomes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Every call automatically logs duration, transcripts, actions taken, sentiment, and advances the relationship stage.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs font-mono">
              {callLogs.length} Calls Logged
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Lead</th>
                  <th className="p-3">Engine</th>
                  <th className="p-3">Duration & Outcome</th>
                  <th className="p-3">Action Taken</th>
                  <th className="p-3">Sentiment</th>
                  <th className="p-3">Transcript Summary</th>
                  <th className="p-3 pr-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {callLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No calls dispatched yet. Click &quot;Dispatch Test Voice Call&quot; to test.
                    </td>
                  </tr>
                ) : (
                  callLogs.map((call) => (
                    <tr key={call.id} className="hover:bg-muted/20">
                      <td className="p-3 pl-4 font-semibold text-foreground">
                        {call.lead?.name || "Prospect"}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {call.provider}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="success" className="text-[10px]">
                            {call.outcome}
                          </Badge>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {call.durationSec}s (₹{call.costInr || 15})
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-primary font-mono text-[11px]">
                          {call.actionTaken || "APPOINTMENT_LOCKED"}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge
                          className={`text-[9px] font-mono ${
                            call.sentiment === "POSITIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : call.sentiment === "NEGATIVE"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : "bg-neutral-500/20 text-neutral-300 border-neutral-500/30"
                          }`}
                        >
                          {call.sentiment || "POSITIVE"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px] max-w-xs truncate font-sans">
                        {call.transcriptSummary || "Call completed."}
                      </td>
                      <td className="p-3 pr-4 text-right font-mono text-muted-foreground text-[11px]">
                        {formatDate(call.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Test Call Simulation Modal */}
      <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <PhoneCall className="h-5 w-5 text-indigo-400" />
            <DialogTitle>Simulate Voice AI Call Dispatch</DialogTitle>
          </div>
          <DialogDescription>
            Maya will dial this lead, execute your prompt, and advance their relationship stage in CRM.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-semibold">
              Select Lead to Dial
            </label>
            <select
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-muted/40 text-foreground text-sm"
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id} className="bg-card text-foreground">
                  {l.name} ({l.phone}) — Current Stage: {l.relationshipStage}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground">Active Engine: {config.provider}</div>
            <div>
              Calling rate: ₹{config.provider === "ELEVENLABS" ? "45" : "15"} will be deducted from your credit wallet.
            </div>
          </div>

          {callResult && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Call Connected & Completed!
                </span>
                <span>Stage: {callResult.updatedStage}</span>
              </div>
              <p className="text-muted-foreground text-[11px] italic">
                {callResult.callLog.transcriptSummary}
              </p>
              <div className="text-[10px] text-emerald-400">
                -₹{callResult.deductedCredits} deducted from wallet • Synced to CRM
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCallModal(false)}>
            Close
          </Button>
          <Button
            onClick={handleSimulateCall}
            disabled={isCalling}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {isCalling ? "Dialing..." : "Simulate Live Call"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
