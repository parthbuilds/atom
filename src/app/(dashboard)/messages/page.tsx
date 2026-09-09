"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  RefreshCw,
  Filter,
  Check,
  User,
  ShieldCheck,
  ChevronRight,
  Inbox,
  AlertTriangle,
} from "lucide-react";

export default function MessagesQueuePage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Atom Delivery Lead");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, queueStatus: string, isRead: boolean = true) => {
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, queueStatus, isRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, queueStatus, isRead } : m))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedMessage) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedMessage.projectId,
          content: replyContent.trim(),
          senderName: replyAuthor.trim() || "Atom Delivery Lead",
          senderType: "AGENCY",
          priority: selectedMessage.priority,
        }),
      });

      if (res.ok) {
        // Mark the original client message as IN_PROGRESS or RESOLVED
        await handleUpdateStatus(selectedMessage.id, "RESOLVED", true);
        setReplyContent("");
        setReplyModalOpen(false);
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  // Filtered messages
  const filteredMessages = messages.filter((m) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "NEW") return m.queueStatus === "NEW" || !m.isRead;
    if (activeTab === "IN_PROGRESS") return m.queueStatus === "IN_PROGRESS";
    if (activeTab === "RESOLVED") return m.queueStatus === "RESOLVED";
    if (activeTab === "URGENT") return m.priority === "URGENT";
    return true;
  });

  const unreadCount = messages.filter((m) => m.senderType === "CLIENT" && (!m.isRead || m.queueStatus === "NEW")).length;
  const urgentCount = messages.filter((m) => m.priority === "URGENT" && m.queueStatus !== "RESOLVED").length;
  const inProgressCount = messages.filter((m) => m.queueStatus === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Client Messaging Queue</h1>
            {unreadCount > 0 && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Incoming direct messages, feedback, and blockers submitted by clients from their live status portals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            disabled={loading}
            className="text-xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Inbound</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{messages.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <Inbox className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-blue-600">Needs Response</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{unreadCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-amber-600">In Progress</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{inProgressCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-rose-600">Urgent Escalations</p>
              <p className="text-2xl font-bold text-rose-700 mt-1">{urgentCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: "ALL", label: "All Messages" },
          { id: "NEW", label: `Unread (${unreadCount})` },
          { id: "IN_PROGRESS", label: "In Progress" },
          { id: "RESOLVED", label: "Resolved" },
          { id: "URGENT", label: `Urgent (${urgentCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Messages Queue List ── */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="h-6 w-6 text-slate-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading incoming direct messages…</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Inbox Zero · Queue Clear</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            There are no direct client messages in this queue. New messages sent from client status portals will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => {
            const isClient = msg.senderType === "CLIENT";
            const isUrgent = msg.priority === "URGENT";
            const isNew = !msg.isRead || msg.queueStatus === "NEW";

            return (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition-all ${
                  isNew
                    ? "bg-white border-blue-200 shadow-xs ring-1 ring-blue-100"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isNew ? "bg-blue-600" : msg.queueStatus === "RESOLVED" ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                    <span className="font-bold text-sm text-slate-900">{msg.senderName}</span>
                    {msg.project?.title && (
                      <span className="text-xs text-slate-500 font-medium">
                        · {msg.project.title}
                      </span>
                    )}
                    {isUrgent && (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold">
                        URGENT BLOCKER
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        msg.queueStatus === "RESOLVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : msg.queueStatus === "IN_PROGRESS"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {msg.queueStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(msg.createdAt)}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
                  {msg.content}
                </div>

                {/* Card Actions */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {msg.project?.shareToken && (
                      <Link
                        href={`/status/${msg.project.shareToken}`}
                        target="_blank"
                        className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Client Portal
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.queueStatus !== "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg.id, "IN_PROGRESS", true)}
                        className="text-[11px] h-7 border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600"
                      >
                        Set In Progress
                      </Button>
                    )}
                    {msg.queueStatus !== "RESOLVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg.id, "RESOLVED", true)}
                        className="text-[11px] h-7 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Resolved
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMessage(msg);
                        setReplyModalOpen(true);
                      }}
                      className="text-[11px] h-7 bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1"
                    >
                      <Send className="h-3 w-3" />
                      Reply to Client
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reply to Client Modal ── */}
      <Dialog open={replyModalOpen} onOpenChange={setReplyModalOpen}>
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" />
                Reply to Client Message
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your reply will appear in real-time on the client's public status portal.
              </p>
            </div>

            {selectedMessage && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-800 mb-1">
                  From: {selectedMessage.senderName} ({selectedMessage.project?.title || "Client"})
                </p>
                <p className="text-slate-600 italic">"{selectedMessage.content}"</p>
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reply As</label>
                <input
                  type="text"
                  required
                  value={replyAuthor}
                  onChange={(e) => setReplyAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Response Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Type your response to the client..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplyModalOpen(false)}
                  className="text-xs border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendingReply || !replyContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-medium"
                >
                  {sendingReply ? "Sending…" : "Send & Resolve"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
