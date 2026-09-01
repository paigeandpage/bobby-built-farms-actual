"use client";

import { useEffect, useState } from "react";
import { Gift, Copy, Check, Share2 } from "lucide-react";

/**
 * Self-contained, account-only widget that renders the "Refer a
 * friend, get $5" panel. Owns its own data-fetch against
 * `/api/referrals/me` so the parent /account server component
 * doesn't need to know about referral schema details.
 *
 * We deliberately do the fetch client-side (rather than wiring it
 * into the parent page's server fetch waterfall) because the panel
 * is below-the-fold informational content — keeping it off the
 * critical path means a slow Clerk lookup or DB hop on the referral
 * code can never delay first paint of the orders list.
 */

interface RewardCoupon {
  id: string;
  code: string;
  amountCents: number;
  reason: string;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ReferralPayload {
  code: string;
  url: string;
  discountCents: number;
  discountLabel: string;
  stats: {
    completedReferrals: number;
    pendingReferrals: number;
    totalEarnedCents: number;
    activeRewardCount: number;
  };
  rewards: RewardCoupon[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function ReferralPanel() {
  const [data, setData] = useState<ReferralPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    setShareSupported(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/referrals/me", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as ReferralPayload;
        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      // Reset the "Copied!" label after a beat so the user can copy
      // again without thinking about it.
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail on insecure contexts / blocked permissions.
      // The link is selectable manually as a fallback.
    }
  };

  const handleShare = async () => {
    if (!data) return;
    try {
      await navigator.share({
        title: "Bobby Built Farms",
        text: `Try Bobby Built Farms' pasture-raised chicken — use my link for ${data.discountLabel} off your first order.`,
        url: data.url,
      });
    } catch {
      // User cancelled the share sheet — silently ignore.
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="h-5 w-44 bg-brand-cream rounded animate-pulse mb-3" />
        <div className="h-4 w-full max-w-md bg-brand-cream rounded animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-brand-cream rounded animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h2 className="font-display text-2xl text-brand-charcoal flex items-center gap-2">
            <Gift size={18} className="text-brand-green" aria-hidden="true" />
            Refer a friend
          </h2>
          <p className="text-sm text-brand-charcoal/60 mt-1 leading-relaxed">
            They get <strong className="text-brand-charcoal">{data.discountLabel} off</strong>{" "}
            their first order. You earn{" "}
            <strong className="text-brand-charcoal">{data.discountLabel} off</strong>{" "}
            your next one — auto-applied at checkout.
          </p>
        </div>
        {data.stats.activeRewardCount > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-brand-charcoal/55 uppercase tracking-wider font-semibold">
              Ready to use
            </p>
            <p className="font-display text-2xl text-brand-green">
              {formatCents(
                data.stats.activeRewardCount * data.discountCents
              )}
            </p>
          </div>
        )}
      </div>

      {/* Share link block */}
      <div className="bg-brand-cream/60 border border-brand-cream-dark rounded-xl p-4 mb-4">
        <p className="text-xs text-brand-charcoal/55 uppercase tracking-wider font-semibold mb-2">
          Your referral link
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            value={data.url}
            onFocus={(e) => e.target.select()}
            className="flex-1 min-w-0 bg-white border border-brand-cream-dark rounded-lg px-3 py-2 text-sm text-brand-charcoal/80 font-mono"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-semibold hover:bg-brand-green-dark transition-colors shrink-0 cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          {shareSupported && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-brand-green text-brand-green rounded-lg text-sm font-semibold hover:bg-brand-green hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <Share2 size={14} />
              Share
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-brand-cream/40 rounded-xl p-3 text-center">
          <p className="font-display text-xl text-brand-charcoal">
            {data.stats.completedReferrals}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brand-charcoal/55 mt-0.5">
            Friends joined
          </p>
        </div>
        <div className="bg-brand-cream/40 rounded-xl p-3 text-center">
          <p className="font-display text-xl text-brand-charcoal">
            {data.stats.pendingReferrals}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brand-charcoal/55 mt-0.5">
            Pending
          </p>
        </div>
        <div className="bg-brand-cream/40 rounded-xl p-3 text-center">
          <p className="font-display text-xl text-brand-green">
            {formatCents(data.stats.totalEarnedCents)}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brand-charcoal/55 mt-0.5">
            Earned
          </p>
        </div>
      </div>

      {/* Reward coupon list */}
      {data.rewards.length > 0 && (
        <div>
          <p className="text-xs text-brand-charcoal/55 uppercase tracking-wider font-semibold mb-2">
            Your rewards
          </p>
          <div className="space-y-2">
            {data.rewards.map((r) => {
              const isRedeemed = !!r.redeemedAt;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                    isRedeemed
                      ? "border-brand-cream-dark bg-brand-cream/30 text-brand-charcoal/55"
                      : "border-brand-green/30 bg-brand-green/5 text-brand-charcoal"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <code className="font-mono text-xs px-2 py-1 rounded bg-white border border-brand-cream-dark text-brand-charcoal">
                      {r.code}
                    </code>
                    <span className="font-semibold">
                      {formatCents(r.amountCents)} off
                    </span>
                  </div>
                  <span
                    className={`text-xs shrink-0 ${
                      isRedeemed
                        ? "text-brand-charcoal/45"
                        : "text-brand-green"
                    }`}
                  >
                    {isRedeemed
                      ? `Used ${new Date(r.redeemedAt!).toLocaleDateString()}`
                      : r.expiresAt
                      ? `Expires ${new Date(r.expiresAt).toLocaleDateString()}`
                      : "Ready"}
                  </span>
                </div>
              );
            })}
          </div>
          {data.stats.activeRewardCount > 0 && (
            <p className="text-xs text-brand-charcoal/55 mt-3 leading-relaxed">
              Your oldest unused reward auto-applies the next time you check
              out. No code to type in.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
