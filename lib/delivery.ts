/**
 * Local delivery zone for Bobby Built Farms.
 *
 * The farm is in Fairview, Idaho. We don't ship — we hand-deliver locally
 * within ~30 miles of the farm. To keep checkout simple and free of
 * external geocoding APIs, we maintain a curated allowlist of ZIP codes
 * that fall inside that radius. Customers whose ZIP isn't on the list
 * are pointed at the contact page so we can confirm case-by-case.
 *
 * NOTE: The allowlist below is currently a placeholder pending the real
 * ZIP list from the client. The previous list assumed Fairview, Franklin
 * County, ID (near Preston, adjacent to Cache Valley, UT) — that turned
 * out to be the wrong "Fairview" and the whole geography was off. Until
 * the client confirms the actual delivery ZIPs, only one ZIP is allowed
 * so the developer can continue testing the checkout flow.
 */

export const FARM_CITY = "Fairview, Idaho";
export const DELIVERY_RADIUS_MILES = 30;

/**
 * Placeholder allowlist for development testing only.
 * Replace with the real ZIP list once the client confirms the farm
 * address and the radius they want to serve.
 */
export const DELIVERY_ZIPS: ReadonlySet<string> = new Set([
  "84321", // Logan, UT — developer test ZIP, NOT a real delivery ZIP
]);

/** Strip everything except digits and return the first 5 of a US ZIP. */
export function normalizeZip(input: string): string {
  return input.replace(/\D/g, "").slice(0, 5);
}

/** Returns true if `input` parses to a 5-digit ZIP inside the delivery zone. */
export function isZipInDeliveryZone(input: string): boolean {
  const zip = normalizeZip(input);
  if (zip.length !== 5) return false;
  return DELIVERY_ZIPS.has(zip);
}
