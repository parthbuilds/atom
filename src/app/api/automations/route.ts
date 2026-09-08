import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";

    const [activeAutomations, catalog] = await Promise.all([
      db.orgAutomation.findMany({
        where: { orgId },
        include: { catalogItem: true },
        orderBy: { activatedAt: "asc" },
      }),
      db.automationCatalog.findMany({
        orderBy: { setupPriceInr: "asc" },
      }),
    ]);

    return NextResponse.json({ activeAutomations, catalog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const body = await req.json();
    const { action, orgId, orgAutomationId, catalogId } = body;

    if (action === "toggle") {
      const allowed = await hasPermission(role, "automations:toggle");
      if (!allowed) {
        return NextResponse.json(
          { error: "Unauthorized to toggle automations" },
          { status: 403 }
        );
      }

      const existing = await db.orgAutomation.findUnique({
        where: { id: orgAutomationId },
      });
      if (!existing) {
        return NextResponse.json({ error: "Automation not found" }, { status: 404 });
      }

      const newStatus = existing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const updated = await db.orgAutomation.update({
        where: { id: orgAutomationId },
        data: { status: newStatus },
      });

      // Log notification
      await db.notification.create({
        data: {
          orgId: existing.orgId,
          title: `Automation ${newStatus === "ACTIVE" ? "Resumed" : "Paused"}`,
          message: `Automation was marked ${newStatus} by ${role}.`,
          type: "AUTOMATION",
        },
      });

      return NextResponse.json({ success: true, updated });
    }

    if (action === "install_from_catalog") {
      const allowed = await hasPermission(role, "automations:config");
      if (!allowed) {
        return NextResponse.json(
          { error: "Unauthorized to install automations" },
          { status: 403 }
        );
      }

      const catalogItem = await db.automationCatalog.findUnique({
        where: { id: catalogId },
      });
      if (!catalogItem) {
        return NextResponse.json({ error: "Catalog item not found" }, { status: 404 });
      }

      // Check if already installed
      const existing = await db.orgAutomation.findFirst({
        where: { orgId, automationId: catalogId },
      });
      if (existing) {
        return NextResponse.json({ error: "Automation is already installed in this organization" }, { status: 400 });
      }

      const created = await db.orgAutomation.create({
        data: {
          orgId,
          automationId: catalogId,
          status: "ACTIVE",
          n8nWorkflowId: `n8n_wf_${orgId}_${catalogItem.slug}`,
          executionCount: 0,
          creditsConsumed: 0,
        },
        include: { catalogItem: true },
      });

      return NextResponse.json({ success: true, created });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
