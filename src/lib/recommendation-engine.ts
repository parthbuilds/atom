export type ServiceTrack = "automations" | "website_request" | "custom_saas";

export interface ProjectSpecs {
  projectType?: string; // "Marketing Website", "Web App / SaaS Platform", "E-Commerce", "Customer Portal", "Internal Operations Tool"
  targetAudience?: string;
  primaryGoals?: string;
  keyFeatures?: string[];
  designStyle?: string; // "Minimalist Clean", "Dark High-Tech", "Luxury Editorial", "Vibrant Modern"
  referenceUrls?: string;
  deliveryTimeline?: string; // "7-Day Express Sprint", "14-Day Full Build", "30-Day Comprehensive MVP"
  estimatedBudget?: string;
}

export interface QuizAnswers {
  businessName: string;
  industry: string;
  city: string;
  teamSize: string;
  serviceTrack?: ServiceTrack;
  projectSpecs?: ProjectSpecs;
  biggestPainPoint: "missed calls" | "slow follow-up" | "no-shows" | "cold traffic" | string;
  hasWebsite: "Yes" | "No" | "Not sure";
  customerReachChannel: "phone" | "WhatsApp" | "walk-in" | "social DMs" | string;
  aiMode: "alert only" | "talk to leads" | string;
  leadVolumeBucket: "under 50" | "50-200" | "200-1000" | "1000+" | string;
}

export interface RecommendationResult {
  bundleName: string;
  summary: string;
  serviceTrack: ServiceTrack;
  suggestedAutomations: {
    catalogId: string;
    name: string;
    whyThisFits: string;
    setupPriceInr: number;
    monthlyPriceInr: number;
    highlightBadge?: string;
  }[];
  projectPackage?: {
    name: string;
    tier: string;
    description: string;
    turnaround: string;
    deliverables: string[];
    setupPriceInr: number;
  };
  totalSetupInr: number;
  totalMonthlyInr: number;
  starterCreditsRequiredInr: number;
  needsWebsiteService: boolean;
  estimatedRoiMultiplier: string;
}

