"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import type { Product } from "@prisma/client";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem, openCart } = useCartStore();

  const handleQuickAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      pricePerLb: product.pricePerLb,
      avgLbs: 1,
      count: 1,
      imageUrl: product.imageUrl,
    });
    openCart();
  };

  return (
    <div className="bg-brand-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block">
        <div className="aspect-[4/3] bg-brand-green/10 flex items-center justify-center relative overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
              🐔
            </div>
          )}
          {!product.available && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold text-brand-charcoal/60 uppercase tracking-wider">
                Unavailable
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-lg text-brand-charcoal mb-1 hover:text-brand-green transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-brand-charcoal/60 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-brand-green text-lg">
              ${product.pricePerLb.toFixed(2)}
            </span>
            <span className="text-brand-charcoal/50 text-sm"> /lb</span>
          </div>
          {product.available ? (
            <button
              onClick={handleQuickAdd}
              className="px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-full hover:bg-brand-green-dark transition-colors"
            >
              Add 1 lb
            </button>
          ) : (
            <span className="px-4 py-2 bg-brand-cream-dark text-brand-charcoal/40 text-sm font-medium rounded-full cursor-not-allowed">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
