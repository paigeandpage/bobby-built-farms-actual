import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Download, Repeat } from "lucide-react";
import {
  PICKUP_ADDRESS_LINE1,
  PICKUP_CITY_STATE_ZIP,
  PICKUP_MAP_URL,
} from "@/lib/pickup";

function formatCadence(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "every month";
  if (interval === "week" && intervalCount === 2) return "every 2 weeks";
  return `every ${intervalCount} ${interval}${intervalCount === 1 ? "" : "s"}`;
}

export const metadata: Metadata = {
  title: "Order Details – Bobby Built Farms",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId } = await auth();

  const order = await prisma.order
    .findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        subscription: true,
      },
    })
    .catch(() => null);

  if (!order || order.clerkUserId !== userId) return notFound();

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-8 flex gap-2">
          <Link href="/account" className="hover:text-brand-green transition-colors">
            My Account
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">
            Order #{order.id.slice(-8).toUpperCase()}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <div>
            <h1 className="font-display text-3xl text-brand-charcoal mb-1">
              Order Details
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-block text-sm px-3 py-1 rounded-full font-medium shrink-0 ${
              order.status === "CONFIRMED"
                ? "bg-green-100 text-green-700"
                : order.status === "FULFILLED"
                ? "bg-brand-green/10 text-brand-green"
                : order.status === "CANCELLED"
                ? "bg-red-100 text-red-600"
                : "bg-brand-cream-dark text-brand-charcoal/60"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Subscription context */}
        {order.subscription && (
          <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-4 mb-6 text-sm text-brand-charcoal flex items-start gap-3">
            <Repeat
              size={18}
              className="text-brand-green shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="font-medium">
                {order.isSubscriptionInitial
                  ? "First charge of your subscription"
                  : "Subscription renewal"}
              </p>
              <p className="text-brand-charcoal/65 text-xs mt-0.5 leading-relaxed">
                Charged{" "}
                {formatCadence(
                  order.subscription.interval,
                  order.subscription.intervalCount
                )}
                .{" "}
                <Link
                  href="/account"
                  className="text-brand-green hover:underline"
                >
                  Manage subscription
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Receipt download */}
        <div className="mb-4">
          <a
            href={`/api/orders/${order.id}/receipt`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-green transition-colors"
          >
            <Download size={14} aria-hidden="true" />
            Download receipt
          </a>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4">
          <div className="px-6 py-4 border-b border-brand-cream-dark">
            <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider">
              Items
            </h2>
          </div>
          <div className="divide-y divide-brand-cream-dark">
            {order.items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center text-xl">
                    🐔
                  </div>
                  <div>
                    <p className="font-medium text-brand-charcoal text-sm">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-brand-charcoal/50">
                      {item.weightLbs} lbs × ${item.pricePerLb.toFixed(2)}/lb
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-brand-charcoal text-sm">
                  ${item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-brand-cream-dark bg-brand-cream/50 flex justify-between">
            <span className="font-semibold text-brand-charcoal">Total</span>
            <span className="font-semibold text-brand-green text-lg">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pickup + contact details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-4">
            Pickup Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            {(order.customerName ||
              order.customerEmail ||
              order.customerPhone) && (
              <div>
                <p className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-1.5">
                  Contact
                </p>
                <div className="text-brand-charcoal/80 space-y-0.5">
                  {order.customerName && <p>{order.customerName}</p>}
                  {order.customerEmail && (
                    <p className="break-all">{order.customerEmail}</p>
                  )}
                  {order.customerPhone && <p>{order.customerPhone}</p>}
                </div>
              </div>
            )}
            <div>
              <p className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-1.5">
                Pickup Location
              </p>
              <div className="text-brand-charcoal/80 space-y-0.5">
                <p>{PICKUP_ADDRESS_LINE1}</p>
                <p>{PICKUP_CITY_STATE_ZIP}</p>
              </div>
              <a
                href={PICKUP_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-brand-green hover:underline text-xs"
              >
                Get directions →
              </a>
            </div>
          </div>
        </div>

        {/* Order ID / Stripe reference */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 text-xs text-brand-charcoal/40 space-y-1">
          <div>
            <span className="font-medium text-brand-charcoal/60">Order ID: </span>
            {order.id}
          </div>
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Payment Reference:{" "}
            </span>
            {order.stripeInvoiceId ??
              order.stripePaymentIntentId ??
              order.stripeSessionId ??
              "—"}
          </div>
        </div>

        <Link
          href="/account"
          className="text-sm text-brand-green hover:underline"
        >
          ← Back to My Account
        </Link>
      </div>
    </div>
  );
}
