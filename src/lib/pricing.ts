import { PRICING, RESORTS } from "./mockData";
import type { BookingState } from "./types";
import { calculatePartyOccupancy } from "./occupancy";
import { transferVehicle } from "./transfers";
import { fareOffer, findCoupon, offerBlocker } from "./offers";

export type CartLine = { label: string; amount: number; detail?: string };

export function computeCart(state: BookingState): {
  lines: CartLine[];
  total: number;
} {
  const lines: CartLine[] = [];
  const numSafaris = state.plan.length;
  const { gypsiesRequired } = calculatePartyOccupancy(state.numAdults, state.childAges);
  const safariVehicles = numSafaris * gypsiesRequired;

  if (numSafaris > 0) {
    lines.push({
      label: "Safari permits",
      amount: PRICING.permitPerSafari * safariVehicles,
      detail: `₹${PRICING.permitPerSafari.toLocaleString("en-IN")} × ${numSafaris} safaris × ${gypsiesRequired} ${gypsiesRequired === 1 ? "gypsy" : "gypsies"}`,
    });
    lines.push({
      label: "Guide & vehicle",
      amount: PRICING.guideAndVehiclePerSafari * safariVehicles,
      detail: `₹${PRICING.guideAndVehiclePerSafari.toLocaleString("en-IN")} × ${numSafaris} safaris × ${gypsiesRequired} ${gypsiesRequired === 1 ? "gypsy" : "gypsies"}`,
    });
  }

  const resort = RESORTS.find((r) => r.id === state.resortId);
  if (resort) {
    lines.push({
      label: resort.name,
      amount: resort.pricePerNight * state.nights,
      detail: `₹${resort.pricePerNight.toLocaleString("en-IN")} × ${state.nights} night${state.nights === 1 ? "" : "s"}`,
    });
  }

  const vehicle = transferVehicle(state.transferVehicle);
  if (vehicle) {
    lines.push({ label: "Pickup & drop transfers", amount: vehicle.price, detail: vehicle.name });
  } else if (state.transfers) {
    lines.push({ label: "Transfers", amount: PRICING.transferFlat });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const travellers = state.numAdults + state.childAges.length;
  let remaining = subtotal;

  const fare = fareOffer(state.specialFares[0]);
  if (fare && fare.amount > 0 && !offerBlocker(fare, state, travellers)) {
    const off = Math.min(fare.amount, remaining);
    if (off > 0) {
      lines.push({ label: `${fare.title} fare`, amount: -off, detail: fare.headline });
      remaining -= off;
    }
  }

  const coupon = state.couponCode ? findCoupon(state.couponCode) : undefined;
  if (coupon && !offerBlocker(coupon, state, travellers)) {
    const off = Math.min(coupon.amount, remaining);
    if (off > 0) {
      lines.push({ label: `Coupon ${coupon.code}`, amount: -off, detail: coupon.title });
      remaining -= off;
    }
  }

  return { lines, total: remaining };
}
