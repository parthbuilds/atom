"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Building,
  CreditCard,
  Cpu,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Lock,
} from "lucide-react";

export default function AdminSuperAdminPage() {
  const router = useRouter();
  const { currentSession, setOrg } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check RBAC
  const isSuperOrStaff =
    currentSession.role === "SUPER_ADMIN" || currentSession.role === "AGENCY_STAFF";

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/metrics");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (isSuperOrStaff) {
      loadMetrics();
    }
  }, [currentSession.role, isSuperOrStaff]);

  if (!isSuperOrStaff) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 bg-card border-border shadow-2xl">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/20 text-destructive flex items-center justify-center mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold">Access Denied by RBAC</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-2">
            The Agency Super-Admin command center is strictly restricted to Super Admin and Agency Staff roles. Current session role: <code className="font-mono text-primary">{currentSession.role}</code>.
          </CardDescription>
          <div className="pt-4 flex justify-center">
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                Return to Client Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalClients: 3,
    totalCreditsSold: 100000,
    totalMrrInr: 12497,
    totalLeadsProcessed: 28,
    activeAutomationsCount: 6,
    healthStatus: "100% Operational",
  };

  const clients = data?.clients || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-10 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shadow-lg">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Agency Super-Admin Command</h1>
              <Badge variant="warning" className="text-[10px]">
                Super-Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-level control layer across all tenant organizations, billing revenue, and automation engines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              Open Client View
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="text-xs gap-1.5 font-semibold">
              + Onboard New Business
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Agency KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Client Organizations
            </span>
            <Building className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-black">{metrics.totalClients}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Multi-tenant isolated fleet</div>
        </Card>

        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cumulative Credits Sold
            </span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black">{formatInr(metrics.totalCreditsSold)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">100% upfront prepaid revenue</div>
        </Card>

        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Active MRR
            </span>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-3xl font-black">{formatInr(metrics.totalMrrInr)}/mo</div>
          <div className="text-[11px] text-muted-foreground mt-1">Automated retainer deductions</div>
        </Card>

        <Card className="bg-card/75 border-border/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Underlying n8n Fleet Health
            </span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">100% Operational</div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {metrics.activeAutomationsCount} active workflows running
          </div>
        </Card>
      </div>

      {/* Client Fleet Management Table (BRD Section 1 & Section 4.2) */}
      <Card className="bg-card/75 border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Client Fleet Portfolio</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Inspect any client organization, view their prepaid balances, and switch context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Organization Name</th>
                  <th className="p-3">Industry & City</th>
                  <th className="p-3">Website Status</th>
                  <th className="p-3">Active Automations</th>
                  <th className="p-3">Wallet Balance</th>
                  <th className="p-3 pr-4 text-right">Switch / Impersonate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {clients.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="p-3 pl-4 font-bold text-foreground">
                      <div>{c.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">ws_{c.slug}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <div className="capitalize">{c.industry}</div>
                      <div className="text-[10px]">{c.city || "India"}</div>
                    </td>
                    <td className="p-3">
                      {c.hasOwnWebsite ? (
                        <Badge variant="outline" className="text-[10px]">
                          Existing Website
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          1-Week Starter Website Brief
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 font-semibold">
                      {c.automations?.length || 0} deployed
                    </td>
                    <td className="p-3 font-mono font-bold text-foreground">
                      {formatInr(c.creditBalance)}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => {
                          setOrg(c.id, c.name, c.slug);
                          router.push("/dashboard");
                        }}
                      >
                        Enter Org <ExternalLink className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
