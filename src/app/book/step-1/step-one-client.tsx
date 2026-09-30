"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "@/lib/booking-context";
import { toLocalISODate } from "@/lib/mockData";
import { calculatePartyOccupancy } from "@/lib/occupancy";
import type { Jungle } from "@/lib/types";

const PLANNING_HORIZON = "2027-12-31";
type BookingSpecialFare = "group_of_4" | "senior" | "gst" | "armed_forces" | "medical";

export function StepOneClient({ jungles }: { jungles: Jungle[] }) {
  const router = useRouter();
  const { state, update } = useBooking();
  const availableJungles = jungles.filter((item) => !item.comingSoon);
  const jungle = availableJungles.find((item) => item.slug === state.jungleSlug) ?? availableJungles[0];
  const [error, setError] = useState<string | null>(null);

  // The range picker is gone: fall back to the jungle's first range so later steps always have one.
  useEffect(() => {
    if (jungle && jungle.ranges[0] && (!state.range || !jungle.ranges.includes(state.range))) {
      update({ jungleSlug: jungle.slug, range: jungle.ranges[0] ?? null });
    }
  }, [jungle, state.range, update]);
  const [junglePickerOpen, setJunglePickerOpen] = useState(false);
  const [lengthPickerOpen, setLengthPickerOpen] = useState(false);
  const [travellerPickerOpen, setTravellerPickerOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const appliedQueryJungle = useRef(false);
  const specialFaresSliderRef = useRef<HTMLDivElement>(null);
  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);
  const partySize = state.numAdults + state.childAges.length;
  const requiresChildAges = partySize > 6 && state.childAges.length > 0;
  const today = toLocalISODate(new Date());

  useEffect(() => {
    if (appliedQueryJungle.current) return;
    appliedQueryJungle.current = true;
    const query = new URLSearchParams(window.location.search);
    const requestedSlug = query.get("jungle");
    const requestedEditor = query.get("edit");
    const requestedJungle = jungles.find(
      (item) => !item.comingSoon && item.slug === requestedSlug
    );
    if (requestedJungle && requestedJungle.slug !== state.jungleSlug) {
      update({
        jungleSlug: requestedJungle.slug,
        range: requestedJungle.ranges[0] ?? null,
        recommendedStartDate: null,
        plan: [],
        resortId: null,
      });
    }
    const editorTarget =
      requestedEditor === "date"
          ? "trip-date-control"
          : requestedEditor === "travellers"
            ? "trip-travellers-control"
            : null;
    /* eslint-disable react-hooks/set-state-in-effect -- URL-driven edit links intentionally open the requested Step 1 control after mount */
    if (requestedEditor === "date") requestAnimationFrame(() => dateInputRef.current?.showPicker());
    if (requestedEditor === "travellers") setTravellerPickerOpen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    if (editorTarget) {
      requestAnimationFrame(() =>
        document.getElementById(editorTarget)?.scrollIntoView({ behavior: "smooth", block: "center" })
      );
    }
  }, [jungles, state.jungleSlug, update]);

  if (!jungle) {
    return (
      <div className="mx-auto my-16 max-w-xl rounded-2xl border border-border bg-white p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-dark">No jungles are available</h1>
        <p className="mt-2 text-sm text-muted">No destinations are available to plan right now.</p>
      </div>
    );
  }


  function closePickers(except?: "jungle" | "length" | "travellers") {
    if (except !== "jungle") setJunglePickerOpen(false);
    if (except !== "length") setLengthPickerOpen(false);
    if (except !== "travellers") setTravellerPickerOpen(false);
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    if (!state.startDate) {
      setError("Pick your travel date.");
      return;
    }
    if (state.startDate > PLANNING_HORIZON) {
      setError(`We can only plan trips through ${formatShort(PLANNING_HORIZON)} for now.`);
      return;
    }
    if (occupancy.totalTravellers === 0) {
      setError("Add at least one traveller.");
      setTravellerPickerOpen(true);
      return;
    }
    if (requiresChildAges && state.childAges.some((age) => age === "" || !Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 17)) {
      setError("Add a valid age from 0 to 17 for every child.");
      setTravellerPickerOpen(true);
      return;
    }
    setError(null);
    router.push("/book/step-2");
  }

  function setAdults(value: number) {
    update({ numAdults: value, numTravellers: value + state.childAges.length, recommendedStartDate: null, plan: [] });
  }

  function setChildCount(count: number) {
    const childAges = [...state.childAges];
    while (childAges.length < count) childAges.push("");
    const nextChildAges = childAges.slice(0, count);
    update({ childAges: nextChildAges, numTravellers: state.numAdults + count, recommendedStartDate: null, plan: [] });
  }

  function setChildAge(index: number, age: string) {
    const childAges = [...state.childAges];
    childAges[index] = age;
    update({ childAges, recommendedStartDate: null, plan: [] });
  }

  function toggleSpecialFare(fare: BookingSpecialFare) {
    update({
      // Only one special fare can apply at a time; tapping the selected one clears it.
      specialFares: state.specialFares.includes(fare) ? [] : [fare],
      couponCode: null,
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#F9B233_0%,#FFD86B_16%,#FFF0D0_44%,#ffffff_70%)] pb-12">
      <div className="relative">
        <SafariHero onBack={() => router.push("/")} />

      <form onSubmit={handleContinue} className="relative z-10 -mt-8 mx-3 overflow-hidden rounded-[30px] bg-white/90 shadow-[0_24px_55px_rgba(120,90,0,0.22)] backdrop-blur-xl sm:mx-auto sm:max-w-3xl">


        <div className="space-y-3 bg-white/55 p-4 pb-5 sm:p-6">
          <SelectionButton icon="jungle" label="Which jungle" value={jungle.name} open={junglePickerOpen} onClick={() => {
            const next = !junglePickerOpen;
            closePickers("jungle");
            setJunglePickerOpen(next);
          }} />

          {junglePickerOpen && (
            <div className="overflow-hidden rounded-2xl border border-[#ded8c7] bg-white shadow-[0_14px_36px_rgba(17,17,17,0.10)]">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-brand-dark">Choose a national park</p>
                  <p className="mt-0.5 text-[11px] text-muted">More destinations are being added</p>
                </div>
                <span className="rounded-full bg-[#e9f5ed] px-2.5 py-1 text-[10px] font-bold text-success">
                  {availableJungles.length} available
                </span>
              </div>
              <div className="max-h-[370px] overflow-y-auto overscroll-contain p-3">
                {(["Maharashtra", "Madhya Pradesh"] as const).map((stateName) => (
                <div key={stateName} className="not-first:mt-5">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">{stateName}</p>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="space-y-1.5">
                    {jungles.filter((item) => item.state === stateName).map((item) => {
                      const selected = jungle.slug === item.slug;
                      if (item.comingSoon) {
                        return (
                          <div
                            key={item.slug}
                            className="grid min-h-14 w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-xl border border-transparent bg-[#f7f7f5] p-2 opacity-70"
                          >
                            <Image
                              src={item.image}
                              alt=""
                              width={40}
                              height={40}
                              className="block h-10 w-10 max-w-none rounded-lg object-cover grayscale"
                              style={{ width: 40, height: 40, minWidth: 40, maxWidth: 40 }}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold text-[#555]">{item.name}</span>
                              <span className="block truncate text-[10px] text-muted">{item.tagline}</span>
                            </span>
                            <span className="rounded-full border border-[#eadfba] bg-[#fff9e7] px-2 py-1 text-[9px] font-bold text-[#7d6b34]">Soon</span>
                          </div>
                        );
                      }
                      return (
                        <button type="button" key={item.slug} onClick={() => {
                          update({ jungleSlug: item.slug, range: item.ranges[0] ?? null, recommendedStartDate: null, plan: [], resortId: null });
                          setJunglePickerOpen(false);
                        }} className={`grid min-h-[70px] w-full grid-cols-[52px_minmax(0,1fr)_32px] items-center gap-3 overflow-hidden rounded-xl border p-2 text-left transition ${selected ? "border-accent bg-[linear-gradient(100deg,#fff9e4,#fff3bc)] shadow-[0_5px_14px_rgba(253,203,8,0.14)]" : "border-border bg-white hover:border-accent hover:bg-[#fffdf5]"}`}>
                          <Image
                            src={item.image}
                            alt=""
                            width={52}
                            height={52}
                            className="block h-[52px] w-[52px] max-w-none rounded-[10px] object-cover shadow-sm"
                            style={{ width: 52, height: 52, minWidth: 52, maxWidth: 52 }}
                          />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-bold text-brand-dark">{item.name}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-muted">{item.tagline}</span>
                          </span>
                          <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-success bg-success text-white" : "border-border bg-white text-muted"}`}>
                            {selected ? "✓" : "›"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div
              id="trip-date-control"
              role="button"
              tabIndex={0}
              onClick={() => { closePickers(); dateInputRef.current?.showPicker(); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); dateInputRef.current?.showPicker(); } }}
              className="group relative flex min-h-[88px] w-full cursor-pointer items-center gap-2 rounded-2xl border border-[#eadfae] bg-white px-2.5 py-3 text-left shadow-[0_2px_8px_rgba(17,17,17,0.03)] transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:gap-3 sm:px-4"
            >
              <FieldIcon type="date" />
              <span className="min-w-0 flex-1">
                <span className="block whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.02em] text-muted sm:text-[10px]">Date of travel</span>
                <span className="mt-1.5 block whitespace-nowrap text-[13px] font-semibold leading-none text-brand-dark">
                  {state.startDate ? formatDateField(state.startDate) : "dd-mm-yyyy"}
                </span>
              </span>
              <input
                ref={dateInputRef}
                type="date"
                min={today}
                max={PLANNING_HORIZON}
                value={state.startDate ?? ""}
                onChange={(e) => { if (e.target.value) update({ startDate: e.target.value, recommendedStartDate: null, plan: [] }); }}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <SelectionButton compact icon="length" label="Travel length" value={`${state.nights}N / ${state.nights + 1}D`} open={lengthPickerOpen} onClick={() => {
              const next = !lengthPickerOpen;
              closePickers("length");
              setLengthPickerOpen(next);
            }} />
          </div>

          {lengthPickerOpen && (
            <div className="grid grid-cols-5 gap-1.5 rounded-xl border border-border bg-white p-3 shadow-sm">
              {[1, 2, 3, 4, 5].map((nights) => (
                <button type="button" key={nights} onClick={() => {
                  update({ nights, recommendedStartDate: null, plan: [] });
                  setLengthPickerOpen(false);
                }} className={`h-11 rounded-lg border text-xs font-bold transition ${state.nights === nights ? "border-brand bg-brand text-white" : "border-border bg-white text-muted hover:border-brand"}`}>
                  {nights}N/{nights + 1}D
                </button>
              ))}
            </div>
          )}

          <SelectionButton id="trip-travellers-control" icon="travellers" label="No. of travellers" value={`${occupancy.totalTravellers} traveller${occupancy.totalTravellers === 1 ? "" : "s"}`} open={travellerPickerOpen} onClick={() => {
            const next = !travellerPickerOpen;
            closePickers("travellers");
            setTravellerPickerOpen(next);
          }} />

          {travellerPickerOpen && (
            <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TravellerRow label="Adults" note="Age 18 and above"><Stepper value={state.numAdults} min={0} max={24} onChange={setAdults} /></TravellerRow>
                <TravellerRow label="Children" note="Age 0–17"><Stepper value={state.childAges.length} min={0} max={8} onChange={setChildCount} /></TravellerRow>
              </div>

              {requiresChildAges && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold">Age of each child</p>
                  <p className="mt-1 text-xs leading-5 text-muted">We need these ages to calculate the correct number of gypsies.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {state.childAges.map((age, index) => (
                      <label key={index} className="text-xs text-muted">Child {index + 1}
                        <input type="number" min={0} max={17} step={1} required value={age} onChange={(event) => setChildAge(index, event.target.value)} placeholder="Age" className="mt-1 w-full rounded-lg border border-border bg-[#fafafa] px-3 py-2 text-sm text-foreground outline-none focus:border-brand" />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 rounded-lg bg-accent-light px-3 py-2.5">
                <span className="text-xs leading-4 text-muted">Up to 6 adults plus 2 young children per gypsy</span>
                <span className="shrink-0 text-sm font-bold text-brand-dark">{occupancy.gypsiesRequired} {occupancy.gypsiesRequired === 1 ? "gypsy" : "gypsies"}</span>
              </div>
            </div>
          )}

          <section className="pt-2" aria-labelledby="special-fares-title">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <p id="special-fares-title" className="text-[10px] font-medium uppercase tracking-[0.03em] text-muted sm:text-[11px]">
                Special fares
              </p>
              <div className="flex items-center gap-1">
                <button type="button" aria-label="Previous special fares" onClick={() => specialFaresSliderRef.current?.scrollBy({ left: -190, behavior: "smooth" })} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfae] bg-white text-sm text-brand-dark">‹</button>
                <button type="button" aria-label="Next special fares" onClick={() => specialFaresSliderRef.current?.scrollBy({ left: 190, behavior: "smooth" })} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfae] bg-white text-sm text-brand-dark">›</button>
              </div>
            </div>
            <div ref={specialFaresSliderRef} className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SpecialFareCard title="Group of 4" subtitle="Flat ₹6,000 off" selected={state.specialFares.includes("group_of_4")} onClick={() => toggleSpecialFare("group_of_4")} />
              <SpecialFareCard title="Senior Citizen" subtitle="Up to ₹4,000 off" selected={state.specialFares.includes("senior")} onClick={() => toggleSpecialFare("senior")} />
              <SpecialFareCard title="Have a GST number?" subtitle="Assured GST invoice" badge="new" selected={state.specialFares.includes("gst")} onClick={() => toggleSpecialFare("gst")} />
              <SpecialFareCard title="Armed Forces" subtitle="Up to ₹600 off" selected={state.specialFares.includes("armed_forces")} onClick={() => toggleSpecialFare("armed_forces")} />
              <SpecialFareCard title="Doctor and Nurses" subtitle="Up to ₹600 off" selected={state.specialFares.includes("medical")} onClick={() => toggleSpecialFare("medical")} />
            </div>
          </section>

          {error && <p role="alert" className="rounded-lg border border-danger/20 bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

          <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(180deg,#FFE36D,#fdcb08)] py-4 text-sm font-bold text-black shadow-[0_12px_26px_rgba(202,156,0,0.32)] transition hover:-translate-y-0.5 hover:bg-[#e7b900] hover:shadow-[0_15px_30px_rgba(202,156,0,0.34)] focus:ring-2 focus:ring-accent focus:ring-offset-2 active:translate-y-0 sm:text-[15px]">
            Find safaris
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </button>
        </div>
      </form>

      <section className="mx-auto mt-8 w-full max-w-3xl px-3 sm:mt-10" aria-label="Payment options">
        <div className="relative z-20 overflow-hidden rounded-[26px] border border-[#f0e6bd] bg-white shadow-[0_14px_36px_rgba(120,90,0,0.12)]">
          <div className="h-1.5 bg-[linear-gradient(90deg,#FFE36D,#fdcb08,#FFE36D)]" aria-hidden="true" />
          <div className="px-5 pb-5 pt-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#fffdf4,#ffefad)] text-[#6b5200] shadow-[0_4px_10px_rgba(111,87,0,0.12)]">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10.5h18M7 15h4" strokeLinecap="round" /></svg>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a6a00]">Travel made easy</p>
                <h2 className="font-display text-xl font-bold leading-tight text-brand-dark">Pay and plan your way</h2>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#68736d]">Cards, UPI and more, accepted</p>

            <PaymentShortcut />
          </div>
        </div>
      </section>

      </div>
    </div>
  );
}


function SafariHero({ onBack }: { onBack: () => void }) {
  const circle = "flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-[0_4px_12px_rgba(120,60,0,0.22)] transition active:scale-95";
  return (
    <header className="relative overflow-hidden pb-0 pt-4">
      {/* sunburst */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 58%, #FFF7C2 0%, #FFE27A 34%, #FDBF3A 72%, #F7A82A 100%)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70"
        style={{
          background: "repeating-conic-gradient(from 0deg at 50% 58%, rgba(255,255,255,0.55) 0deg 5deg, rgba(255,255,255,0) 5deg 15deg)",
          maskImage: "radial-gradient(circle at 50% 58%, #000 8%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 58%, #000 8%, transparent 78%)",
        }}
      />

      {/* Langoor touching top-right of page */}
      <Image
        src="/hero/langoor.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={304}
        priority
        className="absolute right-14 top-0 h-32 w-auto select-none drop-shadow-md langoor-sway"
      />

      {/* Nav buttons */}
      <div className="relative mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6">
        <button type="button" onClick={onBack} className={`${circle} text-[#17201c]`} aria-label="Back to home">
          <BackIcon />
        </button>
        <a href="https://wa.me/?text=Hi%2C%20I%20need%20help%20planning%20my%20safari%20with%20Wild%20Excursions." target="_blank" rel="noreferrer" className={`${circle} text-[#18a957]`} aria-label="Chat on WhatsApp">
          <WhatsAppIcon />
        </a>
      </div>

      {/* Title centred in space between langoor feet and card */}
      <div className="relative flex flex-col items-center justify-center pt-24 pb-8 px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-dark sm:text-4xl">Plan Your Jungle Safari</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#5c4a10]">One simple plan for your safaris, stay and transfers.</p>
      </div>

      {/* Fade strip */}
      <div className="relative w-full" aria-hidden="true" style={{ height: "60px" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, #ffffff)" }} />
      </div>
    </header>
  );
}

function OfferBanner() {
  const code = "LONGWEEKEND";
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — the code stays visible to copy by hand */
    }
  }

  return (
    <div className="bg-white/55 pb-3">
      <div className="relative bg-[#FFE36D] px-4 pb-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#3a2f08]">Long Weekend Stay Offer</p>
            <p className="font-display mt-0.5 text-[22px] font-bold leading-tight text-black">Flat ₹350 Off</p>
            <p className="mt-0.5 text-[10px] font-medium text-[#6b5200]">On your Kolara resort stay</p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            aria-label={`Copy code ${code}`}
            className="flex shrink-0 items-center gap-3 rounded-[18px] border-2 border-dashed border-[#1c1608] bg-white/40 px-4 py-3 text-[12px] font-extrabold tracking-wide text-[#1c1608] transition active:scale-95"
          >
            {copied ? "COPIED!" : code}
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <rect x="8.5" y="8.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {/* scalloped bottom edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-full h-[10px]"
          style={{
            backgroundImage: "radial-gradient(circle at 10px 0, #FFE36D 9.5px, transparent 10px)",
            backgroundSize: "20px 10px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>
    </div>
  );
}

function PaymentShortcut() {
  const chip = "flex h-12 min-w-0 items-center justify-center overflow-hidden rounded-xl border border-[#efe6c4] bg-white px-1.5 shadow-[0_2px_6px_rgba(111,87,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(111,87,0,0.14)]";
  return (
    <div className="mt-4 grid grid-cols-5 gap-2">
      <span className={chip} aria-label="Mastercard">
        <svg viewBox="0 0 40 26" className="h-6 w-9" aria-hidden="true"><circle cx="14" cy="13" r="10" fill="#EB001B" /><circle cx="26" cy="13" r="10" fill="#F79E1B" fillOpacity=".95" /><path d="M20 4.6a10 10 0 0 1 0 16.8 10 10 0 0 1 0-16.8Z" fill="#FF5F00" /></svg>
      </span>
      <span className={`${chip} border-[#1f3a7a] bg-[#1f3a7a]`} aria-label="American Express">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/amex.webp" alt="American Express" loading="lazy" className="max-h-7 w-full object-contain" />
      </span>
      <span className={chip} aria-label="Visa">
        <span className="text-[16px] font-black italic tracking-tight text-[#1a1f71]">VISA</span>
      </span>
      <span className={chip} aria-label="RuPay">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/rupay.webp" alt="RuPay" loading="lazy" className="max-h-5 w-full object-contain" />
      </span>
      <span className={chip} aria-label="UPI">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/payments/upi.svg" alt="UPI" loading="lazy" className="max-h-6 w-full object-contain" />
      </span>
    </div>
  );
}

function SpecialFareCard({ title, subtitle, badge, selected, onClick }: {
  title: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative min-h-[62px] w-[178px] shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition ${selected ? "border-accent bg-[#fff9df] shadow-[0_4px_12px_rgba(253,203,8,0.12)]" : "border-[#eadfae] bg-white hover:border-accent"}`}
    >
      <span className="block whitespace-nowrap text-[12px] font-semibold leading-tight text-brand-dark">{title}</span>
      <span className={`mt-1 block whitespace-nowrap text-[10px] leading-tight ${title === "Have a GST number?" ? "text-[#8a5a00]" : "text-[#8a5a00]"}`}>{subtitle}</span>
      {badge && (
        <span className="absolute right-2 top-2 rounded-full bg-[#e65397] px-1.5 py-0.5 text-[8px] font-bold lowercase text-white">{badge}</span>
      )}
      {selected && <span className="absolute bottom-2 right-2 text-[11px] font-bold text-success">✓</span>}
    </button>
  );
}

function SelectionButton({ id, icon, label, value, open, onClick, compact = false, placeholder = false }: {
  id?: string;
  icon: "jungle" | "range" | "length" | "travellers";
  label: string;
  value: string;
  open: boolean;
  onClick: () => void;
  compact?: boolean;
  placeholder?: boolean;
}) {
  return (
    <button id={id} type="button" onClick={onClick} aria-expanded={open} className={`flex w-full items-center rounded-2xl border bg-white py-3 text-left shadow-[0_2px_8px_rgba(17,17,17,0.03)] transition hover:border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:gap-3 sm:px-4 ${compact ? "min-h-[88px] gap-2 px-2.5" : "min-h-[74px] gap-3 px-3.5"} ${open ? "border-accent ring-2 ring-accent/10" : "border-[#eadfae]"}`}>
      <FieldIcon type={icon} active={open} />
      <span className="min-w-0 flex-1">
        <span className="block whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.02em] text-muted sm:text-[10px]">{label}</span>
        <span className={`mt-1.5 block truncate text-[13px] font-semibold leading-none ${placeholder ? "text-muted" : "text-brand-dark"}`}>{value}</span>
      </span>
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`h-4 w-4 shrink-0 text-muted transition-transform ${compact ? "hidden sm:block" : ""} ${open ? "rotate-180" : ""}`}>
        <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function FieldIcon({ type, active = false }: { type: "jungle" | "range" | "date" | "length" | "travellers"; active?: boolean }) {
  const paths = {
    jungle: <><path d="M12 21s7-5.4 7-12a7 7 0 1 0-14 0c0 6.6 7 12 7 12Z" /><circle cx="12" cy="9" r="2.5" /></>,
    range: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z" /></>,
    date: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    length: <><path d="M4 7h16M7 4 4 7l3 3M20 17H4M17 14l3 3-3 3" /></>,
    travellers: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M17 9a3 3 0 0 1 0 6M17.5 16.5A5 5 0 0 1 21 20" /></>,
  };
  return (
    <span className={`flex h-10 w-7 shrink-0 items-center justify-center bg-transparent transition-colors ${active ? "text-[#8a6a00]" : "text-brand-dark"}`}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[27px] w-[27px] stroke-current" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>
    </span>
  );
}

function TravellerRow({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-[#fafafa] p-3">
      <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-muted">{note}</p></div>
      {children}
    </div>
  );
}

function formatShort(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDateField(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}-${month}-${year}`;
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Decrease" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-lg font-semibold transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-35">−</button>
      <span className="w-5 text-center text-sm font-bold">{value}</span>
      <button type="button" aria-label="Increase" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-lg font-semibold transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-35">+</button>
    </div>
  );
}

function BackIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function WhatsAppIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[25px] w-[25px]" fill="currentColor"><path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.94L2.05 22l5.19-1.36A9.84 9.84 0 1 0 12.04 2Zm0 17.97a8.15 8.15 0 0 1-4.15-1.14l-.3-.18-3.08.81.82-3-.2-.31a8.12 8.12 0 1 1 6.91 3.82Zm4.46-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" /></svg>;
}
