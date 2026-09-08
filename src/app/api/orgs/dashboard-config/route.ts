import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export interface DashboardConfig {
  showLeadsKpi: boolean;
  showAutomationsKpi: boolean;
  showVoiceKpi: boolean;
  showWalletKpi: boolean;
  showFunnelMetrics: boolean;
  showRecentLeads: boolean;
  showQuickSimulator: boolean;
  primaryGoal: "lead_capture" | "consultations" | "roi";
}

const defaultDashboardConfig: DashboardConfig = {
  showLeadsKpi: true,
  showAutomationsKpi: true,
  showVoiceKpi: true,
  showWalletKpi: true,
  showFunnelMetrics: true,
  showRecentLeads: true,
  showQuickSimulator: true,
  primaryGoal: "lead_capture",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId required" }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { themeTokens: true, name: true, slug: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    let config = defaultDashboardConfig;
    if (org.themeTokens) {
      try {
        const parsed = JSON.parse(org.themeTokens);
        if (parsed.dashboardWidgets) {
          config = { ...defaultDashboardConfig, ...parsed.dashboardWidgets };
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, config } = body;

    if (!orgId || !config) {
      return NextResponse.json({ error: "orgId and config required" }, { status: 400 });
    }

    const org = await db.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: "Org not found" }, { status: 404 });
    }

    let existingTokens: any = {};
    if (org.themeTokens) {
      try {
        existingTokens = JSON.parse(org.themeTokens);
      } catch {}
    }

    const updatedTokens = {
      ...existingTokens,
      dashboardWidgets: config,
    };

    await db.organization.update({
      where: { id: orgId },
      data: {
        themeTokens: JSON.stringify(updatedTokens),
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
