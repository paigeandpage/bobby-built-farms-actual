"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";
import {
  NEWSLETTER_CONSENT_TEXT,
  type NewsletterSource,
} from "@/lib/newsletter";

type Variant = "footer" | "inline" | "hero" | "card";

interface Props {
  source: NewsletterSource;
  /** Visual variant — controls colors and layout density. */
  variant?: Variant;
  /** Optional custom heading. */
  heading?: string;
  /** Optional custom subheading. */
  subheading?: string;
  /**
   * If true, also show a name field. Useful on the homepage hero
   * where we want first-name personalization in future emails;
   * skipped in the footer to keep friction low.
   */
  collectName?: boolean;
  /**
   * If true, the consent checkbox is hidden and treated as
   * pre-checked. Use this ONLY where the form's purpose is
   * unambiguously "subscribe to marketing emails" AND the consent
   * text is shown to the user adjacent to the submit button — Bobby
   * still gets a CAN-SPAM-compliant express opt-in trail because
   * `consent: true` is sent and the verbatim consent text is
   * snapshotted to every row server-side. Showing the checkbox is
   * safer; we expose this escape hatch for the footer form where the
   * disclosure copy is right above the button.
   */
  impliedConsent?: boolean;
}

export default function NewsletterSignup({
  source,
  variant = "footer",
  heading,
  subheading,
  collectName = false,
  impliedConsent = false,
}: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(impliedConsent);
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
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: collectName ? name : undefined,
          source,
          // When `impliedConsent` is on, the visible disclosure copy
          // immediately above the button supplies the express opt-in
          // affirmation. Either way, the API requires consent: true.
          consent: impliedConsent ? true : consent,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      setStatus("ok");
      setEmail("");
      setName("");
      setConsent(impliedConsent);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  if (status === "ok") {
    return <SuccessState variant={variant} />;
  }

  // ─── Variant: footer ──────────────────────────────────────────────
  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="newsletter-footer-email">
            Email address
          </label>
          <input
            id="newsletter-footer-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 rounded-full bg-brand-cream/10 border border-brand-cream/20 text-brand-cream placeholder:text-brand-cream/40 px-4 py-2 text-sm focus:outline-none focus:border-brand-gold focus:bg-brand-cream/15 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-brand-gold text-brand-charcoal px-5 py-2 text-sm font-semibold hover:bg-brand-cream transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        <p className="text-[10px] text-brand-cream/40 leading-relaxed">
          By subscribing you agree to receive marketing emails from Bobby Built
          Farms. Unsubscribe anytime.
        </p>
        {status === "error" && (
          <p className="text-xs text-red-300">{error}</p>
        )}
      </form>
    );
  }

  // ─── Variant: hero (light, on a colored background) ───────────────
  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        {heading && (
          <h3 className="font-display text-2xl text-brand-cream">{heading}</h3>
        )}
        {subheading && (
          <p className="text-sm text-brand-cream/75 leading-relaxed">
            {subheading}
          </p>
        )}
        {collectName && (
          <input
            type="text"
            required
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full bg-white/10 border border-brand-cream/30 text-brand-cream placeholder:text-brand-cream/50 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-gold transition-colors"
          />
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 rounded-full bg-white/10 border border-brand-cream/30 text-brand-cream placeholder:text-brand-cream/50 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-gold transition-colors"
          />
          <button
            type="submit"
            disabled={status === "loading" || (!impliedConsent && !consent)}
            className="rounded-full bg-brand-gold text-brand-charcoal px-6 py-2.5 text-sm font-semibold hover:bg-brand-cream transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        {!impliedConsent && (
          <ConsentCheckbox
            checked={consent}
            onChange={setConsent}
            tone="dark"
          />
        )}
        {impliedConsent && (
          <p className="text-[11px] text-brand-cream/60 leading-relaxed">
            By subscribing you agree to receive marketing emails from Bobby
            Built Farms. Unsubscribe anytime.
          </p>
        )}
        {status === "error" && (
          <p className="text-xs text-red-300">{error}</p>
        )}
      </form>
    );
  }

  // ─── Variant: card / inline (light surface) ───────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {heading && (
        <div className="flex items-center gap-2">
          <Mail
            size={18}
            className="text-brand-green shrink-0"
            aria-hidden="true"
          />
          <h3 className="font-display text-xl text-brand-charcoal">
            {heading}
          </h3>
        </div>
      )}
      {subheading && (
        <p className="text-sm text-brand-charcoal/60 leading-relaxed">
          {subheading}
        </p>
      )}
      {collectName && (
        <input
          type="text"
          required
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-brand-cream-dark bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
        />
      )}
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-brand-cream-dark bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
      />
      <ConsentCheckbox checked={consent} onChange={setConsent} tone="light" />
      <button
        type="submit"
        disabled={status === "loading" || !consent}
        className="w-full rounded-xl bg-brand-green text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe to Updates"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}

function ConsentCheckbox({
  checked,
  onChange,
  tone,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  tone: "light" | "dark";
}) {
  const labelClass =
    tone === "dark"
      ? "text-brand-cream/75 leading-relaxed"
      : "text-brand-charcoal/70 leading-relaxed";
  const boxClass =
    tone === "dark"
      ? "border-brand-cream/40 bg-white/10 text-brand-gold focus:ring-brand-gold/30"
      : "border-brand-cream-dark text-brand-green focus:ring-brand-green/30";
  return (
    <label
      className={`flex items-start gap-2 text-[11px] cursor-pointer ${labelClass}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mt-0.5 h-3.5 w-3.5 rounded shrink-0 cursor-pointer ${boxClass}`}
      />
      <span>{NEWSLETTER_CONSENT_TEXT}</span>
    </label>
  );
}

function SuccessState({ variant }: { variant: Variant }) {
  if (variant === "footer") {
    return (
      <div className="flex items-center gap-2 text-sm text-brand-gold">
        <Check size={16} aria-hidden="true" />
        <span>You&rsquo;re on the list. Thanks!</span>
      </div>
    );
  }
  if (variant === "hero") {
    return (
      <div className="rounded-2xl bg-white/15 border border-brand-cream/30 p-5 text-brand-cream max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <Check size={18} aria-hidden="true" className="text-brand-gold" />
          <p className="font-semibold text-base">You&rsquo;re on the list.</p>
        </div>
        <p className="text-sm text-brand-cream/75 leading-relaxed">
          Thanks for subscribing. We&rsquo;ll send updates when new product is
          ready, never spam, and you can unsubscribe with one click anytime.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-brand-green/10 border border-brand-green/30 p-4 text-sm text-brand-charcoal">
      <div className="flex items-center gap-2 mb-1">
        <Check size={16} aria-hidden="true" className="text-brand-green" />
        <p className="font-semibold">You&rsquo;re on the list.</p>
      </div>
      <p className="text-xs text-brand-charcoal/60 leading-relaxed">
        Thanks for subscribing — we&rsquo;ll be in touch.
      </p>
    </div>
  );
}
