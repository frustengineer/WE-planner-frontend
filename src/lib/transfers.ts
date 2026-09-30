export type TransferVehicleId = "innova" | "dzire" | "urbania";
export type TransferChoice = TransferVehicleId | "own";

export type TransferVehicle = {
  id: TransferVehicleId;
  name: string;
  category: string;
  image: string;
  seats: string;
  maxTravellers: number;
  /** Sample flat price for the complete trip (pickup and drop). */
  price: number;
  features: string[];
};

export const TRANSFER_VEHICLES: TransferVehicle[] = [
  {
    id: "dzire",
    name: "Sedan · Swift Dzire",
    category: "Sedan",
    image: "/tiles/swift-dzire.png",
    seats: "Up to 4 travellers",
    maxTravellers: 4,
    price: 1500,
    features: ["AC", "2 medium bags", "Best for couples & small families"],
  },
  {
    id: "innova",
    name: "Innova Crysta",
    category: "SUV",
    image: "/tiles/innova-crysta.png",
    seats: "Up to 6 travellers",
    maxTravellers: 6,
    price: 2500,
    features: ["AC", "4 medium bags", "Extra legroom for long drives"],
  },
  {
    id: "urbania",
    name: "Urbania",
    category: "Tempo Traveller",
    image: "/tiles/urbania.png",
    seats: "Up to 12 travellers",
    maxTravellers: 12,
    price: 4500,
    features: ["AC", "Large luggage space", "Best for big groups"],
  },
];

export function transferVehicle(choice: TransferChoice | null | undefined): TransferVehicle | undefined {
  return TRANSFER_VEHICLES.find((vehicle) => vehicle.id === choice);
}

/** The smallest vehicle that fits the whole party. */
export function recommendedVehicle(travellers: number): TransferVehicleId {
  return (TRANSFER_VEHICLES.find((vehicle) => travellers <= vehicle.maxTravellers) ?? TRANSFER_VEHICLES[TRANSFER_VEHICLES.length - 1]).id;
}
