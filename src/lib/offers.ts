import type { BookingState } from "./types";

export type SpecialFare = BookingState["specialFares"][number];

export type FareOffer = {
  kind: "fare";
  id: SpecialFare;
  title: string;
  headline: string;
  detail: string;
  /** Flat amount taken off the trip total (capped at the total). Sample value. */
  amount: number;
  minTravellers?: number;
};

export type CouponOffer = {
  kind: "coupon";
  id: string;
  code: string;
  title: string;
  headline: string;
  detail: string;
  amount: number;
  requiresResort?: boolean;
};

export const FARE_OFFERS: FareOffer[] = [
  { kind: "fare", id: "group_of_4", title: "Group of 4", headline: "Flat ₹6,000 Off", detail: "For groups of 4 or more travellers", amount: 6000, minTravellers: 4 },
  { kind: "fare", id: "senior", title: "Senior Citizen", headline: "Up to ₹4,000 Off", detail: "Travelling with a senior citizen", amount: 4000 },
  { kind: "fare", id: "gst", title: "GST Invoice", headline: "Assured GST invoice", detail: "Claim input credit on your booking", amount: 0 },
  { kind: "fare", id: "armed_forces", title: "Armed Forces", headline: "Up to ₹600 Off", detail: "Serving and retired personnel", amount: 600 },
  { kind: "fare", id: "medical", title: "Doctors & Nurses", headline: "Up to ₹600 Off", detail: "Medical professionals", amount: 600 },
];

export const COUPON_OFFERS: CouponOffer[] = [
  { kind: "coupon", id: "longweekend", code: "LONGWEEKEND", title: "Long Weekend Stay Offer", headline: "Flat ₹350 Off", detail: "On your resort stay", amount: 350, requiresResort: true },
];

export function findCoupon(code: string): CouponOffer | undefined {
  const normalised = code.trim().toUpperCase();
  return COUPON_OFFERS.find((coupon) => coupon.code === normalised);
}

export function fareOffer(id: SpecialFare | undefined): FareOffer | undefined {
  return FARE_OFFERS.find((offer) => offer.id === id);
}

/** Why an offer can't be applied to this trip, or null when it can. */
export function offerBlocker(offer: FareOffer | CouponOffer, state: BookingState, travellers: number): string | null {
  if (offer.kind === "fare" && offer.minTravellers && travellers < offer.minTravellers) {
    return `Needs ${offer.minTravellers}+ travellers`;
  }
  if (offer.kind === "coupon" && offer.requiresResort && !state.resortId) {
    return "Add a resort stay to use this";
  }
  return null;
}
