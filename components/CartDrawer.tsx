"use client";

import { X, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateCount, totalPrice } =
    useCartStore();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-brand-cream shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-cream-dark">
          <h2 className="font-display text-xl text-brand-charcoal">
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-1 text-brand-charcoal/50 hover:text-brand-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-brand-charcoal/20" />
              <p className="text-brand-charcoal/50 text-sm">
                Your cart is empty.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="text-sm font-medium text-brand-green hover:underline"
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const estLbs = parseFloat(
                  (item.count * item.avgLbs).toFixed(2)
                );
                const subtotal = parseFloat(
                  (estLbs * item.pricePerLb).toFixed(2)
                );
                return (
                  <li
                    key={item.productId}
                    className="flex gap-3 bg-white rounded-xl p-3 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-lg bg-brand-green/10 flex items-center justify-center text-2xl shrink-0">
                      🐔
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-brand-charcoal truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-brand-charcoal/50 mb-2">
                        ${item.pricePerLb.toFixed(2)}/lb · Avg{" "}
                        {item.avgLbs} lbs/unit
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCount(item.productId, item.count - 1)
                          }
                          className="w-6 h-6 rounded-full border border-brand-cream-dark flex items-center justify-center text-sm hover:bg-brand-cream-dark transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium w-16 text-center">
                          {item.count}{" "}
                          {item.count === 1 ? "unit" : "units"}
                        </span>
                        <button
                          onClick={() =>
                            updateCount(item.productId, item.count + 1)
                          }
                          className="w-6 h-6 rounded-full border border-brand-cream-dark flex items-center justify-center text-sm hover:bg-brand-cream-dark transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-brand-charcoal/30 hover:text-brand-terracotta transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="text-right">
                        <p className="text-xs text-brand-charcoal/40">
                          ~{estLbs} lbs
                        </p>
                        <p className="text-sm font-semibold text-brand-green">
                          ${subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-cream-dark px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-charcoal/60">
                Est. Subtotal
              </span>
              <span className="font-semibold text-brand-charcoal">
                ${totalPrice().toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-brand-charcoal/40">
              Final price based on actual weight at fulfillment. Pickup only
              at the farm in Preston, ID.
            </p>
            <Link
              href="/cart"
              onClick={closeCart}
              className="block w-full bg-brand-green text-white text-center py-3 rounded-xl font-medium hover:bg-brand-green-dark transition-colors"
            >
              Review Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
