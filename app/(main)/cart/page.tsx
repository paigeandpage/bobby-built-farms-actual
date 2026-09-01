"use client";

import { useCartStore, type SubscriptionFrequency } from "@/store/cart";
import Link from "next/link";
import { Trash2, ShoppingBag, MapPin, Repeat, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PICKUP_ADDRESS_LINE1,
  PICKUP_CITY_STATE_ZIP,
  PICKUP_MAP_URL,
} from "@/lib/pickup";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter";
import {
  PRICE_LOCK_DEADLINE_LABEL,
  PRICE_LOCK_DURATION_LABEL,
  isPriceLockActive,
} from "@/lib/subscription";
import ReferralBanner from "@/components/ReferralBanner";

const FREQUENCY_LABEL: Record<SubscriptionFrequency, string> = {
  "one-time": "One-time purchase",
  weekly: "Weekly",
  biweekly: "Twice a month",
  monthly: "Monthly",
};

const FREQUENCY_DESCRIPTION: Record<SubscriptionFrequency, string> = {
  "one-time": "Pay once. No recurring charges.",
  weekly: "Charged every week, on this same day.",
  biweekly: "Charged every 2 weeks (≈ twice a month).",
  monthly: "Charged once a month, on this same day.",
};

const FREQUENCY_CADENCE_PHRASE: Record<
  Exclude<SubscriptionFrequency, "one-time">,
  string
> = {
  weekly: "every week",
  biweekly: "every 2 weeks",
  monthly: "every month",
};

const FREQUENCY_SHORT_LABEL: Record<
  Exclude<SubscriptionFrequency, "one-time">,
  string
> = {
  weekly: "wk",
  biweekly: "2 wks",
  monthly: "mo",
};

