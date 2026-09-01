"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/newsletter";

type Status = "ACTIVE" | "UNSUBSCRIBED" | "NONE";

interface Props {
  defaultEmail: string;
  initialStatus: Status;
  /** Token used to one-click unsubscribe without leaving the page. */
  unsubscribeToken: string | null;
}

/**
 * Account-page widget for managing the visitor's marketing email
 * subscription. Shows their current status and lets them subscribe /
 * resubscribe / unsubscribe inline. Hits the same public subscribe
 * and unsubscribe endpoints used elsewhere on the site so the
 * consent paper trail is consistent.
 */
export default function NewsletterAccountPanel({
  defaultEmail,
  initialStatus,
  unsubscribeToken,
}: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [token, setToken] = useState<string | null>(unsubscribeToken);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: defaultEmail,
          source: "account",
          consent: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Couldn't subscribe");
      }
      setStatus("ACTIVE");
      // Token may have been freshly minted; the next page load will
      // pick it up. We don't expose it in the API response on
      // purpose — it's only sent in our outbound email footers.
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    if (!token) {
      setError("No unsubscribe token on file. Please reload the page.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, reason: "Unsubscribed from My Account" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Couldn't unsubscribe");
      }
      setStatus("UNSUBSCRIBED");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <Mail
          size={18}
          className="text-brand-green shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-display text-xl text-brand-charcoal">
            Email Updates
          </h2>
          <p className="text-xs text-brand-charcoal/55 mt-0.5">
            {defaultEmail}
          </p>
        </div>
      </div>

      {status === "ACTIVE" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-brand-green">
            <Check size={16} aria-hidden="true" />
            <span>You&rsquo;re subscribed to farm updates.</span>
          </div>
          <button
            type="button"
            onClick={unsubscribe}
            disabled={busy}
            className="text-xs text-brand-charcoal/50 hover:text-brand-terracotta underline underline-offset-2 cursor-pointer disabled:opacity-60"
          >
            {busy ? "Unsubscribing…" : "Unsubscribe"}
          </button>
        </div>
      )}

      {status !== "ACTIVE" && (
        <div className="space-y-3">
          <p className="text-sm text-brand-charcoal/70 leading-relaxed">
            {status === "UNSUBSCRIBED"
              ? "You're currently unsubscribed. Resubscribe to hear when new pasture-raised chicken is ready."
              : "Subscribe to hear when new pasture-raised chicken is ready, plus occasional farm updates."}
          </p>
          <p className="text-[11px] text-brand-charcoal/50 leading-relaxed">
            {NEWSLETTER_CONSENT_TEXT}
          </p>
          <button
            type="button"
            onClick={subscribe}
            disabled={busy}
            className="rounded-full bg-brand-green text-white px-5 py-2 text-sm font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {busy ? "Saving…" : "Subscribe"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