export function generateRecommendations(quiz: QuizAnswers): RecommendationResult {
  const pain = quiz.biggestPainPoint?.toLowerCase() || "";
  const industry = quiz.industry?.toLowerCase() || "";
  const talksToLeads = quiz.aiMode?.toLowerCase().includes("talk") || false;
  const track = quiz.serviceTrack || (quiz.hasWebsite === "No" ? "website_request" : "automations");

  const recommendations = [];

  // Core Rule 1: WhatsApp Qualifier
  recommendations.push({
    catalogId: "auto-wa-qualifier",
    name: "WhatsApp Instant Lead Qualifier & AI Responder",
    whyThisFits: `For ${quiz.industry} in ${quiz.city || "your area"}, 78% of leads drop off if not replied within 5 minutes. This bot qualifies prospects on WhatsApp in under 3 seconds.`,
    setupPriceInr: 4999,
    monthlyPriceInr: 2499,
    highlightBadge: "Highest Conversion Impact",
  });

  // Core Rule 2: Voice Agent
  if (pain.includes("missed") || talksToLeads || industry.includes("clinic") || industry.includes("real estate") || track === "custom_saas") {
    recommendations.push({
      catalogId: "auto-voice-appointment",
      name: "AI Voice Appointment Booker (Sarvam / Hinglish)",
      whyThisFits: `Never lose another inbound phone inquiry when your team is busy. Maya automatically calls back missed callers, speaks fluent Hinglish, and locks appointment slots.`,
      setupPriceInr: 7999,
      monthlyPriceInr: 3999,
      highlightBadge: "Eliminates Missed Inquiries",
    });
  }

  // Core Rule 3: Calendar booking funnel
  if (pain.includes("no-shows") || industry.includes("salon") || industry.includes("clinic") || industry.includes("coach") || track === "website_request") {
    recommendations.push({
      catalogId: "auto-booking-funnel-sync",
      name: "High-Converting Calendar Booking Funnel",
      whyThisFits: `Automated calendar booking with WhatsApp 2-hour pre-visit confirmations drops appointment no-shows by up to 68%.`,
      setupPriceInr: 4499,
      monthlyPriceInr: 1499,
      highlightBadge: "Stops Lost Revenue",
    });
  }

  // Fallback if less than 2 picked
  if (recommendations.length < 2) {
    recommendations.push({
      catalogId: "auto-cold-lead-reactivator",
      name: "Dormant Lead Reactivation Engine",
      whyThisFits: `Re-engages hundreds of old uncontacted leads sitting in your records with high-converting automated revival offers.`,
      setupPriceInr: 3499,
      monthlyPriceInr: 1999,
      highlightBadge: "Instant Revenue Booster",
    });
  }

  const finalAutomations = recommendations.slice(0, 3);
  let automationsSetup = finalAutomations.reduce((sum, a) => sum + a.setupPriceInr, 0);
  const totalMonthly = finalAutomations.reduce((sum, a) => sum + a.monthlyPriceInr, 0);

  let starterCredits = 3000;
  if (quiz.leadVolumeBucket === "200-1000" || quiz.leadVolumeBucket === "1000+") {
    starterCredits = 6000;
  }

  // Service Track Customizations
  if (track === "website_request") {
    const websiteSetupPrice = 14999;
    return {
      bundleName: `${quiz.businessName || "Custom"} 1-Week High-Converting Website Sprint`,
      summary: `End-to-end bespoke website build with integrated WhatsApp qualifier, fast Edge caching, and SEO optimization delivered in 7 days with live process tracking.`,
      serviceTrack: "website_request",
      suggestedAutomations: finalAutomations,
      projectPackage: {
        name: "1-Week Express Website Sprint",
        tier: "Full-Stack Custom Website",
        description: "Bespoke modern website with 3D/editorial styling, responsive mobile layouts, SEO schema, and pre-integrated lead capture bots.",
        turnaround: "7 Business Days",
        deliverables: [
          "Information Architecture & High-Converting Wireframes",
          "Custom UI Design System & Component Assets",
          "Full-Stack Next.js Production Build",
          "WhatsApp Qualifier & Sarvam Voice Callback Integration",
          "Staging Preview Environment & DNS Domain Handoff",
        ],
        setupPriceInr: websiteSetupPrice,
      },
      totalSetupInr: websiteSetupPrice + automationsSetup,
      totalMonthlyInr: totalMonthly,
      starterCreditsRequiredInr: starterCredits,
      needsWebsiteService: true,
      estimatedRoiMultiplier: "5.8x to 9.2x Pipeline Value",
    };
  }

  if (track === "custom_saas") {
    const saasSetupPrice = 39999;
    return {
      bundleName: `${quiz.businessName || "Custom"} SaaS Product MVP Build Suite`,
      summary: `Complete custom SaaS web application build: Multi-tenant auth & RBAC, database architecture, AI & voice automation APIs, customer portal, and billing gateway.`,
      serviceTrack: "custom_saas",
      suggestedAutomations: finalAutomations,
      projectPackage: {
        name: "Custom SaaS Product MVP Build",
        tier: "Full-Stack SaaS Platform",
        description: "Production-ready web application with user authentication, custom database models, payment gateway, background automations, and client dashboard.",
        turnaround: "14–21 Business Days",
        deliverables: [
          "System Architecture & Database Schema Design",
          "Multi-Tenant User Auth, Roles & Permissions (RBAC)",
          "Interactive Dashboard & Business Workflows",
          "Sarvam Voice AI & WhatsApp Bot Automation Webhooks",
          "Razorpay Billing / Subscription Gateway Integration",
          "Client Live Status Portal with Sprint Progress Updates",
        ],
        setupPriceInr: saasSetupPrice,
      },
      totalSetupInr: saasSetupPrice + automationsSetup,
      totalMonthlyInr: totalMonthly,
      starterCreditsRequiredInr: starterCredits + 2000,
      needsWebsiteService: false,
      estimatedRoiMultiplier: "8.5x to 14.0x Operational ROI",
    };
  }

  return {
    bundleName: `${quiz.businessName || "Growth"} AI Power Suite`,
    summary: `Tailored for ${quiz.industry || "local business"} scaling with automated lead capture, WhatsApp qualification, and smart voice dispatching.`,
    serviceTrack: "automations",
    suggestedAutomations: finalAutomations,
    totalSetupInr: automationsSetup,
    totalMonthlyInr: totalMonthly,
    starterCreditsRequiredInr: starterCredits,
    needsWebsiteService: quiz.hasWebsite === "No",
    estimatedRoiMultiplier: "4.2x to 7.8x estimated ROI",
  };
}