export default function CartPage() {
  const {
    items,
    removeItem,
    updateCount,
    totalPrice,
    clearCart,
    subscriptionFrequency,
    subscriptionConsent,
    marketingConsent,
    setSubscriptionFrequency,
    setSubscriptionConsent,
    setMarketingConsent,
  } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSubscription = subscriptionFrequency !== "one-time";
  const blockedBySubscriptionConsent = isSubscription && !subscriptionConsent;
  const priceLockActive = isPriceLockActive();

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          subscriptionFrequency,
          subscriptionConsent,
          marketingConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) router.push(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen flex items-center justify-center">
        <div className="text-center py-20">
          <ShoppingBag
            size={64}
            className="text-brand-charcoal/20 mx-auto mb-6"
          />
          <h1 className="font-display text-3xl text-brand-charcoal mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-brand-charcoal/60 mb-8 text-sm">
            Add some pasture-raised chicken to get started.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3 bg-brand-green text-white font-semibold rounded-full hover:bg-brand-green-dark transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl text-brand-charcoal mb-8">
          Your Cart
        </h1>

        {/* Items */}
        <div className="space-y-3 mb-8">
          {items.map((item) => {
            const estLbs = parseFloat(
              (item.count * item.avgLbs).toFixed(2)
            );
            const subtotal = parseFloat(
              (estLbs * item.pricePerLb).toFixed(2)
            );
            return (
              <div
                key={item.productId}
                className="bg-white rounded-2xl p-5 flex gap-4 items-center shadow-sm"
              >
                <div className="w-16 h-16 rounded-xl bg-brand-green/10 flex items-center justify-center text-3xl shrink-0">
                  🐔
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-charcoal">
                    {item.name}
                  </p>
                  <p className="text-sm text-brand-charcoal/50">
                    ${item.pricePerLb.toFixed(2)}/lb · Avg {item.avgLbs}{" "}
                    lbs/unit
                  </p>
                </div>

                {/* Count controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      updateCount(item.productId, item.count - 1)
                    }
                    className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
                  >
                    −
                  </button>
                  <span className="w-20 text-center text-sm font-medium">
                    {item.count} {item.count === 1 ? "unit" : "units"}
                  </span>
                  <button
                    onClick={() =>
                      updateCount(item.productId, item.count + 1)
                    }
                    className="w-8 h-8 rounded-full border border-brand-cream-dark flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="text-xs text-brand-charcoal/40">
                    ~{estLbs} lbs
                  </p>
                  <p className="font-semibold text-brand-green">
                    ${subtotal.toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-brand-charcoal/30 hover:text-brand-terracotta transition-colors shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Subscription option */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <Repeat
              size={20}
              className="text-brand-green shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-brand-charcoal text-sm">
                Make this a subscription?
              </p>
              <p className="text-xs text-brand-charcoal/55 mt-0.5 leading-relaxed">
                Get this same order on a recurring schedule. Cancel anytime
                from your account.
              </p>
            </div>
          </div>

          {priceLockActive && (
            <div className="mb-4 flex items-start gap-3 bg-brand-green/10 border border-brand-green/30 rounded-xl p-3.5">
              <Lock
                size={16}
                className="text-brand-green shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="text-xs text-brand-charcoal leading-relaxed">
                <strong className="text-brand-green">
                  Lock in today&rsquo;s price for {PRICE_LOCK_DURATION_LABEL}.
                </strong>{" "}
                Start any subscription on or before{" "}
                <strong>{PRICE_LOCK_DEADLINE_LABEL}</strong> and we&rsquo;ll
                hold your current per-pound pricing for the next year, even if
                our list prices go up.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(
              [
                "one-time",
                "weekly",
                "biweekly",
                "monthly",
              ] as SubscriptionFrequency[]
            ).map((freq) => {
              const active = subscriptionFrequency === freq;
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setSubscriptionFrequency(freq)}
                  className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                    active
                      ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/30"
                      : "border-brand-cream-dark hover:border-brand-green/40"
                  }`}
                  aria-pressed={active}
                >
                  <p className="font-medium text-brand-charcoal text-sm">
                    {FREQUENCY_LABEL[freq]}
                  </p>
                  <p className="text-xs text-brand-charcoal/55 mt-1 leading-snug">
                    {FREQUENCY_DESCRIPTION[freq]}
                  </p>
                </button>
              );
            })}
          </div>

          {isSubscription && (
            <div className="mt-4 bg-brand-cream/60 border border-brand-cream-dark rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer text-sm text-brand-charcoal leading-relaxed">
                <input
                  type="checkbox"
                  checked={subscriptionConsent}
                  onChange={(e) => setSubscriptionConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green/30 shrink-0 cursor-pointer"
                />
                <span>
                  I authorize Bobby Built Farms to charge my payment method{" "}
                  <strong className="text-brand-charcoal">
                    ~${totalPrice().toFixed(2)}
                  </strong>{" "}
                  {FREQUENCY_CADENCE_PHRASE[subscriptionFrequency]}
                  {" "}until I cancel from{" "}
                  <Link
                    href="/account"
                    className="text-brand-green hover:underline"
                  >
                    My Account
                  </Link>
                  . Final amount per delivery may vary slightly with actual
                  fulfillment weight.
                  {priceLockActive && (
                    <>
                      {" "}Subscribing today locks in this per-pound pricing
                      for {PRICE_LOCK_DURATION_LABEL}.
                    </>
                  )}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Marketing email opt-in */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer text-sm text-brand-charcoal leading-relaxed">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green/30 shrink-0 cursor-pointer"
            />
            <span className="flex-1">
              <span className="flex items-center gap-2 font-semibold text-brand-charcoal mb-1">
                <Mail
                  size={14}
                  className="text-brand-green"
                  aria-hidden="true"
                />
                Keep me posted on new batches
              </span>
              <span className="text-xs text-brand-charcoal/55 block">
                {NEWSLETTER_CONSENT_TEXT}
              </span>
            </span>
          </label>
        </div>

        {/* Pickup notice */}
        <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <MapPin
              size={20}
              className="text-brand-green shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-sm text-brand-charcoal leading-relaxed">
              <p className="font-semibold mb-1">Farm pickup at checkout</p>
              <p className="text-brand-charcoal/75">
                All orders are picked up at the farm —{" "}
                <a
                  href={PICKUP_MAP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-brand-green hover:underline"
                >
                  {PICKUP_ADDRESS_LINE1}, {PICKUP_CITY_STATE_ZIP}
                </a>
                . After you check out, we&rsquo;ll email you to coordinate a
                pickup time. Local delivery is coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Referral / reward auto-apply banner */}
        <ReferralBanner />

        {/* Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="space-y-3 mb-5">
            {items.map((item) => {
              const estLbs = parseFloat(
                (item.count * item.avgLbs).toFixed(2)
              );
              const subtotal = parseFloat(
                (estLbs * item.pricePerLb).toFixed(2)
              );
              return (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-brand-charcoal/60">
                    {item.name} · {item.count}{" "}
                    {item.count === 1 ? "unit" : "units"} (~{estLbs} lbs)
                  </span>
                  <span className="text-brand-charcoal">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-brand-cream-dark pt-4 flex justify-between font-semibold text-lg">
            <span>
              Est.{" "}
              {isSubscription
                ? subscriptionFrequency === "monthly"
                  ? "Monthly"
                  : "Per-Delivery"
                : "Subtotal"}
            </span>
            <span className="text-brand-green">
              ${totalPrice().toFixed(2)}
              {isSubscription && (
                <span className="text-xs text-brand-charcoal/40 font-normal ml-1">
                  /{FREQUENCY_SHORT_LABEL[subscriptionFrequency]}
                </span>
              )}
            </span>
          </div>
          <p className="text-xs text-brand-charcoal/40 mt-1">
            {isSubscription
              ? "You'll be charged each period until you cancel from My Account. Final amount may vary with actual fulfillment weight."
              : "Final price based on actual weight at fulfillment. No shipping or delivery fees — pickup is free."}
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading || blockedBySubscriptionConsent}
            className="w-full mt-5 py-4 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? "Redirecting to Checkout..."
              : blockedBySubscriptionConsent
              ? "Authorize the recurring charge above to continue"
              : isSubscription
              ? "Start Subscription"
              : "Proceed to Checkout"}
          </button>

          <button
            onClick={clearCart}
            className="w-full mt-2 py-2 text-sm text-brand-charcoal/40 hover:text-brand-charcoal transition-colors"
          >
            Clear cart
          </button>
        </div>
      </div>
    </div>
  );
}
