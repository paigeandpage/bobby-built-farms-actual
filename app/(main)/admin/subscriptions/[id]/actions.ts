"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getStripe } from "@/lib/stripe";

/**
 * Admin: schedule a cancellation at the end of the current billing period.
 * The customer keeps service through what they've paid for.
 */
export async function adminCancelAtPeriodEndAction(subscriptionId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Forbidden");

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) throw new Error("Subscription not found");

  await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true },
  });

  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/account");
}

/**
 * Admin: undo a "cancel at period end" while the subscription is still
 * within the current period (Stripe forbids resuming a fully-cancelled sub).
 */
export async function adminResumeAction(subscriptionId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Forbidden");

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) throw new Error("Subscription not found");

  await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: false },
  });

  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/account");
}

/**
 * Admin: cancel immediately. This stops billing right now — Stripe won't
 * issue any more invoices. We do NOT auto-issue a refund here; if the
 * customer paid for a period they didn't fully use, decide separately
 * whether to refund via the Stripe dashboard. The webhook
 * `customer.subscription.deleted` will fire and reconcile our DB to
 * `CANCELLED`, but we mirror the change locally now so the admin UI
 * updates immediately.
 */
export async function adminCancelImmediatelyAction(subscriptionId: string) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Forbidden");

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!subscription) throw new Error("Subscription not found");

  await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId);
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: "CANCELLED", cancelAtPeriodEnd: false },
  });

  revalidatePath(`/admin/subscriptions/${subscriptionId}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/account");
}
