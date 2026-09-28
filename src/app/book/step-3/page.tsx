"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { RESORT_DETAILS } from "@/lib/resort-details";
import type { Resort } from "@/lib/types";

type ResortFilter = "all" | Resort["tier"];

export default function ResortStep() {
  const router = useRouter();
  const { state, update } = useBooking();
  const [filter, setFilter] = useState<ResortFilter>("all");

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) {
      router.replace("/book/step-1");
    }
  }, [router, state.plan.length, state.range, state.startDate]);

  const resorts = useMemo(
    () => RESORTS.filter((resort) => resort.range === state.range && (filter === "all" || resort.tier === filter)),
    [filter, state.range]
  );

  const stayDates = getStayDates(state.startDate, state.nights);

  function continueToReview() {
    router.push("/book/step-4");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-28 sm:pb-10">
      <div className="border-b border-[#e0e5e2] bg-white px-4 pt-1 sm:rounded-b-[28px]">
        <StepIndicator current={3} />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="rounded-[24px] bg-[linear-gradient(135deg,#173c2d,#245e43)] px-5 py-5 text-white shadow-[0_16px_34px_rgba(23,60,45,0.2)] sm:px-7 sm:py-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#bde7cd]">Step 3 · Stay</p>
          <h1 className="font-display mt-1 text-3xl font-bold">Choose your resort</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/75">
            <span className="inline-flex items-center gap-1.5"><CalendarIcon />{stayDates}</span>
            <span>{state.nights} night{state.nights === 1 ? "" : "s"}</span>
            <span>{state.range}</span>
          </div>
        </section>

        <div className="permit-scroll -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Filter resorts by category">
          {(["all", "budget", "comfort", "premium"] as ResortFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${filter === option ? "bg-[#182b22] text-white shadow-md" : "border border-[#dce2de] bg-white text-[#5e6c65]"}`}
            >
              {option === "all" ? "All stays" : option}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#50715f]">Recommended stays</p>
            <h2 className="font-display mt-1 text-2xl font-bold text-[#17201c]">Resorts near {state.range}</h2>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-[#758078]">{resorts.length} options</span>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {resorts.map((resort) => {
            const details = RESORT_DETAILS[resort.tier];
            const selected = state.resortId === resort.id;
            return (
              <article key={resort.id} className={`overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(25,50,40,0.09)] transition ${selected ? "ring-2 ring-[#1f6b48]" : "ring-1 ring-[#e1e6e3]"}`}>
                <Link href={`/book/step-3/resort/${resort.id}`} className="group block" aria-label={`View details for ${resort.name}`}>
                  <div className="relative h-48 overflow-hidden sm:h-52">
                    <Image src={details.image} alt={`${resort.name} property`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold capitalize text-[#244335] shadow-sm">{resort.tier} stay</span>
                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#254236] shadow-sm"><HeartIcon /></span>
                    <span className="absolute bottom-3 left-3 rounded-lg bg-[#17633b] px-2.5 py-1.5 text-xs font-extrabold text-white">{details.rating} ★</span>
                  </div>

                  <div className="p-4 pb-0 sm:p-5 sm:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#66756d]">{details.reviews}</p>
                        <h3 className="font-display mt-1 truncate text-xl font-bold text-[#17201c]">{resort.name}</h3>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-[#66756d]"><PinIcon />Near {resort.range} safari gate</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-black text-[#17201c]">₹{resort.pricePerNight.toLocaleString("en-IN")}</p>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#7c8781]">per night</p>
                      </div>
                    </div>

                    <p className="mt-4 rounded-xl bg-[#f2f7f3] px-3 py-2.5 text-[11px] font-semibold text-[#37604b]">{details.highlight}</p>
                    <ul className="mt-3 space-y-1.5">
                      {details.benefits.map((benefit) => <li key={benefit} className="flex items-center gap-2 text-[11px] text-[#3f6f58]"><CheckIcon />{benefit}</li>)}
                    </ul>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#17633b]">View resort details <span aria-hidden="true">→</span></span>
                  </div>
                </Link>

                <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                  <div className="mt-3 flex items-center gap-3 border-t border-[#e8ece9] pt-4">
                    <p className="min-w-0 flex-1 text-[10px] leading-4 text-[#748078]">₹{(resort.pricePerNight * state.nights).toLocaleString("en-IN")} for {state.nights} night{state.nights === 1 ? "" : "s"}</p>
                    <button
                      type="button"
                      onClick={() => update({ resortId: selected ? null : resort.id })}
                      className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition ${selected ? "bg-[#e8f5ed] text-[#17633b]" : "bg-[#182b22] text-white hover:bg-[#25523d]"}`}
                    >
                      {selected ? "Selected ✓" : "Select stay"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {resorts.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-[#ccd6d0] bg-white p-8 text-center text-sm text-[#6e7a73]">No stays match this filter.</div>}

        <div className="mt-7 hidden items-center justify-between rounded-2xl bg-white p-4 shadow-sm sm:flex">
          <button type="button" onClick={() => router.push("/book/step-2")} className="rounded-xl px-5 py-3 text-sm font-bold text-[#425249]">Back</button>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => { update({ resortId: null }); continueToReview(); }} className="px-4 py-3 text-xs font-bold text-[#68756e]">Skip stay</button>
            <button type="button" onClick={continueToReview} className="rounded-xl bg-[#fdcb08] px-7 py-3 text-sm font-extrabold text-[#17201c] shadow-[0_8px_20px_rgba(253,203,8,0.25)]">Continue to review →</button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5e1] bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_28px_rgba(24,33,29,0.12)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button type="button" onClick={() => { update({ resortId: null }); continueToReview(); }} className="px-2 py-3 text-xs font-bold text-[#68756e]">Skip</button>
          <button type="button" onClick={continueToReview} className="flex-1 rounded-xl bg-[#fdcb08] px-5 py-3.5 text-sm font-extrabold text-[#17201c] shadow-[0_8px_20px_rgba(253,203,8,0.25)]">Continue to review →</button>
        </div>
      </div>
    </main>
  );
}

function getStayDates(startDate: string | null, nights: number) {
  if (!startDate) return "Choose dates";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + nights);
  const startLabel = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const endLabel = end.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${startLabel} – ${endLabel}`;
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" strokeLinecap="round" /></svg>;
}

function HeartIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m4 10 3.3 3.3L16 5.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
