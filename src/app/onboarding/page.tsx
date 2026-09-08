"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  generateRecommendations,
  QuizAnswers,
  RecommendationResult,
} from "@/lib/recommendation-engine";
import { formatInr } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Building2,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Globe,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  Check,
  TrendingUp,
  LayoutDashboard,
  Bot,
  Volume2,
  Layers,
  Share2,
  Code2,
  ExternalLink,
} from "lucide-react";
import { useSession } from "@/components/auth/session-provider";
import { useTheme } from "@/components/theme/theme-provider";
import { AtomLogo } from "@/components/ui/atom-logo";
import { AtomWordmark } from "@/components/ui/atom-wordmark";

export default function OnboardingPage() {
  const router = useRouter();
  const { setOrg, setRole } = useSession();
  const { updateToken } = useTheme();

  // Wizard step (1 to 6)
  const [step, setStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);

  // WhatsApp OTP Verification State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("+91 98765 43210");
  const [whatsappOtp, setWhatsappOtp] = useState("");
  const [whatsappModalStep, setWhatsappModalStep] = useState<"phone" | "otp" | "success">("phone");
  const [whatsappIsVerifying, setWhatsappIsVerifying] = useState(false);
  const [verifiedWhatsAppNumber, setVerifiedWhatsAppNumber] = useState<string | null>(null);

  // Form State
  const [serviceTrack, setServiceTrack] = useState<"automations" | "website_request" | "custom_saas">("automations");

  const [quiz, setQuiz] = useState<QuizAnswers>({
    businessName: "",
    industry: "real estate",
    city: "",
    teamSize: "2-5",
    biggestPainPoint: "slow follow-up",
    hasWebsite: "Yes",
    customerReachChannel: "WhatsApp",
    aiMode: "talk to leads",
    leadVolumeBucket: "50-200",
  });

  // Project Specs for Website Request / Custom SaaS
  const [projectSpecs, setProjectSpecs] = useState({
    projectTitle: "",
    projectType: "Marketing & Lead Capture Website",
    targetAudience: "",
    primaryGoals: "",
    keyFeatures: [
      "User Authentication & Role Access",
      "WhatsApp Bot Qualifier Integration",
      "Sarvam Voice AI Inbound Callback",
      "Interactive Product/Villa Showcase",
      "Razorpay / Stripe Payments",
      "Live Client Status Portal",
    ],
    designStyle: "Modern Clean & Responsive",
    referenceUrls: "",
    deliveryTimeline: "7-Day Express Sprint",
  });

  const [createdShareToken, setCreatedShareToken] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Simple "Other" custom details (Only Brand Type & Explanation)
  const [otherBrandType, setOtherBrandType] = useState("");
  const [otherExplanation, setOtherExplanation] = useState("");

  const [ownerInfo, setOwnerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Website brief for No-website branch (Step 4)
  const [websiteBrief, setWebsiteBrief] = useState({
    businessDescription: "",
    highlight1: "",
    highlight2: "",
    highlight3: "",
  });

  // Recommendation output
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);

  // Dashboard Builder Preferences
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [dashboardWidgets, setDashboardWidgets] = useState({
    showLeadsKpi: true,
    showAutomationsKpi: true,
    showVoiceKpi: true,
    showWalletKpi: true,
    showFunnelMetrics: true,
    showRecentLeads: true,
    showQuickSimulator: true,
    primaryGoal: "lead_capture" as "lead_capture" | "consultations" | "roi",
  });

  // Welcome checklist (Step 6)
  const [welcomeChecklist, setWelcomeChecklist] = useState({
    whatsappConnected: false,
    leadsAdded: false,
    funnelReviewed: false,
  });

  // Clean, compact industry presets
  const industryList = [
    { id: "real estate", label: "Real Estate", persona: "Property Acquisition Agent", greeting: "Namaste! Welcome to our property listings. Are you looking to buy, sell, or schedule a site visit?" },
    { id: "clinic/salon", label: "Clinic & Healthcare", persona: "Patient Care Concierge", greeting: "Hello! Welcome to our clinic. Would you like to schedule an appointment with our specialist?" },
    { id: "home services", label: "Home Services", persona: "Service Dispatch Agent", greeting: "Hi there! Need repair or maintenance support? Tell me your location to dispatch our team." },
    { id: "coach/consultant", label: "Coaching & Advisory", persona: "Executive Advisor", greeting: "Welcome! To tailor our consultation, what is your primary business goal right now?" },
    { id: "e-commerce", label: "D2C & Retail", persona: "Order & Support Rep", greeting: "Hey! Looking to track your shipment or have a product question? I can help right away." },
    { id: "restaurant", label: "Dining & Hospitality", persona: "Host Concierge", greeting: "Namaste! Looking to book a table or plan a gathering? Let me know your party size." },
    { id: "legal/finance", label: "Legal & Finance", persona: "Client Intake Officer", greeting: "Hello. Welcome to our firm. What advisory or compliance matter can we assist you with?" },
    { id: "other", label: "Other Industry", persona: "AI Business Assistant", greeting: otherExplanation ? `Hello! Welcome to ${quiz.businessName || "our business"}. Regarding ${otherExplanation}, how can I assist you today?` : "Hello! Welcome. How can I assist you with our services today?" },
  ];

  const currentIndustry = industryList.find((i) => i.id === quiz.industry) || industryList[0];

  const painPoints = [
    {
      id: "slow follow-up",
      title: "Slow Follow-up",
      desc: "Prospects message on WhatsApp/web and go cold before staff reply.",
      metric: "78% drop-off",
    },
    {
      id: "missed calls",
      title: "Missed Calls",
      desc: "Losing inquiries when calls arrive outside work hours or busy times.",
      metric: "<180ms callback",
    },
    {
      id: "no-shows",
      title: "Appointment No-Shows",
      desc: "Clients book consultation slots but fail to attend without reminders.",
      metric: "68% reduction",
    },
    {
      id: "cold traffic",
      title: "Ad Traffic Drop-off",
      desc: "Ad clicks drop off before entering your sales pipeline or CRM.",
      metric: "2.8x uplift",
    },
  ];

  // 6 Stages matching the pill selector layout from the screenshot
  const stages = [
    { step: "01", title: "DNA Setup", phase: "PHASE 01 // DISCOVERY & FOUNDATION", duration: "Day 1 · Setup" },
    { step: "02", title: "Bottleneck", phase: "PHASE 02 // BOTTLENECK AUDIT", duration: "Day 1 · Audit" },
    { step: "03", title: "AI Blueprint", phase: "PHASE 03 // ARCHITECTURAL BLUEPRINT", duration: "Day 2 · Blueprint" },
    { step: "04", title: "Website", phase: "PHASE 04 // LAUNCHPAD STOREFRONT", duration: "Week 1 · Launchpad" },
    { step: "05", title: "Dashboard", phase: "PHASE 05 // SUITE PROVISIONING", duration: "Instant Provision" },
    { step: "06", title: "Live Launch", phase: "PHASE 06 // WORKFORCE ONLINE", duration: "Production Live" },
  ];

  const currentStage = stages[step - 1];

  const handleNextFromBasics = () => {
    if (!quiz.businessName.trim()) {
      alert("Please enter your business or company name.");
      return;
    }
    if (quiz.industry === "other" && !otherBrandType.trim()) {
      alert("Please enter what your brand or business is.");
      return;
    }
    setStep(2);
  };

  const handleFinishQuiz = () => {
    const effectiveIndustry =
      quiz.industry === "other" && otherBrandType.trim() ? otherBrandType.trim() : quiz.industry;

    const result = generateRecommendations({
      ...quiz,
      serviceTrack,
      projectSpecs,
      industry: effectiveIndustry,
    });

    setRecommendations(result);
    setSelectedAutomations(result.suggestedAutomations.map((a) => a.catalogId));
    setStep(3);
  };

  const handleNextFromRecommendations = () => {
    if (serviceTrack === "website_request" || serviceTrack === "custom_saas" || quiz.hasWebsite === "No") {
      setStep(4);
    } else {
      setStep(5);
    }
  };

  const handleNextFromWebsiteBranch = () => {
    setStep(5);
  };

  const toggleAutomationSelection = (catId: string) => {
    if (selectedAutomations.includes(catId)) {
      if (selectedAutomations.length === 1) {
        alert("Please keep at least 1 automation selected.");
        return;
      }
      setSelectedAutomations(selectedAutomations.filter((id) => id !== catId));
    } else {
      setSelectedAutomations([...selectedAutomations, catId]);
    }
  };

  const executePaymentAndProvision = async () => {
    setIsProcessing(true);
    setShowRazorpayModal(false);
    setStep(6);

    const resolvedIndustry =
      quiz.industry === "other" && otherBrandType.trim() ? otherBrandType.trim() : quiz.industry;

    try {
      const response = await fetch("/api/onboarding/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: quiz.businessName,
          industry: resolvedIndustry,
          city: quiz.city,
          teamSize: quiz.teamSize,
          hasWebsite: quiz.hasWebsite,
          serviceTrack,
          projectSpecs: {
            ...projectSpecs,
            projectTitle: projectSpecs.projectTitle || `${quiz.businessName} ${serviceTrack === "custom_saas" ? "Custom SaaS Product" : "Bespoke Website"}`,
          },
          websiteBrief: (serviceTrack === "website_request" || quiz.hasWebsite === "No") ? websiteBrief : null,
          selectedCatalogIds: selectedAutomations,
          starterCreditsInr: recommendations?.starterCreditsRequiredInr || 5000,
          ownerName: ownerInfo.name || `${quiz.businessName} Owner`,
          ownerEmail: ownerInfo.email || `hello@${quiz.businessName.toLowerCase().replace(/\s+/g, "")}.com`,
          razorpayPaymentId: `pay_rzp_live_${Date.now().toString(36)}`,
          themeMode,
          dashboardWidgets,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Provisioning failed");

      if (data.project?.shareToken) {
        setCreatedShareToken(data.project.shareToken);
      }

      setOrg(data.org.id, data.org.name, data.org.slug);
      setRole("CLIENT_OWNER");
      updateToken("mode", themeMode);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="synthio-scope min-h-screen bg-[#f8f7f3] text-neutral-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-synthio-body relative">
      {/* Blueprint Dashed Vertical Frame running top to bottom */}
      <div
        className="pointer-events-none fixed inset-0 z-10 mx-auto hidden max-w-[1180px] xl:block"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-0 w-px dashed-line-v opacity-30" />
        <div className="absolute top-0 bottom-0 right-0 w-px dashed-line-v opacity-30" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 max-w-5xl w-full mx-auto flex items-center justify-between pb-3">
        <AtomWordmark size="md" showBadge badgeText="Autonomous Workforce" href="/" />

        <div className="font-synthio-mono text-xs bg-white border border-[#e2e0d8] px-3.5 py-1.5 rounded-full text-neutral-700 shadow-2xs flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Step {step} of 06 · {currentStage.title}</span>
        </div>
      </header>

      {/* Top Progress Pills (Light Pastel Matte Colors Matching Screenshot!) */}
      <div className="relative z-20 w-full max-w-5xl mx-auto my-3">
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {stages.map((stage, idx) => {
            const isActive = step === idx + 1;
            const isDone = step > idx + 1;
            return (
              <button
                key={stage.step}
                type="button"
                onClick={() => idx + 1 <= step && setStep(idx + 1)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-synthio-mono transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? "bg-neutral-950 text-white border-neutral-950 shadow-md"
                    : isDone
                    ? "bg-[#edf5f0] text-emerald-800 border-[#cbe3d4] hover:bg-[#e4f0e9]"
                    : "bg-white text-neutral-600 border-[#e2e0d8] hover:bg-[#faf9f5]"
                }`}
              >
                <span
                  className={`size-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-amber-400 text-neutral-950"
                      : isDone
                      ? "bg-emerald-200 text-emerald-900"
                      : "bg-[#f1ede4] text-neutral-500"
                  }`}
                >
                  {isDone ? "✓" : stage.step}
                </span>
                <span className="font-synthio-body font-semibold text-xs">{stage.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container Card (Large White Card Matching Screenshot) */}
      <main className="relative z-20 w-full max-w-5xl mx-auto my-auto py-2">
        {/* ========================================================================= */}
        {/* STEP 1: BUSINESS BASICS                                                   */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form & Inputs */}
              <div className="lg:col-span-7 space-y-4">
                {/* Header Pills (Matte Pastel Colors - No Harsh Black) */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-synthio-mono px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-900 border border-blue-200 font-semibold">
                    PHASE 01 // DISCOVERY & FOUNDATION
                  </span>
                  <span className="text-xs font-synthio-mono text-emerald-800 font-medium bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full">
                    Day 1 · Setup
                  </span>
                  <span className="text-xs font-synthio-mono text-neutral-400">
                    Step 01 of 06
                  </span>
                </div>

                <div>
                  <h2 className="font-synthio-heading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                    Organization DNA & Industry Setup
                  </h2>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    Atom calibrates voice cadence, WhatsApp qualification logic, and appointment funnels to your exact industry.
                  </p>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Business / Company Name *
                    </label>
                    <Input
                      placeholder="e.g. Apex Realty or Radiant Clinic"
                      value={quiz.businessName}
                      onChange={(e) => setQuiz({ ...quiz, businessName: e.target.value })}
                      className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      City / Territory
                    </label>
                    <Input
                      placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                      value={quiz.city}
                      onChange={(e) => setQuiz({ ...quiz, city: e.target.value })}
                      className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Compact Industry Grid (Matte Pastel Selected States) */}
                <div className="space-y-1.5 pt-0.5">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Select Industry Domain
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {industryList.map((ind) => {
                      const isSelected = quiz.industry === ind.id;
                      return (
                        <button
                          key={ind.id}
                          type="button"
                          onClick={() => setQuiz({ ...quiz, industry: ind.id })}
                          className={`py-2 px-2 rounded-xl border text-xs transition-all text-center cursor-pointer ${
                            isSelected
                              ? "bg-[#edf5f0] text-emerald-900 border-emerald-400 font-semibold shadow-2xs ring-1 ring-emerald-300"
                              : "bg-[#faf9f5] hover:bg-[#f3f0e8] border-[#e2e0d8] text-neutral-700 font-normal"
                          }`}
                        >
                          {ind.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clean, Simple 'Other' Option (Only Brand Type & Explanation) */}
                {quiz.industry === "other" && (
                  <div className="p-3.5 rounded-xl bg-[#faf9f5] border border-[#e2e0d8] space-y-2.5 animate-in fade-in duration-200">
                    <div className="text-xs font-semibold text-neutral-800">
                      Tell us about your brand:
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                        What is your brand or business type? *
                      </label>
                      <Input
                        placeholder="e.g. Luxury Car Detailing, Custom Jewelry, Boutique SaaS"
                        value={otherBrandType}
                        onChange={(e) => setOtherBrandType(e.target.value)}
                        className="h-8 text-xs bg-white border-[#e2e0d8] rounded-lg focus-visible:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-neutral-600 block mb-1">
                        Brief explanation of what you do
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. We provide ceramic coating and detailing for luxury cars and need an automated bot to answer pricing and book service appointments."
                        value={otherExplanation}
                        onChange={(e) => setOtherExplanation(e.target.value)}
                        className="w-full p-2 rounded-lg border border-[#e2e0d8] bg-white text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-synthio-body"
                      />
                    </div>
                  </div>
                )}

                {/* Primary Project Track Selector (Matte Pastel Selected State) */}
                <div className="space-y-1.5 pt-0.5">
                  <label className="text-xs font-medium text-neutral-700 flex items-center justify-between">
                    <span>Select Project Track *</span>
                    <span className="text-[10px] text-blue-700 font-synthio-mono">Choose Build Scope</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "automations",
                        icon: Bot,
                        title: "AI Automations & Agents",
                        desc: "WhatsApp bot qualifier, Sarvam AI Voice caller & CRM sync.",
                        tag: "Fast Track",
                      },
                      {
                        id: "website_request",
                        icon: Globe,
                        title: "Website Request",
                        desc: "1-Week bespoke high-converting website with delivery tracking.",
                        tag: "7-Day Sprint",
                      },
                      {
                        id: "custom_saas",
                        icon: Layers,
                        title: "Custom SaaS Product",
                        desc: "Full web app, multi-tenant auth, database & customer portal.",
                        tag: "Full MVP",
                      },
                    ].map((tr) => {
                      const isSelected = serviceTrack === tr.id;
                      const Icon = tr.icon;
                      return (
                        <div
                          key={tr.id}
                          onClick={() => {
                            setServiceTrack(tr.id as any);
                            if (tr.id === "website_request") {
                              setQuiz({ ...quiz, hasWebsite: "No" });
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#eff6ff] text-neutral-900 border-blue-400 shadow-2xs ring-1 ring-blue-300"
                              : "bg-[#faf9f5] hover:bg-[#f3f0e8] border-[#e2e0d8] text-neutral-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon className={`size-3.5 ${isSelected ? "text-blue-600" : "text-neutral-500"}`} />
                            <span
                              className={`text-[9px] font-synthio-mono px-1.5 py-0.5 rounded-md font-medium ${
                                isSelected ? "bg-blue-100 text-blue-800 border border-blue-200" : "bg-[#e2e0d8] text-neutral-600"
                              }`}
                            >
                              {tr.tag}
                            </span>
                          </div>
                          <div className="font-synthio-heading font-semibold text-xs text-neutral-900">{tr.title}</div>
                          <div className="text-[10px] mt-0.5 leading-snug text-neutral-500">
                            {tr.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Team Size (Matte Pastel Selected State) */}
                <div className="space-y-1 pt-0.5">
                  <label className="text-xs font-medium text-neutral-700 block">
                    Team Size
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["Solo", "2-5", "6-20", "20+"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setQuiz({ ...quiz, teamSize: size })}
                        className={`h-8 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          quiz.teamSize === size
                            ? "bg-[#edf5f0] text-emerald-900 border border-emerald-400 font-semibold shadow-2xs ring-1 ring-emerald-300"
                            : "bg-[#faf9f5] hover:bg-[#f3f0e8] border border-[#e2e0d8] text-neutral-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Step Navigation Bar */}
                <div className="pt-3 flex items-center justify-between border-t border-[#f0ede6]">
                  <span className="text-xs font-synthio-mono text-neutral-400">
                    Step 01 of 06
                  </span>

                  <div className="flex items-center gap-1.5">
                    {stages.map((_, dotIdx) => (
                      <div
                        key={dotIdx}
                        className={`h-1.5 rounded-full transition-all ${
                          step === dotIdx + 1 ? "w-5 bg-neutral-700" : "w-1.5 bg-neutral-300"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextFromBasics}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-synthio-mono font-medium transition-all cursor-pointer shadow-xs"
                  >
                    <span>Next Phase</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Architectural Blueprint Matte Pastel Card (NO Harsh Black!) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#faf9f5] p-4 text-neutral-900 font-synthio-mono text-xs border border-[#e3e0d8] shadow-2xs space-y-3">
                  {/* Blueprint Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#e5e2da]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[11px] text-neutral-700 font-bold tracking-wider uppercase">
                        Architectural Blueprint
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">v2.4</span>
                  </div>

                  {/* Matte Pastel Infrastructure Badges */}
                  <div>
                    <span className="text-neutral-500 text-[10px] block mb-1.5 font-medium">
                      AI Agent Infrastructure
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div className="p-2 rounded-xl bg-white border border-[#e2e0d8] text-center">
                        <span className="block size-2.5 rounded-full bg-slate-600 mx-auto mb-1" />
                        <span className="text-[10px] text-neutral-800 font-bold block">Kernel</span>
                        <span className="text-[9px] text-neutral-400">v2.4</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#e2e0d8] text-center">
                        <span className="block size-2.5 rounded-full bg-amber-500 mx-auto mb-1" />
                        <span className="text-[10px] text-amber-800 font-bold block">Voice</span>
                        <span className="text-[9px] text-neutral-400">&lt;180ms</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#e2e0d8] text-center">
                        <span className="block size-2.5 rounded-full bg-emerald-500 mx-auto mb-1" />
                        <span className="text-[10px] text-emerald-800 font-bold block">WhatsApp</span>
                        <span className="text-[9px] text-neutral-400">Instant</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-[#e2e0d8] text-center">
                        <span className="block size-2.5 rounded-full bg-blue-500 mx-auto mb-1" />
                        <span className="text-[10px] text-blue-800 font-bold block">Calendar</span>
                        <span className="text-[9px] text-neutral-400">Auto-Lock</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Persona Details in Light Matte Card */}
                  <div className="p-3 rounded-xl bg-white border border-[#e2e0d8] space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500">Assigned Model:</span>
                      <span className="text-neutral-800 font-semibold">
                        {quiz.businessName ? `${quiz.businessName} AI` : currentIndustry.persona}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500">Industry:</span>
                      <span className="text-emerald-700 font-medium">
                        {quiz.industry === "other" ? (otherBrandType || "Custom Niche") : currentIndustry.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-neutral-500">Voice Cadence:</span>
                      <span className="text-blue-700 font-medium">Indian English / Hinglish</span>
                    </div>
                  </div>

                  {/* Inbound Greeting Cadence */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#e2e0d8] space-y-1">
                    <div className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                      <Volume2 className="size-3 text-neutral-500" />
                      <span>Inbound Greeting Cadence</span>
                    </div>
                    <p className="text-[11px] italic text-neutral-700 leading-relaxed font-synthio-body">
                      &ldquo;{currentIndustry.greeting}&rdquo;
                    </p>
                  </div>

                  {/* Quality Assurance Footer */}
                  <div className="flex justify-between items-center pt-0.5 text-[11px]">
                    <span className="text-neutral-500">Configuration Status</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="size-3" /> 100% Calibrated & Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: BOTTLENECK DIAGNOSTIC                                             */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-synthio-mono px-2.5 py-0.5 rounded-full bg-[#fef3c7] text-amber-900 border border-amber-300 font-semibold">
                PHASE 02 // BOTTLENECK AUDIT
              </span>
              <span className="text-xs font-synthio-mono text-emerald-800 font-medium bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full">
                Day 1 · Audit
              </span>
              <span className="text-xs font-synthio-mono text-neutral-400">
                Step 02 of 06
              </span>
            </div>

            <div>
              <h2 className="font-synthio-heading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Where are you losing the most customer leads?
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Select your core operational bottleneck so we can activate self-healing automations.
              </p>
            </div>

            {/* 4 Clean Pain Point Cards (Matte Pastel Selected State) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              {painPoints.map((item) => {
                const isSelected = quiz.biggestPainPoint === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setQuiz({ ...quiz, biggestPainPoint: item.id })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#eff6ff] text-neutral-900 border-blue-400 shadow-2xs ring-1 ring-blue-300"
                        : "bg-[#faf9f5] hover:bg-[#f3f0e8] border-[#e2e0d8] text-neutral-800"
                    }`}
                  >
                    <div className="font-synthio-heading font-semibold text-xs text-neutral-900 mb-0.5">{item.title}</div>
                    <div className="text-[11px] text-neutral-500 leading-snug">
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Website Question */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-medium text-neutral-700 block">
                Do you currently have a live website?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Yes", "No", "Not sure"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setQuiz({ ...quiz, hasWebsite: opt as any })}
                    className={`h-9 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      quiz.hasWebsite === opt
                        ? "bg-[#edf5f0] text-emerald-900 border border-emerald-400 font-semibold shadow-2xs ring-1 ring-emerald-300"
                        : "bg-[#faf9f5] hover:bg-[#f3f0e8] border border-[#e2e0d8] text-neutral-700"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {quiz.hasWebsite === "No" && (
                <p className="text-[11px] text-neutral-500 mt-1 font-synthio-mono">
                  We will include our 1-Week Starter Website package in your recommendation.
                </p>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="pt-3 flex items-center justify-between border-t border-[#f0ede6]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs font-synthio-mono text-neutral-700 hover:text-neutral-950 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous Phase</span>
              </button>

              <div className="flex items-center gap-1.5">
                {stages.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      step === dotIdx + 1 ? "w-5 bg-neutral-700" : "w-1.5 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleFinishQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-synthio-mono font-medium transition-all cursor-pointer shadow-xs"
              >
                <span>View Recommendations</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CURATED AI BLUEPRINT                                              */}
        {/* ========================================================================= */}
        {step === 3 && recommendations && (
          <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-synthio-mono px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-900 border border-blue-200 font-semibold">
                  PHASE 03 // ARCHITECTURAL BLUEPRINT
                </span>
                <span className="text-xs font-synthio-mono text-emerald-800 font-medium bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full">
                  Day 2 · Blueprint
                </span>
              </div>
              <span className="text-xs font-synthio-mono text-emerald-800 bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full font-bold">
                {recommendations.estimatedRoiMultiplier}
              </span>
            </div>

            <div>
              <h2 className="font-synthio-heading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {recommendations.bundleName}
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5 font-synthio-body">
                {recommendations.summary}
              </p>
            </div>

            {/* Recommended Automation Suite Cards */}
            <div className="space-y-2.5">
              {recommendations.suggestedAutomations.map((item) => {
                const isSelected = selectedAutomations.includes(item.catalogId);
                return (
                  <div
                    key={item.catalogId}
                    onClick={() => toggleAutomationSelection(item.catalogId)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? "bg-[#edf5f0]/50 border-emerald-400 shadow-2xs ring-1 ring-emerald-300"
                        : "bg-white border-[#e2e0d8] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`mt-0.5 size-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-synthio-heading font-semibold text-xs text-neutral-900 flex items-center gap-2">
                          {item.name}
                          {item.highlightBadge && (
                            <span className="font-synthio-mono text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              {item.highlightBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed font-synthio-body">
                          {item.whyThisFits}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-synthio-mono">
                      <div className="text-xs font-bold text-neutral-900">
                        {formatInr(item.setupPriceInr)}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        +{formatInr(item.monthlyPriceInr)}/mo
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Usage Credits Note */}
            <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#e2e0d8] flex items-center justify-between text-xs text-neutral-700 font-synthio-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>
                  Includes <strong>{formatInr(recommendations.starterCreditsRequiredInr)}</strong> prepaid usage credits for WhatsApp & Voice calls.
                </span>
              </div>
              <span className="text-neutral-500 font-medium text-[11px]">Zero Lock-in</span>
            </div>

            {/* Step Navigation Controls */}
            <div className="pt-3 flex items-center justify-between border-t border-[#f0ede6]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs font-synthio-mono text-neutral-700 hover:text-neutral-950 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous Phase</span>
              </button>

              <div className="flex items-center gap-1.5">
                {stages.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      step === dotIdx + 1 ? "w-5 bg-neutral-700" : "w-1.5 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextFromRecommendations}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-synthio-mono font-medium transition-all cursor-pointer shadow-xs"
              >
                <span>
                  {serviceTrack === "custom_saas"
                    ? "SaaS Product Blueprint"
                    : serviceTrack === "website_request" || quiz.hasWebsite === "No"
                    ? "Website Sprint Scope"
                    : "Dashboard Setup"}
                </span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: WEBSITE REQUEST / CUSTOM SAAS BLUEPRINT INTAKE                   */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-synthio-mono px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-900 border border-blue-200 font-semibold">
                {serviceTrack === "custom_saas"
                  ? "PHASE 04 // CUSTOM SAAS MVP SPECIFICATIONS"
                  : "PHASE 04 // 1-WEEK WEBSITE SPRINT BLUEPRINT"}
              </span>
              <span className="text-xs font-synthio-mono text-emerald-800 font-medium bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full">
                {serviceTrack === "custom_saas" ? "14-Day Delivery MVP" : "7-Day Express Sprint"}
              </span>
              <span className="text-xs font-synthio-mono text-neutral-400">
                Step 04 of 06
              </span>
            </div>

            <div>
              <h2 className="font-synthio-heading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                {serviceTrack === "custom_saas"
                  ? "Custom SaaS Product Specifications & Blueprint"
                  : "Bespoke High-Converting Website Brief"}
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                {serviceTrack === "custom_saas"
                  ? "Define your web application modules, target audience, and workflow triggers. We architect the database, auth, and AI infrastructure with a live client status portal."
                  : "Our studio team builds a bespoke, mobile-optimized site in 7 days with pre-integrated WhatsApp bots, Sarvam Voice AI callbacks, and live delivery updates."}
              </p>
            </div>

            <div className="space-y-3.5 pt-0.5">
              {/* Working Title & Project Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Project / Product Title *
                  </label>
                  <Input
                    placeholder={
                      serviceTrack === "custom_saas"
                        ? "e.g. Apex Luxury Portal or SmileCraft SaaS"
                        : "e.g. Apex Whitefield Luxury Villas Showcase"
                    }
                    value={projectSpecs.projectTitle}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, projectTitle: e.target.value })}
                    className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Primary Digital Category
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={projectSpecs.projectType}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, projectType: e.target.value })}
                  >
                    <option value="Marketing & Lead Capture Website">High-Converting Marketing & Lead Capture Site</option>
                    <option value="Full-Stack Custom SaaS Web App">Full-Stack Custom SaaS Web Application</option>
                    <option value="Multi-Branch Client Intake Portal">Multi-Branch Client Intake & Triage Portal</option>
                    <option value="Interactive 3D / Media Showcase">Interactive 3D / Real Estate Showcase</option>
                    <option value="Custom Internal Operations Tool">Custom Internal Operations & CRM Tool</option>
                  </select>
                </div>
              </div>

              {/* Target Audience & Core Value Proposition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Target Audience / Ideal Customer Profile
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Who are the primary users? (e.g. High-net-worth buyers, patients, B2B clients)"
                    value={projectSpecs.targetAudience}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, targetAudience: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Core Problem Solved & Value Proposition
                  </label>
                  <textarea
                    rows={2}
                    className="w-full p-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="What does this product solve? (e.g. Automates intake, eliminates no-shows)"
                    value={projectSpecs.primaryGoals}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, primaryGoals: e.target.value })}
                  />
                </div>
              </div>

              {/* Required Key Features (Matte Pastel Selectable Chips) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 block">
                  Required Modules & Feature Inclusions (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    "User Authentication & Multi-Tenant Roles",
                    "WhatsApp Qualifier Floating Bot Widget",
                    "Sarvam Voice AI Instant Callback Trigger",
                    "Interactive 3D / Media Gallery Showcase",
                    "Razorpay / Stripe Payments & Subscriptions",
                    "Client Live Delivery & Status Portal",
                    "Custom Database Models & REST APIs",
                    "SMS & WhatsApp Notification Triggers",
                    "Automated CRM Lead Pipeline Sync",
                  ].map((feat) => {
                    const isChecked = projectSpecs.keyFeatures.includes(feat);
                    return (
                      <div
                        key={feat}
                        onClick={() => {
                          if (isChecked) {
                            setProjectSpecs({
                              ...projectSpecs,
                              keyFeatures: projectSpecs.keyFeatures.filter((f) => f !== feat),
                            });
                          } else {
                            setProjectSpecs({
                              ...projectSpecs,
                              keyFeatures: [...projectSpecs.keyFeatures, feat],
                            });
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2 transition-all ${
                          isChecked
                            ? "bg-[#eff6ff] text-blue-950 border-blue-400 ring-1 ring-blue-300 shadow-2xs font-medium"
                            : "bg-[#faf9f5] hover:bg-[#f3f0e8] border-[#e2e0d8] text-neutral-700"
                        }`}
                      >
                        <div
                          className={`size-3.5 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? "bg-blue-600 text-white border-blue-600" : "border-neutral-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="size-2.5 stroke-[3]" />}
                        </div>
                        <span className="leading-tight text-[11px]">{feat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Design Style & Inspiration References */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Design Aesthetics & Tone
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs text-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={projectSpecs.designStyle}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, designStyle: e.target.value })}
                  >
                    <option value="Modern Clean & Responsive">Modern Clean & Responsive (High-Trust)</option>
                    <option value="Dark Luxury Editorial">Dark Luxury Editorial (Gold & Slate Accents)</option>
                    <option value="Minimalist Neo-Brutalist">Minimalist High-Contrast Bold</option>
                    <option value="Clinical Crisp Teal">Clinical Crisp (Healthcare & Wellness)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">
                    Inspiration URLs or Figma Link
                  </label>
                  <Input
                    placeholder="e.g. https://dribbble.com/shots/... or figma.com/@mybrand"
                    value={projectSpecs.referenceUrls}
                    onChange={(e) => setProjectSpecs({ ...projectSpecs, referenceUrls: e.target.value })}
                    className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-[#f0ede6]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs font-synthio-mono text-neutral-700 hover:text-neutral-950 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous Phase</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromWebsiteBranch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-synthio-mono font-medium transition-all cursor-pointer shadow-xs"
              >
                <span>Save Blueprint & Continue</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: DASHBOARD SETUP & CHECKOUT                                        */}
        {/* ========================================================================= */}
        {step === 5 && recommendations && (
          <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-synthio-mono px-2.5 py-0.5 rounded-full bg-[#eff6ff] text-blue-900 border border-blue-200 font-semibold">
                PHASE 05 // SUITE PROVISIONING
              </span>
              <span className="text-xs font-synthio-mono text-emerald-800 font-medium bg-[#edf5f0] border border-[#cbe3d4] px-2.5 py-0.5 rounded-full">
                Instant Provision
              </span>
              <span className="text-xs font-synthio-mono text-neutral-400">
                Step 05 of 06
              </span>
            </div>

            <div>
              <h2 className="font-synthio-heading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Review & Workspace Activation
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Enter your account credentials and review the itemized provisioning invoice.
              </p>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Your Full Name
                </label>
                <Input
                  placeholder="e.g. Vikram Malhotra"
                  value={ownerInfo.name}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, name: e.target.value })}
                  className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Work Email (Login Email)
                </label>
                <Input
                  placeholder="vikram@yourbusiness.com"
                  type="email"
                  value={ownerInfo.email}
                  onChange={(e) => setOwnerInfo({ ...ownerInfo, email: e.target.value })}
                  className="h-9 text-xs bg-[#faf9f5] border-[#e2e0d8] rounded-xl focus-visible:ring-blue-500"
                />
              </div>
            </div>

            {/* Itemized Invoice in Clean Matte Style */}
            <div className="rounded-2xl border border-[#e2e0d8] bg-[#faf9f5] p-4 space-y-2 text-xs font-synthio-mono">
              <div className="text-[10px] text-neutral-500 uppercase font-medium mb-1">
                Itemized Provisioning Invoice
              </div>
              {recommendations.projectPackage && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-800 font-medium">{recommendations.projectPackage.name}</span>
                  <span className="font-bold text-neutral-900">{formatInr(recommendations.projectPackage.setupPriceInr)}</span>
                </div>
              )}
              {recommendations.suggestedAutomations
                .filter((a) => selectedAutomations.includes(a.catalogId))
                .map((item) => (
                  <div key={item.catalogId} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-600">{item.name}</span>
                    <span className="font-bold text-neutral-900">{formatInr(item.setupPriceInr)}</span>
                  </div>
                ))}

              <div className="flex justify-between items-center text-xs text-neutral-600">
                <span>Usage Credits Wallet (Preloaded)</span>
                <span className="font-bold text-neutral-900">
                  {formatInr(recommendations.starterCreditsRequiredInr)}
                </span>
              </div>

              <div className="border-t border-[#e2e0d8] pt-2 flex justify-between items-center text-sm font-synthio-heading font-bold text-neutral-900">
                <span>Total Due Today</span>
                <span className="text-base text-neutral-900">
                  {formatInr(
                    (recommendations.projectPackage?.setupPriceInr || 0) +
                      recommendations.suggestedAutomations
                        .filter((a) => selectedAutomations.includes(a.catalogId))
                        .reduce((s, a) => s + a.setupPriceInr, 0) +
                      recommendations.starterCreditsRequiredInr
                  )}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-3 flex items-center justify-between border-t border-[#f0ede6]">
              <button
                type="button"
                onClick={() => setStep(quiz.hasWebsite === "No" ? 4 : 3)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#e2e0d8] bg-[#faf9f5] text-xs font-synthio-mono text-neutral-700 hover:text-neutral-950 transition-all cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous Phase</span>
              </button>

              <div className="flex items-center gap-1.5">
                {stages.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all ${
                      step === dotIdx + 1 ? "w-5 bg-neutral-700" : "w-1.5 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowRazorpayModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-synthio-mono font-medium transition-all cursor-pointer shadow-xs"
              >
                <span>Pay & Initialize Workspace</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: LIVE ACTIVATION CHECKLIST                                         */}
        {/* ========================================================================= */}
        {step === 6 && (() => {
          const displayOrgName = quiz.businessName
            ? quiz.businessName.trim().charAt(0).toUpperCase() + quiz.businessName.trim().slice(1)
            : "Your Organization";
          const completedCount =
            (welcomeChecklist.whatsappConnected ? 1 : 0) +
            (welcomeChecklist.leadsAdded ? 1 : 0) +
            (welcomeChecklist.funnelReviewed ? 1 : 0);

          return (
            <div className="rounded-3xl bg-white border border-[#e2e0d8] p-6 sm:p-9 shadow-sm space-y-6 text-center">
              {/* Top Pulse Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf5f0] text-emerald-800 border border-[#cbe3d4] text-[11px] font-synthio-mono font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Setup Complete · Workspace Active</span>
              </div>

              <div>
                <h2 className="font-synthio-heading font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
                  {displayOrgName} is Ready!
                </h2>
                <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto leading-relaxed font-synthio-body">
                  Your autonomous CRM workforce and routing pipelines have been initialized. Complete these quick items or head straight to your dashboard:
                </p>
              </div>

              {/* Live Client Delivery Portal Card (If Project was Provisioned) */}
              {createdShareToken && (
                <div className="p-4 rounded-2xl bg-[#faf9f5] border border-[#e2e0d8] max-w-lg mx-auto text-left space-y-2.5 font-synthio-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                        <Layers className="size-3.5" />
                      </div>
                      <div>
                        <span className="font-synthio-heading font-semibold text-xs text-neutral-900 block leading-tight">
                          Client Delivery &amp; Sprint Portal
                        </span>
                        <span className="text-[10px] text-neutral-500">Live link to track milestone progress &amp; updates</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-synthio-mono px-2 py-0.5 rounded-full bg-[#edf5f0] text-emerald-800 border border-[#cbe3d4] font-medium">
                      Active
                    </span>
                  </div>

                  {/* Clean Input Pill with Integrated Copy & Open Actions */}
                  <div className="flex items-center gap-1.5 bg-white border border-[#e2e0d8] p-1 pl-3 rounded-xl">
                    <span className="text-[11px] font-mono text-neutral-600 truncate flex-1 select-all">
                      {typeof window !== "undefined"
                        ? `${window.location.origin}/status/${createdShareToken}`
                        : `/status/${createdShareToken}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        navigator.clipboard.writeText(`${origin}/status/${createdShareToken}`);
                        setCopiedShareLink(true);
                        setTimeout(() => setCopiedShareLink(false), 2000);
                      }}
                      className={`h-7 px-3 text-[11px] font-synthio-mono font-medium rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                        copiedShareLink
                          ? "bg-emerald-600 text-white"
                          : "bg-[#f1ede4] hover:bg-[#e6e2d8] text-neutral-800"
                      }`}
                    >
                      {copiedShareLink ? (
                        <>
                          <Check className="size-3 stroke-[2.5]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`/status/${createdShareToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 rounded-lg border border-[#e2e0d8] bg-white hover:bg-[#faf9f5] flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors shrink-0"
                      title="Open Status Portal in new tab"
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* 3 Simple Action Items with Progress Header */}
              <div className="max-w-lg mx-auto space-y-2.5 text-left font-synthio-body">
                <div className="flex items-center justify-between px-1 text-xs font-synthio-mono text-neutral-500">
                  <span>Activation Checklist</span>
                  <span className="text-[10px] text-emerald-800 font-semibold bg-[#edf5f0] border border-[#cbe3d4] px-2 py-0.5 rounded-full">
                    {completedCount} of 3 completed
                  </span>
                </div>

                {/* Item 1: WhatsApp */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    welcomeChecklist.whatsappConnected
                      ? "bg-[#edf5f0]/70 border-[#cbe3d4]"
                      : "bg-[#faf9f5] hover:bg-[#f6f5ef] border-[#e2e0d8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
                      <MessageSquare className="size-4" />
                    </div>
                    <div>
                      <div className="font-synthio-heading font-semibold text-xs text-neutral-900">
                        {welcomeChecklist.whatsappConnected
                          ? `1. WhatsApp: ${verifiedWhatsAppNumber || whatsappPhone}`
                          : "1. Connect WhatsApp Business Number"}
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-tight">
                        {welcomeChecklist.whatsappConnected
                          ? "Verified & connected to Meta Cloud API webhook"
                          : "Enter business number & verify OTP to enable bot"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!welcomeChecklist.whatsappConnected) {
                        setWhatsappModalStep("phone");
                        setShowWhatsAppModal(true);
                      } else {
                        setWhatsappModalStep("success");
                        setShowWhatsAppModal(true);
                      }
                    }}
                    className={`text-xs h-7 px-3.5 rounded-xl cursor-pointer transition-all shrink-0 font-medium ${
                      welcomeChecklist.whatsappConnected
                        ? "bg-[#edf5f0] text-emerald-800 border border-emerald-300 font-semibold shadow-2xs ring-1 ring-emerald-200"
                        : "bg-white hover:bg-[#f3f0e8] text-neutral-800 border border-[#e2e0d8] shadow-2xs"
                    }`}
                  >
                    {welcomeChecklist.whatsappConnected ? "Connected ✓" : "Connect"}
                  </button>
                </div>

                {/* Item 2: Starter Leads */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    welcomeChecklist.leadsAdded
                      ? "bg-[#edf5f0]/70 border-[#cbe3d4]"
                      : "bg-[#faf9f5] hover:bg-[#f6f5ef] border-[#e2e0d8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center shadow-2xs shrink-0">
                      <TrendingUp className="size-4" />
                    </div>
                    <div>
                      <div className="font-synthio-heading font-semibold text-xs text-neutral-900">
                        2. Add First 10 Starter Leads
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-tight">
                        Upload a test CSV or trigger sample webhook
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setWelcomeChecklist({
                        ...welcomeChecklist,
                        leadsAdded: !welcomeChecklist.leadsAdded,
                      })
                    }
                    className={`text-xs h-7 px-3.5 rounded-xl cursor-pointer transition-all shrink-0 font-medium ${
                      welcomeChecklist.leadsAdded
                        ? "bg-[#edf5f0] text-emerald-800 border border-emerald-300 font-semibold shadow-2xs ring-1 ring-emerald-200"
                        : "bg-white hover:bg-[#f3f0e8] text-neutral-800 border border-[#e2e0d8] shadow-2xs"
                    }`}
                  >
                    {welcomeChecklist.leadsAdded ? "Added ✓" : "Import"}
                  </button>
                </div>

                {/* Item 3: Funnel */}
                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    welcomeChecklist.funnelReviewed
                      ? "bg-[#edf5f0]/70 border-[#cbe3d4]"
                      : "bg-[#faf9f5] hover:bg-[#f6f5ef] border-[#e2e0d8]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shadow-2xs shrink-0">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <div className="font-synthio-heading font-semibold text-xs text-neutral-900">
                        3. Review Booking Funnel
                      </div>
                      <div className="text-[11px] text-neutral-500 leading-tight">
                        Preview your live lead capture and booking link
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setWelcomeChecklist({
                        ...welcomeChecklist,
                        funnelReviewed: !welcomeChecklist.funnelReviewed,
                      })
                    }
                    className={`text-xs h-7 px-3.5 rounded-xl cursor-pointer transition-all shrink-0 font-medium ${
                      welcomeChecklist.funnelReviewed
                        ? "bg-[#edf5f0] text-emerald-800 border border-emerald-300 font-semibold shadow-2xs ring-1 ring-emerald-200"
                        : "bg-white hover:bg-[#f3f0e8] text-neutral-800 border border-[#e2e0d8] shadow-2xs"
                    }`}
                  >
                    {welcomeChecklist.funnelReviewed ? "Reviewed ✓" : "Preview"}
                  </button>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-2 max-w-xs mx-auto space-y-2">
                <Button
                  onClick={() => {
                    window.location.href = "/dashboard";
                  }}
                  className="w-full h-10 text-xs font-synthio-heading font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 group transition-all"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <p className="text-[11px] text-neutral-400 font-synthio-mono">
                  You can finish these anytime in your workspace
                </p>
              </div>
            </div>
          );
        })()}
      </main>

      {/* WhatsApp Verification Modal Simulator (Phone -> OTP -> Connected) */}
      <Dialog open={showWhatsAppModal} onOpenChange={setShowWhatsAppModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              <MessageSquare className="size-4" />
            </div>
            <DialogTitle className="font-synthio-heading font-bold text-base text-neutral-900">
              {whatsappModalStep === "phone" && "Connect WhatsApp Business Number"}
              {whatsappModalStep === "otp" && "Verify 6-Digit OTP"}
              {whatsappModalStep === "success" && "WhatsApp Number Connected!"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500 font-synthio-body">
            {whatsappModalStep === "phone" && "Link your official WhatsApp Business number with Atom autonomous qualification bot."}
            {whatsappModalStep === "otp" && `We sent a 6-digit verification code to ${whatsappPhone}. Enter it below.`}
            {whatsappModalStep === "success" && "Your WhatsApp Business number is verified and ready to qualify inbound leads 24/7."}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: ENTER PHONE */}
        {whatsappModalStep === "phone" && (
          <div className="space-y-3.5 my-3 text-xs font-synthio-body">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                WhatsApp Phone Number *
              </label>
              <div className="flex items-center gap-2">
                <span className="h-9 px-3 rounded-xl bg-[#faf9f5] border border-[#e2e0d8] text-xs font-mono text-neutral-700 flex items-center shrink-0">
                  🇮🇳 +91
                </span>
                <Input
                  placeholder="98765 43210"
                  value={whatsappPhone.replace(/^\+91\s*/, "")}
                  onChange={(e) => setWhatsappPhone(`+91 ${e.target.value.replace(/[^0-9\s]/g, "")}`)}
                  className="h-9 text-xs bg-white border-[#e2e0d8] rounded-xl font-mono focus-visible:ring-emerald-500 flex-1"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 font-synthio-mono">
                Official Meta Cloud API webhook will be registered to this line.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#edf5f0]/80 border border-[#cbe3d4] text-[11px] text-emerald-900 flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Instant Test Mode:</strong> Click below to receive simulated OTP <strong>584920</strong> immediately.
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER OTP */}
        {whatsappModalStep === "otp" && (
          <div className="space-y-3.5 my-3 text-xs font-synthio-body">
            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">
                Enter 6-Digit Verification Code
              </label>
              <Input
                placeholder="e.g. 584920"
                maxLength={6}
                value={whatsappOtp}
                onChange={(e) => setWhatsappOtp(e.target.value.trim())}
                className="h-10 text-center text-base tracking-widest font-mono bg-white border-[#e2e0d8] rounded-xl focus-visible:ring-emerald-500"
                autoFocus
              />
              <div className="flex items-center justify-between mt-1.5 text-[11px] font-synthio-mono">
                <button
                  type="button"
                  onClick={() => setWhatsappOtp("584920")}
                  className="text-emerald-700 hover:text-emerald-800 font-medium underline cursor-pointer"
                >
                  Auto-fill Demo Code (584920)
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsappModalStep("phone")}
                  className="text-neutral-500 hover:text-neutral-700 cursor-pointer"
                >
                  Change Number
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {whatsappModalStep === "success" && (
          <div className="p-4 rounded-2xl bg-[#edf5f0] border border-[#cbe3d4] my-3 space-y-2 text-center">
            <div className="size-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="size-5 stroke-[2.5]" />
            </div>
            <div className="font-synthio-heading font-bold text-sm text-emerald-950">
              {verifiedWhatsAppNumber || whatsappPhone} Connected
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-synthio-body">
              Meta Cloud API webhook is active. Inbound messages will be answered within 1.8 seconds with AI qualifiers.
            </p>
          </div>
        )}

        <DialogFooter>
          {whatsappModalStep === "phone" && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowWhatsAppModal(false)}
                className="text-xs h-9 rounded-xl border-[#e2e0d8]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setWhatsappModalStep("otp");
                  setWhatsappOtp("584920");
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 rounded-xl"
              >
                Send OTP Code →
              </Button>
            </>
          )}

          {whatsappModalStep === "otp" && (
            <>
              <Button
                variant="outline"
                onClick={() => setWhatsappModalStep("phone")}
                className="text-xs h-9 rounded-xl border-[#e2e0d8]"
              >
                Back
              </Button>
              <Button
                onClick={() => {
                  setWhatsappIsVerifying(true);
                  setTimeout(() => {
                    setWhatsappIsVerifying(false);
                    setVerifiedWhatsAppNumber(whatsappPhone);
                    setWelcomeChecklist({
                      ...welcomeChecklist,
                      whatsappConnected: true,
                    });
                    setWhatsappModalStep("success");
                  }, 400);
                }}
                disabled={whatsappIsVerifying || whatsappOtp.length < 4}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-9 rounded-xl"
              >
                {whatsappIsVerifying ? "Verifying..." : "Verify & Link Bot"}
              </Button>
            </>
          )}

          {whatsappModalStep === "success" && (
            <Button
              onClick={() => setShowWhatsAppModal(false)}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs h-9 rounded-xl"
            >
              Proceed to Connected ✓
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Razorpay Native Checkout Modal Simulator */}
      <Dialog open={showRazorpayModal} onOpenChange={setShowRazorpayModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <DialogTitle className="font-synthio-heading font-bold text-sm">
              Razorpay Secure Checkout
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-neutral-500">
            Pay for <strong>Atom Automation Suite</strong> using India UPI or Cards
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs font-synthio-mono">
          <div className="p-3 rounded-xl bg-[#faf9f5] border border-[#e2e0d8] flex justify-between items-center">
            <div>
              <div className="text-[10px] text-neutral-500">Paying to</div>
              <div className="font-semibold text-neutral-900">{quiz.businessName || "New Client"}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-neutral-500">Amount</div>
              <div className="text-base font-bold text-neutral-900">
                {recommendations &&
                  formatInr(
                    recommendations.suggestedAutomations
                      .filter((a) => selectedAutomations.includes(a.catalogId))
                      .reduce((s, a) => s + a.setupPriceInr, 0) +
                      recommendations.starterCreditsRequiredInr
                  )}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-neutral-500 text-center">
            Test Mode: Clicking Authorize will trigger immediate 200 OK webhook provisioning.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRazorpayModal(false)} className="text-xs h-9 rounded-xl border-[#e2e0d8]">
            Cancel
          </Button>
          <Button
            onClick={executePaymentAndProvision}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-9 rounded-xl"
          >
            {isProcessing ? "Provisioning..." : "Authorize ₹ Payment"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
