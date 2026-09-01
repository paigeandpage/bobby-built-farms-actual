"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import {
  sendOrderCancelledEmail,
  sendOrderFulfilledEmail,
} from "@/lib/email";
import type { OrderStatus } from "@prisma/client";

async function setOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Forbidden");
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus },
    include: { items: { include: { product: true } } },
  });

  if (nextStatus === "FULFILLED") {
    await sendOrderFulfilledEmail(updated);
  } else if (nextStatus === "CANCELLED") {
    await sendOrderCancelledEmail(updated);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account");
}

export async function markFulfilledAction(orderId: string) {
  await setOrderStatus(orderId, "FULFILLED");
}

export async function markCancelledAction(orderId: string) {
  await setOrderStatus(orderId, "CANCELLED");
}

export async function markConfirmedAction(orderId: string) {
  // Used to undo an accidental cancellation. Doesn't trigger an email
  // since the customer wasn't notified of the change yet.
  const admin = await requireAdmin();
  if (!admin) {
    throw new Error("Forbidden");
  }
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CONFIRMED" },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
