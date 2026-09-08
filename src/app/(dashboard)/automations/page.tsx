"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Cpu,
  Zap,
  MessageSquare,
  PhoneCall,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Plus,
  ShieldCheck,
  Workflow,
  ExternalLink,
} from "lucide-react";

export default function AutomationsPage() {
  const { currentSession } = useSession();
  const [activeTab, setActiveTab] = useState("active");
  const [activeAutomations, setActiveAutomations] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/automations?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveAutomations(data.activeAutomations || []);
        setCatalog(data.catalog || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [currentSession.orgId]);

  const handleToggle = async (orgAutomationId: string) => {
    setActionLoading(orgAutomationId);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle",
          orgAutomationId,
        }),
      });
      if (res.ok) {
        fetchAutomations();
      } else {
        const d = await res.json();
        alert(d.error || "Permission denied");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInstall = async (catalogId: string) => {
    setActionLoading(catalogId);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "install_from_catalog",
          orgId: currentSession.orgId,
          catalogId,
        }),
      });
      if (res.ok) {
        fetchAutomations();
        setActiveTab("active");
      } else {
        const d = await res.json();
        alert(d.error || "Failed to install");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Check which catalog items are already installed
  const installedCatalogIds = new Set(activeAutomations.map((a) => a.automationId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automations Hub & Marketplace</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Self-contained n8n workflow control layer for {currentSession.orgName}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono py-1 px-2.5">
            Client Workspace: ws_{currentSession.orgSlug}
          </Badge>
        </div>
      </div>

      {/* Tabs: Active vs Marketplace Catalog */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <Cpu className="h-4 w-4" /> Active Workforce ({activeAutomations.length})
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2">
              <Sparkles className="h-4 w-4" /> Automation Catalog ({catalog.length})
            </TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 hidden sm:flex"
            onClick={() => setActiveTab(activeTab === "active" ? "catalog" : "active")}
          >
            {activeTab === "active" ? "+ Browse More Automations" : "View Active Fleet"}
          </Button>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE AUTOMATIONS TAB (BRD Section 4.5) */}
        {/* ========================================================================= */}
        <TabsContent value="active" className="space-y-4 pt-2">
          {activeAutomations.length === 0 ? (
            <Card className="p-8 text-center bg-card/60 border-border">
              <p className="text-muted-foreground text-sm">No automations active yet.</p>
              <Button
                size="sm"
                className="mt-3 text-xs"
                onClick={() => setActiveTab("catalog")}
              >
                Browse Catalog & Install
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAutomations.map((auto) => {
                const isActive = auto.status === "ACTIVE";
                let tags: string[] = [];
                try {
                  tags = JSON.parse(auto.catalogItem?.recommendedTags || "[]");
                } catch {}

                return (
                  <Card
                    key={auto.id}
                    className={`bg-card/75 border transition-all ${
                      isActive ? "border-border/90" : "border-border/40 opacity-70"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-lg ${
                              auto.catalogItem?.category === "WhatsApp"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : auto.catalogItem?.category === "Voice AI"
                                ? "bg-indigo-500/10 text-indigo-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {auto.catalogItem?.category === "WhatsApp" ? (
                              <MessageSquare className="h-5 w-5" />
                            ) : auto.catalogItem?.category === "Voice AI" ? (
                              <PhoneCall className="h-5 w-5" />
                            ) : (
                              <Workflow className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold">
                              {auto.catalogItem?.name}
                            </CardTitle>
                            <CardDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                              {auto.n8nWorkflowId}
                            </CardDescription>
                          </div>
                        </div>

                        {/* On/Off Switch */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase text-[10px]">
                            {isActive ? "Active" : "Paused"}
                          </span>
                          <Switch
                            checked={isActive}
                            onCheckedChange={() => handleToggle(auto.id)}
                            disabled={actionLoading === auto.id}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {auto.catalogItem?.description}
                      </p>

                      {/* Stats row: Executions, Credits, Last Run */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/25 border border-border/50 text-center">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Executions
                          </div>
                          <div className="text-base font-black text-foreground">
                            {auto.executionCount}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Credits Used
                          </div>
                          <div className="text-base font-black text-foreground">
                            ₹{auto.creditsConsumed}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                            Last Run
                          </div>
                          <div className="text-[11px] font-medium text-muted-foreground mt-1">
                            {auto.lastRunAt ? formatDate(auto.lastRunAt) : "Idle"}
                          </div>
                        </div>
                      </div>

                      {/* Matching Tags */}
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-[10px] py-0 px-2">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ========================================================================= */}
        {/* AUTOMATION MARKETPLACE CATALOG TAB (BRD Section 4.1) */}
        {/* ========================================================================= */}
        <TabsContent value="catalog" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.map((item) => {
              const isInstalled = installedCatalogIds.has(item.id);
              let tags: string[] = [];
              try {
                tags = JSON.parse(item.recommendedTags || "[]");
              } catch {}

              return (
                <Card
                  key={item.id}
                  className="bg-card/75 border-border/80 flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {item.category}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> ~{item.estimatedSetupDays} day setup
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold">{item.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {item.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground border border-border/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-foreground">
                          {formatInr(item.setupPriceInr)} setup
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          +{formatInr(item.monthlyPriceInr)}/mo retainer
                        </div>
                      </div>

                      {isInstalled ? (
                        <Badge variant="success" className="text-xs py-1 px-3">
                          Installed ✓
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleInstall(item.id)}
                          disabled={actionLoading === item.id}
                          className="gap-1.5 text-xs font-semibold"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {actionLoading === item.id ? "Installing..." : "Add to Org"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
