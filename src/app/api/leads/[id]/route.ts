import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const allowed = await hasPermission(role, "leads:read");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const lead = await db.lead.findUnique({
      where: { id: params.id },
      include: {
        activities: {
          orderBy: { timestamp: "asc" },
        },
        callLogs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const allowed = await hasPermission(role, "leads:write");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { status, relationshipStage, notes, tags } = body;

    const existing = await db.lead.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (relationshipStage !== undefined) data.relationshipStage = relationshipStage;
    if (notes !== undefined) data.notes = notes;
    if (tags !== undefined) data.tags = typeof tags === "string" ? tags : JSON.stringify(tags);

    const updated = await db.lead.update({
      where: { id: params.id },
      data,
    });

    // Record activity if status or stage changed
    if (status && status !== existing.status) {
      await db.leadActivity.create({
        data: {
          leadId: params.id,
          type: "STATUS_CHANGE",
          title: `Status changed to ${status}`,
          payload: JSON.stringify({ from: existing.status, to: status }),
        },
      });
    }

    if (relationshipStage && relationshipStage !== existing.relationshipStage) {
      await db.leadActivity.create({
        data: {
          leadId: params.id,
          type: "STATUS_CHANGE",
          title: `Relationship stage updated: ${relationshipStage}`,
          payload: JSON.stringify({ from: existing.relationshipStage, to: relationshipStage }),
        },
      });
    }

    return NextResponse.json({ lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
