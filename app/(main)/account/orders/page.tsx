import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download, ShoppingBag } from "lucide-react";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "All Orders – Bobby Built Farms",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-brand-cream-dark text-brand-charcoal/60",
  CONFIRMED: "bg-green-100 text-green-700",
  FULFILLED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-red-100 text-red-600",
};

export default async function AllOrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const orders = await prisma.order
    .findMany({
      where: { clerkUserId: userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-6 flex gap-2">
          <Link
            href="/account"
            className="hover:text-brand-green transition-colors"
          >
            My Account
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">All Orders</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-display text-4xl text-brand-charcoal mb-1">
            Order History
          </h1>
          <p className="text-brand-charcoal/50 text-sm">
            {orders.length === 0
              ? "No orders yet."
              : `${orders.length} order${orders.length === 1 ? "" : "s"} total. Download a receipt for any past order below.`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag
              size={48}
              className="text-brand-charcoal/20 mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-brand-charcoal/50 mb-5 text-sm">
              You haven&rsquo;t placed an order yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-2.5 bg-brand-green text-white text-sm font-medium rounded-full hover:bg-brand-green-dark transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const itemSummary = order.items
                .map((i) => `${i.product.name} · ${i.weightLbs} lbs`)
                .join(" · ");
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <p className="font-medium text-brand-charcoal text-sm">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <span
                          className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[order.status]}`}
                        >
                          {order.status}
                        </span>
                        {order.subscriptionId && (
                          <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green font-semibold">
                            {order.isSubscriptionInitial
                              ? "Subscription start"
                              : "Subscription renewal"}
                          </span>
                        )}
                      </div>
                      <p className="text-brand-charcoal/50 text-xs mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-brand-charcoal/50 text-xs mt-1.5 truncate">
                        {itemSummary}
                      </p>
                    </Link>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-brand-green">
                        ${order.total.toFixed(2)}
                      </p>
                      <a
                        href={`/api/orders/${order.id}/receipt`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-charcoal/60 hover:text-brand-green transition-colors mt-2"
                      >
                        <Download size={12} aria-hidden="true" />
                        Receipt
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
