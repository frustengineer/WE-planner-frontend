"use client";

import Link from "next/link";
import { useState } from "react";

type Region = "domestic" | "international";
type Tag = "tigers" | "big-cats" | "rhinos" | "elephants";

type Destination = {
  name: string;
  place: string;
  safariFrom: string;
  stayFrom: string;
  image: string;
  href: string;
  region: Region;
  tags: Tag[];
};

const pexels = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=700`;

// Sample destinations and prices for the demo.
const DESTINATIONS: Destination[] = [
  { name: "Tadoba", place: "Maharashtra / India", safariFrom: "₹4,500", stayFrom: "₹2,900", image: pexels("417074"), href: "/jungles/tadoba", region: "domestic", tags: ["tigers"] },
  { name: "Pench", place: "Madhya Pradesh / India", safariFrom: "₹5,200", stayFrom: "₹3,000", image: pexels("145939"), href: "/jungles/pench", region: "domestic", tags: ["tigers"] },
  { name: "Bandhavgarh", place: "Madhya Pradesh / India", safariFrom: "₹6,100", stayFrom: "₹3,400", image: pexels("133394"), href: "/jungles/bandhavgarh", region: "domestic", tags: ["tigers"] },
  { name: "Gir", place: "Gujarat / India", safariFrom: "₹5,800", stayFrom: "₹2,700", image: pexels("247502"), href: "https://wildexcursions.in/tours/gir/", region: "domestic", tags: ["big-cats"] },
  { name: "Kaziranga", place: "Assam / India", safariFrom: "₹6,700", stayFrom: "₹3,100", image: pexels("677974"), href: "https://wildexcursions.in/tours/kaziranga/", region: "domestic", tags: ["rhinos", "elephants"] },
  { name: "Ranthambore", place: "Rajasthan / India", safariFrom: "₹7,400", stayFrom: "₹3,800", image: pexels("417074"), href: "https://wildexcursions.in/tours/ranthambore/", region: "domestic", tags: ["tigers"] },
  { name: "Masai Mara", place: "Narok / Kenya", safariFrom: "₹38,000", stayFrom: "₹12,000", image: pexels("247502"), href: "/book/step-1", region: "international", tags: ["big-cats", "elephants"] },
  { name: "Serengeti", place: "Mara / Tanzania", safariFrom: "₹42,000", stayFrom: "₹14,500", image: pexels("133394"), href: "/book/step-1", region: "international", tags: ["big-cats"] },
  { name: "Chitwan", place: "Bagmati / Nepal", safariFrom: "₹9,800", stayFrom: "₹4,200", image: pexels("677974"), href: "/book/step-1", region: "international", tags: ["rhinos", "tigers"] },
  { name: "Yala", place: "Southern / Sri Lanka", safariFrom: "₹11,500", stayFrom: "₹5,000", image: pexels("145939"), href: "/book/step-1", region: "international", tags: ["big-cats", "elephants"] },
];

const CATEGORIES: { id: Tag; label: string; icon: string }[] = [
  { id: "tigers", label: "Tigers", icon: "/chips/animal-1.png" },
  { id: "big-cats", label: "Big Cats", icon: "/chips/animal-2.png" },
  { id: "rhinos", label: "Rhinos", icon: "/chips/animal-3.png" },
  { id: "elephants", label: "Elephants", icon: "/chips/elephant.png" },
];

const CARD_HEIGHTS = [216, 250, 236, 200, 250, 216];

export function ExploreDestinations({ className = "" }: { className?: string }) {
  const [region, setRegion] = useState<Region>("domestic");
  const [category, setCategory] = useState<Tag | null>(null);

  const visible = DESTINATIONS.filter((item) => item.region === region && (!category || item.tags.includes(category)));
  const left = visible.filter((_, index) => index % 2 === 0);
  const right = visible.filter((_, index) => index % 2 === 1);

  return (
    <section className={className} aria-label="Explore top packages">
      <div className="relative pt-2 text-center">
        <p className="font-display text-[56px] font-bold leading-none tracking-tight text-[#e9ebf0]" aria-hidden="true">Explore</p>
        <h2 className="-mt-2 text-[15px] font-medium uppercase tracking-[0.14em] text-[#1c1f2e]">Top packages</h2>
      </div>

      <div className="mt-6 grid grid-cols-2 rounded-full bg-[#f1f3f7] p-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]" role="tablist" aria-label="Region">
        {(["domestic", "international"] as Region[]).map((option) => (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={region === option}
            onClick={() => {
              setRegion(option);
              setCategory(null);
            }}
            className={`rounded-full py-3 text-[15px] font-medium capitalize transition ${
              region === option ? "bg-[linear-gradient(160deg,#2f3448,#1c2030)] text-white shadow-[0_6px_14px_rgba(28,32,48,0.3)]" : "text-[#3a3f52]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2.5 overflow-x-auto px-5 pb-1">
        {CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(active ? null : item.id)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-[15px] font-medium transition ${
                active ? "border-[#1c2030] bg-[#1c2030] text-white" : "border-[#dcdfe6] bg-white text-[#2a2e3f]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" aria-hidden="true" className={`h-[22px] w-[22px] object-contain ${active ? "invert" : ""}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-[#f7f8fa] px-4 py-8 text-center text-sm text-[#7b7f90]">No packages match this filter yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 items-start gap-3.5">
          <div className="flex flex-col gap-3.5">
            {left.map((item, index) => (
              <DestinationCard key={item.name} item={item} height={CARD_HEIGHTS[(index * 2) % CARD_HEIGHTS.length]} />
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3.5">
            {right.map((item, index) => (
              <DestinationCard key={item.name} item={item} height={CARD_HEIGHTS[(index * 2 + 1) % CARD_HEIGHTS.length]} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function DestinationCard({ item, height }: { item: Destination; height: number }) {
  const external = item.href.startsWith("http");
  return (
    <Link
      href={item.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="relative block overflow-hidden rounded-[26px] bg-[#1c2030] shadow-[0_10px_22px_rgba(0,0,0,0.14)] transition active:scale-[.98]"
      style={{ height }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt={item.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,22,40,0)_35%,rgba(20,22,40,0.92)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
        <h3 className="font-display text-[22px] font-bold leading-none">{item.name}</h3>
        <p className="mt-1.5 truncate text-[10.5px] font-medium uppercase tracking-wide text-white/80">{item.place}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M3 16h18M4 16V9.5l2.4-4h7.6l3 4H20a1 1 0 0 1 1 1V16" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.5" cy="17.5" r="1.6" /><circle cx="16.5" cy="17.5" r="1.6" /></svg>
          Package from {item.safariFrom}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><path d="M5 20V8l7-4 7 4v12M3 20h18M9 20v-4h6v4M9 10h2M13 10h2M9 13h2M13 13h2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {item.stayFrom}/night
        </p>
      </div>
    </Link>
  );
}
