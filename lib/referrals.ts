import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import type { ReferralCode, RewardCoupon } from "@prisma/client";

// ─── Tunables ──────────────────────────────────────────────────────────────

/**
 * Discount amount for both sides of the referral program. In cents
 * because Stripe's `amount_off` is integer-cents. If you want to
 * sweeten the deal, bump this once and both sides update — the
 * checkout coupon and the issued reward coupon read the same
 * constant.
 */
export const REFERRAL_DISCOUNT_CENTS = 500;

/** Display-friendly version of the discount, e.g. "$5". */
export const REFERRAL_DISCOUNT_LABEL = `$${(
  REFERRAL_DISCOUNT_CENTS / 100
).toFixed(0)}`;

/**
 * Cookie name set by `/r/[code]` when a friend clicks a referral
 * link. Read server-side by `/api/checkout` and `/api/referrals/preview`
 * so the cart UI can advertise the discount before checkout.
 *
 * Not HttpOnly — the cart's client-side banner reads it directly
 * with `document.cookie`. It's not a secret; the worst an attacker
 * can do is spoof a referral for themselves, which `applyReferral`
 * blocks for self-referrals.
 */
export const REFERRAL_COOKIE_NAME = "bbf_ref";

/** 60 days — long enough to survive "I'll order later this week". */
export const REFERRAL_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 60;

/** Earned reward coupons expire after a year if not redeemed. */
export const REWARD_COUPON_VALIDITY_DAYS = 365;

// ─── Code generation ──────────────────────────────────────────────────────

/**
 * Crockford-style base32 alphabet — no `I`, `L`, `O`, `0`, `1`, `U`
 * so a code read out loud or transcribed from a screenshot is hard
 * to garble. 6 chars over this 32-letter alphabet gives ~10^9
 * combinations, more than enough headroom for a small farm.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";

function randomCode(length: number): string {
  let out = "";
  // crypto.getRandomValues is available in both edge and node runtimes.
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
  }
  return out;
}

async function generateUniqueCode(
  prefix: string,
  exists: (code: string) => Promise<boolean>
): Promise<string> {
  // Retry a handful of times to dodge the (vanishingly small) odds
  // of a collision. If we somehow fail 5 times in a row, widen the
  // suffix and try again — far cheaper than throwing on the user.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${prefix}${randomCode(6)}`;
    if (!(await exists(code))) return code;
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${prefix}${randomCode(8)}`;
    if (!(await exists(code))) return code;
  }
  throw new Error("Failed to generate a unique referral/reward code");
}

// ─── ReferralCode (per-user shareable code) ───────────────────────────────

/**
 * Return the user's existing referral code or lazily create one.
 * Idempotent — concurrent calls won't double-insert because of the
 * `clerkUserId` unique constraint; the catch path re-reads.
 */
export async function getOrCreateReferralCode(
  clerkUserId: string
): Promise<ReferralCode> {
  const existing = await prisma.referralCode.findUnique({
    where: { clerkUserId },
  });
  if (existing) return existing;

  const code = await generateUniqueCode("BBF-", async (c) =>
    (await prisma.referralCode.findUnique({ where: { code: c } })) !== null
  );

  try {
    return await prisma.referralCode.create({
      data: { clerkUserId, code },
    });
  } catch {
    // Lost a race against another request for the same user — re-read.
    const reread = await prisma.referralCode.findUnique({
      where: { clerkUserId },
    });
    if (reread) return reread;
    throw new Error("Failed to create referral code");
  }
}

/** Lookup a code typed/clicked by a referee. NULL if not found. */
export async function findReferralCode(
  rawCode: string | null | undefined
): Promise<ReferralCode | null> {
  if (!rawCode) return null;
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;
  return prisma.referralCode.findUnique({ where: { code } });
}

/**
 * Build the public URL a customer can share. Use this everywhere so
 * the share string never drifts from the cookie-setter route.
 */
export function buildReferralUrl(code: string, appUrl: string): string {
  return `${appUrl.replace(/\/+$/, "")}/r/${encodeURIComponent(code)}`;
}

// ─── Stripe coupon helpers ────────────────────────────────────────────────

/**
 * Create a single-use Stripe Coupon worth $5 off applied to one
 * checkout. We always mint a fresh coupon per redemption rather than
 * reusing a shared "REFER5" code — that way each coupon's
 * `max_redemptions=1` enforces "one discount per friend" without us
 * needing to track redemption ourselves on the Stripe side.
 *
 * `metadata.purpose` lets us recognize these on the Stripe dashboard
 * and (if we ever want to) reconcile them against our DB.
 */
