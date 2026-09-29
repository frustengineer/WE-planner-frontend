import type { Resort } from "./types";

export type ResortPresentation = {
  image: string;
  gallery: string[];
  rating: number;
  reviews: string;
  guestScore: number;
  highlight: string;
  description: string;
  benefits: string[];
  amenities: string[];
};

export const RESORT_TIER_LABEL: Record<Resort["tier"], string> = {
  budget: "Deluxe",
  comfort: "Semi-luxury",
  premium: "Luxury",
};

const PHOTOS = {
  pool: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1400",
  resort: "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1400",
  lodge: "https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=1400",
  room: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1400",
};

export const RESORT_DETAILS: Record<Resort["tier"], ResortPresentation> = {
  budget: {
    image: PHOTOS.pool,
    gallery: [PHOTOS.pool, PHOTOS.room, PHOTOS.resort],
    rating: 4.2,
    reviews: "320 ratings",
    guestScore: 84,
    highlight: "Comfortable stay close to your safari gate",
    description: "A relaxed, practical base for early safari departures, with comfortable rooms and helpful local service.",
    benefits: ["4 meals included: Breakfast, lunch, high tea & dinner", "Free cancellation options"],
    amenities: ["Restaurant", "Parking", "Air conditioning", "Hot water", "Room service", "Safari wake-up call"],
  },
  comfort: {
    image: PHOTOS.resort,
    gallery: [PHOTOS.resort, PHOTOS.pool, PHOTOS.room],
    rating: 4.5,
    reviews: "510 ratings",
    guestScore: 89,
    highlight: "Popular with wildlife travellers",
    description: "A welcoming forest retreat combining modern comforts with convenient access to the nearby safari gate.",
    benefits: ["4 meals included: Breakfast, lunch, high tea & dinner", "Early safari wake-up service"],
    amenities: ["Swimming pool", "Restaurant", "Bonfire", "Parking", "Air conditioning", "Room service"],
  },
  premium: {
    image: PHOTOS.lodge,
    gallery: [PHOTOS.lodge, PHOTOS.room, PHOTOS.pool],
    rating: 4.8,
    reviews: "280 ratings",
    guestScore: 94,
    highlight: "Premium forest stay with curated meals",
    description: "An elevated wilderness stay with spacious rooms, curated dining and thoughtful service before and after every safari.",
    benefits: ["4 meals included: Breakfast, lunch, high tea & dinner", "Flexible check-in support"],
    amenities: ["Swimming pool", "Spa", "Restaurant", "Bonfire", "Nature trail", "Safari concierge"],
  },
};
