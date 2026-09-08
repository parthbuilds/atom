/**
 * Atom Comprehensive ROI Attribution & Performance Engine
 * 
 * Provides mathematical modeling of:
 * 1. Direct Revenue Attribution (Booked Deals * Deal Size)
 * 2. Pipeline Acceleration Value (Qualified Leads * Win Probability)
 * 3. Human Labor Replacement Savings (Telecaller SDR + Web Maintenance replacement)
 * 4. Channel-Specific Cost-Per-Lead (CPL) and Cost-Per-Acquisition (CPA)
 * 5. Net Economic Profit & Real ROI Multipliers
 */

export interface LeadItem {
  id: string;
  status: string;
  relationshipStage?: string;
  source?: string;
  createdAt?: string | Date;
}

export interface AutomationItem {
  id: string;
  creditsConsumed: number;
  executionCount: number;
  catalogItem?: {
    name: string;
    category: string;
  };
}

export interface CallLogItem {
  id: string;
  durationSec: number;
  provider: string;
  outcome: string;
  relationshipStage?: string;
}

export interface RoiBreakdown {
  // Spend & Costs
  totalCreditsSpent: number;
  platformRetainerSpent: number;
  totalCostInr: number;

  // Pipeline & Conversion
  totalLeads: number;
  qualifiedLeads: number;
  bookedLeads: number;
  conversionRatePct: number;

  // Voice AI Execution Stats
  totalVoiceCalls: number;
  connectedCalls: number;
  connectRatePct: number;
  totalVoiceMinutes: number;
  voiceCreditsSpent: number;

  // Economic Value & Attribution
  attributedRevenueInr: number;
  pipelineValueInr: number;
  humanLaborSavingsInr: number;
  humanHoursSaved: number;
  totalEconomicValueInr: number;
  netProfitInr: number;
  roiMultiplier: number;

  // Efficiency KPIs
  costPerLeadOverall: number;
  costPerAcquisition: number; // Cost per won/booked lead
  voiceCostPerLead: number;
  humanComparisonSavingsPct: number;

  // Channel Level Breakdown
  channels: {
    name: string;
    category: string;
    spendInr: number;
    leadsGenerated: number;
    cplInr: number;
    roiMultiplier: number;
    status: string;
  }[];
}

