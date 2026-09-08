import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";
    const status = searchParams.get("status");
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;

    // RBAC check: leads:read
    const allowed = await hasPermission(role, "leads:read");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized role for leads:read" }, { status: 403 });
    }

    const where: any = { orgId };
    if (status && status !== "ALL") {
      where.status = status;
    }

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        activities: {
          orderBy: { timestamp: "desc" },
          take: 3,
        },
        callLogs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const allowed = await hasPermission(role, "leads:write");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized role for leads:write" }, { status: 403 });
    }

    const body = await req.json();
    const { orgId, name, phone, email, notes, source, tags } = body;

    if (!orgId || !name || !phone) {
      return NextResponse.json({ error: "Missing required fields (orgId, name, phone)" }, { status: 400 });
    }

    const lead = await db.lead.create({
      data: {
        orgId,
        name,
        phone,
        email: email || null,
        notes: notes || null,
        source: source || "Manual CRM Entry",
        tags: tags ? JSON.stringify(tags) : JSON.stringify(["Manual"]),
        status: "NEW",
        relationshipStage: "FIRST_CONTACT",
      },
    });

    // Record activity
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "STATUS_CHANGE",
        title: "Lead Created",
        payload: JSON.stringify({ source: lead.source }),
      },
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
