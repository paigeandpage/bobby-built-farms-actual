"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalUnits } = useCartStore();
  const count = totalUnits();

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/farm-practices", label: "How We Farm" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-brand-cream border-b border-brand-cream-dark sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span className="font-display text-brand-green font-bold text-lg tracking-tight">
              Bobby Built Farms
            </span>
            <span className="text-xs text-brand-charcoal/50 tracking-widest uppercase">
              Fairview, Idaho
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-green ${
                  pathname === link.href
                    ? "text-brand-green"
                    : "text-brand-charcoal/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-brand-charcoal hover:text-brand-green transition-colors"
              aria-label="View cart"
            >
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-terracotta text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-brand-charcoal"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-cream-dark px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-brand-charcoal/70 hover:text-brand-green py-1"
            >
              {link.label}
            </Link>
          ))}

        </div>
      )}
    </header>
  );
}
