import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shareToken = searchParams.get("shareToken");
    const orgId = searchParams.get("orgId");
    const projectId = searchParams.get("projectId");

    // Public Client Share View by shareToken
    if (shareToken) {
      const project = await db.project.findUnique({
        where: { shareToken },
        include: {
          org: { select: { id: true, name: true, slug: true, industry: true } },
          milestones: { orderBy: { order: "asc" } },
          updates: { orderBy: { createdAt: "desc" } },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found or invalid link" }, { status: 404 });
      }

      return NextResponse.json({ project });
    }

    // Single project by id
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          org: { select: { id: true, name: true, slug: true } },
          milestones: { orderBy: { order: "asc" } },
          updates: { orderBy: { createdAt: "desc" } },
        },
      });
      return NextResponse.json({ project });
    }

    // Projects by orgId
    const targetOrgId = orgId || "org-apex-realty";
    const projects = await db.project.findMany({
      where: { orgId: targetOrgId },
      include: {
        milestones: { orderBy: { order: "asc" } },
        updates: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      orgId,
      type,
      title,
      description,
      targetAudience,
      primaryGoals,
      keyFeatures,
      designPreferences,
      techStack,
      referenceUrls,
      estimatedLaunch,
      projectId,
      phase,
      deliverables,
      authorName,
      milestoneId,
      status,
      progressPct,
      stagingUrl,
      liveUrl,
    } = body;

    // 0. Create new Website or Custom SaaS Project from Onboarding
    if (action === "create_project" || (!action && title && type)) {
      if (!title || !type) {
        return NextResponse.json(
          { error: "Project title and type are required" },
          { status: 400 }
        );
      }

      const targetOrgId = orgId || "org-apex-realty";

      // Create Project
      const project = await db.project.create({
        data: {
          orgId: targetOrgId,
          type: type || "WEBSITE_REQUEST",
          title,
          description: description || "Custom digital build and automation architecture.",
          targetAudience: targetAudience || "High-intent prospective buyers and clients",
          primaryGoals: primaryGoals || "Accelerate lead capture, automate client inquiries, and improve ROI.",
          keyFeatures: keyFeatures ? (Array.isArray(keyFeatures) ? JSON.stringify(keyFeatures) : keyFeatures) : JSON.stringify(["Automated Lead Capture", "Mobile Responsive", "CRM Synced"]),
          designPreferences: designPreferences || "Modern Dark Mode with High-Conversion Layout",
          techStack: techStack || "Next.js 14, Tailwind CSS, Prisma ORM, Sarvam AI Voice",
          referenceUrls: referenceUrls || null,
          status: "DESIGNING",
          progressPct: 20,
          estimatedLaunch: estimatedLaunch ? new Date(estimatedLaunch) : new Date(Date.now() + 7 * 86400000),
          stagingUrl: `https://${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-preview.atomplatform.io`,
        },
      });

      // Seed standard milestones
      const isSaas = type === "CUSTOM_SAAS";
      const milestonesData = isSaas
        ? [
            { title: "Architecture & Multi-Tenant Database Schema", status: "COMPLETED", order: 1, dueDate: "Day 2" },
            { title: "Core Dashboard & Auth/RBAC Implementation", status: "IN_PROGRESS", order: 2, dueDate: "Day 5" },
            { title: "AI Voice Agent & Automation Pipeline Hookup", status: "PENDING", order: 3, dueDate: "Day 8" },
            { title: "Billing & Razorpay Wallet Integration", status: "PENDING", order: 4, dueDate: "Day 11" },
            { title: "Staging Review, Security Testing & Production Deploy", status: "PENDING", order: 5, dueDate: "Day 14" },
          ]
        : [
            { title: "Requirements Intake & Technical Spec", status: "COMPLETED", order: 1, dueDate: "Day 1" },
            { title: "High-Fidelity UI Design & Branding", status: "IN_PROGRESS", order: 2, dueDate: "Day 3" },
            { title: "Responsive Frontend Build & Speed Optimization", status: "PENDING", order: 3, dueDate: "Day 5" },
            { title: "WhatsApp & Sarvam AI Voice Lead Capture", status: "PENDING", order: 4, dueDate: "Day 6" },
            { title: "QA Testing & Live Domain Launch", status: "PENDING", order: 5, dueDate: "Day 7" },
          ];

      for (const m of milestonesData) {
        await db.projectMilestone.create({
          data: {
            projectId: project.id,
            title: m.title,
            status: m.status,
            order: m.order,
            dueDate: m.dueDate,
          },
        });
      }

      // Initial progress update ("What We Have Done")
      await db.projectUpdate.create({
        data: {
          projectId: project.id,
          title: "Project Initialized & Requirements Architecture Finalized",
          description: `Intake requirements and design specs locked for ${title}. Architecture scope, brand styling tokens, and sprint roadmap have been initialized.`,
          phase: "DISCOVERY",
          deliverables: JSON.stringify(["Project Technical Spec", "7-Day Sprint Roadmap", "Interactive Status Tracker Link"]),
          authorName: "Atom Engineering Team",
        },
      });

      const fullProject = await db.project.findUnique({
        where: { id: project.id },
        include: {
          milestones: { orderBy: { order: "asc" } },
          updates: { orderBy: { createdAt: "desc" } },
        },
      });

      return NextResponse.json({ success: true, project: fullProject });
    }
    if (action === "create_update") {
      if (!projectId || !title || !description) {
        return NextResponse.json(
          { error: "projectId, title, and description are required" },
          { status: 400 }
        );
      }

      const update = await db.projectUpdate.create({
        data: {
          projectId,
          title,
          description,
          phase: phase || "DEVELOPMENT",
          deliverables: deliverables ? (Array.isArray(deliverables) ? JSON.stringify(deliverables) : deliverables) : null,
          authorName: authorName || "Atom Engineering Team",
        },
      });

      // Optionally bump project progress if specified
      if (progressPct !== undefined) {
        await db.project.update({
          where: { id: projectId },
          data: { progressPct: Math.min(100, Math.max(0, progressPct)) },
        });
      }

      return NextResponse.json({ success: true, update });
    }

    // 2. Toggle milestone status
    if (action === "update_milestone") {
      if (!milestoneId || !status) {
        return NextResponse.json(
          { error: "milestoneId and status are required" },
          { status: 400 }
        );
      }

      const updatedMilestone = await db.projectMilestone.update({
        where: { id: milestoneId },
        data: { status },
      });

      return NextResponse.json({ success: true, milestone: updatedMilestone });
    }

    // 3. Update project details (status, progressPct, stagingUrl, liveUrl)
    if (action === "update_project") {
      if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
      }

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (progressPct !== undefined) updateData.progressPct = Number(progressPct);
      if (stagingUrl !== undefined) updateData.stagingUrl = stagingUrl;
      if (liveUrl !== undefined) updateData.liveUrl = liveUrl;

      const updatedProject = await db.project.update({
        where: { id: projectId },
        data: updateData,
        include: {
          milestones: { orderBy: { order: "asc" } },
          updates: { orderBy: { createdAt: "desc" } },
        },
      });

      return NextResponse.json({ success: true, project: updatedProject });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
