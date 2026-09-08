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
  Filter,
  Globe,
  Code,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Send,
  Users,
} from "lucide-react";

export default function FunnelsPage() {
  const { currentSession } = useSession();
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Live test submission modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<any | null>(null);
  const [testForm, setTestForm] = useState({
    name: "Rohit Deshmukh",
    phone: "+91 99887 66554",
    email: "rohit.d@gmail.com",
    notes: "Submitted via live hosted funnel booking page.",
  });
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const fetchFunnels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/funnels?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        setFunnels(data.funnels || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, [currentSession.orgId]);

  const handleTestSubmit = async () => {
    if (!selectedFunnel) return;
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_lead",
          funnelSlug: selectedFunnel.publishedSlug,
          ...testForm,
        }),
      });
      if (res.ok) {
        setSubmissionSuccess(true);
        fetchFunnels();
        setTimeout(() => {
          setSubmissionSuccess(false);
          setShowTestModal(false);
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const embedSnippetCode = `<!-- Atom Automations Inbound Widget -->
<script
  src="https://cdn.atomplatform.io/widget/v1.js"
  data-org="${currentSession.orgSlug}"
  data-channel="whatsapp"
  data-trigger="floating_bubble"
  async>
</script>`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funnel Hub & Lead Capture</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Template-based booking funnels, embeddable website snippets, and hosted subdomain landing pages.
          </p>
        </div>
      </div>

      {/* Two Paths Overview Banner (BRD Section 4.4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Globe className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Path A: Already Have a Website?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Embed our WhatsApp chat widget snippet or connect your custom domain to route visitors straight into the CRM.
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm">Path B: No Website? (1-Week Service)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enjoy instant hosted landing page on <code className="text-primary font-mono text-[11px]">{currentSession.orgSlug}.atomplatform.io</code> while our human team finishes your full site in 7 days.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Funnels List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Active Lead Funnels ({funnels.length})</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {funnels.map((funnel) => {
            let brief: any = null;
            try {
              if (funnel.websiteBrief) brief = JSON.parse(funnel.websiteBrief);
            } catch {}

            return (
              <Card key={funnel.id} className="bg-card/75 border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      {funnel.templateId}
                    </Badge>
                    <Badge variant="success" className="text-[10px]">
                      {funnel.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold pt-1">{funnel.title}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground font-mono">
                    URL: https://{funnel.publishedSlug}.atomplatform.io
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Views vs Conversions */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/25 border border-border/50 text-center">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Views
                      </div>
                      <div className="text-base font-black text-foreground">{funnel.views}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Leads Captured
                      </div>
                      <div className="text-base font-black text-foreground">
                        {funnel.conversions}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                        Conversion %
                      </div>
                      <div className="text-base font-black text-emerald-400">
                        {funnel.views > 0
                          ? `${Math.round((funnel.conversions / funnel.views) * 100)}%`
                          : "0%"}
                      </div>
                    </div>
                  </div>

                  {brief && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs space-y-1">
                      <div className="font-semibold text-primary">
                        1-Week Starter Website Brief Received
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        {brief.businessDescription}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 w-full"
                      onClick={() => {
                        setSelectedFunnel(funnel);
                        setShowTestModal(true);
                      }}
                    >
                      <Send className="h-3.5 w-3.5 text-primary" /> Test Lead Form Submission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Embed Code Snippet Card (BRD Section 4.4) */}
      <Card className="bg-card/75 border-border/80">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-bold">Embeddable Lead Capture Snippet</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Paste this snippet before the <code className="text-primary font-mono text-xs">&lt;/body&gt;</code> tag of your existing website to activate floating WhatsApp booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <pre className="p-4 rounded-xl bg-background/90 border border-border/70 text-xs font-mono text-muted-foreground overflow-x-auto">
              {embedSnippetCode}
            </pre>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(embedSnippetCode);
                setCopiedSnippet(true);
                setTimeout(() => setCopiedSnippet(false), 2000);
              }}
              className="absolute right-3 top-3 h-8 text-xs gap-1.5"
            >
              {copiedSnippet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedSnippet ? "Copied!" : "Copy Code"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Lead Submission Modal */}
      <Dialog open={showTestModal} onOpenChange={setShowTestModal}>
        <DialogHeader>
          <DialogTitle>Simulate Hosted Funnel Submission</DialogTitle>
          <DialogDescription>
            Submits a prospective lead directly through: {selectedFunnel?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Visitor Name</label>
            <Input
              value={testForm.name}
              onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
            <Input
              value={testForm.phone}
              onChange={(e) => setTestForm({ ...testForm, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <Input
              value={testForm.email}
              onChange={(e) => setTestForm({ ...testForm, email: e.target.value })}
            />
          </div>

          {submissionSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4" /> Lead pushed to CRM table successfully!
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTestModal(false)}>
            Close
          </Button>
          <Button onClick={handleTestSubmit} className="gap-2">
            <Send className="h-3.5 w-3.5" /> Submit to CRM
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
