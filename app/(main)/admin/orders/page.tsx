import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { OrderStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin · Orders – Bobby Built Farms",
  robots: { index: false, follow: false },
};

const STATUS_FILTERS: { value: "ALL" | OrderStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FULFILLED", label: "Fulfilled" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PENDING", label: "Pending" },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-brand-cream-dark text-brand-charcoal/60",
  CONFIRMED: "bg-green-100 text-green-700",
  FULFILLED: "bg-brand-green/10 text-brand-green",
  CANCELLED: "bg-red-100 text-red-600",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { status } = await searchParams;
  const statusFilter =
    status === "CONFIRMED" ||
    status === "FULFILLED" ||
    status === "CANCELLED" ||
    status === "PENDING"
      ? (status as OrderStatus)
      : null;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all])
  ) as Partial<Record<OrderStatus, number>>;
  const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-brand-terracotta text-xs uppercase tracking-widest font-semibold mb-1">
              Admin
            </p>
            <h1 className="font-display text-4xl text-brand-charcoal mb-1">
              Orders
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              Showing the {orders.length} most recent
              {statusFilter ? ` ${statusFilter.toLowerCase()}` : ""} orders.
            </p>
          </div>
          <div className="flex items-center gap-4 self-end">
            <Link
              href="/admin/subscriptions"
              className="text-sm text-brand-green hover:underline"
            >
              View subscriptions →
            </Link>
            <Link
              href="/admin/newsletter"
              className="text-sm text-brand-green hover:underline"
            >
              View newsletter →
            </Link>
          </div>
        </div>

        {/* Status filter tabs */}
        <nav className="flex flex-wrap gap-2 mb-6">
          {STATUS_FILTERS.map((f) => {
            const active =
              (f.value === "ALL" && !statusFilter) || f.value === statusFilter;
            const count =
              f.value === "ALL" ? totalCount : countByStatus[f.value] ?? 0;
            return (
              <Link
                key={f.value}
                href={
                  f.value === "ALL"
                    ? "/admin/orders"
                    : `/admin/orders?status=${f.value}`
                }
                className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${
                  active
                    ? "bg-brand-green text-white"
                    : "bg-white text-brand-charcoal/60 hover:bg-brand-cream-dark"
                }`}
              >
                {f.label}
                <span
                  className={`ml-2 text-xs ${
                    active ? "opacity-70" : "text-brand-charcoal/40"
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-brand-charcoal/50 text-sm">
              No orders match this filter yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-brand-cream-dark">
              {orders.map((order) => {
                const itemSummary = order.items
                  .map((i) => `${i.product.name} (${i.weightLbs} lbs)`)
                  .join(" · ");
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block px-5 py-4 hover:bg-brand-cream/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <p className="font-medium text-brand-charcoal text-sm">
                            #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[order.status]}`}
                          >
                            {order.status}
                          </span>
                          {order.subscriptionId && (
                            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-brand-green/10 text-brand-green">
                              {order.isSubscriptionInitial
                                ? "Sub · initial"
                                : "Sub · renewal"}
                            </span>
                          )}
                          <span className="text-brand-charcoal/40 text-xs">
                            {new Date(order.createdAt).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-brand-charcoal/70 text-sm mt-1.5 truncate">
                          {order.customerName ?? "(no name)"}
                          {order.customerPhone &&
                            ` · ${order.customerPhone}`}
                          {order.addressCity &&
                            ` · ${order.addressCity}, ${order.addressState ?? ""}`}
                        </p>
                        <p className="text-brand-charcoal/40 text-xs mt-1 truncate">
                          {itemSummary}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-brand-green">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
