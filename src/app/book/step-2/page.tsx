"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AvailabilityGrid, type AvailabilitySelection } from "@/components/AvailabilityGrid";
import { StepIndicator } from "@/components/StepIndicator";
import { ZonePlanCard } from "@/components/ZonePlanCard";
import {
  recommendationRangeScopes,
  recommendPreferredSafariPlan,
  type PreferredRecommendation,
} from "@/lib/engine";
import { useBooking } from "@/lib/booking-context";
import { dateRangeFrom, toLocalISODate, ZONES } from "@/lib/mockData";
import { calculatePartyOccupancy } from "@/lib/occupancy";
import { computeCart } from "@/lib/pricing";
import { getSampleAvailability } from "@/lib/sampleAvailability";
import type { AvailabilitySnapshot, RecommendedSafari, ZoneType } from "@/lib/types";

const REFRESH_INTERVAL_MS = 20_000;
const PLANNING_HORIZON = "2027-12-31";

export default function Step2() {
  const router = useRouter();
  const { state, update } = useBooking();
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripDetailsOpen, setTripDetailsOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySnapshot[]>([]);
  const [recommendation, setRecommendation] = useState<PreferredRecommendation | null>(null);
  const [activeZoneType, setActiveZoneType] = useState<ZoneType>("buffer");
  const [refreshTick, setRefreshTick] = useState(0);
  const [cartAnimationKey, setCartAnimationKey] = useState(0);
  const [dateChangeNotice, setDateChangeNotice] = useState<string | null>(null);
  const [isTripBarPinned, setIsTripBarPinned] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const tripBarSentinelRef = useRef<HTMLDivElement>(null);

  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);
  const today = toLocalISODate(new Date());

  useEffect(() => {
    if (!state.range || !state.startDate) router.replace("/book/step-1");
  }, [router, state.range, state.startDate]);

  const requestedDates = useMemo(
    () => (state.startDate ? dateRangeFrom(state.startDate, state.nights) : []),
    [state.startDate, state.nights]
  );
  const coverageDates = useMemo(
    () => (state.startDate ? dateRangeFrom(shiftISODate(state.startDate, -5), state.nights + 10) : []),
    [state.startDate, state.nights]
  );
  const candidateRanges = useMemo(
    () => (state.range ? Array.from(new Set(recommendationRangeScopes(state.range).flat())) : []),
    [state.range]
  );
  const dates = useMemo(
    () => state.recommendedStartDate ? dateRangeFrom(state.recommendedStartDate, state.nights) : requestedDates,
    [requestedDates, state.nights, state.recommendedStartDate]
  );

  useEffect(() => {
    const refresh = setInterval(() => setRefreshTick((tick) => tick + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const sentinel = tripBarSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsTripBarPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!state.range || !state.startDate || coverageDates.length === 0) return;
    const zoneIds = ZONES.filter((zone) => candidateRanges.includes(zone.range)).map((zone) => zone.id);
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading state belongs to this request lifecycle
    setLoading(true);
    Promise.resolve()
      .then(() => getSampleAvailability(zoneIds, coverageDates))
      .then((data) => {
        if (cancelled) return;
        const result = recommendPreferredSafariPlan({
          range: state.range!,
          requestedStartDate: state.startDate!,
          nights: state.nights,
          availability: data,
          gypsiesRequired: occupancy.gypsiesRequired,
          minimumStartDate: toLocalISODate(new Date()),
        });
        setAvailability(data);
        setRecommendation(result);
        setFetchError(null);
        update({ recommendedStartDate: result.recommendedStartDate });
        setDateChangeNotice((notice) => notice ? "Dates updated. New permit availability is ready." : notice);
      })
      .catch(() => {
        if (!cancelled) setFetchError("We could not refresh permit availability. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.range, state.startDate, state.nights, coverageDates.join(","), candidateRanges.join(","), refreshTick, occupancy.gypsiesRequired]);

  const recommendationRanges = useMemo(
    () => recommendation?.ranges ?? (state.range ? [state.range] : []),
    [recommendation?.ranges, state.range]
  );
  const recommendedPlan = recommendation?.plan ?? [];
  const { total: cartTotal } = computeCart({ ...state, resortId: null });
  const cartItemCount = state.plan.length + (state.transfers ? 1 : 0);
  const isRefreshing = loading && dateChangeNotice !== null;
  const hasAlternativeRecommendation = Boolean(
    recommendation &&
      (recommendation.rangeChanged ||
        (recommendation.dayOffset !== null && recommendation.dayOffset !== 0))
  );

  const availabilitySections = useMemo(() => {
    if (!state.range || requestedDates.length === 0) return [];
    const sections: Array<{ range: string; dates: string[]; context: "original" | "recommended" }> = [
      { range: state.range, dates: requestedDates, context: "original" },
    ];
    const recommendedDates = state.recommendedStartDate
      ? dateRangeFrom(state.recommendedStartDate, state.nights)
      : requestedDates;
    for (const range of recommendationRanges) {
      const same = range === state.range && recommendedDates.every((date, index) => date === requestedDates[index]);
      if (!same) sections.push({ range, dates: recommendedDates, context: "recommended" });
    }
    return sections;
  }, [recommendationRanges, requestedDates, state.nights, state.range, state.recommendedStartDate]);

  function commitPlan(plan: typeof state.plan) {
    const sessionOrder = { morning: 0, afternoon: 1 };
    const normalized = [...plan]
      .sort((a, b) => a.date.localeCompare(b.date) || sessionOrder[a.session] - sessionOrder[b.session])
      .map((safari, index) => ({ ...safari, safariNumber: index + 1 }));
    update({
      plan: normalized,
      numSafarisBuffer: normalized.filter((safari) => safari.zone.type === "buffer").length,
      numSafarisCore: normalized.filter((safari) => safari.zone.type === "core").length,
    });
  }

  function toggleSafari(safariToToggle: (typeof state.plan)[number]) {
    const selected = state.plan.some(
      (safari) => safari.zone.id === safariToToggle.zone.id && safari.date === safariToToggle.date && safari.session === safariToToggle.session
    );
    const plan = selected
      ? state.plan.filter(
          (safari) => !(safari.zone.id === safariToToggle.zone.id && safari.date === safariToToggle.date && safari.session === safariToToggle.session)
        )
      : [
          ...state.plan.filter((safari) => !(safari.date === safariToToggle.date && safari.session === safariToToggle.session)),
          safariToToggle,
        ];
    commitPlan(plan);
    if (!selected) setCartAnimationKey((key) => key + 1);
    setError(null);
  }

  function addRecommendedPlan() {
    commitPlan(recommendedPlan);
    if (recommendedPlan.length) setCartAnimationKey((key) => key + 1);
    setError(null);
  }

  function handleToggleSelection(selection: AvailabilitySelection) {
    toggleSafari({
      safariNumber: 0,
      zone: selection.zone,
      date: selection.date,
      session: selection.session,
      reason: `Selected permit · priority #${selection.rank}`,
      isFillIn: false,
      isProvisional: selection.isProvisional,
      gypsiesRequired: occupancy.gypsiesRequired,
    });
  }

  function changeStartDate(startDate: string) {
    if (!startDate || startDate < today || startDate > PLANNING_HORIZON) return;
    update({ startDate, plan: [], numSafarisBuffer: 0, numSafarisCore: 0 });
    setError(null);
    setDateChangeNotice("Checking permits for your new dates…");
  }

  async function copyOfferCode() {
    try {
      await navigator.clipboard.writeText("LONGWEEKEND");
      setCouponCopied(true);
      window.setTimeout(() => setCouponCopied(false), 1800);
    } catch {
      setCouponCopied(false);
    }
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    if (state.plan.length === 0) {
      setError("Choose at least one available safari permit to continue.");
      return;
    }
    const unavailableSelection = state.plan.some((safari) => {
      if (safari.isProvisional) return false;
      const snapshot = availability.find(
        (item) => item.zoneId === safari.zone.id && item.date === safari.date && item.session === safari.session
      );
      return !snapshot || snapshot.status !== "available" || snapshot.availableCount < occupancy.gypsiesRequired;
    });
    if (unavailableSelection) {
      setError("Availability changed for a selected permit. Refresh and choose another open option.");
      return;
    }
    setError(null);
    update({ resortId: null });
    router.push("/book/step-3");
  }

  return (
    <main className="relative min-h-screen bg-[#f4f6f4] pb-32 sm:pb-10">
      <form onSubmit={handleContinue} className="mx-auto max-w-6xl">
        <div className="border-b border-[#dde3df] bg-white px-4 pb-2 pt-2 sm:rounded-b-[28px] sm:px-7 sm:shadow-[0_10px_30px_rgba(25,50,40,0.06)]">
          <div className="mx-auto grid max-w-4xl grid-cols-[40px_minmax(0,1fr)_72px] items-center gap-2">
            <button type="button" onClick={() => router.push("/book/step-1")} className="flex h-10 w-9 items-center justify-start text-[#17201c] transition hover:-translate-x-0.5 hover:text-[#1f6b48]" aria-label="Back to trip basics">
              <BackIcon />
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4d7863]">Step 1 of 3</p>
              <h1 className="font-display truncate text-xl font-bold leading-tight text-[#17201c] sm:text-2xl">Safari permits</h1>
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
            <StepIndicator current={1} currentTone="green" />
          </div>
        </div>

        <div ref={tripBarSentinelRef} className="h-px" aria-hidden="true" />
        <div className="relative h-[116px] sm:h-[118px]">
        <div className={`${isTripBarPinned ? "fixed inset-x-0 top-0 z-50 shadow-[0_4px_12px_rgba(24,33,29,0.08)]" : "absolute inset-x-0 top-0 z-30"} isolate border-b border-[#e0e5e2] bg-white [backface-visibility:hidden]`}>
          <div className="mx-auto max-w-4xl px-3 py-2.5 sm:px-5">
            <div className="permit-scroll flex items-center overflow-x-auto rounded-xl bg-[#f2f5f3] px-1.5 py-1">
              <SummaryChip icon={<MapIcon />} label={recommendation?.rangeLabel ?? state.range ?? "Range"} onClick={() => router.push("/book/step-1?edit=range")} />
              <span className="h-4 w-px shrink-0 bg-[#d5ddd8]" aria-hidden="true" />
              <SummaryChip icon={<CalendarIcon />} label={`${dates[0] ? formatShort(dates[0]) : "—"} – ${dates.at(-1) ? formatShort(dates.at(-1)!) : "—"}`} onClick={() => router.push("/book/step-1?edit=date")} />
              <span className="h-4 w-px shrink-0 bg-[#d5ddd8]" aria-hidden="true" />
              <SummaryChip icon={<PeopleIcon />} label={`${occupancy.totalTravellers} travellers · ${occupancy.gypsiesRequired} ${occupancy.gypsiesRequired === 1 ? "vehicle" : "vehicles"}`} onClick={() => router.push("/book/step-1?edit=travellers")} />
            </div>

            <div className="mt-2 flex items-stretch gap-2">
              <div className="date-strip permit-scroll flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-2xl bg-[#f2f5f3] p-1">
                {requestedDates.map((date, index) => {
                  const isArrival = index === 0;
                  const isDeparture = index === requestedDates.length - 1;
                  const hasPermit = state.plan.some((s) => s.date === date);
                  const isActive = isArrival || hasPermit;
                  return (
                    <div key={date} className={`min-w-[64px] flex-1 shrink-0 rounded-xl px-2 py-1.5 text-center transition ${isActive ? "bg-[#18211d] text-white shadow-sm" : "text-[#435149]"}`}>
                      <span className={`block text-[8px] font-extrabold uppercase tracking-[0.1em] ${isActive ? "text-white/55" : "text-[#8a958f]"}`}>{formatWeekday(date)}</span>
                      <span className="mt-0.5 block text-base font-extrabold leading-none">{new Date(`${date}T00:00:00`).getDate()}</span>
                      <span className={`mt-1 block text-[8px] font-semibold ${isActive ? "text-white/70" : "text-[#77837c]"}`}>
                        {isArrival ? "Arrival" : isDeparture ? "Departure" : hasPermit ? "Added ✓" : "Safari"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <label className="relative flex w-[72px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#dce2de] bg-white text-[#304139] transition hover:border-[#789b89] hover:bg-[#f8faf8] sm:w-[108px]">
                <CalendarEditIcon />
                <span className="mt-1 text-[9px] font-extrabold">Edit dates</span>
                <input type="date" min={today} max={PLANNING_HORIZON} value={state.startDate ?? ""} onChange={(event) => changeStartDate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Change trip start date" />
              </label>
            </div>
          </div>
        </div>
        </div>

        <section className="offer-ticket-edge relative bg-[#adf0b8] px-5 pb-5 pt-4 text-[#17201c] sm:px-7 sm:pb-6 sm:pt-5">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium sm:text-base">Long Weekend Offer</p>
              <p className="mt-0.5 whitespace-nowrap text-xl font-black sm:text-2xl">Flat ₹350 Off</p>
            </div>
            <button type="button" onClick={copyOfferCode} className="flex min-w-0 max-w-[210px] flex-1 items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-[#218552] bg-white px-3 py-3 text-left text-[#18211d] transition active:scale-[0.98] sm:max-w-[310px] sm:px-5" aria-label="Copy offer code LONGWEEKEND">
              <span className="truncate text-sm font-black tracking-[0.02em] sm:text-xl">{couponCopied ? "COPIED!" : "LONGWEEKEND"}</span>
              {couponCopied ? <CheckIconSmall /> : <CopyIcon />}
            </button>
          </div>
        </section>

        <div className="pt-5 sm:pt-7 lg:mx-auto lg:flex lg:max-w-[1200px] lg:items-start lg:gap-8 lg:px-8 lg:pt-10">
        {/* ── Left: permit sections ── */}
        <div className="mx-3 min-w-0 flex-1 space-y-5 sm:mx-5 sm:space-y-7 lg:mx-0">
          {fetchError && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">{fetchError}</p>}
          {dateChangeNotice && <p className="rounded-xl border border-[#c8dccf] bg-[#eef8f1] px-4 py-3 text-xs font-semibold text-[#246441]">{dateChangeNotice}</p>}

          {hasAlternativeRecommendation && recommendation && !isRefreshing && (
            <div className="rounded-2xl border border-[#cce0d3] bg-[#edf8f1] p-4">
              <p className="text-sm font-extrabold text-[#185d39]">We found a better available plan</p>
              <p className="mt-1 text-xs leading-5 text-[#587065]">
                Your closest workable permits are in {recommendation.rangeLabel}{recommendation.dayOffset ? `, ${Math.abs(recommendation.dayOffset)} day${Math.abs(recommendation.dayOffset) === 1 ? "" : "s"} ${recommendation.dayOffset < 0 ? "earlier" : "later"}` : ""}.
              </p>
            </div>
          )}

          <section className="-mx-3 overflow-hidden bg-[linear-gradient(145deg,#fff5c9_0%,#f7f3df_45%,#e8f6ed_100%)] sm:-mx-5 lg:mx-0">
            <div className="flex flex-col gap-4 px-5 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">👍</span>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#536c31]">Handpicked for your trip</p>
                </div>
                <h2 className="font-display mt-1 text-2xl font-bold text-[#18211d]">Recommended permits</h2>
                <p className="mt-1 text-xs text-[#657068]">Best available mix based on zone priority and your dates.</p>
              </div>
              {recommendedPlan.length > 0 && (
                <button type="button" onClick={addRecommendedPlan} className="rounded-xl bg-[#18211d] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-black">
                  Add all {recommendedPlan.length} permits
                </button>
              )}
            </div>

            {recommendedPlan.length === 0 ? (
              <div className="mx-5 mb-5 rounded-2xl border border-dashed border-[#c9b76f] bg-white/55 p-8 text-center text-sm text-[#6a6246] sm:mx-7">
                {loading ? "Finding the best permit combination…" : "No complete permit plan was found. Try nearby dates below."}
              </div>
            ) : (
              <div className="space-y-5 px-5 pb-5 sm:px-7">
                {groupPermitsByDate(recommendedPlan).map(({ date, morning, afternoon }) => (
                  <div key={date}>
                    <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#536c31]">
                      <CalendarDotIcon />
                      {formatDateHeader(date)}
                    </p>
                    <div className="space-y-2">
                      {morning && (
                        <ZonePlanCard
                          safari={morning}
                          isSelected={state.plan.some((item) => item.zone.id === morning.zone.id && item.date === morning.date && item.session === morning.session)}
                          onToggle={() => toggleSafari(morning)}
                        />
                      )}
                      {afternoon && (
                        <ZonePlanCard
                          safari={afternoon}
                          isSelected={state.plan.some((item) => item.zone.id === afternoon.zone.id && item.date === afternoon.date && item.session === afternoon.session)}
                          onToggle={() => toggleSafari(afternoon)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="relative -mx-3 bg-[#f9fbf9] px-3 py-5 sm:-mx-5 sm:px-5 sm:py-7 lg:mx-0 lg:px-7" aria-busy={isRefreshing}>
            {isRefreshing && (
              <div className="absolute inset-0 z-20 flex items-start justify-center bg-white/75 pt-28 backdrop-blur-sm">
                <span className="rounded-full bg-[#18211d] px-5 py-3 text-xs font-bold text-white shadow-xl">Refreshing permits…</span>
              </div>
            )}
            <div className="mb-5">
              <div className="grid grid-cols-2 rounded-xl bg-[#e8ece9] p-1" aria-label="Safari permit type">
                {(["buffer", "core"] as ZoneType[]).map((zoneType) => (
                  <button key={zoneType} type="button" onClick={() => setActiveZoneType(zoneType)} className={`rounded-[10px] px-5 py-2.5 text-xs font-extrabold capitalize transition ${activeZoneType === zoneType ? "bg-[#18211d] text-white shadow-md" : "text-[#66736d]"}`}>
                    {zoneType} permits
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-7">
              {availabilitySections.map((section) => (
                <div key={`${section.context}-${section.range}-${section.dates[0]}-${activeZoneType}`}>
                  <AvailabilityGrid
                    range={section.range}
                    zoneType={activeZoneType}
                    dates={section.dates}
                    plan={state.plan}
                    availability={availability}
                    gypsiesRequired={occupancy.gypsiesRequired}
                    onToggleSelection={handleToggleSelection}
                  />
                </div>
              ))}
            </div>
          </section>

          </div>{/* end left column */}

          {/* ── Right: sticky cart sidebar ── */}
          <div className="mx-3 sm:mx-5 lg:mx-0 lg:w-[300px] lg:shrink-0">
            <div className="lg:sticky lg:top-4 lg:space-y-4">
          <div>
            <section id="safari-cart" className="overflow-hidden rounded-[26px] border border-[#18211d] bg-white shadow-[0_14px_34px_rgba(24,33,29,0.13)]">
              <div key={cartAnimationKey} className={`bg-[#18211d] p-5 text-white ${cartAnimationKey > 0 ? "cart-bump" : ""}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">Your trip</p>
                    <h2 className="mt-1 text-lg font-extrabold">Booking summary</h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{cartItemCount} items</span>
                </div>
                <p className="mt-5 text-3xl font-extrabold">₹{cartTotal.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-[10px] text-white/55">Estimated total · sample pricing</p>
              </div>

              <div className="divide-y divide-[#e7ebe8]">
                {state.plan.length === 0 && !state.transfers ? (
                  <p className="p-6 text-center text-xs leading-5 text-[#718078]">Your plan is empty. Start with a recommended permit.</p>
                ) : (
                  <>
                    {state.plan.map((safari) => (
                      <div key={`${safari.zone.id}-${safari.date}-${safari.session}`} className="cart-item-in flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-[#203028]">{safari.zone.name} permit</p>
                          <p className="mt-0.5 text-[10px] text-[#718078]">{formatShort(safari.date)} · {safari.session === "morning" ? "Morning" : "Afternoon"}</p>
                        </div>
                        <button type="button" onClick={() => toggleSafari(safari)} className="text-[10px] font-extrabold text-danger hover:underline">Remove</button>
                      </div>
                    ))}
                    {state.transfers && (
                      <div className="cart-item-in flex items-center justify-between gap-3 px-4 py-3">
                        <div><p className="text-xs font-extrabold text-[#203028]">Pickup & drop transfers</p><p className="mt-0.5 text-[10px] text-[#718078]">Complete trip</p></div>
                        <button type="button" onClick={() => update({ transfers: false, transferVehicle: null })} className="text-[10px] font-extrabold text-danger hover:underline">Remove</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-danger" role="alert">{error}</p>}

          <div className="hidden items-center justify-between rounded-[24px] border border-[#dfe4e1] bg-white p-4 shadow-lg sm:flex lg:hidden">
            <button type="button" onClick={() => router.push("/book/step-1")} className="rounded-xl border border-[#d8dfdb] px-5 py-3 text-sm font-bold text-[#26372f]">Back</button>
            <div className="flex items-center gap-5">
              <div className="text-right"><p className="text-[10px] font-semibold text-[#748078]">Estimated total</p><p className="text-lg font-extrabold text-[#18211d]">₹{cartTotal.toLocaleString("en-IN")}</p></div>
              <button type="submit" disabled={loading} className="rounded-xl bg-[#fdcb08] px-8 py-3.5 text-sm font-extrabold text-black shadow-[0_8px_20px_rgba(253,203,8,0.28)] hover:bg-[#edbd00] disabled:opacity-50">Continue to review →</button>
            </div>
          </div>
          {/* Desktop continue button (inside right sidebar) */}
          <button type="submit" disabled={loading} className="hidden w-full rounded-2xl bg-[#fdcb08] py-3.5 text-sm font-extrabold text-black shadow-[0_8px_20px_rgba(253,203,8,0.28)] transition hover:bg-[#edbd00] disabled:opacity-50 lg:block">
            Continue to resort →
          </button>
            </div>{/* end sticky wrapper */}
          </div>{/* end right column */}
        </div>{/* end lg:flex */}

        <div className="fixed inset-x-3 bottom-3 z-50 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {error && <p className="mb-2 rounded-xl bg-white px-3 py-2 text-center text-[11px] font-bold text-danger shadow-md">{error}</p>}
          {tripDetailsOpen && state.plan.length > 0 && (
            <div className="mb-2 max-h-[45vh] overflow-y-auto rounded-2xl bg-[#161c19] p-3.5 text-white shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#FFE36D]">Your safaris</p>
                <button type="button" onClick={() => setTripDetailsOpen(false)} aria-label="Hide details" className="text-xs font-bold text-white/60">Hide</button>
              </div>
              <ul className="divide-y divide-white/10">
                {state.plan.map((safari) => (
                  <li key={`${safari.zone.id}-${safari.date}-${safari.session}`} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-white/60">Safari {safari.safariNumber} · {formatDayDate(safari.date)}</p>
                      <p className="truncate text-sm font-bold">{safari.zone.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold">{safari.session === "morning" ? "Morning" : "Evening"}</p>
                      <p className="text-[10px] capitalize text-white/60">{safari.zone.type}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-stretch gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#161c19] px-3.5 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tiles/gypsy.png" alt="" aria-hidden="true" className="h-[46px] w-[46px] max-w-none object-contain" />
              </span>
              {state.plan.length === 0 ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">Add safaris to your plan</p>
                  <p className="truncate text-xs text-white/70">Pick a slot as per your convenience</p>
                </div>
              ) : (
                <button type="button" onClick={() => setTripDetailsOpen((open) => !open)} aria-expanded={tripDetailsOpen} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-bold text-white">
                    {state.plan.length} {state.plan.length === 1 ? "safari" : "safaris"} added · ₹{cartTotal.toLocaleString("en-IN")}
                  </p>
                  <p className="truncate text-xs text-white/70">
                    {state.plan.map((safari) => `${formatShort(safari.date)} ${safari.session === "morning" ? "AM" : "PM"}`).join(" · ")}
                  </p>
                </button>
              )}
            </div>

            {state.plan.length > 0 && (
              <button
                type="submit"
                disabled={loading}
                className="group flex shrink-0 flex-col items-center justify-center rounded-2xl bg-[#FDCB08] px-5 py-2.5 text-[#1c1608] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_14px_32px_rgba(0,0,0,0.28)] transition active:scale-95 disabled:opacity-50"
              >
                <span className="flex items-center gap-1.5 text-[15px] font-extrabold leading-tight">
                  Continue
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </main>
  );
}

function SummaryChip({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold text-[#34443c] transition hover:bg-white hover:text-[#175f3b] focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-[#2e7251] sm:px-3 sm:text-[11px]">
      {icon}
      <span>{label}</span>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 text-[#819087]" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

function groupPermitsByDate(plan: RecommendedSafari[]) {
  const map = new Map<string, { morning?: RecommendedSafari; afternoon?: RecommendedSafari }>();
  for (const safari of plan) {
    const entry = map.get(safari.date) ?? {};
    if (safari.session === "morning") entry.morning = safari;
    else entry.afternoon = safari;
    map.set(safari.date, entry);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, slots]) => ({ date, ...slots }));
}

function formatDateHeader(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatDayDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function formatShort(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatWeekday(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });
}

function shiftISODate(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
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
function MapIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#2e7251]" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>;
}
function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#2e7251]" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
}
function CalendarEditIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 text-[#2e7251]" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17M14.5 15.5h3M16 14v3" strokeLinecap="round" /></svg>;
}
function PeopleIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#2e7251]" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 5 5" strokeLinecap="round" /></svg>;
}
function CopyIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="5" width="11" height="14" rx="2" /><path d="M16 5V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2" strokeLinecap="round" /></svg>;
}
function CheckIconSmall() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#218552]" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CalendarDotIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" /><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" /></svg>;
}
