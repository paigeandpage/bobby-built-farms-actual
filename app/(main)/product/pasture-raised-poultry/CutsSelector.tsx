"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { CUTS, type Cut, type CutCategory } from "@/lib/cuts";

function CutCard({ cut }: { cut: Cut }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const handleAdd = () => {
    addItem({
      productId: cut.id,
      name: cut.name,
      pricePerLb: cut.pricePerLb,
      avgLbs: cut.avgLbs,
      count: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const estPrice = cut.pricePerLb * cut.avgLbs;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      {/* Image — intentionally blank for now */}
      <div className="aspect-[16/9] relative bg-brand-green/10 flex items-center justify-center">
        {cut.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cut.imageSrc}
            alt={cut.name}
            className={`w-full h-full object-cover ${cut.imagePosition ?? ""} ${
              cut.soldOut ? "grayscale opacity-60" : ""
            }`}
          />
        ) : (
          <span className="text-4xl opacity-40" aria-hidden="true">
            🐔
          </span>
        )}
        {cut.soldOut && (
          <span className="absolute top-3 right-3 bg-brand-charcoal/80 text-white text-xs font-semibold uppercase tracking-wider rounded-full px-3 py-1">
            Sold Out
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-5 flex flex-col gap-3">
        <div>
          <h3 className="font-display text-lg text-brand-charcoal leading-tight mb-1">
            {cut.name}
          </h3>
          {cut.packaging && (
            <p className="text-brand-terracotta text-xs font-semibold uppercase tracking-wider mb-1">
              {cut.packaging}
            </p>
          )}
          {cut.description && (
            <p className="text-brand-charcoal/55 text-xs leading-relaxed">
              {cut.description}
            </p>
          )}
        </div>

        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-brand-green font-semibold text-xl">
              ${cut.pricePerLb.toFixed(2)}
            </span>
            <span className="text-brand-charcoal/50 text-sm">/ lb</span>
            {cut.retailPricePerLb &&
              cut.retailPricePerLb > cut.pricePerLb && (
                <span className="text-brand-charcoal/40 text-sm line-through">
                  ${cut.retailPricePerLb.toFixed(2)}
                </span>
              )}
          </div>
          <span className="ml-auto text-xs text-brand-charcoal/45 bg-brand-cream rounded-full px-2 py-0.5">
            Avg {cut.avgLbs} lbs/unit · ~${estPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAdd}
          disabled={cut.soldOut}
          className={`w-full py-3 font-medium rounded-xl transition-colors text-sm ${
            cut.soldOut
              ? "bg-brand-cream-dark text-brand-charcoal/40 cursor-not-allowed"
              : added
                ? "bg-brand-green/20 text-brand-green cursor-default"
                : "bg-brand-green text-white hover:bg-brand-green-dark cursor-pointer"
          }`}
        >
          {cut.soldOut ? "Sold Out" : added ? "Added to Cart ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

const SECTIONS: { category: CutCategory; title: string; blurb: string }[] = [
  {
    category: "Whole Bird",
    title: "Whole Bird",
    blurb:
      "Best value. Great for roasting, spatchcocking, or breaking down yourself.",
  },
  {
    category: "Cuts",
    title: "Individual Cuts",
    blurb: "Order exactly what you need. Priced per pound, sold by the unit.",
  },
  {
    category: "Nose to Tail",
    title: "Nose to Tail",
    blurb:
      "Hearts, livers, feet, and bones. Maximum nutrition, minimum waste.",
  },
  {
    category: "Value Boxes",
    title: "Value Boxes",
    blurb:
      "Bulk bundles at a reduced per-pound price. Stock the freezer or the broth pot.",
  },
];

export default function CutsSelector() {
  return (
    <div className="space-y-12">
      {SECTIONS.map(({ category, title, blurb }) => {
        const items = CUTS.filter((c) => c.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category}>
            <h2 className="font-display text-2xl text-brand-charcoal mb-1">
              {title}
            </h2>
            <p className="text-brand-charcoal/50 text-sm mb-5">{blurb}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((cut) => (
                <CutCard key={cut.id} cut={cut} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
