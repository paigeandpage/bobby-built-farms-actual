export type CutCategory =
  | "Whole Bird"
  | "Cuts"
  | "Nose to Tail"
  | "Value Boxes";

export interface Cut {
  id: string;
  name: string;
  avgLbs: number;
  // Active price the customer pays. While the site is in early-access /
  // presale we charge the wholesale rate from the catalog.
  pricePerLb: number;
  // Standard retail rate. Shown as a strike-through next to pricePerLb so
  // customers can see what they're saving by ordering during presale.
  retailPricePerLb?: number;
  category: CutCategory;
  // Plain product info only — anything that the name + packaging + price/
  // weight chip don't already convey. No marketing copy.
  description?: string;
  packaging?: string;
  imageSrc?: string;
  imagePosition?: string;
  // Out of stock at the farm. The storefront shows a Sold Out state, the
  // seed marks the product unavailable, and checkout rejects the item.
  soldOut?: boolean;
}

// Average weights are typical per-unit weights — the customer's invoice
// reflects actual fulfillment weight.
export const CUTS: Cut[] = [
  // ─── Whole Bird ────────────────────────────────────────────────────────
  {
    id: "whole-small",
    name: "Whole Chicken, Small",
    avgLbs: 2.85,
    pricePerLb: 5.25,
    retailPricePerLb: 7.25,
    category: "Whole Bird",
    description: "~2.5–3 lbs",
  },
  {
    id: "whole-medium",
    name: "Whole Chicken, Medium",
    avgLbs: 3.5,
    pricePerLb: 5.25,
    retailPricePerLb: 7.25,
    category: "Whole Bird",
    description: "~3–4 lbs",
  },
  {
    id: "whole-large",
    name: "Whole Chicken, Large",
    avgLbs: 4.75,
    pricePerLb: 5.25,
    retailPricePerLb: 7.25,
    category: "Whole Bird",
    description: "~4.5–5 lbs",
  },
  {
    id: "whole-jumbo",
    name: "Whole Chicken, Jumbo",
    avgLbs: 5.75,
    pricePerLb: 5.25,
    retailPricePerLb: 7.25,
    category: "Whole Bird",
    description: "~5.5–6 lbs",
  },
  {
    id: "spatchcock",
    name: "Spatchcock Chicken",
    avgLbs: 5,
    pricePerLb: 6.5,
    retailPricePerLb: 8.15,
    category: "Whole Bird",
    description: "Backbone removed and flattened",
  },

  // ─── Cuts ──────────────────────────────────────────────────────────────
  {
    id: "breast-boneless",
    name: "Chicken Breast, Boneless Skinless",
    avgLbs: 1.85,
    pricePerLb: 10.65,
    retailPricePerLb: 15.0,
    category: "Cuts",
    soldOut: true,
  },
  {
    id: "breast-bone-in",
    name: "Chicken Breast, Bone-In with Skin",
    avgLbs: 1.5,
    pricePerLb: 7.15,
    retailPricePerLb: 13.0,
    category: "Cuts",
  },
  {
    id: "leg-quarters",
    name: "Chicken Leg Quarters",
    avgLbs: 1.75,
    pricePerLb: 7.15,
    retailPricePerLb: 13.0,
    category: "Cuts",
    description: "Thigh and drumstick attached, bone-in with skin",
    soldOut: true,
  },
  {
    id: "thighs-bone-in",
    name: "Chicken Thighs, Bone-In with Skin",
    avgLbs: 1.9,
    pricePerLb: 7.25,
    retailPricePerLb: 14.0,
    category: "Cuts",
    packaging: "4 per package",
  },
  {
    id: "thighs-boneless",
    name: "Chicken Thighs, Boneless Skinless",
    avgLbs: 1.3,
    pricePerLb: 8.1,
    retailPricePerLb: 16.0,
    category: "Cuts",
    packaging: "4 per package",
    soldOut: true,
  },
  {
    id: "drumsticks",
    name: "Chicken Drumsticks",
    avgLbs: 1.5,
    pricePerLb: 5.25,
    retailPricePerLb: 6.5,
    category: "Cuts",
    packaging: "4 per package",
  },
  {
    id: "wings",
    name: "Chicken Wings",
    avgLbs: 1.72,
    pricePerLb: 5.25,
    retailPricePerLb: 6.75,
    category: "Cuts",
  },

  // ─── Nose to Tail ──────────────────────────────────────────────────────
  {
    id: "meaty-backs",
    name: "Meaty Backs and Breast",
    avgLbs: 2,
    pricePerLb: 1.25,
    retailPricePerLb: 2.0,
    category: "Nose to Tail",
  },
  {
    id: "skin",
    name: "Chicken Skin",
    avgLbs: 1,
    pricePerLb: 2.15,
    retailPricePerLb: 3.15,
    category: "Nose to Tail",
    soldOut: true,
  },
  {
    id: "hearts",
    name: "Chicken Hearts",
    avgLbs: 1,
    pricePerLb: 7.5,
    retailPricePerLb: 15.0,
    category: "Nose to Tail",
  },
  {
    id: "livers",
    name: "Chicken Livers",
    avgLbs: 1,
    pricePerLb: 5.1,
    retailPricePerLb: 6.6,
    category: "Nose to Tail",
  },
  {
    id: "necks",
    name: "Chicken Necks",
    avgLbs: 1,
    pricePerLb: 3.25,
    retailPricePerLb: 4.5,
    category: "Nose to Tail",
    soldOut: true,
  },
  {
    id: "feet",
    name: "Chicken Feet",
    avgLbs: 1,
    pricePerLb: 5.1,
    retailPricePerLb: 6.75,
    category: "Nose to Tail",
  },

  // ─── Value Boxes ───────────────────────────────────────────────────────
  // The Bone Broth Kit is sold as a fixed bundle ($20 presale / $40 retail).
  // We model it per-pound so cart math stays consistent: 9 lbs × the bundle's
  // effective rate lands on the bundle price exactly.
  {
    id: "bone-broth-kit",
    name: "Chicken Bone Broth Kit",
    avgLbs: 9,
    pricePerLb: 20 / 9,
    retailPricePerLb: 40 / 9,
    category: "Value Boxes",
    packaging: "1 pkg feet · 3 pkgs meaty backs · 2 pkgs necks",
    description: "$20 per kit",
  },
  {
    id: "wing-value-box",
    name: "Chicken Wing Value Box",
    avgLbs: 32,
    pricePerLb: 4.5,
    retailPricePerLb: 6.0,
    category: "Value Boxes",
    packaging: "20 packages of wings",
  },
  {
    id: "drumstick-value-box",
    name: "Chicken Drumstick Value Box",
    avgLbs: 30,
    pricePerLb: 4.5,
    retailPricePerLb: 6.0,
    category: "Value Boxes",
    packaging: "20 packages of drumsticks",
  },
  {
    id: "whole-chicken-value-box",
    name: "Whole Chicken Value Box",
    avgLbs: 33,
    pricePerLb: 5.0,
    retailPricePerLb: 6.7,
    category: "Value Boxes",
    packaging: "8 birds",
  },
];
