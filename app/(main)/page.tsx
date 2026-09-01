import type { Metadata } from "next";
import Link from "next/link";
import { CUTS } from "@/lib/cuts";
import NewsletterSignup from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Home – Bobby Built Farms",
  description:
    "Bobby Built Farms raises pasture-raised chickens in Fairview, Idaho. Non-GMO, soy-free, moved daily.",
};

export default async function HomePage() {
  const fromPrice = Math.min(...CUTS.map((c) => c.pricePerLb));

  return (
    <div className="flex flex-col">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="/chickens-hero.png"
            alt="Bobby Built Farms pasture-raised chickens on green grass"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-brand-green/80" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p className="text-brand-cream/60 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
            Fairview, Idaho
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-brand-cream leading-tight mb-6">
            Raised Right.
            <br />
            <span className="text-brand-gold">Built to Last.</span>
          </h1>
          <p className="text-brand-cream/75 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Pasture-raised chickens moved to fresh grass every single day. No
            GMOs. No soy. No shortcuts. Just food raised the way Bobby would
            have built it — order online and pick up at the farm in Preston,
            Idaho.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-white text-brand-green font-semibold rounded-full hover:bg-brand-cream transition-colors text-sm"
            >
              Shop Now
            </Link>
            <Link
              href="/farm-practices"
              className="inline-flex items-center px-8 py-3.5 border border-brand-cream/40 text-brand-cream font-semibold rounded-full hover:bg-brand-cream/10 transition-colors text-sm"
            >
              How We Farm
            </Link>
          </div>
        </div>
      </section>

      {/* ─── The Bobby Standard ───────────────────────────────────────────── */}
      <section className="bg-brand-cream py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-3">
              Why Bobby Built Farms
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-brand-charcoal">
              The Bobby Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌿",
                title: "Pasture Raised Daily",
                body: "Our chickens move to fresh pasture every single day. They eat real grass, bugs, and seeds, the way chickens are meant to live.",
              },
              {
                icon: "🚫",
                title: "Non-GMO & Soy-Free",
                body: "A non-GMO, soy-free ration supplements their pasture diet. No antibiotics or vaccinations, ever. Clean inputs mean clean nutrition from farm to table.",
              },
              {
                icon: "💊",
                title: "Food as Medicine",
                body: "Our founder Amy has a background in clinical nutrition. She built Bobby Built Farms because she believes the most powerful pharmacy is your plate.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{pillar.icon}</div>
                <h3 className="font-display text-xl text-brand-charcoal mb-3">
                  {pillar.title}
                </h3>
                <p className="text-brand-charcoal/65 text-sm leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Products ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-2">
                Fresh from the Pasture
              </p>
              <h2 className="font-display text-4xl text-brand-charcoal">
                Our Chicken
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:inline-flex text-sm font-medium text-brand-green hover:underline"
            >
              View all products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              href="/product/pasture-raised-poultry"
              className="group bg-brand-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-[4/3] bg-brand-green/10 overflow-hidden relative">
                <img
                  src="/chickens-hero.png"
                  alt="Pasture Raised Poultry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-brand-terracotta text-xs uppercase tracking-wider font-semibold mb-1">
                  Bobby Built Farms
                </p>
                <h3 className="font-display text-xl text-brand-charcoal mb-2 group-hover:text-brand-green transition-colors">
                  Pasture Raised Poultry
                </h3>
                <p className="text-brand-charcoal/60 text-sm leading-relaxed flex-1 mb-4">
                  Non-GMO, soy-free, no antibiotics or vaccinations. Moved to
                  fresh pasture every day. Whole birds, individual cuts,
                  nose-to-tail offal, and bulk value boxes — priced per pound.
                </p>
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

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/shop"
              className="text-sm font-medium text-brand-green hover:underline"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── The Bobby Story ──────────────────────────────────────────────── */}
      <section className="bg-brand-green py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-brand-cream/50 text-sm uppercase tracking-widest font-semibold mb-4">
              A Father&rsquo;s Standard
            </p>
            <h2 className="font-display text-4xl sm:text-5xl text-brand-cream mb-6 leading-tight">
              The Legacy
            </h2>
            <p className="text-brand-cream/75 leading-relaxed mb-4">
              The Bobby Built way means doing the homework and taking the time
              to build things right. If a foundation is shaky or the principles
              are flawed, we aren&rsquo;t afraid to tear it down and start over.
            </p>
            <p className="text-brand-cream/75 leading-relaxed mb-4">
              We bring that same integrity to our pasture-raised chickens.
              Getting it right meant returning to the fundamentals: honest,
              non-GMO feed without a trace of soy filler, and birds that live on
              real grass.
            </p>
            <p className="text-brand-cream/75 leading-relaxed mb-8">
              That&rsquo;s Bobby Built. We raise every batch with the same
              conviction Bobby used to build his legacy, one his daughter Amy
              carries forward on the farm today.
            </p>
            <Link
              href="/farm-practices"
              className="inline-flex items-center px-8 py-3 border border-brand-cream/40 text-brand-cream font-semibold rounded-full hover:bg-brand-cream/10 transition-colors text-sm"
            >
              See How We Farm
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="w-80 h-[28rem] rounded-2xl overflow-hidden border-4 border-brand-cream/20 shadow-2xl">
              <img
                src="/bobby.png"
                alt="Bobby on his tractor at the farm"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────────────── */}
      <section className="bg-brand-charcoal py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-gold/80 text-xs uppercase tracking-widest font-semibold mb-3">
              Stay Connected
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-brand-cream mb-4 leading-tight">
              Know when fresh chicken is ready.
            </h2>
            <p className="text-brand-cream/70 text-sm leading-relaxed">
              Birds finish in batches. Subscribers hear first when a new batch
              comes off pasture, plus the occasional farm update. No spam,
              unsubscribe with one click.
            </p>
          </div>
          <NewsletterSignup
            source="homepage"
            variant="hero"
            collectName
            impliedConsent
          />
        </div>
      </section>

      {/* ─── Trust Bar ────────────────────────────────────────────────────── */}
      <section className="bg-brand-cream-dark py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { stat: "Daily", label: "Pasture Rotation" },
              { stat: "100%", label: "Pasture Raised" },
              { stat: "0", label: "GMOs or Soy" },
              { stat: "Pickup", label: "At the Farm in Preston, ID" },
            ].map((item) => (
              <div key={item.label}>
                <div className="font-display text-3xl text-brand-green font-bold mb-1">
                  {item.stat}
                </div>
                <div className="text-xs text-brand-charcoal/60 uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
