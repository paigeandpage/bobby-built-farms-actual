import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AddToCartForm from "./AddToCartForm";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } }).catch(() => null);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} – Bobby Built Farms`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product = null;

  try {
    product = await prisma.product.findUnique({ where: { slug } });
  } catch {
    // DB not connected
  }

  if (!product) return notFound();

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-charcoal/50 mb-8 flex gap-2">
          <Link href="/shop" className="hover:text-brand-green transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-brand-charcoal">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="aspect-square rounded-2xl bg-brand-green/10 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="text-9xl">🐔</div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-brand-terracotta text-sm uppercase tracking-widest font-semibold mb-2">
              Bobby Built Farms
            </p>
            <h1 className="font-display text-4xl text-brand-charcoal mb-3">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="font-semibold text-brand-green text-3xl">
                ${product.pricePerLb.toFixed(2)}
              </span>
              <span className="text-brand-charcoal/50 text-base">/ lb</span>
            </div>
            <p className="text-brand-charcoal/70 leading-relaxed mb-8 text-base">
              {product.description}
            </p>

            {product.available ? (
              <AddToCartForm product={product} />
            ) : (
              <div className="bg-brand-cream-dark rounded-xl p-5 text-center">
                <p className="text-brand-charcoal/60 font-medium">
                  Currently Unavailable
                </p>
                <p className="text-brand-charcoal/40 text-sm mt-1">
                  Check back soon
                </p>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-8 pt-6 border-t border-brand-cream-dark space-y-2">
              {[
                "Moved to fresh pasture every day",
                "Non-GMO, soy-free ration",
                "No antibiotics, hormones, or vaccinations",
                "Farm pickup in Preston, ID",
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-2 text-sm text-brand-charcoal/60">
                  <span className="text-brand-green">✓</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
