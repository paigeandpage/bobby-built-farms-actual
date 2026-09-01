"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { CheckCircle, MapPin } from "lucide-react";
import {
  PICKUP_ADDRESS_LINE1,
  PICKUP_CITY_STATE_ZIP,
  PICKUP_MAP_URL,
} from "@/lib/pickup";

export default function OrderConfirmationPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-brand-cream min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center py-20">
        <CheckCircle
          size={64}
          className="text-brand-green mx-auto mb-6"
        />
        <h1 className="font-display text-4xl text-brand-charcoal mb-4">
          Order Confirmed!
        </h1>
        <p className="text-brand-charcoal/60 leading-relaxed mb-6">
          Thank you for your order. We&rsquo;ll email you shortly to coordinate
          a pickup time.
        </p>

        <div className="bg-white rounded-2xl p-5 shadow-sm mb-8 text-left">
          <div className="flex items-start gap-3">
            <MapPin
              size={20}
              className="text-brand-green shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-sm text-brand-charcoal leading-relaxed">
              <p className="font-semibold mb-1">Pickup Location</p>
              <address className="not-italic text-brand-charcoal/75">
                {PICKUP_ADDRESS_LINE1}
                <br />
                {PICKUP_CITY_STATE_ZIP}
              </address>
              <a
                href={PICKUP_MAP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-brand-green hover:underline"
              >
                Get directions →
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center px-8 py-3 bg-brand-green text-white font-semibold rounded-full hover:bg-brand-green-dark transition-colors text-sm"
          >
            View My Orders
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3 border border-brand-green text-brand-green font-semibold rounded-full hover:bg-brand-green hover:text-white transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
        <p className="text-xs text-brand-charcoal/40 mt-6">
          Checked out as a guest?{" "}
          <Link href="/track-order" className="text-brand-green hover:underline">
            Track your order
          </Link>{" "}
          with your email and order code.
        </p>
      </div>
    </div>
  );
}
