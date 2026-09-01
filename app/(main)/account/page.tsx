import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import { isAdminEmail } from "@/lib/admin";
import SubscriptionCard from "@/components/SubscriptionCard";
import NewsletterAccountPanel from "@/components/NewsletterAccountPanel";
import ReferralPanel from "@/components/ReferralPanel";
import { normalizeEmail } from "@/lib/newsletter";
import { Download, Repeat } from "lucide-react";

export const metadata: Metadata = {
  title: "My Account – Bobby Built Farms",
};

interface CartItemSnapshot {
  productId: string;
  count: number;
  avgLbs: number;
  pricePerLb: number;
}

interface SubscriptionProductLookup {
  id: string;
  slug: string;
  name: string;
  pricePerLb: number;
}

function summarizeCartItems(
  cartItems: CartItemSnapshot[],
  productsById: Map<string, SubscriptionProductLookup>
): { summary: string; total: number } {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return { summary: "(no items)", total: 0 };
  }
  const parts: string[] = [];
  let total = 0;
  for (const item of cartItems) {
    const product =
      productsById.get(item.productId) ?? null;
    const name = product?.name ?? "Item";
    parts.push(
      `${name} · ${item.count} ${item.count === 1 ? "unit" : "units"}`
    );
    total += item.count * item.avgLbs * item.pricePerLb;
  }
  return {
    summary: parts.join(" · "),
    total: parseFloat(total.toFixed(2)),
  };
}

export default async function AccountPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const primaryEmail = user?.emailAddresses[0]?.emailAddress ?? "";
  const isAdmin = isAdminEmail(primaryEmail);

  const newsletterRow = primaryEmail
    ? await prisma.newsletterSubscriber
        .findUnique({
          where: { email: normalizeEmail(primaryEmail) },
          select: { status: true, unsubscribeToken: true },
        })
        .catch(() => null)
    : null;

  const [orders, subscriptions] = userId
    ? await Promise.all([
        prisma.order
          .findMany({
            where: { clerkUserId: userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
          .catch(() => []),
        prisma.subscription
          .findMany({
            where: { clerkUserId: userId },
            orderBy: { createdAt: "desc" },
          })
          .catch(() => []),
      ])
    : [[], []];

  // Pre-fetch all products referenced by any subscription's cart snapshot
  // so we can render readable item names without an N+1.
  const subscriptionProductIds = new Set<string>();
  for (const sub of subscriptions) {
    const items = (sub.cartItems as unknown as CartItemSnapshot[] | null) ?? [];
    for (const item of items) subscriptionProductIds.add(item.productId);
  }
  const subscriptionProducts =
    subscriptionProductIds.size > 0
      ? await prisma.product
          .findMany({
            where: {
              OR: [
                { id: { in: Array.from(subscriptionProductIds) } },
                { slug: { in: Array.from(subscriptionProductIds) } },
              ],
            },
            select: { id: true, slug: true, name: true, pricePerLb: true },
          })
          .catch(() => [])
      : [];
  const productsByKey = new Map<string, SubscriptionProductLookup>();
  for (const p of subscriptionProducts) {
    productsByKey.set(p.id, p);
    productsByKey.set(p.slug, p);
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl text-brand-charcoal mb-1">
            My Account
          </h1>
          {user && (
            <p className="text-brand-charcoal/50 text-sm">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          )}
          {isAdmin && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/admin/orders"
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-green transition-colors"
              >
                Admin · Orders →
              </Link>
              <Link
                href="/admin/subscriptions"
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-green transition-colors"
              >
                Admin · Subscriptions →
              </Link>
              <Link
                href="/admin/newsletter"
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-charcoal text-white text-xs font-semibold uppercase tracking-wider hover:bg-brand-green transition-colors"
              >
                Admin · Newsletter →
              </Link>
            </div>
          )}
        </div>

        {/* Refer a friend */}
        {userId && (
          <section className="mb-10">
            <ReferralPanel />
          </section>
        )}

        {/* Newsletter management */}
        {primaryEmail && (
          <section className="mb-10">
            <NewsletterAccountPanel
              defaultEmail={primaryEmail}
              initialStatus={
                newsletterRow?.status === "ACTIVE"
                  ? "ACTIVE"
                  : newsletterRow?.status === "UNSUBSCRIBED"
                  ? "UNSUBSCRIBED"
                  : "NONE"
              }
              unsubscribeToken={newsletterRow?.unsubscribeToken ?? null}
            />
          </section>
        )}

        {/* Subscriptions */}
        {subscriptions.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl text-brand-charcoal flex items-center gap-2">
                <Repeat size={18} className="text-brand-green" aria-hidden="true" />
                Subscriptions
              </h2>
            </div>
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const cartItems =
                  (sub.cartItems as unknown as CartItemSnapshot[] | null) ?? [];
                const { summary, total } = summarizeCartItems(
                  cartItems,
                  productsByKey
                );
                return (
                  <SubscriptionCard
                    key={sub.id}
                    id={sub.id}
                    status={sub.status}
                    interval={sub.interval}
                    intervalCount={sub.intervalCount}
                    cancelAtPeriodEnd={sub.cancelAtPeriodEnd}
                    currentPeriodEnd={
                      sub.currentPeriodEnd?.toISOString() ?? null
                    }
                    itemSummary={summary}
                    totalEstimate={total}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl text-brand-charcoal">
              Recent Orders
            </h2>
            {orders.length > 0 && (
              <Link
                href="/account/orders"
                className="text-sm text-brand-green hover:underline"
              >
                View all →
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <p className="text-brand-charcoal/50 mb-4 text-sm">
                No orders yet.
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
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="flex-1 min-w-0"
                    >
                      <p className="font-medium text-brand-charcoal text-sm">
                        Order #{order.id.slice(-8).toUpperCase()}
                        {order.subscriptionId && (
                          <span className="ml-2 inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-semibold align-middle">
                            Subscription
                          </span>
                        )}
                      </p>
                      <p className="text-brand-charcoal/50 text-xs mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </Link>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-brand-green">
                        ${order.total.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${
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
                  </div>
                  <div className="flex items-center justify-between mt-3 gap-3">
                    <div className="text-xs text-brand-charcoal/50 flex-1 min-w-0 truncate">
                      {order.items
                        .map((item) => `${item.product.name} · ${item.weightLbs} lbs`)
                        .join(" · ")}
                    </div>
                    <a
                      href={`/api/orders/${order.id}/receipt`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-charcoal/60 hover:text-brand-green transition-colors shrink-0"
                    >
                      <Download size={12} aria-hidden="true" />
                      Receipt
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
