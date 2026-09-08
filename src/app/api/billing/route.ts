import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasPermission, Role } from "@/lib/auth/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId") || "org-apex-realty";
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;

    const allowed = await hasPermission(role, "billing:read");
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized for billing:read" }, { status: 403 });
    }

    const org = await db.organization.findUnique({
      where: { id: orgId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Auto low-balance threshold (INR 500)
    const isLowBalance = org.creditBalance < 500;

    return NextResponse.json({
      creditBalance: org.creditBalance,
      isLowBalance,
      lowBalanceThreshold: 500,
      transactions: org.transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = (req.cookies.get("atom_role")?.value || "CLIENT_OWNER") as Role;
    const body = await req.json();
    const { action, orgId, amountInr, description, razorpayPaymentId } = body;

    if (action === "topup") {
      const allowed = await hasPermission(role, "billing:write");
      if (!allowed) {
        return NextResponse.json({ error: "Unauthorized for billing:write" }, { status: 403 });
      }

      const amount = Number(amountInr);
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
      }

      // 1. Increment organization credit balance
      const updatedOrg = await db.organization.update({
        where: { id: orgId },
        data: {
          creditBalance: { increment: amount },
        },
      });

      // 2. Create transaction record
      const txn = await db.transaction.create({
        data: {
          orgId,
          amountInr: amount,
          type: "TOPUP",
          description: description || `Credits Top-up via Razorpay (UPI/Card)`,
          reference: razorpayPaymentId || `pay_rzp_${Date.now().toString(36)}`,
          status: "SUCCESS",
        },
      });

      // 3. Notification
      await db.notification.create({
        data: {
          orgId,
          title: "Wallet Top-up Successful",
          message: `₹${amount.toLocaleString()} was added to your wallet. New balance: ₹${updatedOrg.creditBalance.toLocaleString()}.`,
          type: "LOW_BALANCE",
        },
      });

      return NextResponse.json({
        success: true,
        newBalance: updatedOrg.creditBalance,
        transaction: txn,
      });
    }

    if (action === "deduct_usage") {
      // Simulate credit usage from WhatsApp conversation or Voice AI minute
      const amount = Number(amountInr);
      const org = await db.organization.findUnique({ where: { id: orgId } });
      if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

      const newBalance = org.creditBalance - amount;
      await db.organization.update({
        where: { id: orgId },
        data: { creditBalance: newBalance },
      });

      const txn = await db.transaction.create({
        data: {
          orgId,
          amountInr: -amount,
          type: "DEDUCTION_USAGE",
          description: description || "Automated usage deduction",
          status: "SUCCESS",
        },
      });

      // Check auto low-balance alert rule (BRD Section 9.6)
      if (newBalance < 500) {
        await db.notification.create({
          data: {
            orgId,
            title: "⚠️ Low Credit Alert",
            message: `Your balance is ₹${newBalance}. Please top up immediately to prevent your WhatsApp & Voice automations from pausing.`,
            type: "LOW_BALANCE",
          },
        });
      }

      return NextResponse.json({ success: true, newBalance, transaction: txn });
    }

    return NextResponse.json({ error: "Unknown billing action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
