import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.projectUpdate.deleteMany();
  await prisma.projectMilestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.orgAutomation.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.funnel.deleteMany();
  await prisma.voiceAgentConfig.deleteMany();
  await prisma.automationCatalog.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Default permissions matrix (RBAC)
  const permissions = [
    // Super Admin: everything
    { role: "SUPER_ADMIN", action: "agency:manage_all", allowed: true },
    { role: "SUPER_ADMIN", action: "billing:read", allowed: true },
    { role: "SUPER_ADMIN", action: "billing:write", allowed: true },
    { role: "SUPER_ADMIN", action: "automations:toggle", allowed: true },
    { role: "SUPER_ADMIN", action: "automations:config", allowed: true },
    { role: "SUPER_ADMIN", action: "leads:read", allowed: true },
    { role: "SUPER_ADMIN", action: "leads:write", allowed: true },
    { role: "SUPER_ADMIN", action: "leads:export", allowed: true },
    { role: "SUPER_ADMIN", action: "funnels:manage", allowed: true },
    { role: "SUPER_ADMIN", action: "theme:customize", allowed: true },

    // Agency Staff: manage assigned clients, view leads, no billing/global
    { role: "AGENCY_STAFF", action: "agency:manage_clients", allowed: true },
    { role: "AGENCY_STAFF", action: "billing:read", allowed: false },
    { role: "AGENCY_STAFF", action: "billing:write", allowed: false },
    { role: "AGENCY_STAFF", action: "automations:toggle", allowed: true },
    { role: "AGENCY_STAFF", action: "automations:config", allowed: true },
    { role: "AGENCY_STAFF", action: "leads:read", allowed: true },
    { role: "AGENCY_STAFF", action: "leads:write", allowed: true },
    { role: "AGENCY_STAFF", action: "leads:export", allowed: true },
    { role: "AGENCY_STAFF", action: "funnels:manage", allowed: true },
    { role: "AGENCY_STAFF", action: "theme:customize", allowed: false },

    // Client Owner: full access to their own org
    { role: "CLIENT_OWNER", action: "billing:read", allowed: true },
    { role: "CLIENT_OWNER", action: "billing:write", allowed: true },
    { role: "CLIENT_OWNER", action: "automations:toggle", allowed: true },
    { role: "CLIENT_OWNER", action: "automations:config", allowed: true },
    { role: "CLIENT_OWNER", action: "leads:read", allowed: true },
    { role: "CLIENT_OWNER", action: "leads:write", allowed: true },
    { role: "CLIENT_OWNER", action: "leads:export", allowed: true },
    { role: "CLIENT_OWNER", action: "funnels:manage", allowed: true },
    { role: "CLIENT_OWNER", action: "theme:customize", allowed: true },

    // Client Team Member: leads and funnels only, no billing or automation config
    { role: "CLIENT_TEAM_MEMBER", action: "billing:read", allowed: false },
    { role: "CLIENT_TEAM_MEMBER", action: "billing:write", allowed: false },
    { role: "CLIENT_TEAM_MEMBER", action: "automations:toggle", allowed: false },
    { role: "CLIENT_TEAM_MEMBER", action: "automations:config", allowed: false },
    { role: "CLIENT_TEAM_MEMBER", action: "leads:read", allowed: true },
    { role: "CLIENT_TEAM_MEMBER", action: "leads:write", allowed: true },
    { role: "CLIENT_TEAM_MEMBER", action: "leads:export", allowed: false },
    { role: "CLIENT_TEAM_MEMBER", action: "funnels:manage", allowed: true },
    { role: "CLIENT_TEAM_MEMBER", action: "theme:customize", allowed: false },

    // Automation Viewer (read-only): dashboards and leads viewing only
    { role: "AUTOMATION_VIEWER", action: "billing:read", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "billing:write", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "automations:toggle", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "automations:config", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "leads:read", allowed: true },
    { role: "AUTOMATION_VIEWER", action: "leads:write", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "leads:export", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "funnels:manage", allowed: false },
    { role: "AUTOMATION_VIEWER", action: "theme:customize", allowed: false },
  ];

  for (const p of permissions) {
    await prisma.permission.create({ data: p });
  }

  // 3. Seed Automations Catalog
  const catalog = [
    {
      id: "auto-wa-qualifier",
      name: "WhatsApp Instant Lead Qualifier & AI Responder",
      slug: "wa-lead-qualifier",
      category: "WhatsApp",
      setupPriceInr: 4999,
      monthlyPriceInr: 2499,
      estimatedSetupDays: 1,
      description: "Instantly greets inbound leads on WhatsApp within 3 seconds, asks qualifying questions, captures requirements, and notifies your sales team in real time.",
      recommendedTags: JSON.stringify(["slow follow-up", "cold traffic that doesn't convert", "whatsapp", "real estate", "clinic/salon"]),
      n8nTemplateKey: "wa_qualifier_v1",
      activeCount: 14,
    },
    {
      id: "auto-voice-appointment",
      name: "AI Voice Appointment Booker (Sarvam / Hinglish)",
      slug: "voice-appointment-booker",
      category: "Voice AI",
      setupPriceInr: 7999,
      monthlyPriceInr: 3999,
      estimatedSetupDays: 2,
      description: "Autonomous cold and warm outreach voice agent powered by Sarvam AI. Dials fresh leads, speaks fluent Hindi/English, checks availability, and books appointments onto your calendar.",
      recommendedTags: JSON.stringify(["missed calls", "no-shows", "phone", "clinic/salon", "home services", "real estate"]),
      n8nTemplateKey: "voice_appointment_v1",
      activeCount: 8,
    },
    {
      id: "auto-cold-lead-reactivator",
      name: "Dormant Lead Reactivation Engine",
      slug: "dormant-lead-reactivator",
      category: "CRM",
      setupPriceInr: 3499,
      monthlyPriceInr: 1999,
      estimatedSetupDays: 1,
      description: "Automatically scans dead or uncontacted leads older than 14 days, sending targeted multi-step WhatsApp & SMS revival offers that drive re-engagement.",
      recommendedTags: JSON.stringify(["cold traffic that doesn't convert", "slow follow-up", "coach/consultant", "e-commerce"]),
      n8nTemplateKey: "reactivation_flow_v2",
      activeCount: 11,
    },
    {
      id: "auto-booking-funnel-sync",
      name: "High-Converting Calendar Booking Funnel",
      slug: "calendar-booking-funnel",
      category: "Funnel",
      setupPriceInr: 4499,
      monthlyPriceInr: 1499,
      estimatedSetupDays: 1,
      description: "Hosted landing page + embeddable calendar widget with SMS/WhatsApp confirmation & 1-hour pre-appointment reminders to reduce no-shows to near zero.",
      recommendedTags: JSON.stringify(["no-shows", "clinic/salon", "coach/consultant", "restaurant"]),
      n8nTemplateKey: "booking_funnel_sync_v1",
      activeCount: 19,
    },
    {
      id: "auto-review-booster",
      name: "Google 5-Star Review & Reputation Automator",
      slug: "google-review-booster",
      category: "CRM",
      setupPriceInr: 2999,
      monthlyPriceInr: 999,
      estimatedSetupDays: 1,
      description: "Automatically triggers a friendly WhatsApp request to satisfied customers right after service completion, filtering 5-star reviews to Google Maps and routing complaints internally.",
      recommendedTags: JSON.stringify(["clinic/salon", "home services", "restaurant"]),
      n8nTemplateKey: "review_booster_v1",
      activeCount: 22,
    },
  ];

  for (const item of catalog) {
    await prisma.automationCatalog.create({ data: item });
  }

  // 4. Default theme tokens JSON
  const defaultTokens = JSON.stringify({
    radius: "0.5rem",
    primary: "221.2 83.2% 53.3%", // vibrant royal blue
    primaryForeground: "210 40% 98%",
    background: "222.2 84% 4.9%",  // dark mode default
    foreground: "210 40% 98%",
    card: "222.2 84% 6.5%",
    cardForeground: "210 40% 98%",
    accent: "217.2 32.6% 17.5%",
    border: "217.2 32.6% 17.5%",
    mode: "dark",
  });

  // 5. Seed Organizations
  const agencyOrg = await prisma.organization.create({
    data: {
      id: "org-agency-master",
      name: "Synthex Automation Agency",
      slug: "synthex-agency",
      industry: "other",
      city: "Mumbai",
      teamSize: "10-25",
      themeTokens: defaultTokens,
      creditBalance: 100000,
      hasOwnWebsite: true,
      websiteUrl: "https://synthex.agency",
    },
  });

  const clientOrg = await prisma.organization.create({
    data: {
      id: "org-apex-realty",
      name: "Apex Luxury Properties",
      slug: "apex-realty",
      industry: "real estate",
      city: "Bengaluru",
      teamSize: "5-10",
      themeTokens: defaultTokens,
      creditBalance: 8450,
      hasOwnWebsite: true,
      websiteUrl: "https://apexrealty.in",
    },
  });

  const noWebOrg = await prisma.organization.create({
    data: {
      id: "org-dr-sharma-dental",
      name: "Dr. Sharma Dental Aesthetics",
      slug: "dr-sharma-dental",
      industry: "clinic/salon",
      city: "Delhi NCR",
      teamSize: "2-5",
      themeTokens: defaultTokens,
      creditBalance: 4200,
      hasOwnWebsite: false,
      websiteUrl: null,
    },
  });

  // 6. Seed Users
  await prisma.user.createMany({
    data: [
      {
        id: "user-super-admin",
        orgId: agencyOrg.id,
        name: "Parth (Agency Founder)",
        email: "admin@atomplatform.io",
        role: "SUPER_ADMIN",
      },
      {
        id: "user-agency-staff",
        orgId: agencyOrg.id,
        name: "Neha Mehta (Operations Lead)",
        email: "staff@atomplatform.io",
        role: "AGENCY_STAFF",
      },
      {
        id: "user-client-owner",
        orgId: clientOrg.id,
        name: "Vikram Malhotra",
        email: "vikram@apexrealty.in",
        role: "CLIENT_OWNER",
      },
      {
        id: "user-client-member",
        orgId: clientOrg.id,
        name: "Rohan Varma",
        email: "rohan@apexrealty.in",
        role: "CLIENT_TEAM_MEMBER",
      },
      {
        id: "user-client-viewer",
        orgId: clientOrg.id,
        name: "Priya Nair",
        email: "priya@apexrealty.in",
        role: "AUTOMATION_VIEWER",
      },
    ],
  });

  // 7. Seed Org Automations for Apex Realty
  const auto1 = await prisma.orgAutomation.create({
    data: {
      id: "org-auto-1",
      orgId: clientOrg.id,
      automationId: "auto-wa-qualifier",
      status: "ACTIVE",
      executionCount: 142,
      creditsConsumed: 710,
      n8nWorkflowId: "n8n_wf_apex_wa_01",
      lastRunAt: new Date(Date.now() - 1000 * 60 * 18), // 18 mins ago
    },
  });

  const auto2 = await prisma.orgAutomation.create({
    data: {
      id: "org-auto-2",
      orgId: clientOrg.id,
      automationId: "auto-voice-appointment",
      status: "ACTIVE",
      executionCount: 89,
      creditsConsumed: 1780,
      n8nWorkflowId: "n8n_wf_apex_voice_02",
      lastRunAt: new Date(Date.now() - 1000 * 60 * 45),
    },
  });

  // 8. Seed Voice Agent Config
  await prisma.voiceAgentConfig.create({
    data: {
      orgId: clientOrg.id,
      provider: "SARVAM",
      language: "Hindi + English (Hinglish)",
      promptScript:
        "Namaste, I am Maya calling from Apex Luxury Properties. I noticed your interest in the 3 BHK villa listings in Whitefield. Are you looking to schedule a site tour this upcoming Saturday or Sunday?",
      callingHours: "10:30 AM - 07:00 PM",
      targetStatus: "NEW",
    },
  });

  // 9. Seed Funnel
  await prisma.funnel.create({
    data: {
      id: "funnel-apex-site",
      orgId: clientOrg.id,
      title: "Whitefield Villa VIP Site Visit Pass",
      templateId: "tpl-luxury-booking",
      publishedSlug: "apex-whitefield-vip",
      hasOwnWebsite: true,
      status: "ACTIVE",
      views: 1240,
      conversions: 86,
    },
  });

  await prisma.funnel.create({
    data: {
      id: "funnel-sharma-starter",
      orgId: noWebOrg.id,
      title: "Smile Makeover Free Consultation",
      templateId: "tpl-clinic-starter",
      publishedSlug: "drsharma-consultation",
      hasOwnWebsite: false,
      websiteBrief: JSON.stringify({
        businessDescription: "Premier cosmetic dentistry clinic specializing in invisible aligners and laser teeth whitening in South Delhi.",
        threeHighlights: [
          "15+ years experience with over 3,000 smile transformations",
          " painless laser technology & custom US-FDA aligners",
          "Zero-cost initial 3D digital scan & consultation"
        ],
        requestedAt: new Date().toISOString(),
        humanCallbackStatus: "SCHEDULED_WITHIN_24H",
      }),
      status: "ACTIVE",
      views: 310,
      conversions: 24,
    },
  });

  // 10. Seed Realistic Leads for Apex Realty
  const lead1 = await prisma.lead.create({
    data: {
      id: "lead-101",
      orgId: clientOrg.id,
      automationId: auto1.id,
      name: "Aditya Singhania",
      phone: "+91 98201 44521",
      email: "aditya.singhania@fintech.co",
      status: "QUALIFIED",
      relationshipStage: "INTERESTED",
      tags: JSON.stringify(["3BHK", "Ready to move", "Budget 3.5Cr+"]),
      notes: "High intent buyer. Wants north-facing unit with duplex garden layout.",
      source: "WhatsApp Lead Qualifier",
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      id: "lead-102",
      orgId: clientOrg.id,
      automationId: auto2.id,
      name: "Kavita Ramachandran",
      phone: "+91 97410 88231",
      email: "kavita.r@techcorp.in",
      status: "BOOKED",
      relationshipStage: "BOOKED",
      tags: JSON.stringify(["Site Visit Confirmed", "Sunday 11am"]),
      notes: "Voice agent booked appointment on 14th Sept. Sent WhatsApp confirmation.",
      source: "AI Voice Agent (Sarvam)",
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      id: "lead-103",
      orgId: clientOrg.id,
      automationId: auto1.id,
      name: "Rajesh Khandelwal",
      phone: "+91 94140 12890",
      email: "rajesh.kh@investors.in",
      status: "NEW",
      relationshipStage: "FIRST_CONTACT",
      tags: JSON.stringify(["Commercial Floor", "Investor"]),
      notes: "Inbounded 20m ago via WhatsApp widget.",
      source: "WhatsApp Lead Qualifier",
    },
  });

  // 11. Lead Activities & Conversation Timeline
  await prisma.leadActivity.createMany({
    data: [
      {
        leadId: lead1.id,
        type: "MESSAGE",
        title: "Inbound WhatsApp Inquiry",
        payload: JSON.stringify({
          sender: "lead",
          message: "Hi, saw your ad for Whitefield luxury villas. Is 3 BHK available?",
          time: "10:14 AM",
        }),
      },
      {
        leadId: lead1.id,
        type: "MESSAGE",
        title: "AI Response (Instant Qualifier)",
        payload: JSON.stringify({
          sender: "bot",
          message: "Hello Aditya! Yes, our Phase 2 villas are open with immediate possession. Are you looking for self-use or investment?",
          time: "10:14 AM",
        }),
      },
      {
        leadId: lead1.id,
        type: "MESSAGE",
        title: "Lead Qualification Answer",
        payload: JSON.stringify({
          sender: "lead",
          message: "Looking for self-use for family, budget around 3.5 to 4 Cr.",
          time: "10:16 AM",
        }),
      },
      {
        leadId: lead1.id,
        type: "STATUS_CHANGE",
        title: "Status auto-updated to QUALIFIED",
        payload: JSON.stringify({ old: "NEW", new: "QUALIFIED" }),
      },
      {
        leadId: lead2.id,
        type: "CALL",
        title: "Outbound AI Voice Call (Sarvam AI)",
        payload: JSON.stringify({
          duration: "2m 14s",
          outcome: "CONNECTED",
          language: "English / Hindi",
          summary: "Confirmed availability for Sunday 11:00 AM site visit. Added to Google Calendar.",
        }),
      },
    ],
  });

  // 12. Call Logs (Rich metrics for Voice AI Agent & ROI instrumentation)
  await prisma.callLog.createMany({
    data: [
      {
        leadId: lead2.id,
        orgId: clientOrg.id,
        provider: "SARVAM",
        durationSec: 134,
        outcome: "CONNECTED",
        relationshipStage: "BOOKED",
        sentiment: "POSITIVE",
        costInr: 15,
        actionTaken: "APPOINTMENT_LOCKED",
        transcriptSummary: "AI: Namaste Kavita ji, calling from Apex Realty regarding your villa inquiry. Lead: Yes, can we do a weekend visit? AI: Certainly, we have slots at 11am or 4pm Sunday. Lead: 11am is great. AI: Booked! You will receive confirmation on WhatsApp.",
      },
      {
        leadId: lead1.id,
        orgId: clientOrg.id,
        provider: "SARVAM",
        durationSec: 180,
        outcome: "CONNECTED",
        relationshipStage: "QUALIFIED",
        sentiment: "POSITIVE",
        costInr: 20,
        actionTaken: "BROCHURE_SENT",
        transcriptSummary: "AI: Namaste Aditya ji, Maya here from Apex Realty. Following up on your duplex villa inquiry. Lead: Yes, looking for 4 BHK north-facing unit. AI: Perfect, WhatsApping the floor plans right now.",
      },
      {
        leadId: lead3.id,
        orgId: clientOrg.id,
        provider: "SARVAM",
        durationSec: 45,
        outcome: "NO_ANSWER",
        relationshipStage: "FIRST_CONTACT",
        sentiment: "NEUTRAL",
        costInr: 5,
        actionTaken: "FOLLOWUP_QUEUED",
        transcriptSummary: "Call rang for 45 seconds with no answer. Followup queued for evening 5:30 PM slot.",
      },
      {
        leadId: lead1.id,
        orgId: clientOrg.id,
        provider: "ELEVENLABS",
        durationSec: 110,
        outcome: "CONNECTED",
        relationshipStage: "INTERESTED",
        sentiment: "POSITIVE",
        costInr: 45,
        actionTaken: "APPOINTMENT_LOCKED",
        transcriptSummary: "ElevenLabs Voice Agent confirmed unit pricing and investment tax benefits with client. Scheduled callback with Senior VP.",
      },
      {
        leadId: lead2.id,
        orgId: clientOrg.id,
        provider: "SARVAM",
        durationSec: 92,
        outcome: "CONNECTED",
        relationshipStage: "BOOKED",
        sentiment: "POSITIVE",
        costInr: 15,
        actionTaken: "APPOINTMENT_LOCKED",
        transcriptSummary: "Voice Agent verified driver pickup address for Bangalore VIP site visit.",
      },
    ],
  });

  // 12.1 Projects & Client Updates (Website Request & Custom SaaS Onboarding)
  const proj1 = await prisma.project.create({
    data: {
      id: "proj-apex-website",
      orgId: clientOrg.id,
      type: "WEBSITE_REQUEST",
      title: "Apex Whitefield Luxury Villas Showcase & Booking Experience",
      description: "Custom interactive 1-week website with 3D floorplan tours, direct WhatsApp widget, and Sarvam Voice AI callback trigger.",
      targetAudience: "High-net-worth NRI & Bengaluru tech executive homebuyers looking for ₹3.5Cr+ luxury villas.",
      primaryGoals: "Generate 50+ qualified site visit appointments monthly and build high-trust digital branding.",
      keyFeatures: JSON.stringify([
        "Interactive 3D Villa Masterplan & Unit Tour",
        "WhatsApp Instant Qualifier floating widget",
        "Autonomous Sarvam Voice AI callback button",
        "Mobile-first luxury editorial aesthetic",
        "Fast Edge CDN caching with sub-second LCP",
        "Automated CRM lead push with attribution source tags",
      ]),
      designPreferences: "Dark Luxury Editorial (Gold & Slate accents, Cormorant Garamond / Inter typography, smooth micro-interactions)",
      techStack: "Next.js 14, Tailwind CSS, Framer Motion, Sarvam AI Voice Webhooks",
      referenceUrls: "https://dribbble.com/shots/luxury-estates, https://figma.com/@apex/website-v1",
      status: "DEVELOPING",
      progressPct: 68,
      stagingUrl: "https://apex-luxury.staging.atomplatform.io",
      liveUrl: "https://apexrealty.in/villas",
      shareToken: "apex-villas-status-tok1",
      estimatedLaunch: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
    },
  });

  await prisma.projectMilestone.createMany({
    data: [
      {
        projectId: proj1.id,
        title: "Discovery & Architecture Blueprint",
        status: "COMPLETED",
        dueDate: "Day 1",
        order: 1,
      },
      {
        projectId: proj1.id,
        title: "Luxury UI Design System & Component Library",
        status: "COMPLETED",
        dueDate: "Day 2",
        order: 2,
      },
      {
        projectId: proj1.id,
        title: "Full-Stack Next.js 14 Page & Interactive Unit Tours",
        status: "COMPLETED",
        dueDate: "Day 4",
        order: 3,
      },
      {
        projectId: proj1.id,
        title: "Sarvam Voice AI Callback & WhatsApp Integration",
        status: "IN_PROGRESS",
        dueDate: "Day 5",
        order: 4,
      },
      {
        projectId: proj1.id,
        title: "Security Audit, SEO Schema & Production Launch",
        status: "PENDING",
        dueDate: "Day 7",
        order: 5,
      },
    ],
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: proj1.id,
        title: "Sprint 1: Architecture & Luxury Wireframes Approved",
        description: "Completed client discovery session. Finalized the 5 core sections: Hero with dynamic villa video, interactive 3D floor selector, pricing tiers, amenities gallery, and the instant booking engine.",
        phase: "DISCOVERY",
        deliverables: JSON.stringify(["Figma Wireframes v1.2", "Copywriting Sheet", "Information Architecture Sitemap"]),
        authorName: "Atom Engineering & Design",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      },
      {
        projectId: proj1.id,
        title: "Sprint 2: Next.js Frontend Assembled & Staging Deployed",
        description: "Built the responsive desktop and mobile views. Implemented high-performance image optimization for villa galleries. Deployed initial preview to staging URL for client review.",
        phase: "DEVELOPMENT",
        deliverables: JSON.stringify(["Live Staging URL", "Lighthouse Performance Report (98/100)", "Responsive Mobile Preview"]),
        authorName: "Atom Full-Stack Team",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      },
      {
        projectId: proj1.id,
        title: "Sprint 3: Connected CRM Webhooks & WhatsApp Instant Booking",
        description: "Tested and verified lead capture flows: whenever a visitor enters their phone number, lead is created in CRM and WhatsApp bot instantly responds in 2.8 seconds.",
        phase: "INTEGRATION",
        deliverables: JSON.stringify(["Lead Webhook Endpoints", "WhatsApp Bot Template Previews", "CRM Auto-Sync Verification"]),
        authorName: "Atom Automations Specialist",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
    ],
  });

  // Second project for Dr. Sharma Dental (Custom SaaS Product)
  const proj2 = await prisma.project.create({
    data: {
      id: "proj-sharma-saas",
      orgId: noWebOrg.id,
      type: "CUSTOM_SAAS",
      title: "SmileCraft - Multi-Branch Patient Intake & AI Triage Portal",
      description: "Custom SaaS patient self-service portal: patients upload dental photos, get AI preliminary assessment, and lock doctor consultation slots.",
      targetAudience: "Cosmetic dentistry patients seeking Invisalign, aligners, and veneer smile makeovers.",
      primaryGoals: "Automate clinic patient intake, reduce receptionist workload by 70%, and enable pre-consultation digital triage.",
      keyFeatures: JSON.stringify([
        "Patient Self-Service Auth & Multi-Branch Profile",
        "Dental Photo Upload & Cloud Storage Triage",
        "Sarvam Voice AI Followup Automation for Missed Bookings",
        "Razorpay Consultation Advance Deposit Gateway",
        "Doctor Clinic Scheduling & Patient Notes Dashboard",
      ]),
      designPreferences: "Clean Clinical Minimalist (Teal & Pure White, high accessibility, calm healthcare tone)",
      techStack: "Next.js 14, Tailwind, SQLite/Postgres, Sarvam AI, Razorpay Webhooks",
      status: "DEVELOPING",
      progressPct: 45,
      stagingUrl: "https://smilecraft.staging.atomplatform.io",
      shareToken: "sharma-smilecraft-tok2",
      estimatedLaunch: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    },
  });

  await prisma.projectMilestone.createMany({
    data: [
      { projectId: proj2.id, title: "Requirements & Database Schema Design", status: "COMPLETED", order: 1 },
      { projectId: proj2.id, title: "Patient Auth & Photo Upload Pipeline", status: "COMPLETED", order: 2 },
      { projectId: proj2.id, title: "Doctor Clinic Triage Dashboard", status: "IN_PROGRESS", order: 3 },
      { projectId: proj2.id, title: "Razorpay Advance Deposit Integration", status: "PENDING", order: 4 },
      { projectId: proj2.id, title: "HIPAA Compliance Check & Launch", status: "PENDING", order: 5 },
    ],
  });

  await prisma.projectUpdate.createMany({
    data: [
      {
        projectId: proj2.id,
        title: "Sprint 1: Patient Intake Schema & Secure Uploads Active",
        description: "Implemented high-res image upload pipeline for teeth photos with automated thumbnail generation and patient profile association.",
        phase: "DEVELOPMENT",
        deliverables: JSON.stringify(["Image Upload API", "Patient Registration Screen Preview"]),
        authorName: "Atom Engineering",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ],
  });

  // 13. Transactions / Credit Ledger
  await prisma.transaction.createMany({
    data: [
      {
        orgId: clientOrg.id,
        amountInr: 10000,
        type: "TOPUP",
        description: "Wallet Top-up via Razorpay (UPI)",
        reference: "pay_Rzp918239aBc",
        status: "SUCCESS",
      },
      {
        orgId: clientOrg.id,
        amountInr: -710,
        type: "DEDUCTION_USAGE",
        description: "142 WhatsApp Qualifier conversations (@ ₹5/conv)",
        reference: "usage_wa_sep",
        status: "SUCCESS",
      },
      {
        orgId: clientOrg.id,
        amountInr: -840,
        type: "DEDUCTION_USAGE",
        description: "Voice AI Agent 28 minutes via Sarvam (@ ₹30/min)",
        reference: "usage_voice_sep",
        status: "SUCCESS",
      },
    ],
  });

  // 14. Notifications
  await prisma.notification.createMany({
    data: [
      {
        orgId: clientOrg.id,
        title: "New High-Intent Qualified Lead",
        message: "Aditya Singhania matched budget (3.5Cr+) for Whitefield Villa.",
        type: "LEAD",
        read: false,
      },
      {
        orgId: clientOrg.id,
        title: "Appointment Booked by Voice AI",
        message: "Kavita Ramachandran booked a site visit for Sunday at 11:00 AM.",
        type: "BOOKING",
        read: false,
      },
    ],
  });

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
