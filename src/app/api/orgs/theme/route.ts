import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { themeTokens: true, name: true, slug: true },
    });

    if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

    const tokens = org.themeTokens ? JSON.parse(org.themeTokens) : null;
    return NextResponse.json({ tokens, orgName: org.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const allowed = await hasPermission(role, "theme:customize");
    if (!allowed) {
      return NextResponse.json(
        { error: "Unauthorized: White-label theming requires Client Owner or Super Admin role." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orgId, themeTokens } = body;

    if (!orgId || !themeTokens) {
      return NextResponse.json({ error: "orgId and themeTokens required" }, { status: 400 });
    }

    const updated = await db.organization.update({
      where: { id: orgId },
      data: {
        themeTokens: typeof themeTokens === "string" ? themeTokens : JSON.stringify(themeTokens),
      },
    });

    return NextResponse.json({ success: true, themeTokens: updated.themeTokens });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
