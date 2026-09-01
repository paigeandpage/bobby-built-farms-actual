import type { Metadata } from "next";
import Link from "next/link";
import { CUTS } from "@/lib/cuts";

export const metadata: Metadata = {
  title: "Shop – Bobby Built Farms",
  description:
    "Shop pasture-raised chicken from Bobby Built Farms in Fairview, Idaho. Non-GMO, soy-free, moved to fresh pasture every day.",
};

export default function ShopPage() {
  const fromPrice = Math.min(...CUTS.map((c) => c.pricePerLb));

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-brand-cream-dark py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-2">
            Bobby Built Farms
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-brand-charcoal mb-3">
            Our Chicken
          </h1>
          <p className="text-brand-charcoal/60 max-w-xl text-base">
            Pasture raised daily. Non-GMO, soy-free, no antibiotics or
            vaccinations. Raised in Fairview, Idaho — order online, then pick
            up at the farm in Preston, Idaho.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Static placeholder product card */}
            <Link
              href="/product/pasture-raised-poultry"
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-brand-green/10 overflow-hidden relative">
                <img
                  src="/chickens-hero.png"
                  alt="Pasture Raised Poultry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-brand-terracotta text-xs uppercase tracking-wider font-semibold mb-1">
                  Bobby Built Farms
                </p>
                <h2 className="font-display text-xl text-brand-charcoal mb-2 group-hover:text-brand-green transition-colors">
                  Pasture Raised Poultry
                </h2>
                <p className="text-brand-charcoal/60 text-sm leading-relaxed flex-1 mb-4">
                  Non-GMO, soy-free, no antibiotics or vaccinations. Moved to
                  fresh pasture every day. Whole birds, individual cuts,
                  nose-to-tail offal, and bulk value boxes — priced per pound.
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {["Non-GMO", "Soy-Free", "No Antibiotics or Vaccines"].map((b) => (
                    <span
                      key={b}
                      className="text-xs text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full font-medium"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-brand-green text-lg">
                      From ${fromPrice.toFixed(2)}
                    </span>
                    <span className="text-brand-charcoal/50 text-sm"> /lb</span>
                  </div>
                  <span className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-full group-hover:bg-brand-green-dark transition-colors">
                    Select Cuts
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-t border-brand-cream-dark py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-brand-charcoal/60">
            {[
              "✅ Moved to fresh pasture daily",
              "✅ Non-GMO soy-free ration",
              "✅ No antibiotics, hormones, or vaccinations",
              "✅ Farm pickup in Preston, ID",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
