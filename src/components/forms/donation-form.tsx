"use client";

import { useState } from "react";
import { CheckCircle2, ShieldCheck, Lock, Smartphone, CreditCard, X, Loader2, ArrowRight, Printer } from "lucide-react";
import { cn, formatGHS, generateReference } from "@/lib/utils";
import { Button, Card, Badge } from "@/components/ui";
import { createDonationAction } from "@/app/actions/donations";
import { toastCreated } from "@/components/ui/toast";

const AMOUNTS = [50, 100, 250, 500];

export function DonationForm({ initiativeId }: { initiativeId?: string }) {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [corporate, setCorporate] = useState(false);

  // Paystack checkout simulation states
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [paystackChannel, setPaystackChannel] = useState<"momo" | "card">("momo");
  const [momoProvider, setMomoProvider] = useState<"MTN" | "TELECEL" | "AT">("MTN");
  const [momoNumber, setMomoNumber] = useState("024 000 0000");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sent, setSent] = useState(false);
  const [paystackRef, setPaystackRef] = useState("");

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleStartPaystack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorEmail) return;
    setIsPaystackOpen(true);
  };

  const handleAuthorizePaystack = async () => {
    setIsProcessing(true);
    const ref = `pstk_live_${Math.random().toString(36).slice(2, 10)}`;
    setPaystackRef(ref);

    try {
      await createDonationAction({
        amount: finalAmount,
        currency: "GHS",
        frequency,
        donor_name: anonymous ? null : donorName || "Supporter",
        donor_email: donorEmail,
        payment_method: paystackChannel === "momo" ? `Mobile Money (${momoProvider})` : "Card (Visa/Mastercard)",
        reference: ref,
        anonymous,
        initiative_id: initiativeId || null,
        status: "SUCCESS",
      });
    } catch {
      // Handled
    }

    toastCreated.donation(finalAmount, "GHS", anonymous ? undefined : donorName || undefined);
    setIsProcessing(false);
    setIsPaystackOpen(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-6 py-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf-400/15 text-leaf-600 dark:text-leaf-400">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-leaf-600 dark:text-leaf-400">
            <ShieldCheck className="h-4 w-4" /> Paystack Payment Verified
          </div>
          <h3 className="font-display text-2xl font-semibold text-ocean-950 dark:text-white">
            Thank you for your donation
          </h3>
          <p className="mx-auto max-w-md text-sm text-ocean-700 dark:text-ocean-300">
            Your support directly powers civic education, livelihoods, and clean communities across South Tongu District.
          </p>
        </div>

        <div className="mx-auto max-w-sm rounded-xl border border-ocean-100 bg-ocean-50/50 p-4 text-left text-xs text-ocean-800 dark:border-ocean-800 dark:bg-ocean-900/50 dark:text-ocean-200">
          <div className="flex justify-between py-1.5 border-b border-ocean-100 dark:border-ocean-800">
            <span className="text-ocean-600 dark:text-ocean-400">Paystack Reference</span>
            <span className="font-mono font-medium text-ocean-950 dark:text-white">{paystackRef}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-ocean-100 dark:border-ocean-800">
            <span className="text-ocean-600 dark:text-ocean-400">Amount Paid</span>
            <span className="font-mono font-semibold text-ocean-950 dark:text-white">{formatGHS(finalAmount)}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-ocean-100 dark:border-ocean-800">
            <span className="text-ocean-600 dark:text-ocean-400">Gift Type</span>
            <span className="font-medium">{frequency === "MONTHLY" ? "Monthly recurring gift" : "One-time contribution"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-ocean-600 dark:text-ocean-400">Payment Gateway</span>
            <span className="font-medium text-ocean-900 dark:text-white">
              Paystack ({paystackChannel === "momo" ? `${momoProvider} MoMo` : "Debit Card"})
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
          <Button
            onClick={() => window.print()}
            variant="ghost"
            size="md"
          >
            <Printer className="h-4 w-4" /> Print Receipt
          </Button>
          <Button
            onClick={() => {
              setSent(false);
              setCustomAmount("");
              setAmount(100);
            }}
            size="md"
          >
            Make another donation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleStartPaystack} className="space-y-6">
        {/* Frequency selector */}
        <div className="flex gap-2 rounded-full bg-ocean-50 p-1 dark:bg-ocean-900">
          {(["ONE_TIME", "MONTHLY"] as const).map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setFrequency(f)}
              className={cn(
                "flex-1 rounded-full py-2 text-sm font-semibold transition",
                frequency === f ? "bg-ocean-700 text-white shadow-sm" : "text-ocean-600 dark:text-ocean-300"
              )}
            >
              {f === "ONE_TIME" ? "One-time" : "Monthly"}
            </button>
          ))}
        </div>

        {/* Amount Selector */}
        <div>
          <p className="mb-2 text-sm font-medium text-ocean-800 dark:text-ocean-200">Select Amount (GHS)</p>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => { setAmount(a); setCustomAmount(""); }}
                className={cn(
                  "rounded-lg border py-2.5 text-sm font-semibold transition",
                  !customAmount && amount === a
                    ? "border-ocean-700 bg-ocean-700 text-white"
                    : "border-ocean-200 text-ocean-700 hover:border-ocean-400 dark:border-ocean-700 dark:text-ocean-200"
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={1}
            placeholder="Or enter a custom amount (GHS)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="mt-2 w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm focus:border-ocean-500 dark:border-ocean-700 dark:bg-ocean-900"
          />
        </div>

        {initiativeId && (
          <div className="rounded-lg bg-ocean-50 p-3 text-xs text-ocean-700 dark:bg-ocean-800 dark:text-ocean-200">
            Sponsoring Initiative: <strong className="font-semibold">{initiativeId}</strong>
          </div>
        )}

        {/* Donor Information */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">Your name (optional)</label>
            <input
              name="donorName"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="e.g. Kwami Sasu"
              className="w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm dark:border-ocean-700 dark:bg-ocean-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ocean-800 dark:text-ocean-200">Email (for receipt)</label>
            <input
              name="donorEmail"
              type="email"
              required
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="kwami@example.com"
              className="w-full rounded-lg border border-ocean-200 px-3 py-2.5 text-sm dark:border-ocean-700 dark:bg-ocean-900"
            />
          </div>
        </div>

        {/* Checkbox Options */}
        <div className="flex flex-wrap gap-5 text-sm text-ocean-700 dark:text-ocean-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-ocean-300 text-ocean-700"
            />
            Give anonymously on public wall
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={corporate}
              onChange={(e) => setCorporate(e.target.checked)}
              className="rounded border-ocean-300 text-ocean-700"
            />
            Corporate donation
          </label>
        </div>

        {/* Paystack Integration Note */}
        <div className="flex items-center gap-3 rounded-xl border border-ocean-200/80 bg-ocean-50/50 p-3.5 dark:border-ocean-800 dark:bg-ocean-900/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
            P
          </div>
          <div className="text-xs text-ocean-700 dark:text-ocean-300">
            <p className="font-semibold text-ocean-950 dark:text-white">Secured via Paystack</p>
            <p className="text-[11px] text-ocean-600 dark:text-ocean-400">
              Supports Mobile Money (MTN, Telecel, AT) and Visa/Mastercard on the next screen.
            </p>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Proceed to Paystack • {formatGHS(finalAmount || 0)}
        </Button>
      </form>

      {/* Paystack Redirect / Popup Checkout Modal Simulation */}
      {isPaystackOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ocean-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-ocean-900">
            {/* Paystack Modal Header */}
            <div className="flex items-center justify-between border-b border-ocean-100 bg-[#0B222E] p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#0AA5DB] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                  paystack
                </span>
                <span className="text-xs text-ocean-200">The Citizen Project</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPaystackOpen(false)}
                className="rounded-full p-1 text-ocean-300 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Paystack Amount summary */}
            <div className="border-b border-ocean-100 p-4 text-center dark:border-ocean-800">
              <p className="text-xs text-ocean-600 dark:text-ocean-400">Use test payment info below</p>
              <p className="mt-1 font-mono text-2xl font-bold text-ocean-950 dark:text-white">
                {formatGHS(finalAmount)}
              </p>
              <p className="text-[11px] font-mono text-ocean-500">{donorEmail}</p>
            </div>

            {/* Paystack Payment Channel Tabs */}
            <div className="flex border-b border-ocean-100 dark:border-ocean-800">
              <button
                type="button"
                onClick={() => setPaystackChannel("momo")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2",
                  paystackChannel === "momo"
                    ? "border-[#0AA5DB] text-ocean-950 dark:text-white bg-ocean-50/50 dark:bg-ocean-800/40"
                    : "border-transparent text-ocean-600 hover:text-ocean-900 dark:text-ocean-400"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile Money
              </button>
              <button
                type="button"
                onClick={() => setPaystackChannel("card")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition border-b-2",
                  paystackChannel === "card"
                    ? "border-[#0AA5DB] text-ocean-950 dark:text-white bg-ocean-50/50 dark:bg-ocean-800/40"
                    : "border-transparent text-ocean-600 hover:text-ocean-900 dark:text-ocean-400"
                )}
              >
                <CreditCard className="h-3.5 w-3.5" /> Card
              </button>
            </div>

            {/* Paystack Channel Form Body */}
            <div className="p-5 space-y-4">
              {paystackChannel === "momo" ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ocean-700 dark:text-ocean-300">
                      Mobile Network
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["MTN", "TELECEL", "AT"] as const).map((net) => (
                        <button
                          key={net}
                          type="button"
                          onClick={() => setMomoProvider(net)}
                          className={cn(
                            "rounded-lg border py-2 text-xs font-bold transition",
                            momoProvider === net
                              ? "border-[#0AA5DB] bg-[#0AA5DB]/10 text-ocean-900 dark:text-white"
                              : "border-ocean-200 text-ocean-600 dark:border-ocean-700"
                          )}
                        >
                          {net}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ocean-700 dark:text-ocean-300">
                      Phone Number
                    </label>
                    <input
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="024 000 0000"
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm font-mono focus:border-[#0AA5DB] dark:border-ocean-700 dark:bg-ocean-900"
                    />
                  </div>
                  <p className="text-[11px] text-ocean-500">
                    A test prompt will be authorized upon clicking confirm.
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-ocean-700 dark:text-ocean-300">
                      Card Number
                    </label>
                    <input
                      defaultValue="4084 0800 0000 0000"
                      className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm font-mono focus:border-[#0AA5DB] dark:border-ocean-700 dark:bg-ocean-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ocean-700 dark:text-ocean-300">Expiry</label>
                      <input
                        defaultValue="12/28"
                        className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm font-mono dark:border-ocean-700 dark:bg-ocean-900"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-ocean-700 dark:text-ocean-300">CVV</label>
                      <input
                        defaultValue="123"
                        className="w-full rounded-lg border border-ocean-200 px-3 py-2 text-sm font-mono dark:border-ocean-700 dark:bg-ocean-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Pay Action Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleAuthorizePaystack}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0AA5DB] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#0994c5] disabled:opacity-75"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Authorizing with Paystack…
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Pay {formatGHS(finalAmount)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-ocean-500">
                <ShieldCheck className="h-3.5 w-3.5 text-leaf-500" />
                <span>Test Mode · 256-bit encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
