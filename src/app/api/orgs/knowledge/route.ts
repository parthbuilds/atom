import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "orgId is required" }, { status: 400 });
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, industry: true, themeTokens: true },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let knowledge = {
      markdownContent: `# ${org.name} - Business Knowledge Base\n\n## Overview\nWe provide premier ${org.industry} solutions tailored for high-intent clients.\n\n## Core Services & Pricing\n- Consultation & Audit: ₹1,500\n- Full Service Engagement: ₹25,000 - ₹75,000\n\n## Target Audience\nHomeowners, business executives, and qualified prospects seeking premium reliability.\n\n## Common Customer Questions & Objections\n1. What is your turnaround time? (Typically within 24-48 hours)\n2. Do you offer satisfaction guarantees? (Yes, 100% money back)\n\n## Desired Lead Qualification Criteria\n- Monthly budget > ₹20,000\n- Ready to initiate within the next 14 days`,
      lastUpdated: new Date().toISOString(),
      fileName: "business-context.md",
      aiDiagnosis: null,
    };

    if (org.themeTokens) {
      try {
        const parsed = JSON.parse(org.themeTokens);
        if (parsed.businessKnowledge) {
          knowledge = { ...knowledge, ...parsed.businessKnowledge };
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ success: true, knowledge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, markdownContent, fileName, aiDiagnosis } = body;

    if (!orgId || !markdownContent) {
      return NextResponse.json(
        { error: "orgId and markdownContent are required" },
        { status: 400 }
      );
    }

    const org = await db.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let existingTokens: any = {};
    if (org.themeTokens) {
      try {
        existingTokens = JSON.parse(org.themeTokens);
      } catch {}
    }

    const businessKnowledge = {
      markdownContent,
      fileName: fileName || "business-context.md",
      lastUpdated: new Date().toISOString(),
      aiDiagnosis: aiDiagnosis || existingTokens.businessKnowledge?.aiDiagnosis || null,
    };

    const updatedTokens = {
      ...existingTokens,
      businessKnowledge,
    };

    await db.organization.update({
      where: { id: orgId },
      data: {
        themeTokens: JSON.stringify(updatedTokens),
      },
    });

    return NextResponse.json({ success: true, knowledge: businessKnowledge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
