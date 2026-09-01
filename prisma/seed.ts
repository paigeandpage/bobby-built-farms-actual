import { PrismaClient } from "@prisma/client";
import { CUTS } from "../lib/cuts";

const prisma = new PrismaClient();

// Sourced from lib/cuts.ts so the storefront and database stay in sync.
// Slugs mirror the cut id used on the pasture-raised-poultry page.
async function main() {
  console.log("Seeding Bobby Built Farms products...");

  for (const cut of CUTS) {
    const descriptionParts = [
      cut.packaging,
      cut.description,
      `Average weight ~${cut.avgLbs} lbs per unit.`,
    ].filter(Boolean);

    const product = {
      name: cut.name,
      slug: cut.id,
      description: descriptionParts.join(" · "),
      pricePerLb: cut.pricePerLb,
      imageUrl: null as string | null,
      available: !cut.soldOut,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`  ✓ ${product.name}`);
  }

  // ─── Temporary test product ──────────────────────────────────────────────
  // Lets the team run a real end-to-end checkout for $0.50 (the Stripe USD
  // minimum). Reach this via /product/test. Delete this block once the
  // pickup checkout flow has been validated in production.
  const testProduct = {
    name: "Test Product",
    slug: "test",
    description:
      "Temporary product for end-to-end checkout testing. Not for sale.",
    pricePerLb: 0.5,
    imageUrl: null as string | null,
    available: true,
  };
  await prisma.product.upsert({
    where: { slug: testProduct.slug },
    update: testProduct,
    create: testProduct,
  });
  console.log(`  ✓ ${testProduct.name} (TEMP — remove after testing)`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
