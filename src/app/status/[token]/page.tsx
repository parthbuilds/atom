"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  RefreshCw,
  Loader2,
  MessageSquare,
  Send,
  AlertCircle,
  User,
  MessageCircle,
} from "lucide-react";

export default function ClientProjectStatusPage() {
  const params = useParams();
  const token = params?.token as string;

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`/api/projects?shareToken=${token}`)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
          if (data.project?.directMessages) {
            setMessages(data.project.directMessages);
          }
        } else {
          setError("Project not found or link has expired.");
        }
      })
      .catch((err) => setError(err.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !token) return;
    setSendingMessage(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareToken: token,
          content: newMessage.trim(),
          senderName: senderName.trim() || (project?.org?.name ? `${project.org.name} Team` : "Client Partner"),
          priority,
          senderType: "CLIENT",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setMessageSuccess(true);
        setTimeout(() => setMessageSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading live project status…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <Clock className="h-6 w-6 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Invalid Project Link</h1>
        <p className="text-sm text-slate-500 max-w-sm">{error || "Please check with your agency team for an updated status URL."}</p>
      </div>
    );
  }

  let parsedFeatures: string[] = [];
  try {
    if (project.keyFeatures) parsedFeatures = JSON.parse(project.keyFeatures);
  } catch { }

  const completedMilestones = (project.milestones || []).filter((m: any) => m.status === "COMPLETED").length;
  const totalMilestones = (project.milestones || []).length || 1;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <AtomOrbitO className="size-4" dark={false} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Client Delivery Portal</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800 leading-tight">{project.org?.name || "Client Project"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-mono font-medium">
                {project.type === "CUSTOM_SAAS" ? "Custom SaaS Build" : "1-Week Website Sprint"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="text-xs gap-1.5 h-8 border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
            {copiedLink ? "Copied!" : "Share Link"}
          </Button>
          {project.stagingUrl && (
            <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="text-xs gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Globe className="h-3.5 w-3.5" />
                Staging Preview
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </header>

      <main className="max-w-9xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Hero Card ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Status pill top bar */}
          <div className="px-6 pt-6 pb-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono font-medium">
              <Sparkles className="h-3 w-3" />
              Process Status: {project.status}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 py-5">
            {/* Left: title + desc */}
            <div className="space-y-2 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {project.title}
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">{project.description}</p>
            </div>

            {/* Right: progress widget */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-w-[220px] space-y-3 shrink-0">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Completion</span>
                <span className="font-mono font-bold text-blue-600 text-base">{project.progressPct}%</span>
              </div>
              <Progress value={project.progressPct} className="h-2" />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{completedMilestones} of {totalMilestones} Milestones</span>
                <span className="text-emerald-600 font-semibold">Active Sprint</span>
              </div>
            </div>
          </div>

          {/* Bottom specs strip */}
          <div className="border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {[
              { label: "Target Audience", value: project.targetAudience || "Core customers" },
              { label: "Design Aesthetic", value: project.designPreferences || "Modern Clean & Responsive" },
              { label: "Tech Stack", value: project.techStack || "Next.js 14, Tailwind, Sarvam Voice" },
            ].map((item) => (
              <div key={item.label} className="px-5 py-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Delivery Roadmap */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-500" />
                  Delivery Roadmap
                </h2>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>

              <div className="p-4 space-y-2">
                {(project.milestones || []).map((m: any) => {
                  const isCompleted = m.status === "COMPLETED";
                  const isInProgress = m.status === "IN_PROGRESS";

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all ${isCompleted
                        ? "bg-emerald-50 border-emerald-200"
                        : isInProgress
                          ? "bg-blue-50 border-blue-300 shadow-sm"
                          : "bg-white border-slate-200 opacity-60"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : isInProgress ? (
                            <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${isCompleted ? "text-emerald-800" : isInProgress ? "text-blue-900" : "text-slate-500"
                            }`}>
                            {m.title}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className={
                              isCompleted ? "text-emerald-600 font-medium" :
                                isInProgress ? "text-blue-600 font-medium" :
                                  "text-slate-400"
                            }>
                              {isCompleted ? "Completed ✓" : isInProgress ? "Currently in Progress" : "Upcoming Phase"}
                            </span>
                            {m.dueDate && (
                              <span className="text-slate-400 font-mono">{m.dueDate}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scope card */}
            {parsedFeatures.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Included Project Scope</h3>
                </div>
                <div className="p-4 space-y-2">
                  {parsedFeatures.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Activity Changelog */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-blue-500" />
                    What We Have Done
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Chronological engineering updates & deliverables shipped.</p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {(project.updates || []).length} Updates Posted
                </span>
              </div>

              <div className="p-4 space-y-3">
                {(project.updates || []).length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No updates posted yet. Next sprint update will appear here.
                  </div>
                ) : (
                  (project.updates || []).map((update: any) => {
                    let deliverables: string[] = [];
                    try {
                      if (update.deliverables) deliverables = JSON.parse(update.deliverables);
                    } catch { }

                    const phaseColors: Record<string, string> = {
                      LAUNCH: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      INTEGRATION: "bg-indigo-50 text-indigo-700 border-indigo-200",
                      DESIGN: "bg-purple-50 text-purple-700 border-purple-200",
                      DISCOVERY: "bg-amber-50 text-amber-700 border-amber-200",
                      DEVELOPMENT: "bg-blue-50 text-blue-700 border-blue-200",
                    };
                    const phaseClass = phaseColors[update.phase] || "bg-slate-50 text-slate-600 border-slate-200";

                    return (
                      <div key={update.id} className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
                        {/* Update header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-md border font-semibold ${phaseClass}`}>
                              {update.phase}
                            </span>
                            <span className="font-bold text-sm text-slate-800">{update.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0">
                            <Calendar className="h-3 w-3" />
                            {formatDate(update.createdAt)}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="px-4 py-3 space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed">{update.description}</p>

                          {deliverables.length > 0 && (
                            <div>
                              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                <FileCheck className="h-3 w-3 text-emerald-500" />
                                Tangible Deliverables Shipped:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {deliverables.map((item, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-white border border-slate-200 text-slate-700 font-medium shadow-xs"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-[10px] text-slate-400 font-mono text-right">
                            Author: {update.authorName || "Atom Platform Engineering"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Client Direct Messaging Section ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <MessageSquare className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900">Direct Message to Agency Team</h2>
                <Badge variant="outline" className="text-[10px] bg-white text-blue-700 border-blue-200 font-mono">
                  Live Queue
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Have a question, request changes, or need to send links? Send a message directly to your engineering team.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
              Response SLA: &lt; 2 Hours
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Message Thread History */}
            {messages.length > 0 && (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {messages.map((msg: any) => {
                  const isAgency = msg.senderType === "AGENCY";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAgency ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700">{msg.senderName}</span>
                        {isAgency && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 text-[10px] font-mono">
                            Agency Lead
                          </span>
                        )}
                        <span>·</span>
                        <span className="font-mono text-[10px]">{formatDate(msg.createdAt)}</span>
                        {msg.priority === "URGENT" && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 text-[10px] font-bold">
                            URGENT
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-xl rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isAgency
                            ? "bg-slate-100 text-slate-800 rounded-tl-sm border border-slate-200/70"
                            : "bg-blue-600 text-white rounded-tr-sm shadow-xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compose Message Form */}
            <form onSubmit={handleSendMessage} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-700"
                >
                  <option value="NORMAL">Normal Question</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Blocker</option>
                </select>
              </div>
              <div className="relative">
                <textarea
                  rows={3}
                  required
                  placeholder="Write your direct message, change request, or question here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  {messageSuccess && (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Message sent to team queue!
                    </span>
                  )}
                </p>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingMessage || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 font-medium"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Direct Message
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* ── Footer CTA ── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-500" />
              Have questions or revision requests?
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your feedback is directly routed to your assigned full-stack lead for immediate turnaround.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyLink}
              className="text-xs border-slate-200 bg-white hover:bg-slate-50 text-slate-700 gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-400" />
              Copy Status URL
            </Button>
            {project.stagingUrl && (
              <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5">
                  View Staging Preview
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Powered by footer */}
        <div className="text-center pb-2">
          <p className="text-[11px] text-slate-400 font-mono">
            Powered by <span className="text-slate-600 font-semibold">Atom Platform</span> · Client Delivery Engine
          </p>
        </div>
      </main>
    </div>
  );
}
