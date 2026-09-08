import { db } from "../db";

export type Role =
  | "SUPER_ADMIN"
  | "AGENCY_STAFF"
  | "CLIENT_OWNER"
  | "CLIENT_TEAM_MEMBER"
  | "AUTOMATION_VIEWER";

export interface SessionContext {
  userId: string;
  name: string;
  email: string;
  role: Role;
  orgId: string;
  orgName: string;
  orgSlug: string;
}

// Memory cache for permission lookups
let permissionCache: Record<string, boolean> | null = null;
let cacheTime = 0;

export async function hasPermission(role: Role, action: string): Promise<boolean> {
  // Super Admin can do everything
  if (role === "SUPER_ADMIN") return true;

  const now = Date.now();
  if (!permissionCache || now - cacheTime > 30000) {
    const allPerms = await db.permission.findMany();
    permissionCache = {};
    for (const p of allPerms) {
      permissionCache[`${p.role}:${p.action}`] = p.allowed;
    }
    cacheTime = now;
  }

  const key = `${role}:${action}`;
  return !!permissionCache[key];
}

/**
 * Server-side tenant assertion.
 * Ensures the requesting user either:
 * 1. Has SUPER_ADMIN / AGENCY_STAFF role (can inspect target org)
 * 2. Or belongs strictly to targetOrgId.
 */
export async function assertTenantAccess(session: SessionContext, targetOrgId: string): Promise<boolean> {
  if (session.role === "SUPER_ADMIN" || session.role === "AGENCY_STAFF") {
    return true;
  }
  return session.orgId === targetOrgId;
}
