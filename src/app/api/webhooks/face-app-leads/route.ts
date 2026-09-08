import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Dedicated Inbound Webhook for Face App / AI Lead Scanner / Ad Campaigns
 * Accepts JSON payloads from Face App, Meta Lead Ads, or customized web capture flows.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId,
      name,
      phone,
      email,
      campaignName,
      faceScanId,
      faceAestheticScore,
      notes,
      source,
    } = body;

    // Default to active client organization if not passed in query/body
    const targetOrgId =
      orgId ||
      req.nextUrl.searchParams.get("orgId") ||
      "org-apex-realty";

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required for inbound lead ingestion" },
        { status: 400 }
      );
    }

    const org = await db.organization.findUnique({ where: { id: targetOrgId } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if lead already exists
    let lead = await db.lead.findFirst({
      where: { orgId: targetOrgId, phone },
    });

    const leadSource = source || "Face App AI Lead Inbound";
    const leadNotes = notes || (faceScanId ? `Face Scan ID: ${faceScanId}. Campaign: ${campaignName || "General"}` : "Inbounded via Face App ad capture.");
    const tags = ["Face App Lead", campaignName || "Ad Campaign", "High-Intent"];

    if (lead) {
      // Append activity to existing lead
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "MESSAGE",
          title: "Face App Re-engagement Inbound",
          payload: JSON.stringify({
            source: leadSource,
            campaignName,
            faceScanId,
            timestamp: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json({
        success: true,
        action: "updated_existing",
        leadId: lead.id,
        message: `Lead ${lead.name} (${phone}) re-engaged from Face App.`,
      });
    }

    // Create brand-new lead in the client's CRM
    lead = await db.lead.create({
      data: {
        orgId: targetOrgId,
        name: name || "Face App Prospect",
        phone,
        email: email || null,
        notes: leadNotes,
        source: leadSource,
        tags: JSON.stringify(tags),
        status: "NEW",
        relationshipStage: "FIRST_CONTACT",
      },
    });

    // Create Initial Activity
    await db.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "MESSAGE",
        title: "Face App AI Lead Captured",
        payload: JSON.stringify({
          source: leadSource,
          campaignName,
          faceScanId,
          faceAestheticScore: faceAestheticScore || null,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Create Notification in CRM
    await db.notification.create({
      data: {
        orgId: targetOrgId,
        title: "⚡ Face App Lead Inbounded!",
        message: `${lead.name} (${lead.phone}) just captured via Face App AI. Instant follow-up bot triggered.`,
        type: "LEAD",
      },
    });

    return NextResponse.json(
      {
        success: true,
        action: "created_new",
        leadId: lead.id,
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
