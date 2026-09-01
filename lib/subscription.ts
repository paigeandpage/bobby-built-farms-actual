/**
 * Shared subscription marketing/promo constants.
 *
 * `PRICE_LOCK_DEADLINE` is the cutoff date for our launch promotion:
 * customers who start a recurring subscription on or before this date
 * keep their current per-pound pricing for one year, even if our list
 * prices go up in the meantime.
 *
 * The deadline is encoded as a UTC instant so it behaves the same on
 * the server (Vercel, UTC) and in the browser (any timezone). For a
 * customer-facing copy date we use the calendar date below.
 */
export const PRICE_LOCK_DEADLINE = new Date("2026-06-22T23:59:59-06:00");

/** Human-readable deadline for cart/marketing copy. */
export const PRICE_LOCK_DEADLINE_LABEL = "June 22, 2026";

/** How long the locked-in price is honored. */
export const PRICE_LOCK_DURATION_LABEL = "one year";

/**
 * `true` if a customer subscribing right now still qualifies for the
 * one-year price lock. Cart UI uses this to decide whether to render
 * the promo callout.
 */
export function isPriceLockActive(now: Date = new Date()): boolean {
  return now.getTime() <= PRICE_LOCK_DEADLINE.getTime();
}
