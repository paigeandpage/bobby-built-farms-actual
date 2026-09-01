import type { Metadata } from "next";
import Link from "next/link";
import CutsSelector from "./CutsSelector";

export const metadata: Metadata = {
  title: "Pasture Raised Poultry – Bobby Built Farms",
  description:
    "Pasture-raised chicken from Bobby Built Farms. Non-GMO, soy-free, moved to fresh grass every day. Order by the cut, priced per pound.",
};

export default function PastureRaisedPoultryPage() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-8 flex gap-2">
          <Link
            href="/shop"
            className="hover:text-brand-green transition-colors"
          >
            Shop
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">Pasture Raised Poultry</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-2">
            Bobby Built Farms
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-charcoal mb-4">
            Pasture Raised Poultry
          </h1>
          <p className="text-brand-charcoal/65 text-base leading-relaxed max-w-2xl mb-5">
            Moved to fresh pasture every single day. Fed a non-GMO, soy-free
            ration. No antibiotics, hormones, or vaccinations. Raised in
            Fairview, Idaho — order online and pick up at the farm in Preston,
            Idaho.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-3">
            {[
              "✓ Non-GMO",
              "✓ Soy-Free",
              "✓ No Antibiotics or Vaccines",
              "✓ Daily Pasture Rotation",
            ].map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium text-brand-green bg-brand-green/10 px-3 py-1 rounded-full"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing note */}
        <div className="bg-white rounded-2xl px-5 py-4 mb-8 shadow-sm flex items-start gap-3 text-sm text-brand-charcoal/65">
          <span className="text-brand-green text-base mt-0.5">ⓘ</span>
          <p>
            <span className="font-semibold text-brand-charcoal">
              Early-access pricing.
            </span>{" "}
            Every cut below is discounted from its standard rate as a
            thank-you for ordering during our presale. Cuts are priced per
            pound — your final invoice reflects actual fulfilled weight.
          </p>
        </div>

        {/* Cuts */}
        <CutsSelector />
      </div>
    </div>
  );
}
