"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionStatus } from "@prisma/client";
import { Repeat, AlertCircle } from "lucide-react";

interface Props {
  id: string;
  status: SubscriptionStatus;
  interval: string;
  intervalCount: number;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  itemSummary: string;
  totalEstimate: number;
}

const STATUS_BADGE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
  INCOMPLETE: "bg-brand-cream-dark text-brand-charcoal/60",
};

function formatCadence(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "Every month";
  if (interval === "week" && intervalCount === 2) return "Every 2 weeks";
  if (interval === "week" && intervalCount === 1) return "Every week";
  return `Every ${intervalCount} ${interval}${intervalCount === 1 ? "" : "s"}`;
}

export default function SubscriptionCard({
  id,
  status,
  interval,
  intervalCount,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  itemSummary,
  totalEstimate,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const callAction = async (action: "cancel" | "resume") => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${id}/${action}`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const isActive = status === "ACTIVE";
  const cadenceLabel = formatCadence(interval, intervalCount);
  const nextChargeLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Repeat
            size={18}
            className="text-brand-green shrink-0"
            aria-hidden="true"
          />
          <p className="font-medium text-brand-charcoal text-sm">
            {cadenceLabel} subscription
          </p>
        </div>
        <span
          className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold shrink-0 ${STATUS_BADGE[status]}`}
        >
          {status}
        </span>
      </div>

      <p className="text-xs text-brand-charcoal/55 leading-relaxed mb-3">
        {itemSummary}
      </p>

      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
        <div>
          <p className="uppercase tracking-wider text-brand-charcoal/40 mb-0.5">
            Per-delivery total
          </p>
          <p className="font-semibold text-brand-green text-sm">
            ~${totalEstimate.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="uppercase tracking-wider text-brand-charcoal/40 mb-0.5">
            {cancelAtPeriodEnd ? "Ends on" : "Next charge"}
          </p>
          <p className="font-medium text-brand-charcoal text-sm">
            {nextChargeLabel ?? "—"}
          </p>
        </div>
      </div>

      {cancelAtPeriodEnd && isActive && (
        <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 leading-relaxed mb-3">
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            Cancellation scheduled. Your subscription ends on{" "}
            {nextChargeLabel ?? "the end of this period"} — you won&rsquo;t be
            charged again unless you resume below.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {isActive && !cancelAtPeriodEnd && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          >
            Cancel subscription
          </button>
        )}

        {isActive && !cancelAtPeriodEnd && confirming && (
          <>
            <button
              type="button"
              onClick={() => callAction("cancel")}
              disabled={pending}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Cancelling…" : "Yes, cancel at period end"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-brand-cream-dark text-brand-charcoal/70 hover:bg-brand-cream-dark transition-colors cursor-pointer"
            >
              Keep subscription
            </button>
          </>
        )}

        {isActive && cancelAtPeriodEnd && (
          <button
            type="button"
            onClick={() => callAction("resume")}
            disabled={pending}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-brand-green text-white hover:bg-brand-green-dark transition-colors disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Resuming…" : "Resume subscription"}
          </button>
        )}
      </div>
    </div>
  );
}
