"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
}

/**
 * Admin row actions: flip a subscriber between ACTIVE and
 * UNSUBSCRIBED. Refreshes the page on success so server-rendered
 * counts stay in sync without us reaching for a global store.
 */
export default function NewsletterAdminRowActions({ id, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const flip = async () => {
    if (busy) return;
    const next = status === "ACTIVE" ? "UNSUBSCRIBED" : "ACTIVE";
    if (
      next === "UNSUBSCRIBED" &&
      !window.confirm("Mark this subscriber as unsubscribed?")
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: next,
          reason: next === "UNSUBSCRIBED" ? "Manual admin action" : undefined,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Update failed");
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={flip}
      disabled={busy}
      className="text-xs font-medium text-brand-charcoal/60 hover:text-brand-green underline underline-offset-2 cursor-pointer disabled:opacity-60"
    >
      {busy
        ? "Saving…"
        : status === "ACTIVE"
        ? "Unsubscribe"
        : "Reactivate"}
    </button>
  );
}
