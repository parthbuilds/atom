"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Code2,
  Palette,
  Clock,
  Send,
  ExternalLink,
  Share2,
  Copy,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
  Zap,
  Building2,
  Users,
  PhoneCall,
  MessageSquare,
} from "lucide-react";

export default function WebsiteSaaSOnboardingPage() {
  const router = useRouter();
  const { currentSession } = useSession();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    type: "WEBSITE_REQUEST" as "WEBSITE_REQUEST" | "CUSTOM_SAAS",
    title: "",
    industry: "Real Estate & Luxury Living",
    targetAudience: "High-net-worth property buyers and investors looking for luxury villas.",
    primaryGoals: "Capture inbound leads via WhatsApp & Sarvam Voice AI, showcase listings, and book instant site visits.",
    selectedFeatures: [
      "1-Week Rapid Launch Landing Page",
      "Interactive WhatsApp Booking Widget",
      "Sarvam Voice AI Automated Site Visit Qualifier",
      "Instant CRM Lead Sync & Pipeline Tracking",
    ],
    designStyle: "Dark High-Tech & Luxury Minimalist",
    brandColor: "#3b82f6",
    referenceUrls: "https://stripe.com, https://linear.app",
    existingAssetsUrl: "",
    targetDomain: "",
    sprintTimeline: "7-Day Rapid Sprint",
    clientName: currentSession.name || "Priya Sharma",
    clientEmail: currentSession.email || "priya@apexrealty.in",
    clientPhone: "+91 98765 43210",
  });

  const websiteFeatureOptions = [
    "1-Week Rapid Launch Landing Page",
    "Interactive WhatsApp Booking Widget",
    "Sarvam Voice AI Automated Site Visit Qualifier",
    "Instant CRM Lead Sync & Pipeline Tracking",
    "Custom Subdomain (e.g. yourbrand.atomplatform.io)",
    "SEO Meta Optimization & Google Indexing",
    "Speed Optimized Next.js Architecture (<0.8s load)",
    "E-Commerce Cart & Razorpay Payment Integration",
  ];

  const saasFeatureOptions = [
    "Multi-Tenant Organization Architecture",
    "Autonomous Sarvam Voice AI Calling Engine",
    "Credit-Wallet & Razorpay Subscription Billing",
    "Role-Based Access Control (RBAC Permissions)",
    "White-Label Theming & Custom Domain Mapping",
    "n8n Automation Engine Webhooks & Workflows",
    "Cost-Per-Lead (CPL) & ROI Attribution Engine",
    "Interactive Client Status Portal & Change Tracker",
  ];

  const toggleFeature = (feat: string) => {
    setFormData((prev) => {
      const exists = prev.selectedFeatures.includes(feat);
      return {
        ...prev,
        selectedFeatures: exists
          ? prev.selectedFeatures.filter((f) => f !== feat)
          : [...prev.selectedFeatures, feat],
      };
    });
  };

  const handleCreateProject = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_project",
          orgId: currentSession.orgId,
          type: formData.type,
          title: formData.title,
          description: `${formData.type === "WEBSITE_REQUEST" ? "Website Build Request" : "Custom SaaS Product"} for ${formData.clientName} (${formData.industry}). Target sprint: ${formData.sprintTimeline}.`,
          targetAudience: formData.targetAudience,
          primaryGoals: formData.primaryGoals,
          keyFeatures: formData.selectedFeatures,
          designPreferences: `${formData.designStyle} (Brand Accent: ${formData.brandColor})`,
          techStack:
            formData.type === "CUSTOM_SAAS"
              ? "Next.js 14 App Router, Tailwind CSS, Prisma SQLite/Postgres, Sarvam AI Voice, Razorpay, n8n"
              : "Next.js 14, Tailwind CSS, Lucide Icons, WhatsApp Meta Cloud API, Sarvam AI Voice",
          referenceUrls: formData.referenceUrls,
          estimatedLaunch:
            formData.sprintTimeline === "7-Day Rapid Sprint"
              ? new Date(Date.now() + 7 * 86400000).toISOString()
              : new Date(Date.now() + 14 * 86400000).toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedProject(data.project);
        setStep(5); // Show success & sharing view
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create project onboarding.");
      }
    } catch (e: any) {
      alert(e.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = createdProject
    ? `${typeof window !== "undefined" ? window.location.origin : "https://atomplatform.io"}/status/${createdProject.shareToken}`
    : "";

  const handleCopyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyWhatsApp = () => {
    if (!createdProject) return;
    const msg = `🚀 *New Project Onboarded: ${createdProject.title}*
    
📋 *Type:* ${createdProject.type === "WEBSITE_REQUEST" ? "Website Request" : "Custom SaaS Product"}
📊 *Current Status:* ${createdProject.progressPct}% (${createdProject.status})
🎯 *Target Delivery:* ${formData.sprintTimeline}

🔗 *Track Real-Time Deliverables & Progress Here:*
${shareUrl}

_Prepared by Atom Engineering Platform_`;

    navigator.clipboard.writeText(msg);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Website & Custom SaaS Onboarding Studio
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure client build specifications, architecture blueprint, branding tokens, and generate live client status sharing.
          </p>
        </div>

        <Link href="/projects">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Projects Hub
          </Button>
        </Link>
      </div>

      {/* Progress Bar (Steps 1 to 4) */}
      {step < 5 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>
              Step {step} of 4:{" "}
              {step === 1 && "Project Category & Core Scope"}
              {step === 2 && "Feature Blueprint & Engine Selection"}
              {step === 3 && "Visual Identity & Design References"}
              {step === 4 && "Sprint Timeline & Client Setup"}
            </span>
            <span>{step * 25}% Complete</span>
          </div>
          <Progress value={step * 25} className="h-2" />
        </div>
      )}

      {/* STEP 1: CATEGORY & CORE SCOPE */}
      {step === 1 && (
        <Card className="bg-card border-border shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Select Project Deliverable Type</h2>
            <p className="text-xs text-muted-foreground">
              Choose whether you are onboarding a high-converting website request or a full custom SaaS automation engine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: "WEBSITE_REQUEST",
                  title: prev.title || `${currentSession.orgName} 1-Week Launch Website`,
                  selectedFeatures: websiteFeatureOptions.slice(0, 4),
                }));
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                formData.type === "WEBSITE_REQUEST"
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border/70 bg-muted/20 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Globe className="h-5 w-5" />
                </div>
                <Badge variant={formData.type === "WEBSITE_REQUEST" ? "default" : "outline"} className="text-[10px]">
                  1-Week Delivery
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-base">Website Request & Landing Page</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Fast 7-day starter site, luxury listing portal, or high-converting inbound landing funnel with WhatsApp & Sarvam Voice lead capture widgets.
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  type: "CUSTOM_SAAS",
                  title: prev.title || `${currentSession.orgName} Client Portal & SaaS Platform`,
                  selectedFeatures: saasFeatureOptions.slice(0, 4),
                }));
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                formData.type === "CUSTOM_SAAS"
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border/70 bg-muted/20 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant={formData.type === "CUSTOM_SAAS" ? "default" : "outline"} className="text-[10px]">
                  Custom SaaS Product
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-base">Custom SaaS Product & Portal</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Full multi-tenant SaaS application with client dashboard, Razorpay credit wallet, Sarvam AI calling, RBAC permissions, and n8n backend engine.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Project Title / Product Name *
              </label>
              <Input
                placeholder="e.g. Apex Luxury Properties 1-Week Launch Site"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Industry / Niche
                </label>
                <Input
                  placeholder="e.g. Real Estate, Aesthetic Clinic, FinTech SaaS"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Target Domain or Subdomain
                </label>
                <Input
                  placeholder="e.g. apexrealty.com or apex.atomplatform.io"
                  value={formData.targetDomain}
                  onChange={(e) => setFormData({ ...formData, targetDomain: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Target Audience
              </label>
              <Input
                placeholder="Who will be using or visiting this product?"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Primary Business Goals
              </label>
              <Input
                placeholder="e.g. Double inbound leads, qualify buyer budgets with Sarvam Voice AI, automate appointments"
                value={formData.primaryGoals}
                onChange={(e) => setFormData({ ...formData, primaryGoals: e.target.value })}
                className="text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={() => {
                if (!formData.title.trim()) {
                  alert("Please enter a project title.");
                  return;
                }
                setStep(2);
              }}
              className="gap-2 text-xs font-semibold"
            >
              Continue to Feature Blueprint <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: FEATURE BLUEPRINT */}
      {step === 2 && (
        <Card className="bg-card border-border shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Feature Blueprint & Integrations</h2>
            <p className="text-xs text-muted-foreground">
              Select the modules and integrations to include in this {formData.type === "WEBSITE_REQUEST" ? "Website" : "Custom SaaS"} build.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(formData.type === "WEBSITE_REQUEST" ? websiteFeatureOptions : saasFeatureOptions).map(
              (feat) => {
                const isSelected = formData.selectedFeatures.includes(feat);
                return (
                  <div
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground font-semibold"
                        : "border-border/70 bg-muted/20 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs">{feat}</span>
                  </div>
                );
              }
            )}
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/80 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground">AI Automation Pre-Wired: </span>
              <span className="text-muted-foreground">
                Both Sarvam Voice calling and WhatsApp Meta Cloud triggers will be automatically hooked into your CRM pipeline upon deployment.
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="sm" onClick={() => setStep(3)} className="gap-2 text-xs font-semibold">
              Continue to Visual Identity <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: VISUAL IDENTITY & BRANDING */}
      {step === 3 && (
        <Card className="bg-card border-border shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Visual Identity & Design Preferences</h2>
            <p className="text-xs text-muted-foreground">
              Define the aesthetic tone, brand color palette, and provide design reference links.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Aesthetic Tone & Theme Mood
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  "Dark High-Tech SaaS",
                  "Luxe Minimalist Gold",
                  "Clean Medical / Clinical",
                  "Modern Vibrant Bold",
                ].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setFormData({ ...formData, designStyle: style })}
                    className={`p-3 rounded-xl border text-xs text-center font-semibold transition-all ${
                      formData.designStyle === style
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Brand Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="font-mono text-xs w-32"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Design Inspiration / Reference URLs
                </label>
                <Input
                  placeholder="e.g. stripe.com, apple.com, linear.app"
                  value={formData.referenceUrls}
                  onChange={(e) => setFormData({ ...formData, referenceUrls: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Existing Assets URL (Figma, Logo, Drive Link, or Content Brief)
              </label>
              <Input
                placeholder="https://drive.google.com/... or https://figma.com/file/..."
                value={formData.existingAssetsUrl}
                onChange={(e) => setFormData({ ...formData, existingAssetsUrl: e.target.value })}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setStep(2)} className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button size="sm" onClick={() => setStep(4)} className="gap-2 text-xs font-semibold">
              Continue to Sprint Setup <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: SPRINT TIMELINE & CLIENT SETUP */}
      {step === 4 && (
        <Card className="bg-card border-border shadow-sm p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold">Delivery Sprint & Client Notifications</h2>
            <p className="text-xs text-muted-foreground">
              Finalize target launch milestones and contact channels for automated client status sharing.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Select Delivery Sprint
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "7-Day Rapid Sprint",
                    desc: "Ideal for 1-Week Launch Websites, Booking Funnels & MVP portals.",
                  },
                  {
                    title: "14-Day Full MVP",
                    desc: "Full Custom SaaS with Sarvam Voice AI, WhatsApp & Razorpay integration.",
                  },
                  {
                    title: "30-Day Comprehensive",
                    desc: "Multi-tenant enterprise SaaS with custom pipelines & data migrations.",
                  },
                ].map((s) => (
                  <div
                    key={s.title}
                    onClick={() => setFormData({ ...formData, sprintTimeline: s.title })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.sprintTimeline === s.title
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-sm"
                        : "border-border/70 bg-muted/20 text-muted-foreground hover:border-border"
                    }`}
                  >
                    <div className="text-sm font-bold text-foreground">{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wider">
                Client Point of Contact (Receives Status Link)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Client Name
                  </label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    Client Email
                  </label>
                  <Input
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    WhatsApp Mobile Number
                  </label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setStep(3)} className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              size="sm"
              disabled={submitting}
              onClick={handleCreateProject}
              className="gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {submitting ? "Initializing Project & Status Link..." : "Complete Onboarding & Generate Status Link ✓"}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: SUCCESS & SHARE UPDATE WITH CLIENT */}
      {step === 5 && createdProject && (
        <Card className="bg-card border-border shadow-xl p-8 space-y-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
              Onboarding Complete & Project Active
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {createdProject.title}
            </h2>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              Your project workspace has been provisioned. The delivery roadmap, initial milestone specs, and public client status link are now live.
            </p>
          </div>

          {/* Shareable Client Link Box */}
          <div className="p-5 rounded-2xl bg-muted/40 border border-border max-w-xl mx-auto text-left space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-primary" /> Live Client Status Portal URL
              </span>
              <span className="text-muted-foreground font-mono text-[11px]">Public No-Login Access</span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-xs bg-background/80 text-foreground"
              />
              <Button size="sm" onClick={handleCopyShareLink} className="text-xs shrink-0 gap-1.5">
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
              <span>Clients can inspect real-time progress, milestones, and deliverables here.</span>
              <a
                href={`/status/${createdProject.shareToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                Preview Client Page <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center flex-wrap gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyWhatsApp}
              className="gap-2 text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {copiedWhatsApp ? "WhatsApp Message Copied!" : "Copy WhatsApp Update to Share"}
            </Button>

            <Link href="/projects">
              <Button size="sm" className="gap-2 text-xs font-semibold">
                Go to Projects Hub <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
