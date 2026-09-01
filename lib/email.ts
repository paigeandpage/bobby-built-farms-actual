import { Resend } from "resend";
import type { Order, OrderItem, Product, Subscription } from "@prisma/client";
import {
  PICKUP_ADDRESS_LINE1,
  PICKUP_CITY_STATE_ZIP,
  PICKUP_MAP_URL,
} from "@/lib/pickup";

// ─── Resend client ─────────────────────────────────────────────────────────

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Bobby Built Farms <noreply@bobbybuiltfarms.com>";
const FARM_EMAIL = process.env.FARM_NOTIFICATION_EMAIL ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://bobbybuiltfarms.com";

// ─── Types ─────────────────────────────────────────────────────────────────

type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  // Set when this order belongs to a Subscription (initial charge or
  // renewal). Lets the customer email mention the cadence and link to
  // /account so they can manage or cancel.
  subscription?: Subscription | null;
};

function formatCadence(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "every month";
  if (interval === "week" && intervalCount === 2) return "every 2 weeks";
  return `every ${intervalCount} ${interval}${intervalCount === 1 ? "" : "s"}`;
}

function subscriptionBlock(
  order: OrderWithItems,
  appUrl: string
): string {
  if (!order.subscription) return "";
  const cadence = formatCadence(
    order.subscription.interval,
    order.subscription.intervalCount
  );
  const heading = order.isSubscriptionInitial
    ? "Subscription started"
    : "Subscription renewal";
  return `
    <div style="background: #4a6741; border-radius: 12px; padding: 16px 18px; margin: 12px 0; color: #ffffff;">
      <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; opacity: 0.75; margin-bottom: 6px;">
        ${heading}
      </div>
      <div style="font-size: 14px; line-height: 1.5;">
        You'll be charged this amount ${cadence} until you cancel.
      </div>
      <a href="${appUrl}/account" style="display: inline-block; margin-top: 10px; background: #ffffff; color: #4a6741; padding: 8px 14px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: 600;">
        Manage or cancel →
      </a>
    </div>`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function shortOrderId(id: string) {
  return id.slice(-8).toUpperCase();
}

function formatItemsTable(order: OrderWithItems): string {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee2cf;">
            <div style="font-weight: 500; color: #2a2a2a;">${item.product.name}</div>
            <div style="font-size: 12px; color: #6f6f6f;">
              ${item.weightLbs.toFixed(2)} lbs × $${item.pricePerLb.toFixed(2)}/lb
            </div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee2cf; text-align: right; color: #2a2a2a;">
            $${item.subtotal.toFixed(2)}
          </td>
        </tr>`
    )
    .join("");
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${rows}
      <tr>
        <td style="padding: 12px 0; font-weight: 600; color: #2a2a2a;">Total</td>
        <td style="padding: 12px 0; font-weight: 600; color: #4a6741; text-align: right; font-size: 16px;">
          $${order.total.toFixed(2)}
        </td>
      </tr>
    </table>`;
}

const pickupBlock = `
  <div style="background: #f4efe2; border-radius: 12px; padding: 16px 18px; margin: 8px 0 4px;">
    <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6f6f6f; font-weight: 600; margin-bottom: 6px;">
      Pickup Location
    </div>
    <div style="color: #2a2a2a; line-height: 1.5; font-size: 14px;">
      ${PICKUP_ADDRESS_LINE1}<br />
      ${PICKUP_CITY_STATE_ZIP}
    </div>
    <a href="${PICKUP_MAP_URL}" style="display: inline-block; margin-top: 8px; color: #4a6741; font-size: 13px; text-decoration: none;">
      Get directions →
    </a>
  </div>`;

const baseShellTop = `
  <div style="background: #f7f0e2; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #2a2a2a;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden;">
      <div style="background: #4a6741; padding: 24px; text-align: center;">
        <div style="color: #f7f0e2; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 600;">
          Bobby Built Farms
        </div>
        <div style="color: #f1c976; font-size: 13px; margin-top: 4px;">
          ${PICKUP_CITY_STATE_ZIP}
        </div>
      </div>
      <div style="padding: 28px 28px 8px;">
`;

const baseShellBottom = `
      </div>
      <div style="padding: 0 28px 28px;">
        <p style="font-size: 11px; color: #b3a895; line-height: 1.5; margin-top: 24px;">
          Bobby Built Farms · Pasture-raised poultry · ${PICKUP_ADDRESS_LINE1}, ${PICKUP_CITY_STATE_ZIP}
        </p>
      </div>
    </div>
  </div>`;

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Send the farmer a heads-up that a new order came in. Includes everything
 * they need to coordinate pickup: customer contact, items, total. Failures
 * are logged but never thrown — the webhook should always 200.
 */
export async function sendOrderNotificationToFarmer(order: OrderWithItems) {
  if (!FARM_EMAIL) {
    console.warn(
      "FARM_NOTIFICATION_EMAIL is not configured — skipping farmer notification email"
    );
    return;
  }

  const subject = `New pickup order: $${order.total.toFixed(2)} — ${order.customerName ?? "customer"}`;
  const html = `${baseShellTop}
    <h1 style="font-size: 22px; margin: 0 0 12px; color: #2a2a2a;">New Pickup Order</h1>
    <p style="color: #6f6f6f; font-size: 14px; margin: 0 0 20px;">
      Order <strong>#${shortOrderId(order.id)}</strong> · ${order.createdAt.toLocaleString(
    "en-US",
    { dateStyle: "medium", timeStyle: "short" }
  )}
    </p>

    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6f6f; margin: 20px 0 6px;">
      Customer
    </h3>
    <p style="margin: 0; line-height: 1.6;">
      ${order.customerName ?? "(no name)"}<br />
      <a href="mailto:${order.customerEmail ?? ""}" style="color: #4a6741;">${
    order.customerEmail ?? "(no email)"
  }</a><br />
      ${order.customerPhone ?? "(no phone)"}
    </p>

    <p style="font-size: 12px; color: #6f6f6f; margin: 16px 0 4px;">
      Reach out to schedule a pickup time at the farm.
    </p>

    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6f6f; margin: 20px 0 6px;">
      Items
    </h3>
    ${formatItemsTable(order)}

    <p style="margin-top: 24px;">
      <a href="${APP_URL}/admin/orders/${order.id}" style="display: inline-block; background: #4a6741; color: #ffffff; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
        Open in Admin
      </a>
    </p>
  ${baseShellBottom}`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: FARM_EMAIL,
      subject,
      html,
    });
  } catch (err) {
    console.error("Failed to send farmer notification email:", err);
  }
}