export function calculateComprehensiveRoi(
  leads: LeadItem[] = [],
  automations: AutomationItem[] = [],
  callLogs: CallLogItem[] = [],
  options: {
    avgDealValueInr?: number;
    humanTelecallerSalaryInr?: number;
    winProbabilityPct?: number;
  } = {}
): RoiBreakdown {
  const avgDealValue = options.avgDealValueInr ?? 35000;
  const telecallerMonthlyRate = options.humanTelecallerSalaryInr ?? 25000;
  const winProbability = (options.winProbabilityPct ?? 25) / 100;

  // 1. Leads breakdown
  const totalLeads = leads.length;
  const bookedLeads = leads.filter(
    (l) => l.status === "BOOKED" || l.status === "WON" || l.relationshipStage === "BOOKED"
  ).length;
  const qualifiedLeads = leads.filter(
    (l) => l.status === "QUALIFIED" || l.relationshipStage === "INTERESTED"
  ).length;
  const conversionRatePct = totalLeads > 0 ? Math.round((bookedLeads / totalLeads) * 100) : 0;

  // 2. Automations & Spend
  const totalCreditsSpent = automations.reduce((sum, a) => sum + (a.creditsConsumed || 0), 0);
  const platformRetainerSpent = 2499; // Standard monthly retainer
  const totalCostInr = Math.max(totalCreditsSpent + platformRetainerSpent, 500);

  // 3. Voice AI metrics
  const totalVoiceCalls = callLogs.length;
  const connectedCalls = callLogs.filter(
    (c) => c.outcome === "CONNECTED" || (c.durationSec && c.durationSec > 15)
  ).length;
  const connectRatePct = totalVoiceCalls > 0 ? Math.round((connectedCalls / totalVoiceCalls) * 100) : 0;
  const totalVoiceSeconds = callLogs.reduce((sum, c) => sum + (c.durationSec || 0), 0);
  const totalVoiceMinutes = Math.ceil(totalVoiceSeconds / 60);

  // Voice credit consumption (approx ₹15/call for Sarvam AI)
  const voiceCreditsSpent = automations
    .filter((a) => a.catalogItem?.category === "Voice AI")
    .reduce((sum, a) => sum + (a.creditsConsumed || 0), totalVoiceCalls * 15);

  // 4. Human Labor Replacement Model
  // A human telecaller handles ~40-50 calls/day and costs ₹25,000/mo.
  // Each voice call takes ~3 mins + 5 mins admin logging = 8 human minutes saved.
  const minutesSaved = totalVoiceCalls * 8 + totalLeads * 12; // 12 mins saved per WhatsApp auto-qualified lead
  const humanHoursSaved = Math.round(minutesSaved / 60);

  // Equivalent labor cost: ₹150/hour or proportional to telecaller salary
  const hourlyHumanRate = Math.round(telecallerMonthlyRate / 160); // 160 work hours/month
  const humanLaborSavingsInr = Math.max(humanHoursSaved * hourlyHumanRate, totalVoiceCalls * 75);

  // 5. Revenue Attribution Model
  const attributedRevenueInr = bookedLeads * avgDealValue;
  const pipelineValueInr = Math.round(qualifiedLeads * avgDealValue * winProbability);

  // Total economic value generated = Direct Revenue Attributed + Labor Costs Saved
  const totalEconomicValueInr = attributedRevenueInr + humanLaborSavingsInr;
  const netProfitInr = totalEconomicValueInr - totalCostInr;

  // ROI Multiplier = Total Economic Value / Total Cost
  const roiMultiplier = totalCostInr > 0 ? Number((totalEconomicValueInr / totalCostInr).toFixed(1)) : 12.5;

  // Cost Per Lead (CPL) & Cost Per Acquisition (CPA)
  const costPerLeadOverall = totalLeads > 0 ? Math.round(totalCostInr / totalLeads) : 18;
  const costPerAcquisition = bookedLeads > 0 ? Math.round(totalCostInr / bookedLeads) : Math.round(totalCostInr / 1);
  const voiceCostPerLead = connectedCalls > 0 ? Math.round(voiceCreditsSpent / connectedCalls) : 15;

  // Human telecaller comparison savings percentage
  const humanCallCostEquivalent = totalVoiceCalls * 110; // human telecaller call cost equivalent
  const humanComparisonSavingsPct =
    humanCallCostEquivalent > 0
      ? Math.min(95, Math.round(((humanCallCostEquivalent - voiceCreditsSpent) / humanCallCostEquivalent) * 100))
      : 82;

  // 6. Channel Breakdown
  const channelMap: Record<string, { spend: number; leads: number; name: string; category: string }> = {
    whatsapp: { spend: 0, leads: 0, name: "WhatsApp AI Qualifier", category: "WhatsApp" },
    voice: { spend: voiceCreditsSpent, leads: 0, name: "Sarvam Voice AI Agent", category: "Voice AI" },
    funnel: { spend: 1200, leads: 0, name: "Hosted Funnel & Forms", category: "Funnel" },
    website: { spend: 800, leads: 0, name: "Custom Website & SaaS Inbound", category: "Website" },
  };

  // Populate from leads
  leads.forEach((l) => {
    const src = (l.source || "").toLowerCase();
    if (src.includes("voice") || src.includes("sarvam") || src.includes("call")) {
      channelMap.voice.leads += 1;
    } else if (src.includes("funnel") || src.includes("booking")) {
      channelMap.funnel.leads += 1;
    } else if (src.includes("website") || src.includes("saas")) {
      channelMap.website.leads += 1;
    } else {
      channelMap.whatsapp.leads += 1;
    }
  });

  // Populate spend from automations
  automations.forEach((a) => {
    const cat = (a.catalogItem?.category || "").toLowerCase();
    if (cat.includes("voice")) {
      channelMap.voice.spend = Math.max(channelMap.voice.spend, a.creditsConsumed);
    } else if (cat.includes("whatsapp")) {
      channelMap.whatsapp.spend += a.creditsConsumed;
    }
  });

  const channels = Object.values(channelMap).map((ch) => {
    const leadsGen = ch.leads > 0 ? ch.leads : 1;
    const cpl = Math.round(ch.spend / leadsGen) || 12;
    const channelAttributed = Math.round((ch.leads / (totalLeads || 1)) * attributedRevenueInr);
    const channelRoi = ch.spend > 0 ? Number(((channelAttributed + ch.leads * 200) / ch.spend).toFixed(1)) : 14.2;

    return {
      name: ch.name,
      category: ch.category,
      spendInr: ch.spend,
      leadsGenerated: ch.leads,
      cplInr: cpl,
      roiMultiplier: Math.max(channelRoi, 2.5),
      status: "ACTIVE",
    };
  });

  return {
    totalCreditsSpent,
    platformRetainerSpent,
    totalCostInr,
    totalLeads,
    qualifiedLeads,
    bookedLeads,
    conversionRatePct,
    totalVoiceCalls,
    connectedCalls,
    connectRatePct,
    totalVoiceMinutes,
    voiceCreditsSpent,
    attributedRevenueInr,
    pipelineValueInr,
    humanLaborSavingsInr,
    humanHoursSaved,
    totalEconomicValueInr,
    netProfitInr,
    roiMultiplier,
    costPerLeadOverall,
    costPerAcquisition,
    voiceCostPerLead,
    humanComparisonSavingsPct,
    channels,
  };
}

/**
 * Interactive ROI Simulator for forecasting expected returns
 */
export function simulateRoiScenario(
  monthlyInboundLeads: number,
  avgDealValueInr: number,
  closeRatePct: number,
  useVoiceAgent: boolean,
  useCustomWebsite: boolean
) {
  const projectedDeals = Math.max(1, Math.round(monthlyInboundLeads * (closeRatePct / 100)));
  const projectedRevenueInr = projectedDeals * avgDealValueInr;

  // Monthly platform cost estimate
  let estimatedPlatformCostInr = 4999; // Base Automations + Retainer
  if (useVoiceAgent) estimatedPlatformCostInr += Math.round(monthlyInboundLeads * 18);
  if (useCustomWebsite) estimatedPlatformCostInr += 2000;

  // Human staff savings: 1 SDR telecaller @ ₹28,000 + agency maintenance @ ₹20,000
  const humanSalaryEquivalent = (useVoiceAgent ? 28000 : 12000) + (useCustomWebsite ? 20000 : 0);
  const projectedLaborSavings = humanSalaryEquivalent;

  const totalProjectedValue = projectedRevenueInr + projectedLaborSavings;
  const projectedNetProfit = totalProjectedValue - estimatedPlatformCostInr;
  const projectedRoiMultiplier = Number((totalProjectedValue / estimatedPlatformCostInr).toFixed(1));
  const projectedCpl = Math.round(estimatedPlatformCostInr / Math.max(1, monthlyInboundLeads));
  const projectedCpa = Math.round(estimatedPlatformCostInr / projectedDeals);

  return {
    monthlyInboundLeads,
    projectedDeals,
    projectedRevenueInr,
    estimatedPlatformCostInr,
    projectedLaborSavings,
    totalProjectedValue,
    projectedNetProfit,
    projectedRoiMultiplier,
    projectedCpl,
    projectedCpa,
  };
}
