import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userIdCookie = req.cookies.get("atom_user_id")?.value;
    const orgIdCookie = req.cookies.get("atom_org")?.value;
    const roleCookie = req.cookies.get("atom_role")?.value;

    if (!userIdCookie && !orgIdCookie) {
      return NextResponse.json({
        authenticated: false,
        session: null,
      });
    }

    let user = null;

    if (userIdCookie) {
      user = await db.user.findUnique({
        where: { id: userIdCookie },
        include: { org: true },
      });
    }

    if (!user && orgIdCookie) {
      user = await db.user.findFirst({
        where: { orgId: orgIdCookie },
        include: { org: true },
      });
    }

    // Do NOT fall back to an arbitrary user if unauthenticated
    if (!user) {
      const res = NextResponse.json({
        authenticated: false,
        session: null,
      });
      res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return res;
    }

    const res = NextResponse.json({
      authenticated: true,
      session: {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: (roleCookie as any) || user.role,
        orgId: user.org.id,
        orgName: user.org.name,
        orgSlug: user.org.slug,
        creditBalance: user.org.creditBalance,
      },
    });
    res.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
