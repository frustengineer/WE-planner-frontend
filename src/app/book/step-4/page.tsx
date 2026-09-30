"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { calculatePartyOccupancy } from "@/lib/occupancy";
import { COUPON_OFFERS, FARE_OFFERS, fareOffer, findCoupon, offerBlocker, type CouponOffer, type FareOffer } from "@/lib/offers";
import { computeCart } from "@/lib/pricing";
import { transferVehicle } from "@/lib/transfers";
import { RESORT_DETAILS, RESORT_TIER_LABEL } from "@/lib/resort-details";

export default function Step4() {
  const router = useRouter();
  const { state, update } = useBooking();
  const [couponInput, setCouponInput] = useState("");
  const [offersOpen, setOffersOpen] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) router.replace("/book/step-1");
  }, [router, state.plan.length, state.range, state.startDate]);

  const { lines, total } = computeCart(state);
  const resort = RESORTS.find((item) => item.id === state.resortId);
  const resortDetails = resort ? RESORT_DETAILS[resort.tier] : null;
  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);

  const travellers = occupancy.totalTravellers;
  const transferChoice = transferVehicle(state.transferVehicle);
  const savings = lines.filter((line) => line.amount < 0).reduce((sum, line) => sum - line.amount, 0);
  const activeFare = fareOffer(state.specialFares[0]);
  const activeCoupon = state.couponCode ? findCoupon(state.couponCode) : undefined;

  const allOffers: Array<FareOffer | CouponOffer> = [...COUPON_OFFERS, ...FARE_OFFERS];
  const offerRows = allOffers.map((offer) => ({
    offer,
    blocker: offerBlocker(offer, state, travellers),
    applied: offer.kind === "coupon" ? activeCoupon?.id === offer.id : activeFare?.id === offer.id,
  }));
  const availableRows = offerRows.filter((row) => !row.blocker);
  const unavailableRows = offerRows.filter((row) => row.blocker);
  const availableCount = availableRows.length;

  useEffect(() => {
    if (!offersOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOffersOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [offersOpen]);

  function toggleOffer(offer: FareOffer | CouponOffer, applied: boolean) {
    if (offer.kind === "coupon") {
      if (applied) update({ couponCode: null });
      else applyCoupon(offer.code);
    } else {
      update({ specialFares: applied ? [] : [offer.id], couponCode: null });
    }
    setOffersOpen(false);
  }

  function applyCoupon(raw: string) {
    if (!raw.trim()) {
      setCouponMessage({ ok: false, text: "Enter a coupon code." });
      return;
    }
    const coupon = findCoupon(raw);
    if (!coupon) {
      setCouponMessage({ ok: false, text: "That code isn't valid." });
      return;
    }
    const blocker = offerBlocker(coupon, state, travellers);
    if (blocker) {
      setCouponMessage({ ok: false, text: blocker });
      return;
    }
    update({ couponCode: coupon.code, specialFares: [] });
    setCouponInput("");
    setCouponMessage({ ok: true, text: `${coupon.code} applied — ${coupon.headline}.` });
  }

  function handleComplete(event: React.FormEvent) {
    event.preventDefault();
    const demoId = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    sessionStorage.setItem(
      `demo-plan:${demoId}`,
      JSON.stringify({
        range: state.range,
        safariCount: state.plan.length,
        nights: state.nights,
        gypsiesRequired: state.plan[0]?.gypsiesRequired ?? 1,
        total,
        demoId,
      })
    );
    router.push(`/confirmation?id=${demoId}`);
  }

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-32 sm:pb-10">
      <form onSubmit={handleComplete}>
        <header className="border-b border-[#e0e5e2] bg-white px-4 pb-2 pt-2 sm:rounded-b-[28px] sm:px-7 sm:shadow-[0_10px_30px_rgba(25,50,40,0.06)]">
          <div className="mx-auto grid max-w-4xl grid-cols-[40px_minmax(0,1fr)_40px] items-center">
            <button type="button" onClick={() => router.push("/book/transfers")} className="flex h-10 w-9 items-center justify-start text-[#17201c] transition hover:-translate-x-0.5" aria-label="Back to transfers"><BackIcon /></button>
            <div className="text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Final check</p>
              <p className="font-display text-xl font-bold text-[#17201c]">Review</p>
            </div>
            <span aria-hidden="true" />
          </div>
          <div className="mx-auto max-w-md"><StepIndicator current={4} /></div>
        </header>

        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
          <section>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Ready for the wild</p>
            <h1 className="font-display mt-1 text-[30px] font-bold leading-tight text-[#111111] sm:text-4xl">Review your trip</h1>
            <p className="mt-1 text-xs leading-5 text-[#68736d] sm:text-sm">One last look at your safaris and stay before you finish.</p>

            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-[20px] border border-[#e1e5e2] bg-white shadow-[0_8px_22px_rgba(17,17,17,0.05)]">
              <SummaryStat icon={<PeopleIcon />} value={String(occupancy.totalTravellers)} label="Travellers" />
              <SummaryStat icon={<SafariIcon />} value={String(state.plan.length)} label="Safaris" bordered />
              <SummaryStat icon={<MoonIcon />} value={String(state.nights)} label={state.nights === 1 ? "Night" : "Nights"} bordered />
            </div>
          </section>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.08fr_.92fr] lg:items-start">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between border-b border-[#edf0ee] px-4 py-4 sm:px-5">
                  <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Your itinerary</p><h2 className="font-display mt-0.5 text-xl font-bold">Safari plan</h2></div>
                  <button type="button" onClick={() => router.push("/book/step-2")} className="rounded-full bg-[#f1f3f1] px-3 py-1.5 text-[10px] font-extrabold text-[#333333]">Edit</button>
                </div>

                <div className="divide-y divide-[#edf0ee]">
                  {state.plan.map((safari, index) => (
                    <article key={`${safari.zone.id}-${safari.date}-${safari.session}`} className="flex gap-3 px-4 py-4 sm:px-5">
                      <div className="flex w-9 shrink-0 flex-col items-center">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${safari.session === "morning" ? "bg-[#fff4bd] text-[#8c6900]" : "bg-[#ecebff] text-[#5146a5]"}`}>{safari.session === "morning" ? <SunIcon /> : <SessionMoonIcon />}</span>
                        {index < state.plan.length - 1 && <span className="mt-1 h-full min-h-5 w-px bg-[#e1e5e2]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#7b847f]">Safari {safari.safariNumber} · {formatDate(safari.date)}</p>
                            <h3 className="font-display mt-1 truncate text-lg font-bold text-[#17201c]">{safari.zone.name}</h3>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-extrabold capitalize ${safari.zone.type === "core" ? "bg-[#fff1c9] text-[#6d5200]" : "bg-[#eaf6ee] text-[#17633b]"}`}>{safari.zone.type}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-[#68736d]">{safari.session === "morning" ? "Morning" : "Evening"} safari · {safari.gypsiesRequired} {safari.gypsiesRequired === 1 ? "gypsy" : "gypsies"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between border-b border-[#edf0ee] px-4 py-4 sm:px-5">
                  <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Your stay</p><h2 className="font-display mt-0.5 text-xl font-bold">Resort</h2></div>
                  <button type="button" onClick={() => router.push("/book/step-3")} className="rounded-full bg-[#f1f3f1] px-3 py-1.5 text-[10px] font-extrabold text-[#333333]">{resort ? "Change" : "Add stay"}</button>
                </div>

                {resort && resortDetails ? (
                  <div className="flex gap-4 p-4 sm:p-5">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-32">
                      <Image src={resortDetails.image} alt={`${resort.name} property`} fill sizes="128px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <span className="rounded-full bg-[#fff4bd] px-2 py-1 text-[8px] font-extrabold text-[#6c5200]">{RESORT_TIER_LABEL[resort.tier]}</span>
                      <h3 className="font-display mt-2 truncate text-lg font-bold text-[#17201c]">{resort.name}</h3>
                      <p className="mt-1 text-[10px] text-[#68736d]">{state.nights} night{state.nights === 1 ? "" : "s"} · Near {resort.range} gate</p>
                      <p className="mt-2 text-[10px] font-bold text-[#17633b]">4 meals included daily</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center"><p className="text-xs text-[#758078]">No resort selected for this trip.</p><button type="button" onClick={() => router.push("/book/step-3")} className="mt-3 text-xs font-extrabold text-[#111111] underline">Browse resorts</button></div>
                )}
              </section>

              <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
                <div className="flex items-center justify-between border-b border-[#edf0ee] px-4 py-4 sm:px-5">
                  <div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Getting there</p><h2 className="font-display mt-0.5 text-xl font-bold">Transfers</h2></div>
                  <button type="button" onClick={() => router.push("/book/transfers")} className="rounded-full bg-[#f1f3f1] px-3 py-1.5 text-[10px] font-extrabold text-[#333333]">{state.transferVehicle ? "Change" : "Add"}</button>
                </div>
                <div className="p-4 sm:p-5">
                  {state.transferVehicle === "own" ? (
                    <p className="text-sm font-semibold text-[#17201c]">Own vehicle <span className="block text-xs font-normal text-[#68736d]">No pickup or drop needed.</span></p>
                  ) : transferChoice ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0"><p className="truncate text-sm font-extrabold text-[#17201c]">{transferChoice.name}</p><p className="mt-0.5 text-xs text-[#68736d]">Pickup &amp; drop · {transferChoice.seats}</p></div>
                      <p className="font-display shrink-0 text-lg font-bold text-[#17201c]">₹{transferChoice.price.toLocaleString("en-IN")}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#758078]">No transfer selected for this trip.</p>
                  )}
                </div>
              </section>

              <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.06)]">
                <div className="flex items-center gap-3 border-b border-[#edf0ee] px-4 py-4 sm:px-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE36D] text-[#1c1608]"><TagIcon className="h-5 w-5" /></span>
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Save more</p>
                    <h2 className="font-display text-xl font-bold leading-tight">Offers &amp; coupons</h2>
                  </div>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  <div>
                    <label htmlFor="coupon-code" className="text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Have a coupon code?</label>
                    <div className="mt-1.5 flex items-center gap-1 rounded-2xl border border-[#e6dcae] bg-[#fffdf5] p-1.5 focus-within:border-[#fdcb08] focus-within:ring-2 focus-within:ring-[#fdcb08]/25">
                      <TagIcon className="ml-2.5 h-4 w-4 shrink-0 text-[#a08a2e]" />
                      <input
                        id="coupon-code"
                        value={couponInput}
                        onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            applyCoupon(couponInput);
                          }
                        }}
                        placeholder="Enter coupon code"
                        autoCapitalize="characters"
                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm font-bold tracking-wide text-[#17201c] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-[#b3ad93]"
                      />
                      <button type="button" onClick={() => applyCoupon(couponInput)} className="shrink-0 rounded-xl bg-[#1c1608] px-5 py-2.5 text-sm font-extrabold text-white transition active:scale-95">Apply</button>
                    </div>
                    {couponMessage && (
                      <p role="status" className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${couponMessage.ok ? "text-[#17633b]" : "text-[#b3261e]"}`}>
                        <span aria-hidden="true">{couponMessage.ok ? "✓" : "!"}</span>{couponMessage.text}
                      </p>
                    )}
                  </div>

                  {(activeFare || activeCoupon) && (
                    <OfferBanner
                      offer={(activeCoupon ?? activeFare)!}
                      state="applied"
                      saving={savings}
                      onAction={() => {
                        update({ specialFares: [], couponCode: null });
                        setCouponMessage(null);
                      }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setOffersOpen(true)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#ece7d3] bg-white px-3.5 py-3 text-left shadow-[0_2px_8px_rgba(17,17,17,0.04)] transition hover:border-[#fdcb08] active:scale-[.99]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4bd] text-[#6b5200]"><TagIcon className="h-[18px] w-[18px]" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-[#17201c]">See all coupons</span>
                      <span className="mt-0.5 block text-[11px] text-[#7b847f]">{availableCount} available · {allOffers.length - availableCount} not available</span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-[#1c1608]" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              </section>
            </div>

            <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.07)] lg:sticky lg:top-5">
              <div className="border-b border-[#edf0ee] px-5 py-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Trip total</p><h2 className="font-display mt-0.5 text-xl font-bold">Price breakdown</h2></div>
              <ul className="space-y-3 px-5 py-5">
                {lines.map((line) => (
                  <li key={line.label} className="flex items-start justify-between gap-4 text-xs">
                    <span className="text-[#68736d]">{line.label}{line.detail && <span className="mt-0.5 block text-[9px] text-[#929a95]">{line.detail}</span>}</span>
                    <span className={`shrink-0 font-extrabold ${line.amount < 0 ? "text-[#17633b]" : "text-[#17201c]"}`}>{line.amount < 0 ? "−" : ""}₹{Math.abs(line.amount).toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
              <div className="mx-5 border-t border-dashed border-[#d9dedb]" />
              <div className="flex items-end justify-between bg-[#fff9dc] px-5 py-5">
                <div><p className="text-[10px] font-bold text-[#6f746f]">Estimated total</p><p className="mt-0.5 text-[9px] text-[#929792]">For your complete trip</p></div>
                <p className="font-display text-3xl font-bold text-[#111111]">₹{total.toLocaleString("en-IN")}</p>
              </div>
            </section>
          </div>

          <div className="mt-6 hidden items-center justify-between rounded-[20px] bg-white p-4 shadow-sm sm:flex">
            <button type="button" onClick={() => router.push("/book/step-3")} className="rounded-xl px-5 py-3 text-sm font-bold text-[#4f5a54]">Back</button>
            <button type="submit" className="rounded-xl bg-[#fdcb08] px-8 py-3.5 text-sm font-extrabold text-[#111111] shadow-[0_8px_20px_rgba(253,203,8,0.28)]">Complete plan →</button>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5e1] bg-white/96 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(24,33,29,0.14)] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-[#748078]">Estimated total</p><p className="text-xl font-black text-[#17201c]">₹{total.toLocaleString("en-IN")}</p></div>
            <button type="submit" className="rounded-xl bg-[#fdcb08] px-6 py-3.5 text-sm font-extrabold text-[#111111] shadow-[0_8px_20px_rgba(253,203,8,0.28)]">Complete plan →</button>
          </div>
        </div>

        {offersOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="All coupons">
            <button type="button" aria-label="Close coupons" onClick={() => setOffersOpen(false)} className="absolute inset-0 bg-black/45" />
            <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[#fffdf2] shadow-[0_-16px_40px_rgba(0,0,0,0.25)] sm:rounded-[28px]">
              <div className="flex items-center justify-between bg-[#FFE36D] px-5 py-4">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#6b5200]">Save more</p>
                  <h2 className="font-display text-xl font-bold text-black">All coupons</h2>
                </div>
                <button type="button" onClick={() => setOffersOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1608] text-[#FFE36D]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="overflow-y-auto px-4 pb-6 pt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Available for your trip ({availableRows.length})</p>
                <div className="space-y-2.5">
                  {availableRows.map(({ offer, applied }) => (
                    <OfferBanner key={offer.id} offer={offer} state={applied ? "applied" : "available"} onAction={() => toggleOffer(offer, applied)} />
                  ))}
                  {availableRows.length === 0 && <p className="rounded-xl bg-white px-3 py-4 text-center text-xs text-[#758078]">No coupons apply to this trip yet.</p>}
                </div>

                {unavailableRows.length > 0 && (
                  <>
                    <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Not available ({unavailableRows.length})</p>
                    <div className="space-y-2.5">
                      {unavailableRows.map(({ offer, blocker }) => (
                        <OfferBanner key={offer.id} offer={offer} state="blocked" blocker={blocker} onAction={() => {}} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </main>
  );
}

function TagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 12.6V5.5a2 2 0 0 1 2-2h7.1a2 2 0 0 1 1.4.6l6.4 6.4a2 2 0 0 1 0 2.8l-6.6 6.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8.3" cy="8.3" r="1.3" fill="currentColor" />
    </svg>
  );
}

const TICKET_MASK =
  "radial-gradient(9px at 64px 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(9px at 64px 100%, #0000 97%, #000) bottom / 100% 51% no-repeat";

function OfferBanner({
  offer,
  state,
  blocker,
  saving,
  onAction,
}: {
  offer: FareOffer | CouponOffer;
  state: "available" | "applied" | "blocked";
  blocker?: string | null;
  saving?: number;
  onAction: () => void;
}) {
  const applied = state === "applied";
  const blocked = state === "blocked";
  return (
    <div style={{ filter: "drop-shadow(0 3px 8px rgba(60,45,0,0.10))" }}>
      <div
        className="flex overflow-hidden rounded-2xl"
        style={{ WebkitMask: TICKET_MASK, mask: TICKET_MASK }}
      >
        <div
          className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 ${
            applied ? "bg-[#1c1608] text-[#FFE36D]" : blocked ? "bg-[#ebe7d6] text-[#a39d83]" : "bg-[linear-gradient(160deg,#FFE36D,#fdcb08)] text-[#1c1608]"
          }`}
        >
          {applied ? (
            <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <TagIcon className="h-6 w-6" />
          )}
          <span className="text-[8px] font-extrabold uppercase tracking-[0.14em]">{applied ? "Applied" : offer.kind === "coupon" ? "Coupon" : "Fare"}</span>
        </div>

        <div className={`flex min-w-0 flex-1 items-center justify-between gap-3 border-l border-dashed px-4 py-3.5 ${applied ? "border-[#e9d977] bg-[#fff7cc]" : blocked ? "border-[#ddd8c2] bg-[#faf8f0]" : "border-[#ecd97c] bg-white"}`}>
          <div className={`min-w-0 ${blocked ? "opacity-70" : ""}`}>
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#8a7a3d]">{offer.title}</p>
            <p className="font-display mt-0.5 text-[19px] font-bold leading-tight text-[#17201c]">{offer.headline}</p>
            {blocked && blocker ? (
              <p className="mt-1 text-[10px] font-semibold text-[#b3261e]">{blocker}</p>
            ) : applied && saving ? (
              <p className="mt-1 text-[10px] font-bold text-[#17633b]">You save ₹{saving.toLocaleString("en-IN")}</p>
            ) : (
              <p className="mt-1 text-[10px] text-[#7b847f]">{offer.detail}</p>
            )}
            {offer.kind === "coupon" && !blocked && (
              <span className="mt-1.5 inline-block rounded-md border border-dashed border-[#c9b24e] bg-[#fffbe6] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-[#6b5200]">{offer.code}</span>
            )}
          </div>

          {!blocked && (
            <button
              type="button"
              onClick={onAction}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold transition active:scale-95 ${
                applied ? "border border-[#1c1608]/25 bg-transparent text-[#1c1608]" : "bg-[#1c1608] text-white"
              }`}
            >
              {applied ? "Remove" : "Apply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ icon, value, label, bordered = false }: { icon: React.ReactNode; value: string; label: string; bordered?: boolean }) {
  return <div className={`flex items-center justify-center gap-2 px-2 py-3.5 ${bordered ? "border-l border-[#e8ebe9]" : ""}`}><span className="text-[#17633b]">{icon}</span><div><p className="text-sm font-extrabold leading-none text-[#17201c]">{value}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-[#7b847f]">{label}</p></div></div>;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function BackIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function PeopleIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 5 5" strokeLinecap="round" /></svg>; }
function SafariIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 17h16M7 17l1.5-7h7L17 17M10 10V7h4v3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" /></svg>; }
function MoonIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function SunIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" /></svg>; }
function SessionMoonIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
