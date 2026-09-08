"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Search,
  Download,
  Plus,
  PhoneCall,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Webhook,
  ArrowRight,
  Filter,
  Check,
  CheckSquare,
  Square,
  FileText,
  Briefcase,
  Zap,
  Camera,
  Copy,
  FolderKanban,
  Trash2,
  ListTodo,
} from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
}

export default function CrmLeadsPage() {
  const { currentSession } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState("leads");

  // Lead Detail Drawer / Modal
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadActivities, setLeadActivities] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [leadTodos, setLeadTodos] = useState<TodoItem[]>([]);
  const [newTodoInput, setNewTodoInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [callingLead, setCallingLead] = useState(false);

  // Global To-Dos State
  const [globalTodos, setGlobalTodos] = useState<
    { id: string; leadId?: string; leadName?: string; text: string; done: boolean }[]
  >([
    {
      id: "gt-1",
      leadName: "Kavita Ramachandran",
      text: "Send finalized penthouse brochure via WhatsApp",
      done: false,
    },
    {
      id: "gt-2",
      leadName: "Anand Verma",
      text: "Confirm Sarvam voice bot appointment reminder before 4 PM",
      done: true,
    },
    {
      id: "gt-3",
      leadName: "Meera Krishnan",
      text: "Prepare custom consultation quote and schedule follow-up",
      done: false,
    },
  ]);
  const [newGlobalTodoText, setNewGlobalTodoText] = useState("");

  // Create Lead Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    source: "WhatsApp Lead Qualifier",
  });

  // Face App Inbound Leads Simulator Modal
  const [showFaceAppModal, setShowFaceAppModal] = useState(false);
  const [faceAppForm, setFaceAppForm] = useState({
    name: "Dr. Ayesha Kapoor",
    phone: "+91 98110 55443",
    email: "ayesha.k@wellnessclinic.in",
    campaignName: "Meta Aesthetic Scan Ad 2026",
    faceScanId: "FS-9921-VIP",
    notes: "Face App AI Scan: Prospect requested skin treatment consultation & price package.",
  });
  const [faceAppSuccess, setFaceAppSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Fetch leads and call logs
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [leadsRes, voiceRes] = await Promise.all([
        fetch(`/api/leads?orgId=${currentSession.orgId}&status=${statusFilter}`),
        fetch(`/api/voice-agent?orgId=${currentSession.orgId}`),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data.leads || []);
      }
      if (voiceRes.ok) {
        const vData = await voiceRes.json();
        setCallLogs(vData.callLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentSession.orgId, statusFilter]);

  // Helper to parse notes and embedded todos
  const parseNotesAndTodos = (notesStr: string | null) => {
    if (!notesStr) return { text: "", todos: [] };
    try {
      const parsed = JSON.parse(notesStr);
      if (parsed && typeof parsed === "object") {
        return {
          text: parsed.text || "",
          todos: Array.isArray(parsed.todos) ? parsed.todos : [],
        };
      }
    } catch {}
    return { text: notesStr, todos: [] };
  };

  const openLeadDetail = async (lead: any) => {
    setSelectedLead(lead);
    const parsed = parseNotesAndTodos(lead.notes);
    setNewNote(parsed.text);
    setLeadTodos(parsed.todos);

    try {
      const res = await fetch(`/api/leads/${lead.id}`);
      if (res.ok) {
        const data = await res.json();
        setLeadActivities(data.lead.activities || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLeadStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedLead(data.lead);
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateRelationshipStage = async (newStage: string) => {
    if (!selectedLead) return;
    try {
      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relationshipStage: newStage }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedLead(data.lead);
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save updated notes and todos
  const handleSaveNotesAndTodos = async () => {
    if (!selectedLead) return;
    setSavingNotes(true);
    try {
      const payloadString = JSON.stringify({
        text: newNote,
        todos: leadTodos,
      });

      const res = await fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: payloadString }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedLead(data.lead);
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNotes(false);
    }
  };

  // Add lead todo
  const handleAddLeadTodo = () => {
    if (!newTodoInput.trim()) return;
    const item: TodoItem = {
      id: `td-${Date.now()}`,
      text: newTodoInput.trim(),
      done: false,
    };
    const updated = [...leadTodos, item];
    setLeadTodos(updated);
    setNewTodoInput("");

    // Auto-save
    if (selectedLead) {
      fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: JSON.stringify({ text: newNote, todos: updated }),
        }),
      }).then(() => fetchLeads());
    }
  };

  const handleToggleLeadTodo = (todoId: string) => {
    const updated = leadTodos.map((t) =>
      t.id === todoId ? { ...t, done: !t.done } : t
    );
    setLeadTodos(updated);

    // Auto-save
    if (selectedLead) {
      fetch(`/api/leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: JSON.stringify({ text: newNote, todos: updated }),
        }),
      }).then(() => fetchLeads());
    }
  };

  // Dispatch live Sarvam Voice AI call
  const handleTriggerVoiceCall = async () => {
    if (!selectedLead) return;
    setCallingLead(true);
    try {
      const res = await fetch("/api/voice-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simulate_call",
          orgId: currentSession.orgId,
          leadId: selectedLead.id,
          provider: "SARVAM",
        }),
      });

      if (res.ok) {
        // Refresh lead details and activity
        const updatedRes = await fetch(`/api/leads/${selectedLead.id}`);
        if (updatedRes.ok) {
          const uData = await updatedRes.json();
          setSelectedLead(uData.lead);
          setLeadActivities(uData.lead.activities || []);
        }
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCallingLead(false);
    }
  };

  // Face App lead submission simulator
  const handleFaceAppSubmit = async () => {
    try {
      const res = await fetch("/api/webhooks/face-app-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          ...faceAppForm,
        }),
      });

      if (res.ok) {
        setFaceAppSuccess(true);
        fetchLeads();
        setTimeout(() => {
          setFaceAppSuccess(false);
          setShowFaceAppModal(false);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Lead
  const handleCreateLead = async () => {
    if (!createForm.name || !createForm.phone) {
      alert("Name and Phone are mandatory.");
      return;
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          ...createForm,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          phone: "",
          email: "",
          notes: "",
          source: "Manual CRM Entry",
        });
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      (l.email && l.email.toLowerCase().includes(q))
    );
  });

  const bookedClients = leads.filter(
    (l) => l.status === "BOOKED" || l.status === "WON" || l.relationshipStage === "BOOKED"
  );

  const stages = [
    { key: "FIRST_CONTACT", label: "1. First Contact" },
    { key: "WARMED", label: "2. Warmed" },
    { key: "INTERESTED", label: "3. Interested" },
    { key: "BOOKED", label: "4. Booked / Won" },
  ];

  const webhookUrl = `http://localhost:3000/api/webhooks/face-app-leads?orgId=${currentSession.orgId}`;

  return (
    <div className="space-y-6">
      {/* Topmate-Inspired Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Leads & Client Project Command Center
            </h1>
            <Badge variant="outline" className="text-[11px] font-semibold text-emerald-500 border-emerald-500/30 bg-emerald-500/5">
              Live Pipeline Active
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Single unified hub for inbound leads, Sarvam voice logs, onboarded client project statuses, and task checklists.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFaceAppModal(true)}
            className="gap-1.5 text-xs text-indigo-500 border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10"
          >
            <Camera className="h-3.5 w-3.5" /> Face App / Ad Inbound
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 text-xs font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="h-3.5 w-3.5" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Topmate-Inspired 4-Card Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Inbound Leads
            </div>
            <div className="text-2xl font-black text-foreground mt-0.5">{leads.length}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Voice AI Calls
            </div>
            <div className="text-2xl font-black text-indigo-500 mt-0.5">{callLogs.length}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <PhoneCall className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Onboarded Clients
            </div>
            <div className="text-2xl font-black text-emerald-500 mt-0.5">{bookedClients.length}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pending To-Dos
            </div>
            <div className="text-2xl font-black text-amber-500 mt-0.5">
              {globalTodos.filter((t) => !t.done).length}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Topmate-Style Tabbed Experience */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 rounded-xl border border-border">
          <TabsTrigger value="leads" className="text-xs gap-1.5 rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" /> Inbound Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="text-xs gap-1.5 rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Briefcase className="h-3.5 w-3.5" /> Onboarded Client Projects ({bookedClients.length})
          </TabsTrigger>
          <TabsTrigger value="calls" className="text-xs gap-1.5 rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <PhoneCall className="h-3.5 w-3.5" /> Sarvam Voice Calls ({callLogs.length})
          </TabsTrigger>
          <TabsTrigger value="todos" className="text-xs gap-1.5 rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CheckSquare className="h-3.5 w-3.5" /> Action To-Dos ({globalTodos.filter((t) => !t.done).length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs gap-1.5 rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Camera className="h-3.5 w-3.5" /> Face App Integration
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: ALL INBOUND LEADS */}
        {/* ========================================================================= */}
        <TabsContent value="leads" className="space-y-4">
          <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="p-4 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads by name, phone or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs bg-muted/20"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "NEW", "CONTACTED", "QUALIFIED", "BOOKED", "WON"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      statusFilter === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground font-semibold">
                    <th className="p-3.5 pl-5">Prospect Name</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">Lead Source</th>
                    <th className="p-3.5">Pipeline Status</th>
                    <th className="p-3.5">Relationship Stage</th>
                    <th className="p-3.5">Captured</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Loading live CRM leads...
                      </td>
                    </tr>
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No leads found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => openLeadDetail(lead)}
                        className="hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <td className="p-3.5 pl-5 font-semibold text-foreground">
                          {lead.name}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground">
                          <div>{lead.phone}</div>
                          {lead.email && <div className="text-[10px] text-primary">{lead.email}</div>}
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-medium ${
                              lead.source.includes("Face App")
                                ? "border-indigo-500/40 text-indigo-500 bg-indigo-500/5"
                                : ""
                            }`}
                          >
                            {lead.source}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant={
                              lead.status === "BOOKED" || lead.status === "WON"
                                ? "success"
                                : lead.status === "QUALIFIED"
                                ? "warning"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            {lead.relationshipStage.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="p-3.5 pr-5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLeadDetail(lead);
                            }}
                          >
                            Open Details →
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: ONBOARDED CLIENT PROJECTS & STATUS */}
        {/* ========================================================================= */}
        <TabsContent value="clients" className="space-y-4">
          <Card className="bg-card border-border/80 shadow-sm p-4">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-base font-bold text-foreground">
                Active Client Projects & Onboarding Milestones
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Clients in Booked / Won status. Manage their project deliverables, notes, and automations execution.
              </CardDescription>
            </CardHeader>

            {bookedClients.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No booked or won clients yet. Qualify inbound leads and move them to "Booked" to track their project status here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookedClients.map((client) => {
                  const parsed = parseNotesAndTodos(client.notes);
                  return (
                    <div
                      key={client.id}
                      onClick={() => openLeadDetail(client)}
                      className="p-4 rounded-xl border border-border/80 bg-muted/10 hover:bg-muted/20 cursor-pointer transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{client.name}</h4>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {client.phone} • {client.email || "No email"}
                          </div>
                        </div>
                        <Badge variant="success" className="text-[10px]">
                          {client.status}
                        </Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-background border border-border/60 text-xs">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          Project Scope & Requirements:
                        </div>
                        <p className="text-foreground text-xs leading-relaxed">
                          {parsed.text || "Direct inbound booking. Deliverable: WhatsApp Qualifier + CRM Lead Pipeline Setup."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                        <span className="text-muted-foreground">Source: {client.source}</span>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Manage Client Project →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 3: SARVAM VOICE AI CALLS & TRANSCRIPTS */}
        {/* ========================================================================= */}
        <TabsContent value="calls" className="space-y-4">
          <Card className="bg-card border-border/80 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Sarvam Voice AI Call Logs & Transcripts
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Automated outreach calls in Hindi and English with full speech summaries.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs text-indigo-500 border-indigo-500/30">
                Sarvam AI Powered
              </Badge>
            </CardHeader>

            {callLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No voice calls recorded yet. Select any lead and click "Dispatch Voice Call" to simulate Maya calling in Hindi/English.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {callLogs.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-muted/10 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <PhoneCall className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground">
                            {c.lead?.name || "Prospect"}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {c.lead?.phone || "+91 Mobile"} • Duration: {c.durationSec}s
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={c.outcome === "CONNECTED" ? "success" : "secondary"}
                          className="text-[10px]"
                        >
                          {c.outcome}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {c.transcriptSummary && (
                      <div className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs text-foreground font-mono leading-relaxed">
                        {c.transcriptSummary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 4: TO-DO CHECKLIST & ACTION ITEMS */}
        {/* ========================================================================= */}
        <TabsContent value="todos" className="space-y-4">
          <Card className="bg-card border-border/80 shadow-sm p-4 space-y-4">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                Team Action Items & Lead To-Dos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Stay on top of follow-ups, contract dispatches, and client tasks.
              </CardDescription>
            </CardHeader>

            {/* Add new global todo */}
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add a new action item or task (e.g. Call back Dr. Sharma regarding teeth whitening)..."
                value={newGlobalTodoText}
                onChange={(e) => setNewGlobalTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newGlobalTodoText.trim()) {
                    setGlobalTodos([
                      ...globalTodos,
                      { id: `gt-${Date.now()}`, text: newGlobalTodoText.trim(), done: false },
                    ]);
                    setNewGlobalTodoText("");
                  }
                }}
                className="h-10 text-xs bg-muted/20"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (newGlobalTodoText.trim()) {
                    setGlobalTodos([
                      ...globalTodos,
                      { id: `gt-${Date.now()}`, text: newGlobalTodoText.trim(), done: false },
                    ]);
                    setNewGlobalTodoText("");
                  }
                }}
                className="h-10 text-xs font-semibold px-4"
              >
                Add Task
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2 pt-2">
              {globalTodos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => {
                    setGlobalTodos(
                      globalTodos.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                    );
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    todo.done
                      ? "border-border/60 bg-muted/20 opacity-60 line-through"
                      : "border-border/80 bg-background hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {todo.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-medium text-foreground">{todo.text}</div>
                      {todo.leadName && (
                        <div className="text-[10px] text-primary mt-0.5">
                          Prospect: {todo.leadName}
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={todo.done ? "secondary" : "outline"} className="text-[10px]">
                    {todo.done ? "Completed ✓" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 5: FACE APP & INBOUND WEBHOOK INTEGRATION */}
        {/* ========================================================================= */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card className="bg-card border-border/80 shadow-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Face App & Ad Campaign Webhook Ingestion
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Plug your Face App scanners, Meta Lead Ads, or customized web capture tools directly into your CRM.
                    </CardDescription>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setShowFaceAppModal(true)}
                className="gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <Zap className="h-3.5 w-3.5" /> Simulate Face App Lead Inbound
              </Button>
            </div>

            {/* Webhook Endpoint Box */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Live Ingestion Webhook URL:
              </div>
              <div className="flex items-center gap-2">
                <code className="p-2 rounded-md bg-background border border-border text-primary font-mono text-xs flex-1 truncate">
                  {webhookUrl}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="h-8 text-xs gap-1"
                >
                  {copiedWebhook ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedWebhook ? "Copied" : "Copy URL"}
                </Button>
              </div>
            </div>

            {/* Curl Snippet */}
            <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                cURL Example for Face App / Meta Ads:
              </div>
              <pre className="p-3 rounded-md bg-background border border-border text-foreground font-mono text-[11px] overflow-x-auto whitespace-pre">
{`curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Dr. Ayesha Kapoor",
    "phone": "+91 98110 55443",
    "email": "ayesha.k@wellnessclinic.in",
    "campaignName": "Meta Aesthetic Face Scan 2026",
    "faceScanId": "FS-9921-VIP",
    "notes": "Face scan completed. High aesthetic treatment interest."
  }'`}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* LEAD DETAIL & NOTES / TODOS MODAL */}
      {/* ========================================================================= */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedLead.name}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground">
                  {selectedLead.phone} • Source: {selectedLead.source}
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                {selectedLead.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-5 my-2">
            {/* Relationship Stage Progression */}
            <div className="p-3 rounded-xl border border-border/80 bg-muted/20">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Running Relationship Stage (AI Context)
              </div>
              <div className="grid grid-cols-4 gap-1">
                {stages.map((st) => {
                  const isCurrent = selectedLead.relationshipStage === st.key;
                  return (
                    <button
                      key={st.key}
                      onClick={() => updateRelationshipStage(st.key)}
                      className={`p-1.5 rounded text-[10px] font-semibold transition-all border text-center ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/40 text-muted-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground">Update Status:</span>
              {["NEW", "CONTACTED", "QUALIFIED", "BOOKED", "WON"].map((st) => (
                <button
                  key={st}
                  onClick={() => updateLeadStatus(st)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                    selectedLead.status === st
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/20 text-muted-foreground border-border/60 hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              ))}

              {/* Instant Call Button */}
              <Button
                size="sm"
                variant="outline"
                disabled={callingLead}
                onClick={handleTriggerVoiceCall}
                className="ml-auto text-xs gap-1.5 text-indigo-500 border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/15"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {callingLead ? "Maya Calling..." : "Dispatch Sarvam AI Voice Call"}
              </Button>
            </div>

            {/* Tabs inside Lead Modal: Notes & To-Dos vs Conversation Timeline */}
            <Tabs defaultValue="todos-notes" className="space-y-3">
              <TabsList className="bg-muted/40 p-1 rounded-lg border border-border">
                <TabsTrigger value="todos-notes" className="text-xs gap-1 font-medium">
                  <CheckSquare className="h-3.5 w-3.5" /> Notes & To-Dos
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs gap-1 font-medium">
                  <Clock className="h-3.5 w-3.5" /> Touchpoints ({leadActivities.length})
                </TabsTrigger>
              </TabsList>

              {/* Notes & To-Dos Tab */}
              <TabsContent value="todos-notes" className="space-y-4">
                {/* To-Do Checklist for this lead */}
                <div className="p-3.5 rounded-xl border border-border bg-background space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-primary" /> Action Tasks for this Prospect:
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {leadTodos.filter((t) => t.done).length}/{leadTodos.length} Done
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add specific task (e.g. Email floor plan brochure, call back at 5pm)..."
                      value={newTodoInput}
                      onChange={(e) => setNewTodoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddLeadTodo();
                      }}
                      className="h-8 text-xs bg-muted/30"
                    />
                    <Button size="sm" onClick={handleAddLeadTodo} className="h-8 text-xs font-semibold px-3">
                      Add
                    </Button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                    {leadTodos.length === 0 ? (
                      <div className="text-[11px] text-muted-foreground py-2 text-center">
                        No pending tasks. Add one above to keep your team organized.
                      </div>
                    ) : (
                      leadTodos.map((todo) => (
                        <div
                          key={todo.id}
                          onClick={() => handleToggleLeadTodo(todo.id)}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            todo.done
                              ? "bg-muted/20 border-border/40 text-muted-foreground line-through"
                              : "bg-muted/40 border-border text-foreground hover:bg-muted/70"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {todo.done ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Square className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span>{todo.text}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px]">
                            {todo.done ? "Done" : "Todo"}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Markdown Notes Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" /> Meeting Notes & Requirements:
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveNotesAndTodos}
                      disabled={savingNotes}
                      className="h-6 text-[11px] px-2.5"
                    >
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Document discussion notes, budget constraints, specific service requests..."
                    className="w-full h-24 p-3 rounded-xl border border-border bg-muted/20 text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-2">
                <div className="p-3 rounded-xl border border-border bg-background max-h-56 overflow-y-auto space-y-2.5">
                  {leadActivities.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No logged touchpoints yet.
                    </div>
                  ) : (
                    leadActivities.map((act) => {
                      let payload: any = {};
                      try {
                        payload = JSON.parse(act.payload);
                      } catch {}

                      return (
                        <div key={act.id} className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-foreground">{act.title}</span>
                            <span className="text-muted-foreground font-mono">
                              {formatDate(act.timestamp)}
                            </span>
                          </div>
                          {payload.transcript && (
                            <p className="text-[11px] text-foreground font-mono bg-background p-2 rounded border border-border">
                              {payload.transcript}
                            </p>
                          )}
                          {payload.message && (
                            <p className="text-[11px] text-foreground">
                              "{payload.message}"
                            </p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Close
            </Button>
          </DialogFooter>
        </Dialog>
      )}

      {/* ========================================================================= */}
      {/* FACE APP / AD LEADS SIMULATOR MODAL */}
      {/* ========================================================================= */}
      <Dialog open={showFaceAppModal} onOpenChange={setShowFaceAppModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-indigo-500">
            <Camera className="h-5 w-5" />
            <DialogTitle>Face App / AI Ad Campaign Lead Ingestion</DialogTitle>
          </div>
          <DialogDescription>
            Simulate a real lead generated via Face App AI camera scan or Meta Lead Ad campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Prospect Name</label>
            <Input
              value={faceAppForm.name}
              onChange={(e) => setFaceAppForm({ ...faceAppForm, name: e.target.value })}
              className="h-9 text-xs bg-muted/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
              <Input
                value={faceAppForm.phone}
                onChange={(e) => setFaceAppForm({ ...faceAppForm, phone: e.target.value })}
                className="h-9 text-xs bg-muted/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Face Scan ID</label>
              <Input
                value={faceAppForm.faceScanId}
                onChange={(e) => setFaceAppForm({ ...faceAppForm, faceScanId: e.target.value })}
                className="h-9 text-xs bg-muted/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Campaign Tag</label>
            <Input
              value={faceAppForm.campaignName}
              onChange={(e) => setFaceAppForm({ ...faceAppForm, campaignName: e.target.value })}
              className="h-9 text-xs bg-muted/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">AI Scan Notes & Offer</label>
            <textarea
              value={faceAppForm.notes}
              onChange={(e) => setFaceAppForm({ ...faceAppForm, notes: e.target.value })}
              className="w-full h-16 p-2 rounded-md border border-border bg-muted/20 text-foreground text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowFaceAppModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleFaceAppSubmit}
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
          >
            {faceAppSuccess ? "Lead Ingested ✓" : "Ingest Face App Lead Now"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ========================================================================= */}
      {/* MANUAL ADD LEAD MODAL */}
      {/* ========================================================================= */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogHeader>
          <DialogTitle>Add Inbound Lead Manually</DialogTitle>
          <DialogDescription>
            Enter prospect contact details to enroll them into your automated CRM pipeline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Full Name</label>
            <Input
              placeholder="e.g. Vikramjit Roy"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="h-9 text-xs bg-muted/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Phone Number</label>
              <Input
                placeholder="+91 98300 77123"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="h-9 text-xs bg-muted/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Email (Optional)</label>
              <Input
                placeholder="client@gmail.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="h-9 text-xs bg-muted/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Lead Source</label>
            <select
              className="w-full h-9 px-3 rounded-md border border-input bg-muted/20 text-xs text-foreground"
              value={createForm.source}
              onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
            >
              <option value="WhatsApp Lead Qualifier">WhatsApp Lead Qualifier</option>
              <option value="Face App AI Lead Inbound">Face App AI Lead Inbound</option>
              <option value="Direct Funnel Inbound">Direct Funnel Inbound</option>
              <option value="Phone Call Inbound">Phone Call Inbound</option>
              <option value="Meta Ads">Meta Ads</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Initial Notes</label>
            <textarea
              placeholder="Specific inquiries or requirements..."
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              className="w-full h-16 p-2 rounded-md border border-border bg-muted/20 text-foreground text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateLead}>
            Create Prospect Lead
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
