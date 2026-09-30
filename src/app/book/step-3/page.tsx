"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { RESORT_DETAILS, RESORT_TIER_LABEL } from "@/lib/resort-details";
import type { Resort } from "@/lib/types";

type ResortFilter = "all" | Resort["tier"];

export default function ResortStep() {
  const router = useRouter();
  const { state, update } = useBooking();
  const [filter, setFilter] = useState<ResortFilter>("all");
  const [offerCopied, setOfferCopied] = useState(false);
  const hasSafariPlan = Boolean(state.range && state.startDate && state.plan.length > 0);
  const effectiveRange = state.range ?? "Kolara";
  const selectedResort = RESORTS.find((resort) => resort.id === state.resortId);

  const resorts = useMemo(
    () => RESORTS.filter((resort) => resort.range === effectiveRange && (filter === "all" || resort.tier === filter)),
    [effectiveRange, filter]
  );

  function continueToNext() {
    router.push(hasSafariPlan ? "/book/transfers" : "/book/step-1");
  }

  async function copyOfferCode() {
    try {
      await navigator.clipboard.writeText("LONGWEEKEND");
      setOfferCopied(true);
      window.setTimeout(() => setOfferCopied(false), 1800);
    } catch {
      setOfferCopied(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-28 sm:pb-10">
      <div className="border-b border-[#e0e5e2] bg-white px-4 pb-2 pt-2 sm:rounded-b-[28px] sm:px-7 sm:shadow-[0_10px_30px_rgba(25,50,40,0.06)]">
        <div className="mx-auto grid max-w-4xl grid-cols-[40px_minmax(0,1fr)_72px] items-center gap-2">
          <button type="button" onClick={() => router.push("/book/step-2")} className="flex h-10 w-9 items-center justify-start text-[#17201c] transition hover:-translate-x-0.5 hover:text-[#1f6b48]" aria-label="Back to safari permits">
            <BackIcon />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4d7863]">Step 2 of 3</p>
            <h1 className="font-display truncate text-xl font-bold leading-tight text-[#17201c] sm:text-2xl">Choose your resort</h1>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => router.push("/book/step-1")} className="flex h-10 w-7 items-center justify-center text-[#17201c] transition hover:-translate-y-0.5 hover:text-[#2e7251]" aria-label="Edit trip basics">
              <EditIcon />
            </button>
            <a href="https://wa.me/?text=Hi%2C%20I%20need%20help%20planning%20my%20safari%20with%20Wild%20Excursions." target="_blank" rel="noreferrer" className="flex h-10 w-7 items-center justify-center text-[#18a957] transition hover:-translate-y-0.5 hover:text-[#087a42]" aria-label="Chat on WhatsApp">
              <WhatsAppIcon />
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-md">
          <StepIndicator current={2} currentTone="green" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <section className="resort-offer-edge sticky top-0 z-40 -mx-4 bg-[#ffe36d] px-5 pb-5 pt-4 text-[#111111] sm:mx-0 sm:rounded-[24px] sm:px-6 sm:pb-6 sm:pt-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold sm:text-sm">Long Weekend Stay Offer</p>
              <p className="mt-0.5 whitespace-nowrap text-xl font-black sm:text-2xl">Flat ₹350 Off</p>
              <p className="mt-1 truncate text-[9px] font-semibold text-black/55">On your {effectiveRange} resort stay</p>
            </div>
            <button type="button" onClick={copyOfferCode} className="flex min-w-0 max-w-[190px] flex-1 items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-[#111111] bg-white px-3 py-3 text-left shadow-[0_5px_14px_rgba(17,17,17,0.08)] transition active:scale-[0.98] sm:max-w-[280px] sm:px-5" aria-label="Copy resort offer code LONGWEEKEND">
              <span className="truncate text-xs font-black tracking-[0.02em] sm:text-base">{offerCopied ? "COPIED!" : "LONGWEEKEND"}</span>
              {offerCopied ? <OfferCheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </section>

        <div className="mt-7">
          <p className="px-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Browse by comfort</p>
          <div className="permit-scroll -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Filter resorts by category">
            {(["all", "budget", "comfort", "premium"] as ResortFilter[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold capitalize transition ${filter === option ? "bg-[#fdcb08] text-[#111111] shadow-[0_5px_14px_rgba(253,203,8,0.28)]" : "border border-[#dedede] bg-white text-[#555555] hover:border-[#111111]"}`}
              >
                {option === "all" ? "All stays" : RESORT_TIER_LABEL[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#50715f]">Recommended stays</p>
            <h2 className="font-display mt-1 text-2xl font-bold text-[#17201c]">Resorts near {effectiveRange}</h2>
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
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold text-[#244335] shadow-sm">{RESORT_TIER_LABEL[resort.tier]}</span>
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
                      className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition ${selected ? "bg-[#fdecea] text-[#b3261e] hover:bg-[#fbd9d5]" : "bg-[#182b22] text-white hover:bg-[#25523d]"}`}
                    >
                      {selected ? "Deselect" : "Select stay"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {resorts.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-[#ccd6d0] bg-white p-8 text-center text-sm text-[#6e7a73]">No stays match this filter.</div>}

        <div className="mt-7 hidden items-center justify-between rounded-2xl bg-white p-4 shadow-sm sm:flex">
          <button type="button" onClick={() => router.push(hasSafariPlan ? "/book/step-2" : "/")} className="rounded-xl px-5 py-3 text-sm font-bold text-[#425249]">Back</button>
          <div className="flex items-center gap-3">
            {hasSafariPlan && <button type="button" onClick={() => { update({ resortId: null }); continueToNext(); }} className="px-4 py-3 text-xs font-bold text-[#68756e]">Skip stay</button>}
            <button type="button" onClick={continueToNext} className="rounded-xl bg-[#fdcb08] px-7 py-3 text-sm font-extrabold text-[#17201c] shadow-[0_8px_20px_rgba(253,203,8,0.25)]">{hasSafariPlan ? "Continue to transfers →" : "Plan your safari →"}</button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-50 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#161c19] px-3.5 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
            <div className="flex shrink-0 items-center gap-1">
              {hasSafariPlan && (
                <>
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/tiles/gypsy.png" alt="Safari added" className="h-[44px] w-[44px] max-w-none object-contain" />
                  </span>
                  <span aria-hidden="true" className="text-sm font-extrabold leading-none text-[#FFE36D]">+</span>
                </>
              )}
              <span className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ${selectedResort ? "" : "opacity-90"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tiles/resort.png" alt="" aria-hidden="true" className="h-[50px] w-[50px] max-w-none object-contain" />
              </span>
            </div>
            {selectedResort ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">{selectedResort.name} added · ₹{(selectedResort.pricePerNight * state.nights).toLocaleString("en-IN")}</p>
                <p className="truncate text-xs text-white/70">{state.nights} night{state.nights === 1 ? "" : "s"} · Near {selectedResort.range} gate</p>
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">Choose your resort</p>
                <p className="truncate text-xs text-white/70">Pick a stay as per your convenience</p>
              </div>
            )}
          </div>
          {selectedResort && (
            <button
              type="button"
              onClick={continueToNext}
              className="group flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#FDCB08] px-5 py-2.5 text-[15px] font-extrabold text-[#1c1608] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_14px_32px_rgba(0,0,0,0.28)] transition active:scale-95"
            >
              Continue
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
        </div>
      </div>
    </main>
  );
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

function CopyIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="5" width="11" height="14" rx="2" /><path d="M16 5V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" strokeLinecap="round" /></svg>;
}

function OfferCheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BackIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EditIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a.996.996 0 0 0 0-1.41l-2.51-2.51a.996.996 0 0 0-1.41 0l-1.96 1.96 3.75 3.75 2.13-1.79Z" /></svg>;
}
function WhatsAppIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[25px] w-[25px]" fill="currentColor"><path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.94L2.05 22l5.19-1.36A9.84 9.84 0 1 0 12.04 2Zm0 17.97a8.15 8.15 0 0 1-4.15-1.14l-.3-.18-3.08.81.82-3-.2-.31a8.12 8.12 0 1 1 6.91 3.82Zm4.46-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" /></svg>;
}
