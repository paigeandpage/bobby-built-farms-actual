"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  email: string;
  token: string;
}

export default function UnsubscribeForm({ email, token }: Props) {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Couldn't unsubscribe");
      }
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "ok") {
    return (
      <div>
        <div className="flex items-center gap-2 text-brand-green mb-2">
          <Check size={18} aria-hidden="true" />
          <p className="font-semibold">You&rsquo;re unsubscribed.</p>
        </div>
        <p className="text-sm text-brand-charcoal/70 leading-relaxed">
          We won&rsquo;t send <strong>{email}</strong> any more marketing
          emails. You&rsquo;ll still get receipts and order updates for any
          orders you place.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-brand-charcoal/70 leading-relaxed">
        Unsubscribe <strong className="text-brand-charcoal">{email}</strong>{" "}
        from Bobby Built Farms marketing emails?
      </p>
      <p className="text-xs text-brand-charcoal/50 leading-relaxed">
        You&rsquo;ll still receive transactional emails (order receipts, pickup
        coordination) for any orders you place.
      </p>
      <label className="block">
        <span className="text-xs text-brand-charcoal/60 mb-1 block">
          Mind sharing why? (optional)
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Too many emails, not relevant, etc."
          className="w-full rounded-xl border border-brand-cream-dark bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand-green transition-colors resize-y"
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-brand-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "loading" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}
