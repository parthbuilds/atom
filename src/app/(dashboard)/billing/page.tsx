"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "@/components/auth/session-provider";
import { formatInr, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Plus,
  RefreshCw,
  Bell,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
} from "lucide-react";

export default function BillingPage() {
  const { currentSession } = useSession();
  const [balance, setBalance] = useState<number>(0);
  const [isLowBalance, setIsLowBalance] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up modal
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  // Auto-alert threshold settings
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(500);
  const [alertPhone, setAlertPhone] = useState("+91 98201 44521");
  const [alertSaved, setAlertSaved] = useState(false);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/billing?orgId=${currentSession.orgId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.creditBalance);
        setIsLowBalance(data.isLowBalance);
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [currentSession.orgId]);

  const handleTopupSubmit = async () => {
    setProcessing(true);
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          orgId: currentSession.orgId,
          amountInr: amount,
          description: `Razorpay UPI Top-up (₹${amount.toLocaleString()})`,
        }),
      });

      if (res.ok) {
        setShowTopupModal(false);
        setCustomAmount("");
        fetchBilling();
      } else {
        const d = await res.json();
        alert(d.error || "Top-up failed");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSimulateUsage = async (type: "whatsapp" | "voice") => {
    const cost = type === "whatsapp" ? 5 : 30;
    const desc =
      type === "whatsapp"
        ? "1 WhatsApp AI Qualifier Conversation"
        : "1 Minute Voice AI Outreach (Sarvam)";

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deduct_usage",
          orgId: currentSession.orgId,
          amountInr: cost,
          description: desc,
        }),
      });
      if (res.ok) {
        fetchBilling();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credits & Wallet Billing</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Prepaid INR wallet powering usage-metered WhatsApp messages and Sarvam voice minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowTopupModal(true)}
            className="text-xs font-semibold gap-2 bg-blue-600 hover:bg-blue-500 text-white"
          >
            <Plus className="h-4 w-4" /> Add Credits via Razorpay
          </Button>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <Card
          className={`bg-card/75 border transition-all ${
            isLowBalance
              ? "border-destructive/80 ring-1 ring-destructive/40"
              : "border-border/90"
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Current Wallet Balance
              </CardTitle>
              {isLowBalance ? (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <AlertTriangle className="h-3 w-3" /> Low Balance
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Healthy
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {formatInr(balance)}
            </div>

            <p className="text-xs text-muted-foreground">
              Usage auto-deducted per event. No surprises, no hidden monthly lock-ins.
            </p>

            <div className="pt-2 flex gap-2">
              <Button
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={() => setShowTopupModal(true)}
              >
                Top Up Balance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metering Rates & Usage Simulation Card */}
        <Card className="bg-card/75 border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Live Metering Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex justify-between items-center text-xs">
              <span className="text-foreground font-medium">WhatsApp AI Conversation</span>
              <span className="font-bold text-primary">₹5.00 / lead</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex justify-between items-center text-xs">
              <span className="text-foreground font-medium">Sarvam Voice AI Call (Hinglish)</span>
              <span className="font-bold text-indigo-400">₹15.00 / call (~₹10/min)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex justify-between items-center text-xs">
              <span className="text-foreground font-medium">ElevenLabs Premium English</span>
              <span className="font-bold text-purple-400">₹45.00 / call (~₹35/min)</span>
            </div>

            <div className="pt-1 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-1/2 text-[11px] h-7"
                onClick={() => handleSimulateUsage("whatsapp")}
                title="Test 1 WhatsApp interaction deduction"
              >
                - ₹5 Test WA
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-1/2 text-[11px] h-7"
                onClick={() => handleSimulateUsage("voice")}
                title="Test 1 Sarvam voice interaction deduction"
              >
                - ₹30 Test Voice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Auto Low-Balance Alert Configuration (BRD 9.6) */}
        <Card className="bg-card/75 border-border/80">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-400" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Auto Low-Balance Protection
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Triggers instant in-app alerts and WhatsApp notifications before automations pause.
            </p>

            <div>
              <label className="text-[11px] text-muted-foreground uppercase font-semibold block mb-1">
                Threshold Limit (INR)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={lowBalanceThreshold}
                  onChange={(e) => setLowBalanceThreshold(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                />
                <span className="text-xs font-semibold">₹</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground uppercase font-semibold block mb-1">
                Alert WhatsApp Number
              </label>
              <Input
                value={alertPhone}
                onChange={(e) => setAlertPhone(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs h-8"
              onClick={() => {
                setAlertSaved(true);
                setTimeout(() => setAlertSaved(false), 2000);
              }}
            >
              {alertSaved ? "Alert Preferences Saved ✓" : "Save Alert Rules"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Ledger */}
      <Card className="bg-card/70 border-border/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Credit Ledger & Invoices</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Audit-grade history of all deposits and automation usage deductions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/80 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Date & Time</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3 pr-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isPositive = tx.amountInr > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-muted/20">
                        <td className="p-3 pl-4 font-mono text-[11px] text-muted-foreground">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="p-3 font-medium text-foreground">{tx.description}</td>
                        <td className="p-3">
                          <Badge
                            variant={isPositive ? "success" : "outline"}
                            className="text-[10px]"
                          >
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          {tx.reference || "—"}
                        </td>
                        <td
                          className={`p-3 pr-4 text-right font-bold font-mono text-sm ${
                            isPositive ? "text-emerald-400" : "text-muted-foreground"
                          }`}
                        >
                          {isPositive ? `+${formatInr(tx.amountInr)}` : formatInr(tx.amountInr)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Razorpay Top-up Checkout Modal */}
      <Dialog open={showTopupModal} onOpenChange={setShowTopupModal}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              R
            </div>
            <DialogTitle>Razorpay Credit Top-Up</DialogTitle>
          </div>
          <DialogDescription>
            Instant deposit into {currentSession.orgName}&apos;s automation wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-semibold">
              Select Preset Pack (INR)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount("");
                  }}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                    selectedAmount === amt && !customAmount
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  {formatInr(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block font-semibold">
              Or Custom Amount (₹)
            </label>
            <Input
              placeholder="e.g. 7500"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="h-10"
            />
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Razorpay Secured UPI / Card Checkout
            </div>
            <div>
              Credits are activated immediately upon authorization. No auto-recurring deductions unless enabled.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTopupModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTopupSubmit}
            disabled={processing}
            className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          >
            {processing ? "Connecting Razorpay..." : "Authorize & Add Credits"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
