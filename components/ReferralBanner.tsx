"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";

/**
 * Cart-page banner that advertises whichever discount will be
 * auto-applied at checkout — either the friend-welcome from a
 * referral cookie, or the next reward coupon the signed-in user has
 * earned. Renders nothing when neither applies, so it's safe to drop
 * unconditionally above the checkout button.
 *
 * The actual discount is applied server-side in `/api/checkout`
 * (cookie + Clerk auth are read there). This banner is purely
 * informational; it never changes what the checkout API does.
 */

interface PreviewPayload {
  welcomeDiscount: { cents: number } | null;
  rewardDiscount: { cents: number } | null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function ReferralBanner() {
  const [data, setData] = useState<PreviewPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/referrals/preview", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as PreviewPayload;
        if (!cancelled) setData(json);
      } catch {
        // Fail silently — no banner is better than a broken banner.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  // Server applies friend-welcome first, then reward — mirror that
  // precedence so what we show is what the user actually gets.
  const applied = data.welcomeDiscount ?? data.rewardDiscount;
  if (!applied) return null;

  const isWelcome = !!data.welcomeDiscount;
  const label = formatCents(applied.cents);

  return (
    <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-4 mb-4 flex items-start gap-3">
      <Gift
        size={20}
        className="text-brand-green shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="text-sm text-brand-charcoal leading-relaxed flex-1">
        <p className="font-semibold text-brand-green">
          {label} off applied at checkout
        </p>
        <p className="text-brand-charcoal/75 text-xs mt-0.5">
          {isWelcome
            ? `Welcome! A friend referred you, so you're getting ${label} off your first order automatically.`
            : `Your referral reward is ready — ${label} comes off your total when you check out.`}
        </p>
      </div>
    </div>
  );
}
