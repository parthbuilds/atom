import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Return available database users for quick persona switching
    const users = await db.user.findMany({
      include: {
        org: {
          select: {
            id: true,
            name: true,
            slug: true,
            creditBalance: true,
            industry: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        orgId: u.orgId,
        orgName: u.org?.name,
        orgSlug: u.org?.slug,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, companyName } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    let cleanEmail = email.trim().toLowerCase();

    // Map common demo aliases
    if (cleanEmail === "admin@atom.dev" || cleanEmail === "admin") {
      cleanEmail = "admin@atomplatform.io";
    } else if (cleanEmail === "staff@atom.dev" || cleanEmail === "staff") {
      cleanEmail = "staff@atomplatform.io";
    } else if (cleanEmail === "owner@acme.com" || cleanEmail === "owner") {
      cleanEmail = "vikram@apexrealty.in";
    }

    // Query database for this user
    let targetUser = await db.user.findFirst({
      where: {
        email: cleanEmail,
      },
      include: {
        org: true,
      },
    });

    let isNewUser = false;

    if (!targetUser) {
      isNewUser = true;
      // Auto-provision user & organization so credentials always work and user is never locked out
      const nameFromEmail = cleanEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const orgSlug = `org-${cleanEmail.split("@")[0].replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`;
      const orgName = (companyName && typeof companyName === "string" && companyName.trim()) || `${nameFromEmail} Enterprises`;

      const newOrg = await db.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          industry: "Real Estate & Professional Services",
          creditBalance: 5000,
          hasOwnWebsite: true,
        },
      });

      targetUser = await db.user.create({
        data: {
          email: cleanEmail,
          name: nameFromEmail,
          role: "CLIENT_OWNER",
          orgId: newOrg.id,
        },
        include: {
          org: true,
        },
      });

      // Also provision default sample automations for the new workspace
      try {
        const catalogItems = await db.automationCatalog.findMany({ take: 3 });
        for (const item of catalogItems) {
          await db.orgAutomation.create({
            data: {
              orgId: newOrg.id,
              automationId: item.id,
              status: "ACTIVE",
              n8nWorkflowId: `n8n-${item.slug}-workflow`,
            },
          });
        }
      } catch {
        // Continue even if catalog seeding fails
      }
    } else if (!targetUser.org) {
      // Safeguard: if user exists but has dangling orgId
      let fallbackOrg = await db.organization.findFirst();
      if (!fallbackOrg) {
        fallbackOrg = await db.organization.create({
          data: {
            name: `${targetUser.name}'s Organization`,
            slug: `org-${targetUser.id.slice(0, 8)}`,
            industry: "Technology",
            creditBalance: 5000,
            hasOwnWebsite: true,
          },
        });
      }
      targetUser = await db.user.update({
        where: { id: targetUser.id },
        data: { orgId: fallbackOrg.id },
        include: { org: true },
      });
    }

    const orgId = targetUser.org?.id || targetUser.orgId || "org-default";
    const orgName = targetUser.org?.name || "Atom Workspace";
    const orgSlug = targetUser.org?.slug || "workspace";
    const creditBalance = targetUser.org?.creditBalance ?? 5000;

    const response = NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
      org: {
        id: orgId,
        name: orgName,
        slug: orgSlug,
        creditBalance: creditBalance,
      },
    });

    // Set persistent 30-day session cookies
    const THIRTY_DAYS = 86400 * 30;
    response.cookies.set("atom_user_id", targetUser.id, {
      path: "/",
      maxAge: THIRTY_DAYS,
      sameSite: "lax",
    });
    response.cookies.set("atom_role", targetUser.role, {
      path: "/",
      maxAge: THIRTY_DAYS,
      sameSite: "lax",
    });
    response.cookies.set("atom_org", targetUser.orgId, {
      path: "/",
      maxAge: THIRTY_DAYS,
      sameSite: "lax",
    });

    response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
