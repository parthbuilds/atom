import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";

    const funnels = await db.funnel.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ funnels });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, funnelSlug, name, phone, email, notes } = body;

    // Public funnel submission from hosted landing page or embedded widget
    if (action === "submit_lead") {
      const funnel = await db.funnel.findUnique({
        where: { publishedSlug: funnelSlug },
        include: { org: true },
      });

      if (!funnel) {
        return NextResponse.json({ error: "Funnel not found" }, { status: 404 });
      }

      // 1. Create lead in client's CRM
      const lead = await db.lead.create({
        data: {
          orgId: funnel.orgId,
          name: name || "Website Visitor",
          phone,
          email: email || null,
          notes: notes || `Submitted via Funnel: ${funnel.title}`,
          source: `Funnel (${funnel.title})`,
          tags: JSON.stringify(["Funnel Inbound", funnel.templateId]),
          status: "NEW",
          relationshipStage: "FIRST_CONTACT",
        },
      });

      // 2. Increment funnel conversions
      await db.funnel.update({
        where: { id: funnel.id },
        data: { conversions: { increment: 1 } },
      });

      // 3. Activity record
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "BOOKING",
          title: "Funnel Form Submission Received",
          payload: JSON.stringify({ funnelTitle: funnel.title, phone, email }),
        },
      });

      // 4. Notification
      await db.notification.create({
        data: {
          orgId: funnel.orgId,
          title: "New Funnel Conversion!",
          message: `${name} just submitted on ${funnel.title}.`,
          type: "BOOKING",
        },
      });

      return NextResponse.json({ success: true, leadId: lead.id });
    }

    if (action === "create_funnel") {
      const { orgId, title, templateId } = body;
      if (!orgId || !title) {
        return NextResponse.json({ error: "orgId and title required" }, { status: 400 });
      }
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.random().toString(36).substring(2, 6)}`;
      const funnel = await db.funnel.create({
        data: {
          orgId,
          title,
          templateId: templateId || "tpl-direct-booking",
          publishedSlug: slug,
          hasOwnWebsite: true,
          status: "ACTIVE",
        },
      });
      return NextResponse.json({ success: true, funnel });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
