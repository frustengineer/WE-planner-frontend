import type { Jungle } from "./types";

const image = (photo: string) =>
  `https://images.pexels.com/photos/${photo}/pexels-photo-${photo}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

export const JUNGLES: Jungle[] = [
  {
    slug: "tadoba",
    name: "Tadoba-Andhari",
    tagline: "Teak forests, bamboo thickets and tiger country",
    description:
      "Explore Tadoba-Andhari through its core and buffer ranges, with safari planning focused on the Kolara, Moharli, Navegaon, and Pangadi & Zari gates.",
    ranges: ["Kolara", "Moharli", "Navegaon", "Pangadi & Zari"],
    animals: ["Tiger", "Leopard", "Sloth bear", "Dhole", "Gaur"],
    bestSeason: "March to May for dry-season sightings; October to February for cooler drives.",
    state: "Maharashtra",
    image: image("417074"),
  },
  {
    slug: "pench",
    name: "Pench",
    tagline: "Teak forest and open central Indian woodland",
    description:
      "Plan a Pench safari across its buffer and core gates, with sample zone recommendations for the Pench range.",
    ranges: ["Pench"],
    animals: ["Tiger", "Leopard", "Wild dog", "Gaur", "Indian wolf"],
    bestSeason: "November to May, with warm-season drives offering the best chances around water.",
    state: "Madhya Pradesh",
    image: image("66898"),
  },
  {
    slug: "bandhavgarh",
    name: "Bandhavgarh",
    tagline: "Sal forest beneath the Vindhya hills",
    description: "Destination details and safari planning are being prepared.",
    ranges: ["Tala", "Magadhi", "Khitauli"],
    animals: ["Tiger", "Leopard", "Sloth bear"],
    bestSeason: "October to June.",
    comingSoon: true,
    state: "Madhya Pradesh",
    image: image("247502"),
  },
];

export async function getJungles(): Promise<Jungle[]> {
  return JUNGLES;
}

export async function getJungleBySlug(slug: string): Promise<Jungle | null> {
  return JUNGLES.find((jungle) => jungle.slug === slug) ?? null;
}
