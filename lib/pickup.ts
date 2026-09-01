/**
 * Order pickup info for Bobby Built Farms.
 *
 * Pickup at the farm is the primary (and currently only) fulfillment
 * method. Local hand-delivery may roll out later — see lib/delivery.ts
 * for that work-in-progress code path. Until then, every checkout flows
 * through pickup.
 */

export const PICKUP_ADDRESS_LINE1 = "779 W 4800 S";
export const PICKUP_CITY_STATE_ZIP = "Preston, ID 83263";
export const PICKUP_ADDRESS = `${PICKUP_ADDRESS_LINE1}, ${PICKUP_CITY_STATE_ZIP}`;

/** Google Maps URL pre-filled with the pickup address. */
export const PICKUP_MAP_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  PICKUP_ADDRESS
)}`;
