import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import NewsletterSignup from "@/components/NewsletterSignup";
import {
  PICKUP_ADDRESS,
  PICKUP_ADDRESS_LINE1,
  PICKUP_CITY_STATE_ZIP,
  PICKUP_MAP_URL,
} from "@/lib/pickup";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="bg-brand-green text-brand-cream text-center text-xs sm:text-sm py-2 px-4 font-medium">
        <span aria-hidden="true">📍</span>{" "}
        Pickup orders at{" "}
        <a
          href={PICKUP_MAP_URL}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-brand-gold transition-colors"
        >
          {PICKUP_ADDRESS}
        </a>
      </div>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <footer className="bg-brand-charcoal text-brand-cream py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl mb-3">Bobby Built Farms</h3>
            <p className="text-sm text-brand-cream/70 leading-relaxed">
              Pasture-raised chicken raised the right way, the Bobby Built way.
              Order online, then pick up at the farm.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-brand-cream/50">
              Pickup Location
            </h4>
            <address className="not-italic text-sm text-brand-cream/70 leading-relaxed">
              {PICKUP_ADDRESS_LINE1}
              <br />
              {PICKUP_CITY_STATE_ZIP}
            </address>
            <a
              href={PICKUP_MAP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-sm text-brand-gold hover:text-brand-cream transition-colors"
            >
              Get directions →
            </a>
            <p className="text-xs text-brand-cream/50 mt-3 leading-relaxed">
              We&rsquo;ll email you to coordinate a pickup time after you order.
              Local delivery is coming soon.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-brand-cream/50">
              Farm Updates
            </h4>
            <p className="text-sm text-brand-cream/70 leading-relaxed mb-3">
              Get an email when new product is ready and stay in the loop on
              farm news.
            </p>
            <NewsletterSignup source="footer" variant="footer" impliedConsent />
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-brand-cream/50">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-brand-cream/70">
              <li>
                <a
                  href="/shop"
                  className="hover:text-brand-cream transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/farm-practices"
                  className="hover:text-brand-cream transition-colors"
                >
                  How We Farm
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-brand-cream transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/track-order"
                  className="hover:text-brand-cream transition-colors"
                >
                  Track Order
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-brand-cream/10 text-xs text-brand-cream/40 text-center">
          &copy; {new Date().getFullYear()} Bobby Built Farms &middot;{" "}
          {PICKUP_CITY_STATE_ZIP}
        </div>
      </footer>
    </>
  );
}
