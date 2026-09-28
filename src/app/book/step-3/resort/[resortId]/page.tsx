"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { RESORT_DETAILS } from "@/lib/resort-details";

export default function ResortDetailsPage() {
  const router = useRouter();
  const { resortId } = useParams<{ resortId: string }>();
  const { state, update } = useBooking();
  const [saved, setSaved] = useState(false);
  const resort = RESORTS.find((item) => item.id === resortId);
  const details = resort ? RESORT_DETAILS[resort.tier] : null;

  useEffect(() => {
    if (!resort) router.replace("/book/step-3");
  }, [resort, router]);

  if (!resort || !details) return null;

  const selected = state.resortId === resort.id;
  const total = resort.pricePerNight * state.nights;

  async function shareResort() {
    if (navigator.share) {
      await navigator.share({ title: resort?.name, url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
  }

  function selectResort() {
    update({ resortId: resort!.id });
    router.push("/book/step-4");
  }

  return (
    <main className="min-h-screen bg-white pb-32 text-[#17201c]">
      <section id="photos" className="relative h-[360px] overflow-hidden sm:h-[480px] sm:rounded-b-[32px]">
        <Image src={details.image} alt={`${resort.name} resort`} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#17201c] shadow-lg backdrop-blur" aria-label="Back to resorts"><BackIcon /></button>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSaved((value) => !value)} className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur ${saved ? "bg-[#17633b] text-white" : "bg-white/95 text-[#17201c]"}`} aria-label={saved ? "Remove saved resort" : "Save resort"}><HeartIcon filled={saved} /></button>
            <button type="button" onClick={shareResort} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#17201c] shadow-lg backdrop-blur" aria-label="Share resort"><ShareIcon /></button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-5 flex items-end justify-between px-5 sm:px-8">
          <div className="flex items-center gap-1.5" aria-label="Photo 1 of 3">
            {details.gallery.map((photo, index) => <span key={photo} className={`h-1.5 rounded-full ${index === 0 ? "w-5 bg-white" : "w-1.5 bg-white/65"}`} />)}
          </div>
          <span className="rounded-xl bg-black/55 px-3 py-2 text-xs font-bold text-white backdrop-blur">View {details.gallery.length} photos</span>
        </div>
      </section>

      <nav className="sticky top-0 z-30 border-b border-[#e5e9e6] bg-white/95 backdrop-blur-xl" aria-label="Resort details sections">
        <div className="permit-scroll mx-auto flex max-w-4xl overflow-x-auto px-4">
          {["Photos", "Overview", "Amenities", "Reviews", "Location"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="shrink-0 border-b-2 border-transparent px-4 py-3 text-xs font-bold text-[#66736c] transition hover:border-[#1f6b48] hover:text-[#17201c]">{item}</a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <section id="overview" className="relative -mt-7 rounded-[26px] bg-white p-5 shadow-[0_14px_36px_rgba(20,45,33,0.13)] sm:-mt-10 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#17633b] px-2.5 py-1.5 text-sm font-extrabold text-white">{details.rating}</span>
            <span className="text-sm font-extrabold text-[#17633b]">{ratingLabel(details.rating)}</span>
            <span className="text-xs text-[#758078]">· {details.reviews}</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{resort.name}</h1>
              <div className="mt-2 flex items-center gap-1 text-[#e2a700]" aria-label={`${starCount(resort.tier)} star resort`}>
                {Array.from({ length: 5 }, (_, index) => <StarIcon key={index} filled={index < starCount(resort.tier)} />)}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[#68756e]"><PinIcon />Near {resort.range} safari gate</p>
            </div>
            <span className="rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-extrabold capitalize text-[#17633b]">{resort.tier}</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#59675f]">{details.description}</p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f2f7f3] p-3.5 text-sm font-bold text-[#28553f]"><BadgeIcon />{details.highlight}</div>
        </section>

        <section id="amenities" className="scroll-mt-20 py-9 sm:py-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#50715f]">Everything you need</p>
          <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Amenities</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {details.amenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-3 rounded-2xl bg-[#f6f8f6] p-3.5 text-xs font-bold text-[#34473d]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#17633b] shadow-sm"><AmenityIcon name={amenity} /></span>
                {amenity}
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className="scroll-mt-20 border-t border-[#e7ebe8] py-9 sm:py-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#50715f]">Guest feedback</p>
          <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Ratings & reviews</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[170px_1fr]">
            <div className="rounded-[22px] bg-[#eaf2ff] p-5 text-center">
              <p className="text-5xl font-black text-[#176ee8]">{details.rating}</p>
              <p className="mt-1 text-sm font-extrabold text-[#176ee8]">{ratingLabel(details.rating)}</p>
            </div>
            <div className="flex flex-col justify-center rounded-[22px] border border-[#e4e9e6] p-5">
              <p className="text-sm font-bold">{details.rating} average rating from recent guests</p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#19985a]"><ThumbIcon />{details.guestScore}% guests liked this property</p>
              <p className="mt-2 text-xs text-[#758078]">Based on {details.reviews} in this sample listing.</p>
            </div>
          </div>
        </section>

        <section id="location" className="scroll-mt-20 border-t border-[#e7ebe8] py-9 sm:py-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#50715f]">Plan your arrival</p>
          <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Location</h2>
          <div className="relative mt-5 overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#dceee3_0%,#edf4df_46%,#dceaf1_100%)] p-6 sm:p-8">
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[20px] border-white/35" />
            <div className="absolute bottom-3 left-[38%] h-24 w-1 rotate-[38deg] rounded-full bg-white/55" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#17633b] text-white shadow-lg"><PinIconLarge /></span>
              <div><p className="font-display text-xl font-bold">Near {resort.range} safari gate</p><p className="mt-1 text-xs text-[#607067]">Convenient for early morning and evening safari departures.</p></div>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5e1] bg-white/96 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(24,33,29,0.14)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black">₹{resort.pricePerNight.toLocaleString("en-IN")} <span className="text-[10px] font-semibold text-[#7a8580]">/ night</span></p>
            <p className="truncate text-[10px] text-[#748078]">₹{total.toLocaleString("en-IN")} for {state.nights} night{state.nights === 1 ? "" : "s"} · {formatStayDates(state.startDate, state.nights)}</p>
          </div>
          <button type="button" onClick={selectResort} className="rounded-xl bg-[#fdcb08] px-6 py-3.5 text-sm font-extrabold text-[#17201c] shadow-[0_8px_20px_rgba(253,203,8,0.28)] sm:px-10">{selected ? "Continue →" : "Select stay"}</button>
        </div>
      </div>
    </main>
  );
}

function formatStayDates(startDate: string | null, nights: number) {
  if (!startDate) return "Dates not selected";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + nights);
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

function ratingLabel(rating: number) {
  if (rating >= 4.7) return "Excellent";
  if (rating >= 4.4) return "Very good";
  return "Good";
}

function starCount(tier: string) {
  return tier === "premium" ? 5 : tier === "comfort" ? 4 : 3;
}

function BackIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function HeartIcon({ filled }: { filled: boolean }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9"><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ShareIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>; }
function PinIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>; }
function PinIconLarge() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>; }
function StarIcon({ filled }: { filled: boolean }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "text-[#e2a700]" : "text-[#d9ddda]"}`} fill="currentColor"><path d="m12 2.7 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 2.7Z" /></svg>; }
function BadgeIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 2 2.1 2.9-.4.5 2.9L20 9l-1.4 2.6.9 2.8-2.8.9-1 2.8-2.8-.9L10.5 19l-2.1-2-2.9.4-.5-2.9L2.5 13l1.4-2.6L3 7.6l2.8-.9 1-2.8 2.8.9L12 3Z" /><path d="m8.5 11.5 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ThumbIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Zm0 10h9.4a3 3 0 0 0 2.9-2.3l1.2-5A3 3 0 0 0 17.6 9H14l.7-3.4A2.2 2.2 0 0 0 12.5 3L7 10Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

function AmenityIcon({ name }: { name: string }) {
  if (name.includes("pool")) return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 15c2 0 2 1.5 4 1.5S8 15 10 15s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M2 20c2 0 2 1.5 4 1.5S8 20 10 20s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M8 12V6a3 3 0 0 1 6 0" strokeLinecap="round" /></svg>;
  if (name.includes("Restaurant") || name.includes("meals")) return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 13V5a3 3 0 0 1 3 3v5h-3Zm0 0v8" strokeLinecap="round" /></svg>;
  if (name.includes("Bonfire")) return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-4 3-6 0 3 1 4 2 4 2-2 1-5 0-8Z" /><path d="m5 21 14-4M5 17l14 4" strokeLinecap="round" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
