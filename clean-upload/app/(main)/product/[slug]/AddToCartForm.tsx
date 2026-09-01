"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart";
import type { Product } from "@prisma/client";

const WEIGHT_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];

interface Props {
  product: Product;
}

export default function AddToCartForm({ product }: Props) {
  const [selectedWeight, setSelectedWeight] = useState(1);
  const [customWeight, setCustomWeight] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const { addItem } = useCartStore();

  const weight = useCustom
    ? parseFloat(customWeight) || 0
    : selectedWeight;

  const price = weight * product.pricePerLb;

  const handleAdd = () => {
    if (weight <= 0) return;
    // Use the product slug as the cart's productId. The webhook resolves
    // it back to the real Product.id when creating the OrderItem, which
    // also lets the slug-based CutsSelector flow share the same shape.
    addItem({
      productId: product.slug,
      name: product.name,
      pricePerLb: product.pricePerLb,
      avgLbs: weight,
      count: 1,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="space-y-5">
      {/* Weight selector */}
      <div>
        <label className="block text-sm font-medium text-brand-charcoal mb-3">
          Select Weight
        </label>
        <div className="flex flex-wrap gap-2">
          {WEIGHT_OPTIONS.map((w) => (
            <button
              key={w}
              onClick={() => {
                setSelectedWeight(w);
                setUseCustom(false);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !useCustom && selectedWeight === w
                  ? "bg-brand-green text-white border-brand-green"
                  : "border-brand-cream-dark text-brand-charcoal hover:border-brand-green hover:text-brand-green"
              }`}
            >
              {w} lb{w !== 1 ? "s" : ""}
            </button>
          ))}
          <button
            onClick={() => setUseCustom(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
              useCustom
                ? "bg-brand-green text-white border-brand-green"
                : "border-brand-cream-dark text-brand-charcoal hover:border-brand-green hover:text-brand-green"
            }`}
          >
            Custom
          </button>
        </div>

        {useCustom && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              placeholder="e.g. 6"
              className="w-28 px-3 py-2 border border-brand-cream-dark rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green bg-white"
            />
            <span className="text-sm text-brand-charcoal/60">lbs</span>
          </div>
        )}
      </div>

      {/* Price preview */}
      {weight > 0 && (
        <div className="bg-white rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm text-brand-charcoal/60">
            {weight} lb{weight !== 1 ? "s" : ""} × ${product.pricePerLb.toFixed(2)}/lb
          </span>
          <span className="font-semibold text-brand-green text-lg">
            ${price.toFixed(2)}
          </span>
        </div>
      )}

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={weight <= 0}
        className="w-full py-4 bg-brand-green text-white font-semibold rounded-xl hover:bg-brand-green-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-base"
      >
        Add to Cart &middot; ${price.toFixed(2)}
      </button>
    </div>
  );
}
