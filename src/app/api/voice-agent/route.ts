import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";

    let config = await db.voiceAgentConfig.findUnique({
      where: { orgId },
    });

    if (!config) {
      config = await db.voiceAgentConfig.create({
        data: {
          orgId,
          provider: "SARVAM",
          promptScript:
            "Namaste, I am Maya calling from your dedicated team. I noticed your interest in our latest offerings. Would you like me to reserve a VIP consultation slot for you with our senior advisor this weekend?",
          callingHours: "10:00 AM - 07:00 PM",
          targetStatus: "NEW",
          language: "Hindi + English (Hinglish)",
        },
      });
    }

    // Call logs
    const callLogs = await db.callLog.findMany({
      where: { orgId },
      include: { lead: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Voice Agent Performance Statistics & ROI Instrumentation
    const totalCalls = callLogs.length;
    const connectedCalls = callLogs.filter((c) => c.outcome === "CONNECTED").length;
    const connectionRatePct = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 78;

    const bookedCalls = callLogs.filter(
      (c) => c.relationshipStage === "BOOKED" || c.actionTaken === "APPOINTMENT_LOCKED"
    ).length;
    const bookingRatePct = totalCalls > 0 ? Math.round((bookedCalls / totalCalls) * 100) : 25;

    const totalDurationSec = callLogs.reduce((s, c) => s + (c.durationSec || 0), 0);
    const totalMinutes = Math.max(1, Math.round(totalDurationSec / 60));
    const avgDurationSec = totalCalls > 0 ? Math.round(totalDurationSec / totalCalls) : 95;

    const totalCreditsSpent = callLogs.reduce((s, c) => s + (c.costInr || 15), 0);
    const costPerCallInr = totalCalls > 0 ? Math.round(totalCreditsSpent / totalCalls) : 15;

    // Human telecaller comparison benchmark:
    // Avg SDR salary in India: ₹25,000/mo for 200 calls = ~₹125 per call
    const humanCostBenchmark = totalCalls * 125;
    const laborSavingsInr = Math.max(0, humanCostBenchmark - totalCreditsSpent);
    const hoursSaved = (totalDurationSec / 3600).toFixed(1);
    const voiceRoiMultiplier =
      totalCreditsSpent > 0 ? (humanCostBenchmark / totalCreditsSpent).toFixed(1) : "8.3";

    // Actions Breakdown ("What the voice agent did")
    const actionsTaken = {
      appointmentsLocked: callLogs.filter((c) => c.actionTaken === "APPOINTMENT_LOCKED").length,
      brochuresSent: callLogs.filter((c) => c.actionTaken === "BROCHURE_SENT").length,
      followupsQueued: callLogs.filter((c) => c.actionTaken === "FOLLOWUP_QUEUED").length,
      disqualified: callLogs.filter((c) => c.actionTaken === "DISQUALIFIED").length,
    };

    // Sentiment Breakdown
    const sentimentStats = {
      positive: callLogs.filter((c) => c.sentiment === "POSITIVE").length,
      neutral: callLogs.filter((c) => c.sentiment === "NEUTRAL" || !c.sentiment).length,
      negative: callLogs.filter((c) => c.sentiment === "NEGATIVE").length,
    };

    // By Provider Breakdown
    const sarvamCalls = callLogs.filter((c) => c.provider === "SARVAM").length;
    const elevenLabsCalls = callLogs.filter((c) => c.provider === "ELEVENLABS").length;

    const voiceStats = {
      totalCalls,
      connectedCalls,
      connectionRatePct,
      bookedCalls,
      bookingRatePct,
      totalMinutes,
      avgDurationSec,
      totalCreditsSpent,
      costPerCallInr,
      humanCostBenchmark,
      laborSavingsInr,
      hoursSaved,
      voiceRoiMultiplier,
      actionsTaken,
      sentimentStats,
      byProvider: {
        sarvamCalls,
        elevenLabsCalls,
      },
    };

    return NextResponse.json({ config, callLogs, voiceStats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const body = await req.json();
    const { action, orgId, provider, promptScript, callingHours, language, leadId } = body;

    // 1. Update config
    if (action === "update_config") {
      const allowed = await hasPermission(role, "automations:config");
      if (!allowed) {
        return NextResponse.json({ error: "Unauthorized for automations:config" }, { status: 403 });
      }

      const updated = await db.voiceAgentConfig.upsert({
        where: { orgId },
        update: {
          provider: provider || "SARVAM",
          promptScript,
          callingHours,
          language,
        },
        create: {
          orgId,
          provider: provider || "SARVAM",
          promptScript,
          callingHours,
          language,
        },
      });

      return NextResponse.json({ success: true, config: updated });
    }

    // 2. Simulate AI Voice Call Dispatch
    if (action === "simulate_call") {
      if (!leadId || !orgId) {
        return NextResponse.json({ error: "leadId and orgId are required" }, { status: 400 });
      }

      const lead = await db.lead.findUnique({ where: { id: leadId } });
      if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

      const callCost = provider === "ELEVENLABS" ? 45 : 15;
      const durationSec = Math.floor(Math.random() * 80) + 70; // 70 to 150 seconds

      let nextStage = lead.relationshipStage;
      let outcome = "CONNECTED";
      let sentiment = "POSITIVE";
      let actionTaken = "APPOINTMENT_LOCKED";
      let transcript = "";

      if (lead.relationshipStage === "FIRST_CONTACT") {
        nextStage = "WARMED";
        actionTaken = "BROCHURE_SENT";
        transcript = `AI [${provider || "SARVAM"}]: "Namaste ${lead.name}, Maya calling from your service team. I saw your interest in our latest solutions." Lead: "Yes, please send me the specs and pricing." AI: "Understood! I have dispatched the brochure directly to your WhatsApp."`;
      } else if (lead.relationshipStage === "WARMED") {
        nextStage = "INTERESTED";
        actionTaken = "FOLLOWUP_QUEUED";
        transcript = `AI [${provider || "SARVAM"}]: "Hi ${lead.name}, following up on the brochure we sent. Did you have any questions on pricing tiers?" Lead: "Yes, I need to consult my team this evening." AI: "Understood, I've queued a callback for tomorrow morning."`;
      } else {
        nextStage = "BOOKED";
        actionTaken = "APPOINTMENT_LOCKED";
        transcript = `AI [${provider || "SARVAM"}]: "Namaste ${lead.name}, checking to confirm our 15-minute consultation slot." Lead: "Yes, 11 AM works perfect." AI: "Locked in! Calendar pass and driver details dispatched."`;
      }

      // Record Call Log
      const callLog = await db.callLog.create({
        data: {
          leadId: lead.id,
          orgId,
          provider: provider || "SARVAM",
          durationSec,
          outcome,
          relationshipStage: nextStage,
          sentiment,
          costInr: callCost,
          actionTaken,
          transcriptSummary: transcript,
        },
      });

      // Update lead
      await db.lead.update({
        where: { id: lead.id },
        data: {
          relationshipStage: nextStage,
          status: nextStage === "BOOKED" ? "BOOKED" : "CONTACTED",
        },
      });

      // Add activity entry
      await db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: "CALL",
          title: `Voice AI Call Completed (${provider || "SARVAM"})`,
          payload: JSON.stringify({
            duration: `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
            stageUpdatedTo: nextStage,
            actionTaken,
            sentiment,
            transcript,
          }),
        },
      });

      // Deduct usage credits
      await db.organization.update({
        where: { id: orgId },
        data: { creditBalance: { decrement: callCost } },
      });

      await db.transaction.create({
        data: {
          orgId,
          amountInr: -callCost,
          type: "DEDUCTION_USAGE",
          description: `Voice Agent call to ${lead.name} (${provider || "Sarvam AI"} - ${Math.floor(durationSec / 60)}m ${durationSec % 60}s)`,
          status: "SUCCESS",
        },
      });

      return NextResponse.json({
        success: true,
        callLog,
        updatedStage: nextStage,
        deductedCredits: callCost,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
