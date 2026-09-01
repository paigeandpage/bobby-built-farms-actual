import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { SubscriptionStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Admin · Subscriptions – Bobby Built Farms",
  robots: { index: false, follow: false },
};

const STATUS_FILTERS: { value: "ALL" | SubscriptionStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAST_DUE", label: "Past due" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "INCOMPLETE", label: "Incomplete" },
];

const STATUS_BADGE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PAST_DUE: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-600",
  INCOMPLETE: "bg-brand-cream-dark text-brand-charcoal/60",
};

function formatCadence(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "Monthly";
  if (interval === "week" && intervalCount === 2) return "Twice a month";
  if (interval === "week" && intervalCount === 1) return "Weekly";
  return `Every ${intervalCount} ${interval}${intervalCount === 1 ? "" : "s"}`;
}

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSubscriptionsPage({ searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { status } = await searchParams;
  const statusFilter =
    status === "ACTIVE" ||
    status === "PAST_DUE" ||
    status === "CANCELLED" ||
    status === "INCOMPLETE"
      ? (status as SubscriptionStatus)
      : null;

  const subscriptions = await prisma.subscription.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true } },
    },
  });

  const counts = await prisma.subscription.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all])
  ) as Partial<Record<SubscriptionStatus, number>>;
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
              Subscriptions
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              Showing the {subscriptions.length} most recent
              {statusFilter ? ` ${statusFilter.toLowerCase()}` : ""} subscriptions.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm text-brand-green hover:underline self-end"
          >
            ← View orders
          </Link>
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
                    ? "/admin/subscriptions"
                    : `/admin/subscriptions?status=${f.value}`
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
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-brand-charcoal/50 text-sm">
              No subscriptions match this filter yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-brand-cream-dark">
              {subscriptions.map((sub) => {
                const nextChargeLabel = sub.currentPeriodEnd
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";
                return (
                  <Link
                    key={sub.id}
                    href={`/admin/subscriptions/${sub.id}`}
                    className="block px-5 py-4 hover:bg-brand-cream/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <p className="font-medium text-brand-charcoal text-sm">
                            {formatCadence(sub.interval, sub.intervalCount)}
                          </p>
                          <span
                            className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${STATUS_BADGE[sub.status]}`}
                          >
                            {sub.status}
                          </span>
                          {sub.cancelAtPeriodEnd && (
                            <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-yellow-100 text-yellow-800">
                              Cancel scheduled
                            </span>
                          )}
                        </div>
                        <p className="text-brand-charcoal/70 text-sm mt-1.5 truncate">
                          {sub.customerName ?? "(no name)"}
                          {sub.customerEmail && ` · ${sub.customerEmail}`}
                          {sub.customerPhone && ` · ${sub.customerPhone}`}
                        </p>
                        <p className="text-brand-charcoal/40 text-xs mt-1">
                          {sub._count.orders} order
                          {sub._count.orders === 1 ? "" : "s"} so far · Started{" "}
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-brand-charcoal/40 text-[10px] uppercase tracking-wider">
                          {sub.cancelAtPeriodEnd ? "Ends" : "Next charge"}
                        </p>
                        <p className="text-sm text-brand-charcoal font-medium">
                          {nextChargeLabel}
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
