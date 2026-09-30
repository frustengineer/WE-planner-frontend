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

  // Per-traveller info
  type TravellerInfo = { name: string; dob: string; gender: string };
  const makeTraveller = (): TravellerInfo => ({ name: "", dob: "", gender: "" });
  const [travellerInfo, setTravellerInfo] = useState<TravellerInfo[]>(() => Array.from({ length: 4 }, makeTraveller));
  const [expandedTraveller, setExpandedTraveller] = useState<number>(0);
  // Contact
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [agreed, setAgreed] = useState(false);

  function updateTraveller(idx: number, field: keyof TravellerInfo, value: string) {
    setTravellerInfo((prev) => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }

  // Offers / coupons
  const [couponInput, setCouponInput] = useState("");
  const [offersOpen, setOffersOpen] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Accordion open state (sections 1-4)
  const [open, setOpen] = useState<1 | 2>(1);

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) router.replace("/book/step-1");
  }, [router, state.plan.length, state.range, state.startDate]);

  const { lines, total } = computeCart(state);
  const resort = RESORTS.find((item) => item.id === state.resortId);
  const resortDetails = resort ? RESORT_DETAILS[resort.tier] : null;
  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);
  const travellers = occupancy.totalTravellers;
  const transferChoice = transferVehicle(state.transferVehicle);
  const savings = lines.filter((l) => l.amount < 0).reduce((s, l) => s - l.amount, 0);
  const activeFare = fareOffer(state.specialFares[0]);
  const activeCoupon = state.couponCode ? findCoupon(state.couponCode) : undefined;
  const allOffers: Array<FareOffer | CouponOffer> = [...COUPON_OFFERS, ...FARE_OFFERS];
  const offerRows = allOffers.map((offer) => ({
    offer,
    blocker: offerBlocker(offer, state, travellers),
    applied: offer.kind === "coupon" ? activeCoupon?.id === offer.id : activeFare?.id === offer.id,
  }));
  const availableRows = offerRows.filter((r) => !r.blocker);
  const unavailableRows = offerRows.filter((r) => r.blocker);

  const contactDone = travellerInfo.slice(0, travellers).every((t) => t.name.trim() && t.dob && t.gender) && email.includes("@") && mobile.length === 10;

  useEffect(() => {
    if (!offersOpen) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setOffersOpen(false);
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
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
    if (!raw.trim()) { setCouponMessage({ ok: false, text: "Enter a coupon code." }); return; }
    const coupon = findCoupon(raw);
    if (!coupon) { setCouponMessage({ ok: false, text: "That code isn't valid." }); return; }
    const blocker = offerBlocker(coupon, state, travellers);
    if (blocker) { setCouponMessage({ ok: false, text: blocker }); return; }
    update({ couponCode: coupon.code, specialFares: [] });
    setCouponInput("");
    setCouponMessage({ ok: true, text: `${coupon.code} applied — ${coupon.headline}.` });
  }

  function handleComplete(event: React.FormEvent) {
    event.preventDefault();
    const demoId = `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    sessionStorage.setItem(`demo-plan:${demoId}`, JSON.stringify({
      range: state.range, safariCount: state.plan.length,
      nights: state.nights, gypsiesRequired: state.plan[0]?.gypsiesRequired ?? 1, total, demoId,
    }));
    router.push(`/confirmation?id=${demoId}`);
  }

  const inputCls = "w-full rounded-2xl border border-[#e1e5e2] bg-[#fafbfa] px-4 py-3 text-sm text-[#17201c] outline-none placeholder:text-[#b0b8b3] focus:border-[#1f6b48] focus:ring-2 focus:ring-[#1f6b48]/15 transition";

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-36">
      <form onSubmit={handleComplete}>
        {/* ── Header ── */}
        <header className="sticky top-0 z-40 border-b border-[#e0e5e2] bg-white/95 px-4 pb-2 pt-2 backdrop-blur-sm sm:rounded-b-[28px] sm:px-7 sm:shadow-[0_10px_30px_rgba(25,50,40,0.06)]">
          <div className="mx-auto grid max-w-4xl grid-cols-[40px_minmax(0,1fr)_72px] items-center gap-2">
            <button type="button" onClick={() => router.push("/book/transfers")} className="flex h-10 w-9 items-center justify-start text-[#17201c] hover:text-[#1f6b48]" aria-label="Back">
              <BackIcon />
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4d7863]">Final step</p>
              <h1 className="font-display truncate text-xl font-bold text-[#17201c]">Review your trip</h1>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => router.push("/book/step-1")} className="flex h-10 w-7 items-center justify-center text-[#17201c] hover:text-[#1f6b48]" aria-label="Edit">
                <EditIcon />
              </button>
              <a href="https://wa.me/?text=Hi" target="_blank" rel="noreferrer" className="flex h-10 w-7 items-center justify-center text-[#18a957]" aria-label="WhatsApp">
                <WhatsAppIcon />
              </a>
            </div>
          </div>
          <div className="mx-auto max-w-md"><StepIndicator current={4} /></div>
        </header>

        <div className="mx-auto max-w-lg px-4 py-4 sm:px-6 sm:py-6">

          {/* ── Trip summary card ── */}
          {(() => {
            const endDate = state.startDate
              ? new Date(new Date(`${state.startDate}T00:00:00`).getTime() + state.nights * 86400000)
              : null;
            return (
              <div className="mb-4 overflow-hidden rounded-[22px] border border-[#e8ebe9] bg-white shadow-[0_4px_18px_rgba(17,17,17,0.07)]">
                {/* Title row */}
                <div className="px-5 pt-5 pb-3">
                  <h2 className="font-display text-lg font-bold leading-snug text-[#17201c]">
                    Tadoba Jungle Safari &amp; Stay
                  </h2>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full border border-[#c8ddd2] px-2.5 py-0.5 text-[10px] font-bold text-[#1f6b48]">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5" strokeLinecap="round"/></svg>
                      Customisable
                    </span>
                    <span className="text-[11px] text-[#68736d]">{state.nights}N · {state.range} Range</span>
                  </div>
                </div>

                {/* Date row */}
                {state.startDate && endDate && (
                  <div className="border-t border-[#f0f2f1] px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-[#17201c]">
                          {new Date(`${state.startDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#68736d]">
                          {new Date(`${state.startDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long" })}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#d9deda] bg-[#f6f8f7] px-3 py-1.5 text-[11px] font-extrabold text-[#17201c]">
                        {state.nights + 1}D/{state.nights}N
                      </span>
                      <div className="min-w-0 flex-1 text-right">
                        <p className="text-sm font-extrabold text-[#17201c]">
                          {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#68736d]">
                          {endDate.toLocaleDateString("en-IN", { weekday: "long" })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Travellers row */}
                <div className="border-t border-[#f0f2f1] px-5 py-3">
                  <p className="text-[11px] text-[#17201c]">
                    <span className="font-extrabold">{travellers} Traveller{travellers !== 1 ? "s" : ""}: </span>
                    {state.numAdults} Adult{state.numAdults !== 1 ? "s" : ""}
                    {state.childAges.length > 0 ? `, ${state.childAges.length} Child${state.childAges.length !== 1 ? "ren" : ""}` : ""}
                    {" · "}{state.plan.length} Safari{state.plan.length !== 1 ? "s" : ""}{resort ? ` · ${resort.name}` : ""}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* ── Section 1: Traveller Details ── */}
          <AccordionSection
            num={1} total={4} title="Traveller Details"
            done={contactDone} open={open === 1} onToggle={() => setOpen(open === 1 ? 2 : 1)}
          >
            <div className="divide-y divide-[#f0f2f1]">
              {/* Per-traveller cards */}
              {Array.from({ length: travellers }, (_, i) => {
                const t = travellerInfo[i];
                const done = t.name.trim() && t.dob && t.gender;
                const isOpen = expandedTraveller === i;
                return (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setExpandedTraveller(isOpen ? -1 : i)}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${done ? "bg-[#eaf6ee] text-[#1f6b48]" : "bg-[#f0f2f1] text-[#7b847f]"}`}>
                        {done ? (
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : (i + 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Traveller {i + 1}{i === 0 ? " · Lead" : ""}</p>
                        <p className="text-sm font-bold text-[#17201c]">{t.name || <span className="font-normal text-[#b0b8b3]">Enter details</span>}</p>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 shrink-0 text-[#aab3ae] transition-transform ${isOpen ? "rotate-180" : ""}`}>
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="space-y-3 bg-[#fafbfa] px-5 py-4">
                        {/* Full name */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Full name as per ID <span className="text-red-500">*</span></label>
                          <input
                            value={t.name}
                            onChange={(e) => updateTraveller(i, "name", e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className={inputCls}
                          />
                        </div>
                        {/* DOB + Gender side by side */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Date of birth <span className="text-red-500">*</span></label>
                            <div
                              className={`${inputCls} cursor-pointer`}
                              onClick={(e) => {
                                const input = (e.currentTarget as HTMLDivElement).querySelector("input");
                                input?.showPicker?.();
                                input?.focus();
                              }}
                            >
                              <input
                                type="date"
                                value={t.dob}
                                max={new Date().toISOString().slice(0, 10)}
                                onChange={(e) => updateTraveller(i, "dob", e.target.value)}
                                className="w-full bg-transparent outline-none [color-scheme:light]"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Gender <span className="text-red-500">*</span></label>
                            <div className="mt-1.5 flex gap-2">
                              {["Male", "Female", "Other"].map((g) => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => updateTraveller(i, "gender", g)}
                                  className={`flex-1 rounded-xl border py-2.5 text-[11px] font-extrabold transition ${t.gender === g ? "border-[#1f6b48] bg-[#eaf6ee] text-[#1f6b48]" : "border-[#e1e5e2] bg-white text-[#7b847f]"}`}
                                >
                                  {g}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {done && i < travellers - 1 && (
                          <button type="button" onClick={() => setExpandedTraveller(i + 1)}
                            className="w-full rounded-2xl bg-[#1f6b48] py-2.5 text-sm font-extrabold text-white active:scale-95">
                            Next traveller →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Contact info */}
              <div className="space-y-3 px-5 py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#7b847f]">Contact details</p>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-[#7b847f]">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className={inputCls} />
                </div>
                <div className="flex overflow-hidden rounded-2xl border border-[#e1e5e2] bg-[#fafbfa] focus-within:border-[#1f6b48] focus-within:ring-2 focus-within:ring-[#1f6b48]/15">
                  <span className="flex items-center border-r border-[#e1e5e2] px-3 text-sm font-bold text-[#17201c]">+91</span>
                  <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Mobile number" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#17201c] outline-none placeholder:text-[#b0b8b3]" />
                </div>
                <p className="text-[10px] text-[#a0a8a4]">Confirmation &amp; safari updates will be sent here.</p>
                {contactDone && (
                  <button type="button" onClick={() => setOpen(2)} className="w-full rounded-2xl bg-[#1f6b48] py-3 text-sm font-extrabold text-white shadow-[0_6px_18px_rgba(31,107,72,0.22)] active:scale-95">
                    Save &amp; continue →
                  </button>
                )}
              </div>
            </div>
          </AccordionSection>

          {/* ── Day-wise Itinerary ── */}
          {state.startDate && <DayItinerary state={state} resort={resort} transferChoice={transferChoice} />}

          {/* ── Offers & Coupons (above price) ── */}
          <div className="mb-4 overflow-hidden rounded-[22px] bg-white shadow-[0_4px_16px_rgba(17,17,17,0.06)]">
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2 overflow-hidden rounded-2xl border border-[#e6dcae] bg-[#fffdf5] p-1.5 focus-within:border-[#fdcb08] focus-within:ring-2 focus-within:ring-[#fdcb08]/25">
                <TagIcon className="ml-2 h-4 w-4 shrink-0 text-[#a08a2e]" />
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(couponInput); }}}
                  placeholder="Enter coupon code"
                  autoCapitalize="characters"
                  className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm font-bold tracking-wide text-[#17201c] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-[#b3ad93]"
                />
                <button type="button" onClick={() => applyCoupon(couponInput)} className="shrink-0 rounded-xl bg-[#1c1608] px-4 py-2 text-sm font-extrabold text-white active:scale-95">Apply</button>
              </div>
              {couponMessage && (
                <p className={`flex items-center gap-1.5 text-[11px] font-semibold ${couponMessage.ok ? "text-[#17633b]" : "text-[#b3261e]"}`}>
                  <span>{couponMessage.ok ? "✓" : "!"}</span>{couponMessage.text}
                </p>
              )}
              {(activeFare || activeCoupon) && (
                <OfferBanner offer={(activeCoupon ?? activeFare)!} state="applied" saving={savings}
                  onAction={() => { update({ specialFares: [], couponCode: null }); setCouponMessage(null); }} />
              )}
              <button type="button" onClick={() => setOffersOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#ece7d3] bg-white px-4 py-3 text-left shadow-sm hover:border-[#fdcb08] active:scale-[.99]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff4bd] text-[#6b5200]"><TagIcon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-[#17201c]">See all coupons</span>
                  <span className="mt-0.5 block text-[11px] text-[#7b847f]">{availableRows.length} available · {unavailableRows.length} not applicable</span>
                </span>
                <ChevronIcon />
              </button>
            </div>
          </div>

          {/* ── Price Breakdown ── */}
          <div className="mt-4 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.07)]">
            <div className="border-b border-[#edf0ee] px-5 py-4">
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#777]">Trip total</p>
              <p className="font-display mt-0.5 text-lg font-bold text-[#17201c]">Price breakdown</p>
            </div>
            <ul className="space-y-3 px-5 py-4">
              {lines.map((line) => (
                <li key={line.label} className="flex items-start justify-between gap-4 text-xs">
                  <span className="text-[#68736d]">{line.label}{line.detail && <span className="mt-0.5 block text-[9px] text-[#929a95]">{line.detail}</span>}</span>
                  <span className={`shrink-0 font-extrabold ${line.amount < 0 ? "text-[#17633b]" : "text-[#17201c]"}`}>{line.amount < 0 ? "−" : ""}₹{Math.abs(line.amount).toLocaleString("en-IN")}</span>
                </li>
              ))}
            </ul>
            <div className="mx-5 border-t border-dashed border-[#d9dedb]" />
            <div className="flex items-end justify-between bg-[#fff9dc] px-5 py-4">
              <div><p className="text-[10px] font-bold text-[#6f746f]">Estimated total</p><p className="mt-0.5 text-[9px] text-[#929792]">Complete trip</p></div>
              <p className="font-display text-3xl font-bold text-[#111]">₹{total.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* ── Important Info ── */}
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[18px] bg-white p-4 shadow-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#1f6b48]" />
            <p className="text-[11px] leading-5 text-[#4f5a54]">
              I confirm that I have read and accept the <span className="font-bold text-[#17201c]">Cancellation Policy</span> and <span className="font-bold text-[#17201c]">Terms of Service</span> of Wild Excursions.
            </p>
          </label>
        </div>

        {/* ── Sticky bottom bar ── */}
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5e1] bg-white/96 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(24,33,29,0.14)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[#748078]">Estimated total</p>
              <p className="text-xl font-black text-[#17201c]">₹{total.toLocaleString("en-IN")}</p>
              {savings > 0 && <p className="text-[9px] font-bold text-[#17633b]">You save ₹{savings.toLocaleString("en-IN")}</p>}
            </div>
            <button type="submit" disabled={!agreed}
              className="rounded-2xl bg-[#fdcb08] px-7 py-3.5 text-sm font-extrabold text-[#111] shadow-[0_8px_20px_rgba(253,203,8,0.3)] disabled:opacity-40 active:scale-95">
              Complete plan →
            </button>
          </div>
        </div>

        {/* ── All coupons sheet ── */}
        {offersOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
            <button type="button" aria-label="Close" onClick={() => setOffersOpen(false)} className="absolute inset-0 bg-black/45" />
            <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[#fffdf2] shadow-[0_-16px_40px_rgba(0,0,0,0.25)] sm:rounded-[28px]">
              <div className="flex items-center justify-between bg-[#FFE36D] px-5 py-4">
                <div><p className="text-[9px] font-extrabold uppercase tracking-wide text-[#6b5200]">Save more</p><h2 className="font-display text-xl font-bold text-black">All coupons</h2></div>
                <button type="button" onClick={() => setOffersOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c1608] text-[#FFE36D]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="overflow-y-auto px-4 pb-6 pt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Available ({availableRows.length})</p>
                <div className="space-y-2.5">
                  {availableRows.map(({ offer, applied }) => (
                    <OfferBanner key={offer.id} offer={offer} state={applied ? "applied" : "available"} onAction={() => toggleOffer(offer, applied)} />
                  ))}
                  {availableRows.length === 0 && <p className="rounded-xl bg-white px-3 py-4 text-center text-xs text-[#758078]">No coupons apply to this trip yet.</p>}
                </div>
                {unavailableRows.length > 0 && (
                  <>
                    <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-wide text-[#7b847f]">Not applicable ({unavailableRows.length})</p>
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

/* ─── Day-wise Itinerary ─── */
import type { BookingState } from "@/lib/types";
import type { Resort } from "@/lib/types";
import type { TransferVehicle } from "@/lib/transfers";

function DayItinerary({ state, resort, transferChoice }: {
  state: BookingState;
  resort: ReturnType<typeof RESORTS["find"]>;
  transferChoice: TransferVehicle | null | undefined;
}) {
  const days = state.nights + 1;
  const hasTransfer = state.transferVehicle && state.transferVehicle !== "own";

  // Group safaris by date
  const safarisByDate: Record<string, typeof state.plan> = {};
  for (const s of state.plan) {
    if (!safarisByDate[s.date]) safarisByDate[s.date] = [];
    safarisByDate[s.date].push(s);
  }

  return (
    <div className="mb-4 overflow-hidden rounded-[22px] bg-white shadow-[0_8px_24px_rgba(17,17,17,0.07)]">
      <div className="border-b border-[#edf0ee] px-5 py-4">
        <p className="text-[9px] font-extrabold uppercase tracking-wide text-[#777]">Your complete plan</p>
        <h2 className="font-display mt-0.5 text-lg font-bold text-[#17201c]">Day-wise itinerary</h2>
      </div>
      <div className="px-5 py-4">
        {Array.from({ length: days }, (_, i) => {
          const dayDate = new Date(`${state.startDate}T00:00:00`);
          dayDate.setDate(dayDate.getDate() + i);
          const isoDate = dayDate.toISOString().slice(0, 10);
          const dayLabel = dayDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
          const daySafaris = safarisByDate[isoDate] ?? [];
          const isFirst = i === 0;
          const isLast = i === days - 1;

          type Activity = { icon: React.ReactNode; text: string; sub?: string; color: string };
          const activities: Activity[] = [];

          if (isFirst && hasTransfer) {
            activities.push({ icon: <CarIcon />, text: `Pickup · ${transferChoice?.name ?? "Transfer"}`, sub: "Arrive at Tadoba", color: "bg-[#e8f4ff] text-[#1a5fa8]" });
          }
          if (isFirst && resort) {
            activities.push({ icon: <HotelIcon />, text: `Check-in · ${resort.name}`, sub: `Near ${resort.range} gate`, color: "bg-[#fff4bd] text-[#7a5c00]" });
          }
          daySafaris
            .sort((a, b) => (a.session === "morning" ? -1 : 1) - (b.session === "morning" ? -1 : 1))
            .forEach((s) => {
              activities.push({
                icon: s.session === "morning" ? <SunIcon /> : <MoonSmIcon />,
                text: `${s.session === "morning" ? "Morning" : "Evening"} safari · ${s.zone.name}`,
                sub: `${s.zone.type === "core" ? "Core zone" : "Buffer zone"} · ${s.gypsiesRequired} gypsy`,
                color: s.session === "morning" ? "bg-[#fff4bd] text-[#8c6900]" : "bg-[#ecebff] text-[#5146a5]",
              });
            });
          if (!isFirst && !isLast && resort) {
            activities.push({ icon: <MoonIcon />, text: `Night at ${resort.name}`, sub: "Meals included", color: "bg-[#eaf6ee] text-[#1f6b48]" });
          }
          if (isLast && resort) {
            activities.push({ icon: <HotelIcon />, text: `Check-out · ${resort.name}`, sub: "Post breakfast", color: "bg-[#fff4bd] text-[#7a5c00]" });
          }
          if (isLast && hasTransfer) {
            activities.push({ icon: <CarIcon />, text: `Drop · ${transferChoice?.name ?? "Transfer"}`, sub: "Return journey", color: "bg-[#e8f4ff] text-[#1a5fa8]" });
          }
          if (activities.length === 0) {
            activities.push({ icon: <MoonIcon />, text: "Leisure day", sub: "Explore the jungle area", color: "bg-[#eaf6ee] text-[#1f6b48]" });
          }

          return (
            <div key={isoDate} className={`relative ${i < days - 1 ? "mb-5" : ""}`}>
              {/* Day pill */}
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[#17201c] px-3 py-1 text-[10px] font-extrabold text-white">Day {i + 1}</span>
                <span className="text-[11px] font-semibold text-[#68736d]">{dayLabel}</span>
              </div>
              {/* Activities */}
              <div className="space-y-2 pl-2">
                {activities.map((act, ai) => (
                  <div key={ai} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${act.color}`}>{act.icon}</span>
                      {ai < activities.length - 1 && <span className="mt-1 h-4 w-px bg-[#e1e5e2]" />}
                    </div>
                    <div className="min-w-0 pb-1 pt-1">
                      <p className="text-sm font-bold text-[#17201c]">{act.text}</p>
                      {act.sub && <p className="mt-0.5 text-[10px] text-[#68736d]">{act.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
              {/* Day divider */}
              {i < days - 1 && <div className="mt-4 border-t border-dashed border-[#e8ebe9]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CarIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17h14M5 17a2 2 0 1 0 4 0m6 0a2 2 0 1 0 4 0" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function HotelIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" /></svg>; }

/* ─── Accordion section ─── */
function AccordionSection({
  num, total, title, done, open, onToggle, action, children,
}: {
  num: number; total: number; title: string; done: boolean; open: boolean;
  onToggle: () => void; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="mb-3 overflow-hidden rounded-[22px] bg-white shadow-[0_4px_16px_rgba(17,17,17,0.06)]">
      <button type="button" onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          done ? "bg-[#1f6b48] text-white" : open ? "bg-[#fdcb08] text-[#111]" : "bg-[#f0f2f1] text-[#7b847f]"
        }`}>
          {done ? (
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : num}
        </span>
        <div className="min-w-0 flex-1">
          <span className="text-[9px] font-extrabold uppercase tracking-wide text-[#7b847f]">{num}/{total}</span>
          <p className="font-display text-base font-bold text-[#17201c]">{title}</p>
        </div>
        {action && !open && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
        <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 shrink-0 text-[#aab3ae] transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="border-t border-[#f0f2f1]">{children}</div>}
    </div>
  );
}

/* ─── Offer banner (ticket style) ─── */
const TICKET_MASK = "radial-gradient(9px at 64px 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(9px at 64px 100%, #0000 97%, #000) bottom / 100% 51% no-repeat";
function OfferBanner({ offer, state, blocker, saving, onAction }: {
  offer: FareOffer | CouponOffer; state: "available" | "applied" | "blocked";
  blocker?: string | null; saving?: number; onAction: () => void;
}) {
  const applied = state === "applied"; const blocked = state === "blocked";
  return (
    <div style={{ filter: "drop-shadow(0 3px 8px rgba(60,45,0,0.10))" }}>
      <div className="flex overflow-hidden rounded-2xl" style={{ WebkitMask: TICKET_MASK, mask: TICKET_MASK }}>
        <div className={`flex w-16 shrink-0 flex-col items-center justify-center gap-1 ${applied ? "bg-[#1c1608] text-[#FFE36D]" : blocked ? "bg-[#ebe7d6] text-[#a39d83]" : "bg-[linear-gradient(160deg,#FFE36D,#fdcb08)] text-[#1c1608]"}`}>
          {applied ? <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            : <TagIcon className="h-6 w-6" />}
          <span className="text-[8px] font-extrabold uppercase tracking-[0.14em]">{applied ? "Applied" : offer.kind === "coupon" ? "Coupon" : "Fare"}</span>
        </div>
        <div className={`flex min-w-0 flex-1 items-center justify-between gap-3 border-l border-dashed px-4 py-3.5 ${applied ? "border-[#e9d977] bg-[#fff7cc]" : blocked ? "border-[#ddd8c2] bg-[#faf8f0]" : "border-[#ecd97c] bg-white"}`}>
          <div className={`min-w-0 ${blocked ? "opacity-70" : ""}`}>
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#8a7a3d]">{offer.title}</p>
            <p className="font-display mt-0.5 text-[17px] font-bold leading-tight text-[#17201c]">{offer.headline}</p>
            {blocked && blocker ? <p className="mt-1 text-[10px] font-semibold text-[#b3261e]">{blocker}</p>
              : applied && saving ? <p className="mt-1 text-[10px] font-bold text-[#17633b]">You save ₹{saving.toLocaleString("en-IN")}</p>
              : <p className="mt-1 text-[10px] text-[#7b847f]">{offer.detail}</p>}
            {offer.kind === "coupon" && !blocked && (
              <span className="mt-1.5 inline-block rounded-md border border-dashed border-[#c9b24e] bg-[#fffbe6] px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-[#6b5200]">{offer.code}</span>
            )}
          </div>
          {!blocked && (
            <button type="button" onClick={onAction}
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] font-extrabold active:scale-95 ${applied ? "border border-[#1c1608]/25 text-[#1c1608]" : "bg-[#1c1608] text-white"}`}>
              {applied ? "Remove" : "Apply"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Small components ─── */
function StatChip({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3">
      <span className="text-[#1f6b48]">{icon}</span>
      <p className="text-sm font-extrabold text-[#17201c]">{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-wide text-[#7b847f]">{label}</p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function TagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" className={className}><path d="M3.5 12.6V5.5a2 2 0 0 1 2-2h7.1a2 2 0 0 1 1.4.6l6.4 6.4a2 2 0 0 1 0 2.8l-6.6 6.6a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1-.6-1.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="8.3" cy="8.3" r="1.3" fill="currentColor" /></svg>;
}
function ChevronIcon() { return <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-[#1c1608]"><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BackIcon() { return <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function EditIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function WhatsAppIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>; }
function PeopleIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 5 5" strokeLinecap="round" /></svg>; }
function SafariIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 17h16M7 17l1.5-7h7L17 17M10 10V7h4v3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="19" r="1.5" /><circle cx="16" cy="19" r="1.5" /></svg>; }
function MoonIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function SunIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" /></svg>; }
function MoonSmIcon() { return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
