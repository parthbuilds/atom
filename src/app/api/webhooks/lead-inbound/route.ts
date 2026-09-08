import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Standard Internal Ingestion API for n8n workflows to push incoming leads.
 * Accepts: orgId, automationId, name, phone, email, notes, tags, rawMessage
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId,
      automationId,
      name,
      phone,
      email,
      notes,
      tags,
      source,
      incomingMessage,
    } = body;

    if (!orgId || !phone) {
      return NextResponse.json(
        { error: "orgId and phone are required" },
        { status: 400 }
      );
    }

    // Verify organization exists
    const org = await db.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if lead with this phone already exists in this org
    let lead = await db.lead.findFirst({
      where: { orgId, phone },
    });

    if (lead) {
      // Append activity to existing lead
      if (incomingMessage) {
        await db.leadActivity.create({
          data: {
            leadId: lead.id,
            type: "MESSAGE",
            title: "Incoming WhatsApp Follow-up",
            payload: JSON.stringify({
              sender: "lead",
              message: incomingMessage,
              timestamp: new Date().toISOString(),
            }),
          },
        });
      }
      return NextResponse.json({
        success: true,
        action: "updated_existing",
        leadId: lead.id,
      });
    }

    // Create new lead
    lead = await db.lead.create({
      data: {
        orgId,
        automationId: automationId || null,
        name: name || "Prospective Client",
        phone,
        email: email || null,
        notes: notes || null,
        source: source || "n8n Automation Flow",
        tags: tags ? JSON.stringify(tags) : JSON.stringify(["Automated"]),
        status: "NEW",
        relationshipStage: "FIRST_CONTACT",
      },
    });

    // Create activity
    if (incomingMessage) {
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "MESSAGE",
          title: "Initial Inbound Message",
          payload: JSON.stringify({
            sender: "lead",
            message: incomingMessage,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    // Trigger notification
    await db.notification.create({
      data: {
        orgId,
        title: "New Lead Captured",
        message: `${lead.name} (${lead.phone}) just inbounded via ${lead.source}.`,
        type: "LEAD",
      },
    });

    // Increment execution count on the automation if provided
    if (automationId) {
      await db.orgAutomation.updateMany({
        where: { orgId, automationId },
        data: {
          executionCount: { increment: 1 },
          lastRunAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { success: true, action: "created_new", leadId: lead.id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
