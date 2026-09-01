import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import NewsletterAdminRowActions from "@/components/NewsletterAdminRowActions";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
} from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Admin · Newsletter – Bobby Built Farms",
  robots: { index: false, follow: false },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "UNSUBSCRIBED", label: "Unsubscribed" },
] as const;

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminNewsletterPage({ searchParams }: Props) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const { status: rawStatus, q: rawQuery } = await searchParams;
  const status =
    rawStatus === "ACTIVE" || rawStatus === "UNSUBSCRIBED" ? rawStatus : "ALL";
  const query = (rawQuery ?? "").trim().toLowerCase();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      ...(status !== "ALL" ? { status } : {}),
      ...(query
        ? {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { optInAt: "desc" },
    take: 500,
  });

  const counts = await prisma.newsletterSubscriber.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countByStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all])
  ) as Partial<Record<"ACTIVE" | "UNSUBSCRIBED", number>>;
  const totalCount = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-brand-terracotta text-xs uppercase tracking-widest font-semibold mb-1">
              Admin
            </p>
            <h1 className="font-display text-4xl text-brand-charcoal mb-1">
              Newsletter
            </h1>
            <p className="text-brand-charcoal/50 text-sm">
              {countByStatus.ACTIVE ?? 0} active subscribers ·{" "}
              {countByStatus.UNSUBSCRIBED ?? 0} unsubscribed
            </p>
          </div>
          <div className="flex items-center gap-2 self-end">
            <Link
              href="/admin/orders"
              className="text-sm text-brand-green hover:underline"
            >
              ← Orders
            </Link>
            <Link
              href="/api/admin/newsletter/export"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green text-white px-4 py-2 text-sm font-semibold hover:bg-brand-green-dark transition-colors"
            >
              <Download size={14} aria-hidden="true" />
              Export CSV
            </Link>
          </div>
        </div>

        {/* Consent record summary — shown so the admin can confirm what
            the active consent text is at a glance. */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-brand-cream-dark">
          <p className="text-xs uppercase tracking-widest font-semibold text-brand-terracotta mb-2">
            Active Consent Statement · v{NEWSLETTER_CONSENT_VERSION}
          </p>
          <p className="text-sm text-brand-charcoal/75 leading-relaxed">
            &ldquo;{NEWSLETTER_CONSENT_TEXT}&rdquo;
          </p>
          <p className="text-xs text-brand-charcoal/40 mt-2 leading-relaxed">
            Each subscriber row below stores a verbatim snapshot of the consent
            text shown to them at opt-in time, plus IP, user agent, source,
            and timestamp. The CSV export uses Mailchimp-compatible column
            names (OPTIN_TIME, OPTIN_IP, CONFIRM_TIME, CONFIRM_IP) so the file
            can be imported directly.
          </p>
        </div>

        {/* Filter / search */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <nav className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => {
              const active = f.value === status;
              const count =
                f.value === "ALL"
                  ? totalCount
                  : countByStatus[f.value as "ACTIVE" | "UNSUBSCRIBED"] ?? 0;
              const href =
                f.value === "ALL"
                  ? "/admin/newsletter"
                  : `/admin/newsletter?status=${f.value}`;
              return (
                <Link
                  key={f.value}
                  href={href}
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
          <form className="flex-1 min-w-[200px] flex justify-end">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search email or name…"
              className="w-full max-w-xs rounded-full bg-white border border-brand-cream-dark px-4 py-1.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
            />
            {status !== "ALL" && (
              <input type="hidden" name="status" value={status} />
            )}
          </form>
        </div>

        {/* List */}
        {subscribers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-brand-charcoal/50 text-sm">
              No subscribers match this filter yet.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-brand-cream-dark text-[11px] uppercase tracking-widest font-semibold text-brand-charcoal/40">
              <div className="col-span-4">Email · Name</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Opt-in</div>
              <div className="col-span-2">IP / User Agent</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            <ul className="divide-y divide-brand-cream-dark">
              {subscribers.map((s) => (
                <li
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 text-sm"
                >
                  <div className="md:col-span-4 min-w-0">
                    <p className="font-medium text-brand-charcoal truncate">
                      {s.email}
                    </p>
                    {s.name && (
                      <p className="text-xs text-brand-charcoal/50 truncate">
                        {s.name}
                      </p>
                    )}
                    {s.clerkUserId && (
                      <p className="text-[10px] text-brand-charcoal/40 mt-0.5">
                        Clerk user
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 text-xs text-brand-charcoal/60 capitalize">
                    {s.source}
                    <p className="text-[10px] text-brand-charcoal/40 mt-0.5">
                      Consent v{s.consentVersion}
                    </p>
                  </div>
                  <div className="md:col-span-2 text-xs text-brand-charcoal/60">
                    {s.optInAt.toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                  <div className="md:col-span-2 text-xs text-brand-charcoal/60 min-w-0">
                    <p className="truncate font-mono">
                      {s.optInIp ?? "(no IP)"}
                    </p>
                    <p
                      className="truncate text-brand-charcoal/40"
                      title={s.optInUserAgent ?? ""}
                    >
                      {s.optInUserAgent ?? "(no UA)"}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end items-center gap-3">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-brand-cream-dark text-brand-charcoal/60"
                      }`}
                    >
                      {s.status}
                    </span>
                    <NewsletterAdminRowActions
                      id={s.id}
                      status={s.status}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {subscribers.length === 500 && (
          <p className="text-xs text-brand-charcoal/40 text-center mt-6">
            Showing the first 500 results — refine the search to see more.
          </p>
        )}
      </div>
    </div>
  );
}
