import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How We Farm – Bobby Built Farms",
  description:
    "How we raise pasture chickens in Fairview, Idaho. Daily rotation, non-GMO soy-free feed, a food-as-medicine philosophy, and the story behind the name.",
};

export default function FarmPracticesPage() {
  return (
    <div className="bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-charcoal py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-cream/50 text-sm uppercase tracking-widest font-semibold mb-4">
            Transparency First
          </p>
          <h1 className="font-display text-5xl sm:text-6xl text-brand-cream leading-tight mb-6">
            How We Farm
          </h1>
          <p className="text-brand-cream/70 text-lg leading-relaxed">
            Here is exactly how your food is raised, from day one.
          </p>
        </div>
      </section>

      {/* Practices */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Daily Pasture Rotation */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="text-5xl mt-1">🌿</div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal mb-3">
                Daily Pasture Rotation
              </h2>
              <p className="text-brand-charcoal/80 leading-relaxed mb-3 text-base">
                Our chickens are moved to fresh pasture every single day. That
                gives them constant access to clean grass, bugs, and seeds
                while letting the land behind them rest and recover.
              </p>
              <p className="text-brand-charcoal/80 leading-relaxed text-base">
                Daily rotation is more work, but it produces healthier birds and
                healthier soil. It is the foundation of everything we do.
              </p>
            </div>
          </div>

          <hr className="border-brand-cream-dark" />

          {/* Non-GMO Soy-Free Feed */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="text-5xl mt-1">🌾</div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal mb-3">
                Non-GMO, Soy-Free Ration
              </h2>
              <p className="text-brand-charcoal/80 leading-relaxed mb-3 text-base">
                Pasture alone is not enough to fully nourish a chicken. We
                supplement with a non-GMO, soy-free feed ration.
              </p>
              <p className="text-brand-charcoal/80 leading-relaxed text-base">
                Clean inputs make clean food. We chose this feed because Amy
                would not put anything on the farm that she would not put on her
                own family&rsquo;s table.
              </p>
            </div>
          </div>

          <hr className="border-brand-cream-dark" />

          {/* Food as Medicine */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="text-5xl mt-1">💊</div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal mb-3">
                Food as Medicine
              </h2>
              <p className="text-brand-charcoal/80 leading-relaxed mb-3 text-base">
                Amy&rsquo;s background is in clinical nutrition. She started
                Bobby Built Farms because she believes the most powerful
                pharmacy is your plate.
              </p>
              <p className="text-brand-charcoal/80 leading-relaxed text-base">
                That belief shapes every decision on this farm. The feed we
                choose, the way we rotate pasture, the practices we refuse to
                compromise on. If it does not produce genuinely better food, we
                do not do it.
              </p>
            </div>
          </div>

          <hr className="border-brand-cream-dark" />

          {/* No Antibiotics / Vaccinations / Hormones */}
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="text-5xl mt-1">🚫</div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal mb-3">
                No Antibiotics. No Vaccinations. No Hormones. Ever.
              </h2>
              <p className="text-brand-charcoal/80 leading-relaxed text-base">
                Our chickens never receive antibiotics, vaccinations, or added
                hormones. Healthy birds start with healthy conditions: fresh
                pasture, clean feed, and enough space to live like chickens are
                supposed to live.
              </p>
            </div>
          </div>

          <hr className="border-brand-cream-dark" />

          {/* About the Name */}
          <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="w-40 h-52 rounded-2xl overflow-hidden border-4 border-brand-green/10 shadow-sm mx-auto sm:mx-0">
              <img
                src="/bobby.png"
                alt="Bobby on his tractor at the farm"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl text-brand-charcoal mb-3">
                About the Name
              </h2>
              <p className="text-brand-charcoal/80 leading-relaxed mb-3 text-base">
                Bobby Built Farms is named for Amy&rsquo;s father. Bobby was
                a builder by nature. He did the homework and took the time to
                get it right, and if he put his name on something, it was
                done right.
              </p>
              <p className="text-brand-charcoal/80 leading-relaxed text-base">
                That&rsquo;s the standard Amy built the farm on, and
                it&rsquo;s why it carries his name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-green py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl text-brand-cream mb-4">
            Ready to Taste the Difference?
          </h2>
          <p className="text-brand-cream/70 mb-8 text-sm">
            Our chicken is raised the right way. Order online and pick up at
            the farm in Preston, Idaho.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-10 py-3.5 bg-brand-terracotta text-white font-semibold rounded-full hover:bg-brand-terracotta-dark transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