/**
 * Send the customer a confirmation that their order was placed. Sets
 * Reply-To to the farm's inbox so any replies route there. Includes the
 * pickup address prominently — pickup is the primary fulfillment method.
 */
export async function sendOrderConfirmationToCustomer(order: OrderWithItems) {
  if (!order.customerEmail) {
    console.warn(
      `Order ${order.id} has no customerEmail — skipping customer confirmation email`
    );
    return;
  }

  const subject = `Your Bobby Built Farms order is confirmed`;
  const html = `${baseShellTop}
    <h1 style="font-size: 24px; margin: 0 0 12px; color: #2a2a2a;">
      Thanks for your order${order.customerName ? `, ${order.customerName.split(" ")[0]}` : ""}.
    </h1>
    <p style="color: #6f6f6f; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
      We&rsquo;ve got your order and we&rsquo;re getting your pasture-raised
      chicken ready. <strong style="color: #2a2a2a;">Pickup is at the farm</strong>
      — we&rsquo;ll be in touch shortly to schedule a time that works for you.
    </p>

    <p style="color: #6f6f6f; font-size: 13px; margin: 0 0 20px;">
      Order <strong style="color: #2a2a2a;">#${shortOrderId(order.id)}</strong>
    </p>

    ${pickupBlock}

    ${subscriptionBlock(order, APP_URL)}

    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6f6f; margin: 24px 0 6px;">
      Your Order
    </h3>
    ${formatItemsTable(order)}

    <p style="font-size: 12px; color: #6f6f6f; margin: 4px 0 20px; line-height: 1.5;">
      Final invoice reflects actual fulfillment weight. No shipping or
      delivery fees — pickup is free.
    </p>

    <p style="margin: 24px 0 0; line-height: 1.6;">
      Questions? Just reply to this email — it goes straight to the farm.
    </p>
  ${baseShellBottom}`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
      replyTo: FARM_EMAIL || undefined,
    });
  } catch (err) {
    console.error("Failed to send customer confirmation email:", err);
  }
}

/**
 * Notify the customer that their order has been picked up.
 */
export async function sendOrderFulfilledEmail(order: OrderWithItems) {
  if (!order.customerEmail) return;

  const subject = `Thanks for picking up your Bobby Built Farms order`;
  const html = `${baseShellTop}
    <h1 style="font-size: 24px; margin: 0 0 12px; color: #2a2a2a;">
      Picked up. Enjoy.
    </h1>
    <p style="color: #6f6f6f; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
      Order <strong style="color: #2a2a2a;">#${shortOrderId(order.id)}</strong> has been picked up. Thank you for ordering pasture-raised chicken from Bobby Built Farms.
    </p>

    <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #6f6f6f; margin: 20px 0 6px;">
      Order Summary
    </h3>
    ${formatItemsTable(order)}

    <p style="margin: 24px 0 0; line-height: 1.6;">
      We hope you enjoy it. If anything&rsquo;s not right, just reply to this email.
    </p>
  ${baseShellBottom}`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
      replyTo: FARM_EMAIL || undefined,
    });
  } catch (err) {
    console.error("Failed to send fulfillment email:", err);
  }
}

