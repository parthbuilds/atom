"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Plus,
  Send,
  MessageSquare,
  Globe,
  Code2,
  ArrowRight,
  ShieldCheck,
  Cpu,
  RefreshCw,
  FileCheck,
} from "lucide-react";

export default function ProjectsPage() {
  const { currentSession } = useSession();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active selected project
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Post Update Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    title: "",
    phase: "DEVELOPMENT",
    description: "",
    deliverables: "",
    progressPct: 75,
  });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  // Share Update Modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareProject, setShareProject] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        const pList = data.projects || [];
        setProjects(pList);
        if (pList.length > 0 && !selectedProjectId) {
          setSelectedProjectId(pList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentSession.orgId]);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : currentStatus === "IN_PROGRESS" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_milestone",
          milestoneId,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostUpdate = async () => {
    if (!activeProject || !updateForm.title || !updateForm.description) {
      alert("Please provide both a title and description for the update.");
      return;
    }
    setSubmittingUpdate(true);
    try {
      const parsedDeliverables = updateForm.deliverables
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_update",
          projectId: activeProject.id,
          title: updateForm.title,
          description: updateForm.description,
          phase: updateForm.phase,
          deliverables: parsedDeliverables,
          progressPct: updateForm.progressPct,
        }),
      });

      if (res.ok) {
        setShowUpdateModal(false);
        setUpdateForm({
          title: "",
          phase: "DEVELOPMENT",
          description: "",
          deliverables: "",
          progressPct: 75,
        });
        fetchProjects();
      }
    } catch (e: any) {
      alert(e.message || "Failed to post update");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const generateWhatsAppUpdateText = (proj: any) => {
    if (!proj) return "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://atomplatform.io";
    const shareUrl = `${origin}/status/${proj.shareToken}`;
    const latestUpdate = proj.updates?.[0];

    return `🚀 *Project Delivery Update: ${proj.title}*

📊 *Current Status:* ${proj.progressPct}% Complete (${proj.status})
${proj.stagingUrl ? `🌐 *Staging Preview:* ${proj.stagingUrl}\n` : ""}
${
  latestUpdate
    ? `✅ *What We've Done Recently:*\n• ${latestUpdate.title}\n• ${latestUpdate.description}\n`
    : ""
}
🔗 *View Live Interactive Status & Deliverables:*
${shareUrl}

_Sent via Atom Client Delivery Engine_`;
  };

  const handleCopyWhatsApp = (proj: any) => {
    const text = generateWhatsAppUpdateText(proj);
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handleCopyShareLink = (proj: any) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://atomplatform.io";
    navigator.clipboard.writeText(`${origin}/status/${proj.shareToken}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="min-w-0 flex-1 pr-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Projects &amp; Client Updates</h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Track Website Requests and Custom SaaS builds, log tangible milestones, and share real-time progress updates with clients.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <Link href="/onboarding/website" className="shrink-0 inline-flex">
            <Button
              className="h-10 px-5 text-xs font-semibold gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Onboard Project</span>
            </Button>
          </Link>
          {activeProject && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShareProject(activeProject);
                  setShowShareModal(true);
                }}
                className="h-10 px-5 text-xs font-semibold gap-2.5 border-border/90 bg-white hover:bg-muted/60 text-slate-800 shadow-sm rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <Share2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Share Update</span>
              </Button>
              <Button
                onClick={() => setShowUpdateModal(true)}
                className="h-10 px-5 text-xs font-semibold gap-2.5 bg-blue-600 hover:bg-blue-500 text-white shadow-sm rounded-xl whitespace-nowrap shrink-0 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Post Update</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Projects Tab / Selector */}
      {projects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                activeProject?.id === p.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card/70 border-border text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              <span>{p.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  activeProject?.id === p.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {p.progressPct}%
              </span>
            </button>
          ))}
        </div>
      )}

      {!activeProject ? (
        <Card className="bg-card/70 border-border/80 p-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Layers className="h-6 w-6" />
          </div>
          <CardTitle className="text-base font-bold">No Active Projects</CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-sm mx-auto">
            Get started by creating a new Website Request or Custom SaaS Product.
          </CardDescription>
          <div className="pt-2">
            <Link href="/onboarding/website">
              <Button size="sm" className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white">
                <Plus className="h-4 w-4" /> Start Website / SaaS Onboarding
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Top Project Banner */}
          <Card className="bg-card/80 border-border/80 p-5 sm:p-6 overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 font-mono">
                    {activeProject.type}
                  </Badge>
                  <Badge variant="success" className="text-[10px]">
                    {activeProject.status}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Created {formatDate(activeProject.createdAt)}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">{activeProject.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{activeProject.description}</p>
              </div>

              {/* Progress & Staging link */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 min-w-[220px]">
                <div className="w-full sm:w-48 lg:w-48 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sprint Progress</span>
                    <span className="font-mono font-bold text-primary">{activeProject.progressPct}%</span>
                  </div>
                  <Progress value={activeProject.progressPct} className="h-2" />
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => handleCopyShareLink(activeProject)}
                    className="text-xs font-semibold gap-2 h-10 px-4.5 rounded-xl border-border bg-card hover:bg-muted/70 text-foreground shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
                    <span>{copiedLink ? "Link Copied!" : "Client Portal Link"}</span>
                  </Button>
                  {activeProject.stagingUrl && (
                    <a href={activeProject.stagingUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="text-xs font-semibold gap-2 h-10 px-4.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer transition-all active:scale-[0.98]">
                        <Globe className="h-4 w-4 shrink-0" />
                        <span>Staging</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Grid: Milestones & Activity Changelog */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Milestones Management (1 Col) */}
            <Card className="bg-card/75 border-border/80 lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Sprint Milestones
                  </CardTitle>
                  <span className="text-xs font-mono text-muted-foreground">
                    {(activeProject.milestones || []).filter((m: any) => m.status === "COMPLETED").length}/
                    {(activeProject.milestones || []).length}
                  </span>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Click any milestone to advance its completion state.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(activeProject.milestones || []).map((m: any) => {
                  const isDone = m.status === "COMPLETED";
                  const isWorking = m.status === "IN_PROGRESS";

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m.id, m.status)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
                          : isWorking
                          ? "bg-primary/10 border-primary/40 text-foreground"
                          : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : isWorking ? (
                            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={isDone ? "line-through opacity-80" : "font-medium"}>{m.title}</span>
                        </div>
                        <Badge
                          variant={isDone ? "success" : isWorking ? "outline" : "secondary"}
                          className="text-[9px] font-mono"
                        >
                          {m.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Updates / Activity Feed ("What We Have Done") (2 Cols) */}
            <Card className="bg-card/75 border-border/80 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" /> What We Have Done (Process Status & Deliverables)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Client-visible changelog of completed tasks, deployed screens, and engineering updates.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowUpdateModal(true)}
                    className="text-xs font-semibold gap-2 h-9.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Add Entry</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(activeProject.updates || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    No status updates logged yet. Click &quot;Add Entry&quot; to log what was completed.
                  </div>
                ) : (
                  (activeProject.updates || []).map((update: any) => {
                    let deliverables: string[] = [];
                    try {
                      if (update.deliverables) deliverables = JSON.parse(update.deliverables);
                    } catch {}

                    return (
                      <div key={update.id} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {update.phase}
                            </Badge>
                            <span className="font-bold text-xs sm:text-sm text-foreground">{update.title}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {formatDate(update.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground leading-relaxed">{update.description}</p>

                        {deliverables.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {deliverables.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] bg-background border border-border text-foreground flex items-center gap-1 font-mono"
                              >
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Post Update Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <DialogTitle>Post Project Update & Tangible Deliverables</DialogTitle>
          </div>
          <DialogDescription>
            This entry will be instantly published to the client&apos;s live delivery portal and share links.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 my-2 text-xs">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Update Title / Headline</label>
            <Input
              placeholder="e.g. Sprint 2 Complete: Integrated Sarvam AI Voice Webhooks"
              value={updateForm.title}
              onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Development Phase</label>
              <select
                className="w-full h-9 px-2.5 rounded-md border border-input bg-background text-xs"
                value={updateForm.phase}
                onChange={(e) => setUpdateForm({ ...updateForm, phase: e.target.value })}
              >
                <option value="DISCOVERY">Discovery & Blueprint</option>
                <option value="DESIGN">Design & Component Assets</option>
                <option value="DEVELOPMENT">Full-Stack Development</option>
                <option value="INTEGRATION">AI & Automations Integration</option>
                <option value="LAUNCH">QA & Production Launch</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Updated Overall Progress ({updateForm.progressPct}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={updateForm.progressPct}
                onChange={(e) => setUpdateForm({ ...updateForm, progressPct: Number(e.target.value) })}
                className="w-full mt-2"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Accomplishments Description (What did we do?)
            </label>
            <textarea
              className="w-full h-24 p-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Explain the technical work completed, user flows verified, or API endpoints connected."
              value={updateForm.description}
              onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Tangible Deliverables (comma separated)
            </label>
            <Input
              placeholder="e.g. Live Staging Preview, Figma Wireframes v2, Webhook Test Passes"
              value={updateForm.deliverables}
              onChange={(e) => setUpdateForm({ ...updateForm, deliverables: e.target.value })}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePostUpdate}
            disabled={submittingUpdate}
            className="bg-primary hover:bg-primary/90 text-white font-medium"
          >
            {submittingUpdate ? "Publishing..." : "Publish Client Update"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Share Update Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <DialogTitle>Share Progress Update with Client</DialogTitle>
          </div>
          <DialogDescription>
            Copy the public portal link or generate pre-formatted WhatsApp / Email status reports.
          </DialogDescription>
        </DialogHeader>

        {shareProject && (
          <div className="space-y-4 my-2 text-xs">
            {/* Direct Portal Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">Client Delivery Portal Link</label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/status/${shareProject.shareToken}`
                      : `/status/${shareProject.shareToken}`
                  }
                  className="h-9 text-xs font-mono bg-muted/40"
                />
                <Button size="sm" onClick={() => handleCopyShareLink(shareProject)} className="h-9 text-xs shrink-0">
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Clients can view this branded link without needing an internal account or password.
              </p>
            </div>

            {/* WhatsApp Formatted Update Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp Ready Update Message
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyWhatsApp(shareProject)}
                  className="h-7 text-[11px] gap-1"
                >
                  {copiedWhatsApp ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedWhatsApp ? "Message Copied!" : "Copy WhatsApp Text"}
                </Button>
              </div>
              <pre className="p-3 rounded-lg bg-muted/40 border border-border text-[11px] font-mono text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                {generateWhatsAppUpdateText(shareProject)}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShareModal(false)}>
            Done
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
