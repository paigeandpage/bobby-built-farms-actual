import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  adminCancelAtPeriodEndAction,
  adminResumeAction,
  adminCancelImmediatelyAction,
} from "./actions";
import type { OrderStatus, SubscriptionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin · Subscription Detail – Bobby Built Farms",
  robots: { index: false, follow: false },
};

const STATUS_BADGE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
  INCOMPLETE: "bg-brand-cream-dark text-brand-charcoal/60",
};

const ORDER_STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-brand-cream-dark text-brand-charcoal/60",
  CONFIRMED: "bg-green-100 text-green-700",
  FULFILLED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-red-100 text-red-600",
};

interface CartItemSnapshot {
  productId: string;
  count: number;
  avgLbs: number;
  pricePerLb: number;
}

function formatCadence(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "Monthly";
  if (interval === "week" && intervalCount === 2) return "Twice a month (every 2 weeks)";
  if (interval === "week" && intervalCount === 1) return "Weekly";
  return `Every ${intervalCount} ${interval}${intervalCount === 1 ? "" : "s"}`;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminSubscriptionDetailPage({ params }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { id } = await params;
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: { include: { product: true } } },
      },
    },
  });

  if (!subscription) return notFound();

  // Resolve product names from the snapshotted cart so admins can see
  // exactly what's billed each cycle, even if the underlying Product was
  // renamed or removed since the customer subscribed.
  const cartItems =
    (subscription.cartItems as unknown as CartItemSnapshot[] | null) ?? [];
  const productIds = Array.from(new Set(cartItems.map((i) => i.productId)));
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: {
            OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
          },
          select: { id: true, slug: true, name: true },
        })
      : [];
  const productByKey = new Map<string, { name: string }>();
  for (const p of products) {
    productByKey.set(p.id, p);
    productByKey.set(p.slug, p);
  }

  const cadenceLabel = formatCadence(
    subscription.interval,
    subscription.intervalCount
  );
  const nextChargeLabel = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const isActive = subscription.status === "ACTIVE";
  const isCancelled = subscription.status === "CANCELLED";

  const estimatedTotal = cartItems.reduce(
    (sum, i) => sum + i.count * i.avgLbs * i.pricePerLb,
    0
  );

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-8 flex gap-2">
          <Link
            href="/admin/subscriptions"
            className="hover:text-brand-green transition-colors"
          >
            Admin Subscriptions
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">
            #{subscription.id.slice(-8).toUpperCase()}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <p className="text-brand-terracotta text-xs uppercase tracking-widest font-semibold mb-1">
              Admin · Subscription
            </p>
            <h1 className="font-display text-3xl text-brand-charcoal mb-1">
              {cadenceLabel}
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              Started{" "}
              {subscription.createdAt.toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${STATUS_BADGE[subscription.status]}`}
            >
              {subscription.status}
            </span>
            {subscription.cancelAtPeriodEnd && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-semibold uppercase tracking-wider">
                Cancel scheduled
              </span>
            )}
          </div>
        </div>

        {/* Status controls */}
        {!isCancelled && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-3">
              Manage
            </h2>
            <div className="flex flex-wrap gap-2">
              {isActive && !subscription.cancelAtPeriodEnd && (
                <form
                  action={async () => {
                    "use server";
                    await adminCancelAtPeriodEndAction(subscription.id);
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-brand-terracotta text-sm font-medium rounded-full border border-brand-terracotta/40 hover:bg-brand-terracotta/10 transition-colors cursor-pointer"
                  >
                    Cancel at period end
                  </button>
                </form>
              )}
              {isActive && subscription.cancelAtPeriodEnd && (
                <form
                  action={async () => {
                    "use server";
                    await adminResumeAction(subscription.id);
                  }}
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-full hover:bg-brand-green-dark transition-colors cursor-pointer"
                  >
                    Resume (undo cancel)
                  </button>
                </form>
              )}
              <form
                action={async () => {
                  "use server";
                  await adminCancelImmediatelyAction(subscription.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-full hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Cancel immediately
                </button>
              </form>
            </div>
            <p className="text-xs text-brand-charcoal/40 mt-3 leading-relaxed">
              <strong>Cancel at period end</strong> stops billing after the
              customer&rsquo;s current period — they keep what they paid for.{" "}
              <strong>Cancel immediately</strong> stops billing now but does
              <em> not</em> issue a refund — refund manually in the Stripe
              dashboard if needed.
            </p>
          </div>
        )}

        {/* Customer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-4">
            Customer
          </h2>
          <div className="text-sm text-brand-charcoal/80 space-y-0.5">
            <p>{subscription.customerName ?? "(no name)"}</p>
            {subscription.customerEmail && (
              <p className="break-all">
                <a
                  href={`mailto:${subscription.customerEmail}`}
                  className="text-brand-green hover:underline"
                >
                  {subscription.customerEmail}
                </a>
              </p>
            )}
            {subscription.customerPhone && (
              <p>
                <a
                  href={`tel:${subscription.customerPhone}`}
                  className="text-brand-green hover:underline"
                >
                  {subscription.customerPhone}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-4">
            Schedule
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-0.5">
                Cadence
              </dt>
              <dd className="text-brand-charcoal font-medium">{cadenceLabel}</dd>
            </div>
            <div>
              <dt className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-0.5">
                {subscription.cancelAtPeriodEnd ? "Ends on" : "Next charge"}
              </dt>
              <dd className="text-brand-charcoal font-medium">
                {nextChargeLabel}
              </dd>
            </div>
            <div>
              <dt className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-0.5">
                Estimated total / cycle
              </dt>
              <dd className="text-brand-green font-semibold">
                ~${estimatedTotal.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-0.5">
                Orders so far
              </dt>
              <dd className="text-brand-charcoal font-medium">
                {subscription.orders.length}
              </dd>
            </div>
          </dl>
        </div>

        {/* Snapshotted cart */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-6 py-4 border-b border-brand-cream-dark">
            <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider">
              What gets billed each cycle
            </h2>
          </div>
          {cartItems.length === 0 ? (
            <p className="px-6 py-4 text-sm text-brand-charcoal/50">
              No cart snapshot recorded.
            </p>
          ) : (
            <div className="divide-y divide-brand-cream-dark">
              {cartItems.map((item, idx) => {
                const product = productByKey.get(item.productId);
                const estLbs = item.count * item.avgLbs;
                const subtotal = estLbs * item.pricePerLb;
                return (
                  <div
                    key={idx}
                    className="px-6 py-3 flex items-center justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-charcoal truncate">
                        {product?.name ?? `Unknown (${item.productId})`}
                      </p>
                      <p className="text-xs text-brand-charcoal/50">
                        {item.count} {item.count === 1 ? "unit" : "units"} ·
                        avg {item.avgLbs} lbs/unit · ${item.pricePerLb.toFixed(2)}
                        /lb
                      </p>
                    </div>
                    <p className="font-medium text-brand-charcoal text-sm">
                      ~${subtotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order history */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-6 py-4 border-b border-brand-cream-dark">
            <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider">
              Orders generated by this subscription
            </h2>
          </div>
          {subscription.orders.length === 0 ? (
            <p className="px-6 py-4 text-sm text-brand-charcoal/50">
              No orders yet.
            </p>
          ) : (
            <div className="divide-y divide-brand-cream-dark">
              {subscription.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block px-6 py-3 hover:bg-brand-cream/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="font-medium text-brand-charcoal text-sm">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <span
                          className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${ORDER_STATUS_BADGE[order.status]}`}
                        >
                          {order.status}
                        </span>
                        {order.isSubscriptionInitial && (
                          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-brand-green/10 text-brand-green">
                            Initial
                          </span>
                        )}
                      </div>
                      <p className="text-brand-charcoal/50 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <p className="font-semibold text-brand-green text-sm shrink-0">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* References */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 text-xs text-brand-charcoal/40 space-y-1">
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Subscription ID:{" "}
            </span>
            {subscription.id}
          </div>
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Stripe subscription:{" "}
            </span>
            {subscription.stripeSubscriptionId}
          </div>
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Stripe customer:{" "}
            </span>
            {subscription.stripeCustomerId}
          </div>
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Clerk user:{" "}
            </span>
            {subscription.clerkUserId}
          </div>
        </div>

        <Link
          href="/admin/subscriptions"
          className="text-sm text-brand-green hover:underline"
        >
          ← Back to all subscriptions
        </Link>
      </div>
    </div>
  );
}
