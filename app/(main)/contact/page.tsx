import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Bobby Built Farms",
  description:
    "Get in touch with Bobby Built Farms in Fairview, Idaho. Questions about our pasture-raised chicken, orders, or the farm itself — send us a note.",
};

const FARM_EMAIL = "bobbybuiltfarms@gmail.com";

export default function ContactPage() {
  return (
    <div className="bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-green py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-cream/50 text-sm uppercase tracking-widest font-semibold mb-4">
            Get in Touch
          </p>
          <h1 className="font-display text-5xl sm:text-6xl text-brand-cream leading-tight mb-6">
            Contact Us
          </h1>
          <p className="text-brand-cream/70 text-lg leading-relaxed">
            Questions about our chicken, an order, or the farm itself? Send
            us a note and we&rsquo;ll get back to you.
          </p>
        </div>
      </section>

      {/* Contact card */}
      <section className="py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-3">
              Email
            </p>
            <a
              href={`mailto:${FARM_EMAIL}`}
              className="font-display text-2xl sm:text-3xl text-brand-green hover:underline break-all"
            >
              {FARM_EMAIL}
            </a>
            <p className="text-brand-charcoal/60 text-sm mt-6 leading-relaxed">
              Email is the best way to reach the farm.
            </p>
            <a
              href={`mailto:${FARM_EMAIL}`}
              className="inline-flex items-center px-8 py-3 bg-brand-green text-white font-semibold rounded-full hover:bg-brand-green-dark transition-colors text-sm mt-8"
            >
              Send an Email
            </a>
          </div>

          <div className="mt-10 text-center">
            <p className="uppercase tracking-widest text-xs mb-1 text-brand-charcoal/40 font-semibold">
              Location
            </p>
            <p className="text-sm text-brand-charcoal/60">Fairview, Idaho</p>
          </div>
        </div>
      </section>
    </div>
  );
}
