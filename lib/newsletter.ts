import { prisma } from "@/lib/prisma";

/**
 * Verbatim text shown to users next to every opt-in checkbox or
 * implied-consent submit button on the site. We snapshot this string
 * onto every NewsletterSubscriber row at the moment of consent — so
 * if we ever rewrite the copy, prior signups still carry the exact
 * language they actually agreed to.
 *
 * Bump `NEWSLETTER_CONSENT_VERSION` whenever the meaning of this text
 * changes (typo fixes don't count). The version travels with each
 * record and is exported alongside the email so we can prove what
 * each subscriber signed up to.
 */
export const NEWSLETTER_CONSENT_TEXT =
  "I agree to receive marketing emails from Bobby Built Farms about new products, seasonal availability, and farm updates. I understand I can unsubscribe at any time using the link in any email.";

export const NEWSLETTER_CONSENT_VERSION = "1.0";

/** Where on the site a signup originated. Stored verbatim on the row. */
export type NewsletterSource =
  | "footer"
  | "homepage"
  | "signup-page"
  | "account"
  | "checkout"
  | "popup"
  | "shop";

/**
 * Lowercase + trim — addresses are stored canonical so the unique
 * constraint actually catches duplicates that differ only in case.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * RFC-5322-lite: good enough to reject obvious typos in the form
 * before we hit the DB. Real validation happens when we send.
 */
export function isLikelyEmail(email: string): boolean {
  const e = normalizeEmail(email);
  if (e.length < 5 || e.length > 254) return false;
  // Exactly one `@`, at least one `.` after it, no spaces.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

interface RecordConsentArgs {
  email: string;
  name?: string | null;
  source: NewsletterSource;
  ip?: string | null;
  userAgent?: string | null;
  clerkUserId?: string | null;
}

/**
 * Insert (or "re-activate") a NewsletterSubscriber row. Idempotent:
 * if the address already exists, we update the row to ACTIVE and
 * refresh the consent snapshot rather than throwing on the unique
 * constraint. The latter behaviour is important — a user who
 * unsubscribed and then re-subscribes from the footer should just
 * silently come back to the list with a fresh OPTIN_TIME.
 */
export async function recordNewsletterConsent(args: RecordConsentArgs) {
  const email = normalizeEmail(args.email);
  if (!isLikelyEmail(email)) {
    throw new Error("Invalid email address");
  }
  const now = new Date();
  return prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      name: args.name?.trim() || null,
      source: args.source,
      consentText: NEWSLETTER_CONSENT_TEXT,
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      optInAt: now,
      optInIp: args.ip ?? null,
      optInUserAgent: args.userAgent ?? null,
      clerkUserId: args.clerkUserId ?? null,
      status: "ACTIVE",
    },
    update: {
      // Refresh the consent record on re-subscribe. We deliberately
      // overwrite source/IP/UA so the export reflects the most recent
      // (and still legally-valid) opt-in event.
      name: args.name?.trim() || undefined,
      source: args.source,
      consentText: NEWSLETTER_CONSENT_TEXT,
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      optInAt: now,
      optInIp: args.ip ?? null,
      optInUserAgent: args.userAgent ?? null,
      clerkUserId: args.clerkUserId ?? undefined,
      status: "ACTIVE",
      unsubscribedAt: null,
      unsubscribeReason: null,
    },
  });
}

/**
 * Pull the requestor's best-guess public IP from common proxy
 * headers. Vercel sets `x-forwarded-for` (the leftmost address is
 * the original client) and also `x-real-ip`. Falls back to null when
 * neither is present (e.g. local dev without a proxy).
 */
export function readClientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? null;
}
