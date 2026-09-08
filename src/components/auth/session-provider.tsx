"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Role, SessionContext } from "@/lib/auth/rbac";

interface SessionState {
  currentSession: SessionContext;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  setOrg: (orgId: string, orgName: string, orgSlug: string) => void;
  setSessionDirect: (session: SessionContext) => void;
  logout: () => Promise<void>;
  availableRoles: { role: Role; label: string; desc: string }[];
}

const defaultSession: SessionContext = {
  userId: "user-client-owner",
  name: "Vikram Malhotra",
  email: "vikram@apexrealty.in",
  role: "CLIENT_OWNER",
  orgId: "org-apex-realty",
  orgName: "Apex Luxury Properties",
  orgSlug: "apex-realty",
};

const availableRoles: { role: Role; label: string; desc: string }[] = [
  {
    role: "SUPER_ADMIN",
    label: "Super Admin (Agency Owner)",
    desc: "Full access across all clients, billing, catalog & theming",
  },
  {
    role: "AGENCY_STAFF",
    label: "Agency Staff",
    desc: "Manage assigned clients, view leads, no billing access",
  },
  {
    role: "CLIENT_OWNER",
    label: "Client Owner",
    desc: "Full access to own organization, billing, automations & CRM",
  },
  {
    role: "CLIENT_TEAM_MEMBER",
    label: "Client Team Member",
    desc: "Manage leads and funnels only, no billing or automation config",
  },
  {
    role: "AUTOMATION_VIEWER",
    label: "Automation Viewer (Read-Only)",
    desc: "Visibility into dashboards and leads only",
  },
];

const SessionContextReact = createContext<SessionState>({
  currentSession: defaultSession,
  isAuthenticated: false,
  setRole: () => {},
  setOrg: () => {},
  setSessionDirect: () => {},
  logout: async () => {},
  availableRoles,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Always start with defaultSession so server & client render identical HTML (fixes hydration mismatch).
  // localStorage is read in useEffect after hydration.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<SessionContext>(defaultSession);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client after mount
  useEffect(() => {
    const saved = localStorage.getItem("atom_active_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentSession(parsed);
        setIsAuthenticated(true);
      } catch {
        // ignore corrupt data
      }
    }
    setHydrated(true);
  }, []);

  // Hydrate from real server database session on mount
  useEffect(() => {
    async function syncSession() {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.session) {
            setCurrentSession(data.session);
            setIsAuthenticated(true);
            try {
              localStorage.setItem("atom_active_session", JSON.stringify(data.session));
            } catch {
              // ignore
            }
          } else {
            // Server confirmed unauthenticated
            const saved = typeof window !== "undefined" ? localStorage.getItem("atom_active_session") : null;
            if (!saved) {
              setIsAuthenticated(false);
            }
          }
        }
      } catch {
        // use cached state
      }
    }
    syncSession();
  }, []);

  // Persistent 30-day cookie synchronization for authenticated users
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated && currentSession.userId) {
      try {
        localStorage.setItem("atom_active_session", JSON.stringify(currentSession));
      } catch {
        // ignore
      }
      const THIRTY_DAYS = 2592000;
      document.cookie = `atom_user_id=${currentSession.userId}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
      document.cookie = `atom_role=${currentSession.role}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
      document.cookie = `atom_org=${currentSession.orgId}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
    }
  }, [currentSession, isAuthenticated]);

  const setRole = (newRole: Role) => {
    let name = currentSession.name;
    let email = currentSession.email;
    let orgId = currentSession.orgId;
    let orgName = currentSession.orgName;
    let orgSlug = currentSession.orgSlug;

    if (newRole === "SUPER_ADMIN") {
      name = "Parth (Agency Founder)";
      email = "admin@atomplatform.io";
      orgId = "org-agency-master";
      orgName = "Synthex Automation Agency";
      orgSlug = "synthex-agency";
    } else if (newRole === "AGENCY_STAFF") {
      name = "Neha Mehta (Ops)";
      email = "staff@atomplatform.io";
      orgId = "org-agency-master";
      orgName = "Synthex Automation Agency";
      orgSlug = "synthex-agency";
    } else if (newRole === "CLIENT_OWNER") {
      name = "Vikram Malhotra";
      email = "vikram@apexrealty.in";
      orgId = "org-apex-realty";
      orgName = "Apex Luxury Properties";
      orgSlug = "apex-realty";
    } else if (newRole === "CLIENT_TEAM_MEMBER") {
      name = "Rohan Varma";
      email = "rohan@apexrealty.in";
      orgId = "org-apex-realty";
      orgName = "Apex Luxury Properties";
      orgSlug = "apex-realty";
    } else if (newRole === "AUTOMATION_VIEWER") {
      name = "Priya Nair";
      email = "priya@apexrealty.in";
      orgId = "org-apex-realty";
      orgName = "Apex Luxury Properties";
      orgSlug = "apex-realty";
    }

    const updated = {
      userId: `user-${newRole.toLowerCase()}`,
      name,
      email,
      role: newRole,
      orgId,
      orgName,
      orgSlug,
    };

    setIsAuthenticated(true);
    setCurrentSession(updated);
  };

  const setOrg = (orgId: string, orgName: string, orgSlug: string) => {
    setCurrentSession((prev) => ({
      ...prev,
      orgId,
      orgName,
      orgSlug,
    }));
  };

  const setSessionDirect = (session: SessionContext) => {
    setIsAuthenticated(true);
    setCurrentSession(session);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("atom_active_session", JSON.stringify(session));
      } catch {
        // ignore
      }
      const THIRTY_DAYS = 2592000;
      document.cookie = `atom_user_id=${session.userId}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
      document.cookie = `atom_role=${session.role}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
      document.cookie = `atom_org=${session.orgId}; path=/; max-age=${THIRTY_DAYS}; SameSite=Lax`;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("atom_active_session");
      document.cookie = "atom_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      document.cookie = "atom_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      document.cookie = "atom_org=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      window.location.href = "/login";
    }
  };

  return (
    <SessionContextReact.Provider
      value={{
        currentSession,
        isAuthenticated,
        setRole,
        setOrg,
        setSessionDirect,
        logout,
        availableRoles,
      }}
    >
      {children}
    </SessionContextReact.Provider>
  );
}

export function useSession() {
  return useContext(SessionContextReact);
}
