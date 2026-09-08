import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      industry,
      city,
      teamSize,
      hasWebsite,
      websiteBrief,
      serviceTrack,
      projectSpecs,
      selectedCatalogIds,
      starterCreditsInr,
      ownerEmail,
      ownerName,
      razorpayPaymentId,
      themeMode,
      dashboardWidgets,
    } = body;

    if (!businessName || !industry) {
      return NextResponse.json(
        { error: "Business name and industry are required" },
        { status: 400 }
      );
    }

    // Generate clean slug
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Create Organization
    const initialTokens = {
      radius: "0.625rem",
      primary: "217 91% 60%",
      mode: themeMode === "light" ? "light" : "dark",
      dashboardWidgets: dashboardWidgets || {
        showLeadsKpi: true,
        showAutomationsKpi: true,
        showVoiceKpi: true,
        showWalletKpi: true,
        showFunnelMetrics: true,
        showRecentLeads: true,
        showQuickSimulator: true,
      },
    };

    const org = await db.organization.create({
      data: {
        name: businessName,
        slug,
        industry,
        city: city || "India",
        teamSize: teamSize || "1-5",
        creditBalance: starterCreditsInr || 5000,
        hasOwnWebsite: hasWebsite !== "No",
        themeTokens: JSON.stringify(initialTokens),
      },
    });

    // 2. Create Owner User
    const user = await db.user.create({
      data: {
        orgId: org.id,
        name: ownerName || `${businessName} Owner`,
        email: ownerEmail || `contact@${baseSlug}.com`,
        role: "CLIENT_OWNER",
      },
    });

    // 3. Assign Selected Automations & generate n8n workflow credentials
    const catalogIds = Array.isArray(selectedCatalogIds)
      ? selectedCatalogIds
      : ["auto-wa-qualifier", "auto-voice-appointment"];

    for (const catId of catalogIds) {
      await db.orgAutomation.create({
        data: {
          orgId: org.id,
          automationId: catId,
          status: "ACTIVE",
          n8nWorkflowId: `n8n_wf_${org.slug}_${catId}`,
        },
      });
    }

    // 4. If No-Website branch, create Funnel with website brief
    if (hasWebsite === "No" && websiteBrief) {
      await db.funnel.create({
        data: {
          orgId: org.id,
          title: `${businessName} 1-Week Starter Landing Page`,
          templateId: "tpl-starter-lead-capture",
          publishedSlug: `${baseSlug}-booking`,
          hasOwnWebsite: false,
          websiteBrief: JSON.stringify(websiteBrief),
          status: "ACTIVE",
        },
      });
    } else {
      // Default funnel
      await db.funnel.create({
        data: {
          orgId: org.id,
          title: `${businessName} Direct Inbound Booking Funnel`,
          templateId: "tpl-direct-booking",
          publishedSlug: `${baseSlug}-inbound`,
          hasOwnWebsite: true,
          status: "ACTIVE",
        },
      });
    }

    // 4.1. If Website Request or Custom SaaS Product track, provision Project with Milestones & Kickoff Update
    let createdProject: any = null;
    const isProjectTrack =
      serviceTrack === "website_request" ||
      serviceTrack === "custom_saas" ||
      Boolean(projectSpecs) ||
      hasWebsite === "No";

    if (isProjectTrack) {
      const projType =
        serviceTrack === "custom_saas"
          ? "CUSTOM_SAAS"
          : serviceTrack === "website_request" || hasWebsite === "No"
          ? "WEBSITE_REQUEST"
          : "AI_AUTOMATION";

      const projTitle =
        projectSpecs?.projectTitle ||
        (projType === "CUSTOM_SAAS"
          ? `${businessName} Custom SaaS Platform`
          : `${businessName} High-Converting Website Sprint`);

      createdProject = await db.project.create({
        data: {
          orgId: org.id,
          type: projType,
          title: projTitle,
          description:
            projectSpecs?.businessDescription ||
            websiteBrief?.businessDescription ||
            `Bespoke digital build for ${businessName} with pre-integrated lead capture automations.`,
          targetAudience:
            projectSpecs?.targetAudience || `Target customers in ${industry} seeking premium service.`,
          primaryGoals:
            projectSpecs?.primaryGoals ||
            "Elevate brand authority, capture high-intent leads, and automate client booking.",
          keyFeatures: JSON.stringify(
            projectSpecs?.keyFeatures || [
              "Responsive Luxury / Clean Design",
              "WhatsApp Qualifier Floating Widget",
              "Sarvam Voice AI Inbound Callback Trigger",
              "Sub-second Edge CDN Deployment",
              "Live Client Status Portal Tracking",
            ]
          ),
          designPreferences:
            projectSpecs?.designStyle || "Modern Clean & Responsive (High-Trust Aesthetics)",
          techStack:
            projType === "CUSTOM_SAAS"
              ? "Next.js 14, Tailwind, Prisma, SQLite, Sarvam Voice AI"
              : "Next.js 14, Tailwind CSS, Framer Motion, Edge CDN",
          referenceUrls: projectSpecs?.referenceUrls || null,
          status: "DEVELOPING",
          progressPct: 25,
          stagingUrl: `https://${baseSlug}.staging.atomplatform.io`,
          liveUrl: hasWebsite !== "No" ? `https://${baseSlug}.com` : null,
          shareToken: `tok_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`,
          estimatedLaunch: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * (projType === "CUSTOM_SAAS" ? 14 : 7)
          ),
        },
      });

      // Seed 5 standard sprint milestones
      await db.projectMilestone.createMany({
        data: [
          {
            projectId: createdProject.id,
            title: "Discovery & Architecture Blueprint",
            status: "COMPLETED",
            dueDate: "Day 1",
            order: 1,
          },
          {
            projectId: createdProject.id,
            title: "UI Design System & Component Library",
            status: "IN_PROGRESS",
            dueDate: "Day 2",
            order: 2,
          },
          {
            projectId: createdProject.id,
            title:
              projType === "CUSTOM_SAAS"
                ? "Full-Stack Web App, Auth & Database Integration"
                : "Full-Stack Next.js 14 Landing Page Build",
            status: "PENDING",
            dueDate: projType === "CUSTOM_SAAS" ? "Day 6" : "Day 4",
            order: 3,
          },
          {
            projectId: createdProject.id,
            title: "Sarvam Voice AI Callback & WhatsApp Qualifier Sync",
            status: "PENDING",
            dueDate: projType === "CUSTOM_SAAS" ? "Day 10" : "Day 5",
            order: 4,
          },
          {
            projectId: createdProject.id,
            title: "Security Audit, SEO Schema & Production Launch",
            status: "PENDING",
            dueDate: projType === "CUSTOM_SAAS" ? "Day 14" : "Day 7",
            order: 5,
          },
        ],
      });

      // Seed initial kickoff update
      await db.projectUpdate.create({
        data: {
          projectId: createdProject.id,
          title: "Sprint Kickoff: Scope & Blueprint Initialized",
          description: `Initial project blueprint generated for ${businessName}. Core feature requirements, design direction, and automated lead capture hooks are locked in.`,
          phase: "DISCOVERY",
          deliverables: JSON.stringify([
            "Intake Requirements Sheet",
            "Information Architecture Outline",
            "Live Client Status Portal Link",
          ]),
          authorName: "Atom Platform Engineering",
        },
      });
    }

    // 5. Seed default Voice Agent Config
    await db.voiceAgentConfig.create({
      data: {
        orgId: org.id,
        provider: "SARVAM",
        language: "Hindi + English (Hinglish)",
        promptScript: `Namaste, I am the AI assistant calling from ${businessName}. Thank you for reaching out. Are you available for a quick discussion regarding our services?`,
        callingHours: "10:00 AM - 07:00 PM",
        targetStatus: "NEW",
      },
    });

    // 6. Record Payment Transaction
    await db.transaction.create({
      data: {
        orgId: org.id,
        amountInr: starterCreditsInr || 5000,
        type: "TOPUP",
        description: `Initial Provisioning & Starter Credits via Razorpay`,
        reference: razorpayPaymentId || `pay_rzp_provision_${Date.now().toString(36)}`,
        status: "SUCCESS",
      },
    });

    // 7. Welcome Notification
    await db.notification.create({
      data: {
        orgId: org.id,
        title: "🎉 Welcome to Atom!",
        message: `Your business ${businessName} has been auto-provisioned with ₹${(starterCreditsInr || 5000).toLocaleString()} in credits. Complete your 3-step setup checklist now.`,
        type: "AUTOMATION",
      },
    });

    const response = NextResponse.json({
      success: true,
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        creditBalance: org.creditBalance,
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      n8nWorkspace: {
        workspaceId: `ws_${org.slug}`,
        apiUrl: `https://n8n.internal/v1/workspaces/ws_${org.slug}`,
        status: "READY",
      },
      project: createdProject
        ? {
            id: createdProject.id,
            title: createdProject.title,
            type: createdProject.type,
            shareToken: createdProject.shareToken,
            stagingUrl: createdProject.stagingUrl,
          }
        : null,
    });

    response.cookies.set("atom_user_id", user.id, {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
    });
    response.cookies.set("atom_role", user.role, {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
    });
    response.cookies.set("atom_org", org.id, {
      path: "/",
      maxAge: 86400 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