export async function createFriendWelcomeStripeCoupon(args: {
  stripe: Stripe;
  referralCode: string;
  referrerClerkUserId: string;
}): Promise<Stripe.Coupon> {
  const { stripe, referralCode, referrerClerkUserId } = args;
  return stripe.coupons.create({
    amount_off: REFERRAL_DISCOUNT_CENTS,
    currency: "usd",
    duration: "once",
    max_redemptions: 1,
    name: `${REFERRAL_DISCOUNT_LABEL} off — referred by a friend`,
    metadata: {
      purpose: "friend-welcome",
      referralCode,
      referrerClerkUserId,
    },
  });
}

/**
 * Create the Stripe-side coupon that backs a RewardCoupon row when
 * we pay out the referrer.
 */
export async function createReferrerRewardStripeCoupon(args: {
  stripe: Stripe;
  ownerClerkUserId: string;
  ownerEmail: string | null;
  rewardCouponCode: string;
}): Promise<Stripe.Coupon> {
  const { stripe, ownerClerkUserId, ownerEmail, rewardCouponCode } = args;
  return stripe.coupons.create({
    amount_off: REFERRAL_DISCOUNT_CENTS,
    currency: "usd",
    duration: "once",
    max_redemptions: 1,
    name: `${REFERRAL_DISCOUNT_LABEL} off — thanks for the referral`,
    metadata: {
      purpose: "referrer-reward",
      rewardCouponCode,
      ownerClerkUserId,
      ownerEmail: ownerEmail ?? "",
    },
  });
}

// ─── RewardCoupon (per-user earned discount) ──────────────────────────────

/**
 * Issue a new RewardCoupon to a user, along with the matching Stripe
 * Coupon used to apply it. The Stripe call happens first — if Stripe
 * errors we don't want a dangling DB row promising a discount we
 * can't actually realize.
 */
export async function issueReferrerRewardCoupon(args: {
  stripe: Stripe;
  ownerClerkUserId: string;
  ownerEmail: string | null;
}): Promise<RewardCoupon> {
  const { stripe, ownerClerkUserId, ownerEmail } = args;
  const code = await generateUniqueCode("RWD-", async (c) =>
    (await prisma.rewardCoupon.findUnique({ where: { code: c } })) !== null
  );

  const stripeCoupon = await createReferrerRewardStripeCoupon({
    stripe,
    ownerClerkUserId,
    ownerEmail,
    rewardCouponCode: code,
  });

  const expiresAt = new Date(
    Date.now() + REWARD_COUPON_VALIDITY_DAYS * 24 * 60 * 60 * 1000
  );

  return prisma.rewardCoupon.create({
    data: {
      code,
      clerkUserId: ownerClerkUserId,
      email: ownerEmail,
      amountOffCents: REFERRAL_DISCOUNT_CENTS,
      reason: "referrer-reward",
      stripeCouponId: stripeCoupon.id,
      expiresAt,
    },
  });
}

/**
 * Find the next reward coupon to auto-apply for a signed-in user at
 * checkout. Returns the oldest unredeemed + unexpired row so
 * customers don't accidentally let earned discounts time out.
 */
export async function findActiveRewardCouponForUser(
  clerkUserId: string
): Promise<RewardCoupon | null> {
  const now = new Date();
  return prisma.rewardCoupon.findFirst({
    where: {
      clerkUserId,
      redeemedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: "asc" },
  });
}

/** List all of a user's reward coupons, newest first, for the UI. */
export async function listRewardCouponsForUser(
  clerkUserId: string
): Promise<RewardCoupon[]> {
  return prisma.rewardCoupon.findMany({
    where: { clerkUserId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Mark a reward coupon as redeemed against a specific order.
 * Idempotent — a second call with the same order id no-ops. We use
 * `updateMany` so a missing row never throws (the order webhook
 * shouldn't crash because the coupon was already cleaned up).
 */
export async function markRewardCouponRedeemed(args: {
  rewardCouponId: string;
  orderId: string;
}): Promise<void> {
  await prisma.rewardCoupon.updateMany({
    where: { id: args.rewardCouponId, redeemedAt: null },
    data: { redeemedAt: new Date(), redeemedOrderId: args.orderId },
  });
}
