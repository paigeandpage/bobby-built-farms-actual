import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  markConfirmedAction,
  markCancelledAction,
  markFulfilledAction,
} from "./actions";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin · Order Detail – Bobby Built Farms",
  robots: { index: false, follow: false },
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-brand-cream-dark text-brand-charcoal/60",
  CONFIRMED: "bg-green-100 text-green-700",
  FULFILLED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-red-100 text-red-600",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      subscription: true,
    },
  });

  if (!order) return notFound();

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-8 flex gap-2">
          <Link
            href="/admin/orders"
            className="hover:text-brand-green transition-colors"
          >
            Admin Orders
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">
            #{order.id.slice(-8).toUpperCase()}
          </span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-brand-terracotta text-xs uppercase tracking-widest font-semibold mb-1">
              Admin · Order Detail
            </p>
            <h1 className="font-display text-3xl text-brand-charcoal mb-1">
              #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              Placed{" "}
              {new Date(order.createdAt).toLocaleString("en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </p>
          </div>
          <span
            className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${STATUS_BADGE[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        {/* Subscription context (admin) */}
        {order.subscription && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 border-l-4 border-brand-green">
            <p className="text-xs uppercase tracking-wider text-brand-green font-semibold mb-1">
              {order.isSubscriptionInitial
                ? "Subscription start"
                : "Subscription renewal"}
            </p>
            <p className="text-sm text-brand-charcoal/80 leading-relaxed">
              Cadence:{" "}
              <strong>
                every {order.subscription.intervalCount}{" "}
                {order.subscription.interval}
                {order.subscription.intervalCount === 1 ? "" : "s"}
              </strong>{" "}
              · Status:{" "}
              <strong className="font-mono text-xs">
                {order.subscription.status}
              </strong>
              {order.subscription.cancelAtPeriodEnd &&
                " · Cancel scheduled at period end"}
              {order.subscription.currentPeriodEnd && (
                <>
                  {" · Next charge: "}
                  <strong>
                    {order.subscription.currentPeriodEnd.toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </strong>
                </>
              )}
            </p>
            <Link
              href={`/admin/subscriptions/${order.subscription.id}`}
              className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider text-brand-green hover:underline"
            >
              Manage subscription →
            </Link>
          </div>
        )}

        {/* Status controls */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-3">
            Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {order.status !== "FULFILLED" && order.status !== "CANCELLED" && (
              <form
                action={async () => {
                  "use server";
                  await markFulfilledAction(order.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-full hover:bg-brand-green-dark transition-colors cursor-pointer"
                >
                  Mark as Picked Up
                </button>
              </form>
            )}
            {order.status !== "CANCELLED" && order.status !== "FULFILLED" && (
              <form
                action={async () => {
                  "use server";
                  await markCancelledAction(order.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-brand-terracotta text-sm font-medium rounded-full border border-brand-terracotta/40 hover:bg-brand-terracotta/10 transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              </form>
            )}
            {order.status === "CANCELLED" && (
              <form
                action={async () => {
                  "use server";
                  await markConfirmedAction(order.id);
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-brand-charcoal/60 text-sm font-medium rounded-full border border-brand-cream-dark hover:bg-brand-cream-dark transition-colors cursor-pointer"
                >
                  Restore to Confirmed
                </button>
              </form>
            )}
            {(order.status === "FULFILLED" ||
              order.status === "CANCELLED") && (
              <p className="text-xs text-brand-charcoal/50 self-center ml-1">
                Order is in a terminal state. Customer was notified by email.
              </p>
            )}
          </div>
          <p className="text-xs text-brand-charcoal/40 mt-3 leading-relaxed">
            Marking as Picked Up or Cancelling sends the customer an email
            automatically. There is no &quot;undo&quot; for these emails —
            once sent, the customer has been notified.
          </p>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wider mb-4">
            Customer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-1.5">
                Contact
              </p>
              <div className="text-brand-charcoal/80 space-y-0.5">
                <p>{order.customerName ?? "(no name)"}</p>
                {order.customerEmail && (
                  <p className="break-all">
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-brand-green hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </p>
                )}
                {order.customerPhone && (
                  <p>
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-brand-green hover:underline"
                    >
                      {order.customerPhone}
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-brand-charcoal/50 text-xs uppercase tracking-wider mb-1.5">
                Fulfillment
              </p>
              <div className="text-brand-charcoal/80 space-y-0.5">
                <p className="font-medium text-brand-charcoal">
                  Farm pickup
                </p>
                <p className="text-xs text-brand-charcoal/60">
                  Coordinate a pickup time with the customer.
                </p>
                {order.addressLine1 && (
                  <div className="mt-3 pt-3 border-t border-brand-cream-dark">
                    <p className="text-xs uppercase tracking-wider text-brand-charcoal/50 mb-1">
                      Legacy address on file
                    </p>
                    <p>{order.addressLine1}</p>
                    {order.addressLine2 && <p>{order.addressLine2}</p>}
                    <p>
                      {[
                        order.addressCity,
                        order.addressState,
                        order.addressPostalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
              <div
                key={item.id}
                className="px-6 py-4 flex items-center justify-between"
              >
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

        {/* References */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 text-xs text-brand-charcoal/40 space-y-1">
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Order ID:{" "}
            </span>
            {order.id}
          </div>
          {order.stripeSessionId && (
            <div>
              <span className="font-medium text-brand-charcoal/60">
                Stripe session:{" "}
              </span>
              {order.stripeSessionId}
            </div>
          )}
          {order.stripeInvoiceId && (
            <div>
              <span className="font-medium text-brand-charcoal/60">
                Stripe invoice:{" "}
              </span>
              {order.stripeInvoiceId}
            </div>
          )}
          {order.stripePaymentIntentId && (
            <div>
              <span className="font-medium text-brand-charcoal/60">
                Stripe payment intent:{" "}
              </span>
              {order.stripePaymentIntentId}
            </div>
          )}
          {order.subscription && (
            <div>
              <span className="font-medium text-brand-charcoal/60">
                Stripe subscription:{" "}
              </span>
              {order.subscription.stripeSubscriptionId}
            </div>
          )}
          <div>
            <span className="font-medium text-brand-charcoal/60">
              Clerk user:{" "}
            </span>
            {order.clerkUserId}
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="text-sm text-brand-green hover:underline"
        >
          ← Back to all orders
        </Link>
      </div>
    </div>
  );
}
