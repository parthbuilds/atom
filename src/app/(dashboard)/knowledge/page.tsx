"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Save,
  Check,
  Zap,
  PhoneCall,
  MessageSquare,
  Sliders,
} from "lucide-react";

export default function KnowledgePage() {
  const { currentSession } = useSession();
  const [markdownContent, setMarkdownContent] = useState("");
  const [fileName, setFileName] = useState("business-context.md");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI Diagnostic State
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any | null>(null);

  // Load existing knowledge base
  const loadKnowledge = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orgs/knowledge?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.knowledge) {
          setMarkdownContent(data.knowledge.markdownContent || "");
          setFileName(data.knowledge.fileName || "business-context.md");
          setLastUpdated(data.knowledge.lastUpdated);
          if (data.knowledge.aiDiagnosis) {
            setDiagnosis(data.knowledge.aiDiagnosis);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKnowledge();
  }, [currentSession.orgId]);

  // Save Knowledge to DB
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/orgs/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          markdownContent,
          fileName,
          aiDiagnosis: diagnosis,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Run Real-Time AI Diagnosis
  const handleRunDiagnosis = async () => {
    setDiagnosing(true);
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          markdownContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data.diagnosis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setMarkdownContent(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Topmate-Inspired Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              AI Business Knowledge Hub
            </h1>
            <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/40 bg-primary/5">
              Live Telemetry Grounded
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Feed your business services, pricing, and objections into Atom AI. The diagnostic engine correlates your knowledge with real-time CRM leads and call logs to identify bottlenecks and optimize conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 text-xs"
          >
            {saveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
            {saving ? "Saving..." : saveSuccess ? "Saved to DB" : "Save Document"}
          </Button>

          <Button
            size="sm"
            onClick={handleRunDiagnosis}
            disabled={diagnosing || !markdownContent}
            className="gap-2 text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="h-4 w-4" />
            {diagnosing ? "Analyzing Real-Time Data..." : "Run AI Diagnostic"}
          </Button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Markdown Document & Uploader */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="bg-card border-border/80 shadow-sm flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-bold text-foreground">
                    Business Knowledge File (.md)
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".md,.txt,.json,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="px-2.5 py-1 rounded-md border border-border bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors">
                      <Upload className="h-3 w-3 text-muted-foreground" />
                      <span>Upload File</span>
                    </div>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                    {fileName}
                  </span>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Describe your services, pricing, ideal customer persona, turnaround times, and common objections.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col">
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="# My Business Knowledge Base&#10;&#10;## Core Services & Pricing&#10;..."
                className="w-full h-[520px] p-3.5 rounded-xl border border-border/70 bg-muted/20 text-foreground font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Supports standard Markdown formatting</span>
                {lastUpdated && (
                  <span>
                    Last updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (6 cols): Real-Time AI Problem Diagnosis & Solutions */}
        <div className="lg:col-span-6 space-y-4">
          {diagnosing && (
            <Card className="bg-card border-primary/40 shadow-sm p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">AI Diagnostic in Progress...</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Correlating your uploaded business context with real-time leads volume, Sarvam voice transcripts, and conversion rates...
              </p>
            </Card>
          )}

          {!diagnosing && !diagnosis && (
            <Card className="bg-card border-dashed border-border p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base text-foreground">No Diagnostic Run Yet</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click <strong>"Run AI Diagnostic"</strong> above. Atom AI will inspect your business markdown alongside active database metrics to pinpoint operational bottlenecks and provide tailored solutions.
              </p>
              <Button
                size="sm"
                onClick={handleRunDiagnosis}
                disabled={!markdownContent}
                className="gap-2 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5" /> Start First Diagnostic
              </Button>
            </Card>
          )}

          {!diagnosing && diagnosis && (
            <div className="space-y-4">
              {/* Telemetry Overview Card */}
              <Card className="bg-card border-border/80 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-foreground">
                          Operational Health Score
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Grounded in real-time telemetry from your database
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary">{diagnosis.healthScore}/100</span>
                      <div className="text-[10px] text-muted-foreground">Overall Index</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/60 text-center">
                    <div className="p-2 rounded-lg bg-muted/20">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Leads Evaluated</div>
                      <div className="text-base font-bold text-foreground">{diagnosis.realtimeTelemetry.totalLeadsEvaluated}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Conversion Rate</div>
                      <div className="text-base font-bold text-emerald-500">{diagnosis.realtimeTelemetry.conversionRatePercent}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Voice Connect</div>
                      <div className="text-base font-bold text-indigo-500">{diagnosis.realtimeTelemetry.callConnectRatePercent}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/20">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">Credits Left</div>
                      <div className="text-base font-bold text-foreground">₹{diagnosis.realtimeTelemetry.creditBalance.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Identified Bottlenecks */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Identified Bottlenecks ({diagnosis.bottlenecks.length})
                </div>

                {diagnosis.bottlenecks.map((b: any, idx: number) => (
                  <Card key={idx} className="bg-card border-amber-500/30 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-foreground">{b.title}</h4>
                            <Badge
                              variant={b.severity === "HIGH" ? "destructive" : "warning"}
                              className="text-[10px] py-0 px-2"
                            >
                              {b.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {b.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                          {b.metric}
                        </Badge>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-600 dark:text-amber-300 flex items-center justify-between">
                        <span><strong>Action Recommended:</strong> {b.action}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Strategic Recommendations & Dynamic Prompts */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Tailored Strategic Fixes ({diagnosis.recommendations.length})
                </div>

                {diagnosis.recommendations.map((rec: any, idx: number) => (
                  <Card key={idx} className="bg-card border-border/80 shadow-sm">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">{rec.title}</h4>
                        <Badge variant="outline" className="text-[10px] font-semibold text-emerald-500 border-emerald-500/30">
                          {rec.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                      {rec.suggestedPromptSnippet && (
                        <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-xs">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">
                            Generated AI Logic / Prompt:
                          </span>
                          <code className="text-primary font-mono text-[11px] block whitespace-pre-wrap">
                            {rec.suggestedPromptSnippet}
                          </code>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
