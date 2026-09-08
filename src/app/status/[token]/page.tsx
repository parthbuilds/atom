"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AtomOrbitO } from "@/components/ui/atom-wordmark";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  Layers,
  Code2,
  Calendar,
  Share2,
  Copy,
  Check,
  Globe,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Building2,
  Cpu,
  RefreshCw,
} from "lucide-react";

export default function ClientProjectStatusPage() {
  const params = useParams();
  const token = params?.token as string;

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchProjectStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?shareToken=${token}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      } else {
        setError("Project not found or link has expired.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col items-center justify-center p-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-400">Loading live project status...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-neutral-100 flex flex-col items-center justify-center p-4 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-3">
          <Clock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">Invalid Project Status Link</h1>
        <p className="text-xs text-neutral-400 max-w-sm mt-1">{error || "Please check with your agency team for an updated status URL."}</p>
      </div>
    );
  }

  let parsedFeatures: string[] = [];
  try {
    if (project.keyFeatures) parsedFeatures = JSON.parse(project.keyFeatures);
  } catch {}

  const completedMilestones = (project.milestones || []).filter((m: any) => m.status === "COMPLETED").length;
  const totalMilestones = (project.milestones || []).length || 1;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-neutral-100 font-sans selection:bg-primary selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-neutral-800 bg-[#0d111a]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-xs">
            <AtomOrbitO className="size-4.5" dark={true} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">Client Delivery Portal</div>
            <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              {project.org?.name || "Client Project"}
              <Badge variant="outline" className="text-[10px] py-0 px-2 border-primary/40 text-primary">
                {project.type === "CUSTOM_SAAS" ? "Custom SaaS Build" : "1-Week Website Sprint"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="text-xs gap-1.5 h-8 border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
            {copiedLink ? "Link Copied!" : "Share Link"}
          </Button>
          {project.stagingUrl && (
            <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-xs gap-1.5 h-8 bg-primary hover:bg-primary/90 text-white font-medium">
                <Globe className="h-3.5 w-3.5" /> Staging Preview <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-[#0f1422] p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-mono">
                <Sparkles className="h-3.5 w-3.5" /> Process Status: {project.status}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{project.title}</h1>
              <p className="text-sm text-neutral-300 leading-relaxed">{project.description}</p>
            </div>

            {/* Quick Metrics */}
            <div className="bg-black/40 border border-neutral-800/80 rounded-xl p-5 min-w-[240px] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Total Completion</span>
                <span className="font-mono font-bold text-primary text-sm">{project.progressPct}%</span>
              </div>
              <Progress value={project.progressPct} className="h-2 bg-neutral-800" />
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                <span>
                  {completedMilestones} of {totalMilestones} Milestones
                </span>
                <span className="text-emerald-400 font-medium">Active Sprint</span>
              </div>
            </div>
          </div>

          {/* Staging & Tech Specs Banner */}
          <div className="mt-6 pt-6 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">Target Audience</span>
              <span className="font-medium text-neutral-200">{project.targetAudience || "Core customers"}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">Design Aesthetic</span>
              <span className="font-medium text-neutral-200">{project.designPreferences || "Modern Clean & Responsive"}</span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
              <span className="text-neutral-400 uppercase font-mono text-[10px] block mb-1">Tech Stack</span>
              <span className="font-medium text-neutral-200">{project.techStack || "Next.js 14, Tailwind, Sarvam Voice"}</span>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Milestones & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestones Roadmap (1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Delivery Roadmap
              </h2>
              <span className="text-xs text-neutral-400 font-mono">
                {completedMilestones}/{totalMilestones}
              </span>
            </div>

            <div className="space-y-2.5">
              {(project.milestones || []).map((m: any, idx: number) => {
                const isCompleted = m.status === "COMPLETED";
                const isInProgress = m.status === "IN_PROGRESS";

                return (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-neutral-900/50 border-emerald-500/30"
                        : isInProgress
                        ? "bg-primary/10 border-primary/40 shadow-sm"
                        : "bg-neutral-900/30 border-neutral-800/80 opacity-70"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : isInProgress ? (
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        ) : (
                          <Clock className="h-4 w-4 text-neutral-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-200">{m.title}</div>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span
                            className={
                              isCompleted
                                ? "text-emerald-400 font-medium"
                                : isInProgress
                                ? "text-primary font-medium"
                                : "text-neutral-500"
                            }
                          >
                            {isCompleted ? "Completed ✓" : isInProgress ? "Currently In Progress" : "Upcoming Phase"}
                          </span>
                          {m.dueDate && <span className="text-neutral-400 font-mono">{m.dueDate}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scope / Features Card */}
            {parsedFeatures.length > 0 && (
              <Card className="bg-neutral-900/60 border-neutral-800 mt-4">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Included Project Scope
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 space-y-1.5">
                  {parsedFeatures.map((f: string, i: number) => (
                    <div key={i} className="text-xs text-neutral-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity Timeline: "What We Have Done" (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> What We Have Done (Activity Changelog)
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">Chronological updates and tangible deliverables shipped by the engineering team.</p>
              </div>
              <Badge variant="secondary" className="text-xs font-mono bg-neutral-800 text-neutral-300">
                {(project.updates || []).length} Updates Posted
              </Badge>
            </div>

            <div className="space-y-4">
              {(project.updates || []).length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                  No development changelog updates posted yet. Next sprint update will appear here.
                </div>
              ) : (
                (project.updates || []).map((update: any) => {
                  let deliverables: string[] = [];
                  try {
                    if (update.deliverables) deliverables = JSON.parse(update.deliverables);
                  } catch {}

                  return (
                    <div
                      key={update.id}
                      className="p-5 rounded-xl border border-neutral-800 bg-[#0d121c]/70 hover:border-neutral-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-[10px] font-mono uppercase tracking-wider ${
                              update.phase === "LAUNCH"
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : update.phase === "INTEGRATION"
                                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                                : "bg-primary/20 text-primary border-primary/30"
                            }`}
                          >
                            {update.phase}
                          </Badge>
                          <span className="font-bold text-sm text-neutral-100">{update.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                          <Calendar className="h-3 w-3" />
                          {formatDate(update.createdAt)}
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed font-sans">{update.description}</p>

                      {deliverables.length > 0 && (
                        <div className="pt-1">
                          <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1">
                            <FileCheck className="h-3 w-3 text-emerald-400" /> Tangible Deliverables Shipped:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {deliverables.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-md text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-200 flex items-center gap-1.5"
                              >
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-neutral-500 font-mono text-right pt-1">
                        Author: {update.authorName || "Atom Engineering Team"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Live Staging & Feedback Card */}
        <div className="rounded-xl border border-neutral-800 bg-[#0e1320] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" /> Have questions or revisions on this sprint?
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Your feedback is directly routed to your assigned full-stack lead for immediate turnaround.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="text-xs border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200"
            >
              <Share2 className="h-3.5 w-3.5 mr-1" /> Copy Status URL
            </Button>
            {project.stagingUrl && (
              <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1">
                  View Staging Preview <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