// ─── Referral reward ───────────────────────────────────────────────────────

interface ReferralRewardEmailArgs {
  /** Address to notify — the referrer. */
  to: string;
  /** Optional first name to personalize the subject/body. */
  firstName?: string | null;
  /** Display label, e.g. "$5". */
  amountLabel: string;
  /** Human-typable reward code, surfaced for support/manual lookup. */
  rewardCode: string;
  /** ISO date the reward expires, if any. */
  expiresAt?: Date | null;
}

/**
 * Tell the referrer that one of their friends just placed an order
 * and that they've earned a discount on their next purchase. The
 * actual coupon is auto-applied at their next checkout — we surface
 * the code in the email purely as a support / receipt artifact.
 */
export async function sendReferralRewardEmail(args: ReferralRewardEmailArgs) {
  const { to, firstName, amountLabel, rewardCode, expiresAt } = args;
  const greeting = firstName ? `, ${firstName}` : "";

  const expiryLine = expiresAt
    ? `<p style="color: #6f6f6f; font-size: 12px; margin: 4px 0 20px;">Expires ${expiresAt.toLocaleDateString(
        "en-US",
        { dateStyle: "long" }
      )}.</p>`
    : "";

  const subject = `You earned ${amountLabel} off — thanks for the referral`;
  const html = `${baseShellTop}
    <h1 style="font-size: 24px; margin: 0 0 12px; color: #2a2a2a;">
      Nice work${greeting}.
    </h1>
    <p style="color: #6f6f6f; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
      A friend you referred just placed their first order with Bobby Built
      Farms. As a thank-you, we&rsquo;ve added <strong style="color: #2a2a2a;">${amountLabel} off</strong>
      your next purchase &mdash; it&rsquo;ll apply automatically the next
      time you check out.
    </p>

    <div style="background: #4a6741; border-radius: 12px; padding: 18px 18px; margin: 16px 0; color: #ffffff; text-align: center;">
      <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; opacity: 0.8;">
        Reward code
      </div>
      <div style="font-family: 'SFMono-Regular', Menlo, Consolas, monospace; font-size: 22px; letter-spacing: 0.12em; margin-top: 8px;">
        ${rewardCode}
      </div>
      <div style="font-size: 12px; opacity: 0.8; margin-top: 6px;">
        Saved to your account &mdash; no need to type it in.
      </div>
    </div>

    ${expiryLine}

    <p style="margin: 24px 0 0; line-height: 1.6;">
      <a href="${APP_URL}/shop" style="display: inline-block; background: #4a6741; color: #ffffff; padding: 10px 18px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 500;">
        Shop now
      </a>
    </p>

    <p style="margin: 24px 0 0; line-height: 1.6; color: #6f6f6f; font-size: 13px;">
      Keep sharing your referral link from <a href="${APP_URL}/account" style="color: #4a6741;">My Account</a> — every friend who orders gets ${amountLabel} off and earns you another ${amountLabel}.
    </p>
  ${baseShellBottom}`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: FARM_EMAIL || undefined,
    });
  } catch (err) {
    console.error("Failed to send referral reward email:", err);
  }
}

/**
 * Notify the customer that their order has been cancelled.
 */
export async function sendOrderCancelledEmail(order: OrderWithItems) {
  if (!order.customerEmail) return;

  const subject = `Your Bobby Built Farms order has been cancelled`;
  const html = `${baseShellTop}
    <h1 style="font-size: 24px; margin: 0 0 12px; color: #2a2a2a;">
      Order cancelled.
    </h1>
    <p style="color: #6f6f6f; font-size: 14px; margin: 0 0 20px; line-height: 1.6;">
      Order <strong style="color: #2a2a2a;">#${shortOrderId(order.id)}</strong> has been cancelled. If you were charged, we&rsquo;ll process a refund manually to your original payment method — refunds typically settle within 5–10 business days. Reply to this email if you don&rsquo;t see it within a week.
    </p>

    <p style="margin: 24px 0 0; line-height: 1.6;">
      Questions? Reply to this email and we&rsquo;ll sort it out.
    </p>
  ${baseShellBottom}`;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.customerEmail,
      subject,
      html,
      replyTo: FARM_EMAIL || undefined,
    });
  } catch (err) {
    console.error("Failed to send cancellation email:", err);
  }
}
