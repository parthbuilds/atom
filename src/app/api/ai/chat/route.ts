import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, message, role } = body;

    if (!orgId || !message) {
      return NextResponse.json({ error: "orgId and message are required" }, { status: 400 });
    }

    // 1. Fetch live workspace telemetry for grounding
    const [org, leads, automations] = await Promise.all([
      db.organization.findUnique({
        where: { id: orgId },
        include: { voiceConfig: true },
      }),
      db.lead.findMany({
        where: { orgId },
        select: { id: true, name: true, status: true, relationshipStage: true, source: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      db.orgAutomation.findMany({
        where: { orgId },
        include: { catalogItem: true },
      }),
    ]);

    const orgName = org?.name || "Your Organization";
    const balance = org?.creditBalance ?? 8450;
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length;
    const bookedLeads = leads.filter((l) => l.status === "BOOKED" || l.relationshipStage === "BOOKED").length;
    const activeAutomations = automations.filter((a) => a.status === "ACTIVE").length;

    const lower = (message || "").toLowerCase();
    let reply = "";
    let actions: Array<{ label: string; action: string; href?: string }> = [];

    if (lower.includes("balance") || lower.includes("credit") || lower.includes("wallet") || lower.includes("recharge") || lower.includes("top up") || lower.includes("pricing")) {
      const isLow = balance < 1000;
      reply = `### 💳 Wallet & Credit Telemetry\n\nYour current active balance is **₹${balance.toLocaleString("en-IN")}** for **${orgName}**.\n\n` +
        `• **WhatsApp Qualifier:** ₹0.18 per message\n` +
        `• **Sarvam AI Hinglish Voice:** ₹2.40 per minute\n` +
        `• **Status:** ${isLow ? "⚠️ **Low Balance Warning!** Please recharge to prevent automations from pausing." : "✅ **Healthy operational reserve.**"}\n\n` +
        `Need to add credits? Use the quick 1-tap top-up below.`;
      actions = [
        { label: "💳 Top Up Wallet Now", action: "open_topup" },
        { label: "📊 View Billing History", action: "navigate", href: "/billing" },
      ];
    } else if (lower.includes("lead") || lower.includes("crm") || lower.includes("inbound") || lower.includes("simulate") || lower.includes("test lead") || lower.includes("qualification")) {
      reply = `### 👥 CRM & Lead Pipeline Status\n\n**${orgName}** currently has **${totalLeads} total inquiries** recorded in your CRM:\n\n` +
        `• **Qualified Leads:** ${qualifiedLeads}\n` +
        `• **Booked Appointments:** ${bookedLeads}\n` +
        `• **Conversion Rate:** ${totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0}%\n\n` +
        `Would you like to simulate a new inbound lead through the WhatsApp qualifier pipeline?`;
      actions = [
        { label: "✨ Simulate Test Inbound Lead", action: "test_lead" },
        { label: "📋 Open Unified CRM Hub", action: "navigate", href: "/crm" },
      ];
    } else if (lower.includes("voice") || lower.includes("sarvam") || lower.includes("call") || lower.includes("maya") || lower.includes("phone") || lower.includes("telephony")) {
      const vConfig = org?.voiceConfig;
      reply = `### 🎙️ Sarvam AI Hinglish Voice Agent\n\n` +
        `• **Agent Voice:** Maya (${vConfig?.language || "Hinglish"} Conversational)\n` +
        `• **Provider:** ${vConfig?.provider || "Sarvam AI (Saaras Model)"}\n` +
        `• **Calling Hours:** ${vConfig?.callingHours || "10:00 AM - 07:00 PM IST"}\n` +
        `• **Engine Latency:** <180ms First-Token Synthesizer\n` +
        `• **Target Status Trigger:** ${vConfig?.targetStatus || "QUALIFIED"}\n\n` +
        `Maya automatically calls qualified leads within 3 minutes of qualification to lock in calendar appointment slots.`;
      actions = [
        { label: "🎙️ Open Voice Studio", action: "navigate", href: "/voice-agent" },
        { label: "✨ Test Simulated Lead", action: "test_lead" },
      ];
    } else if (lower.includes("whatsapp") || lower.includes("meta") || lower.includes("cloud api") || lower.includes("webhook") || lower.includes("connect")) {
      reply = `### 📱 WhatsApp Cloud API Integration\n\n` +
        `Atom integrates directly with the official **Meta Cloud API**:\n\n` +
        `1. **Webhook Processing:** Inbound customer chats are processed in <1.2s.\n` +
        `2. **Intent Qualification:** Qualifies budget, location, and requirement before booking.\n` +
        `3. **CRM Sync:** Contacts and conversation transcripts sync instantaneously to your local table.\n\n` +
        `You can verify or update your WhatsApp number credentials in your settings.`;
      actions = [
        { label: "⚙️ Integration Settings", action: "navigate", href: "/settings" },
        { label: "🤖 View Active Automations", action: "navigate", href: "/automations" },
      ];
    } else if (lower.includes("website") || lower.includes("custom") || lower.includes("1-week") || lower.includes("design") || lower.includes("bespoke") || lower.includes("software")) {
      reply = `### ⚡ 1-Week Digital Flagship & Custom Software\n\n` +
        `Along with autonomous 24/7 AI agents, our human engineering team at **Synthio** builds bespoke software and 1-week digital flagships for Atom clients:\n\n` +
        `• **1-Week Website Sprint:** Custom 60fps Next.js 16 high-conversion site built from your onboarding brief.\n` +
        `• **Bespoke Software Requests:** Proprietary ERP connectors, custom n8n workflows, and specialized database architecture.\n\n` +
        `Track delivery progress in your Client Delivery Portal anytime.`;
      actions = [
        { label: "📁 Client Delivery Projects", action: "navigate", href: "/projects" },
        { label: "📚 View Architecture Docs", action: "navigate", href: "/docs" },
      ];
    } else if (lower.includes("rbac") || lower.includes("role") || lower.includes("permission") || lower.includes("access") || lower.includes("owner") || lower.includes("admin")) {
      reply = `### 🛡️ Multi-Tenant RBAC Matrix\n\n` +
        `You are currently logged in as **${role?.replace(/_/g, " ") || "Client Owner"}**.\n\n` +
        `• **Super Admin:** Global tenant fleet control, ARR/MRR metrics, template catalog.\n` +
        `• **Agency Staff:** Client onboarding assistance, system tuning, support triage.\n` +
        `• **Client Owner:** Full workspace control, credit wallet management, billing.\n` +
        `• **Team Member:** View leads, monitor bots, manual CRM follow-up.\n` +
        `• **Viewer:** Read-only visibility into reports & analytics.`;
      actions = [
        { label: "⚙️ Security & Settings", action: "navigate", href: "/settings" },
        { label: "📚 View Full RBAC Matrix", action: "navigate", href: "/docs#rbac" },
      ];
    } else {
      reply = `### ⚛️ Proton Intelligence Core\n\n` +
        `I am **Proton**, your autonomous operations assistant for **${orgName}**.\n\n` +
        `I can assist you with:\n` +
        `• **Checking Real-time Telemetry:** CPL, lead count (${totalLeads}), and credit balance (₹${balance.toLocaleString("en-IN")})\n` +
        `• **Simulating Customer Traffic:** Instantly trigger test inbound leads to preview WhatsApp/Voice workflows\n` +
        `• **Voice Agent Tuning:** Sarvam AI Hinglish telephony latency and Maya prompt guidance\n` +
        `• **Troubleshooting & Docs:** Fast answers on integrations, RBAC permissions, and webhooks\n\n` +
        `What would you like to explore?`;
      actions = [
        { label: "✨ Test Simulated Lead", action: "test_lead" },
        { label: "💳 Check Wallet Balance", action: "check_balance" },
        { label: "🎙️ Maya Voice Agent Setup", action: "navigate", href: "/voice-agent" },
        { label: "📋 Open CRM Leads Hub", action: "navigate", href: "/crm" },
      ];
    }

    return NextResponse.json({
      success: true,
      reply,
      actions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Proton AI error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
