"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { calculatePartyOccupancy } from "@/lib/occupancy";
import { TRANSFER_VEHICLES, recommendedVehicle, transferVehicle, type TransferChoice, type TransferVehicle } from "@/lib/transfers";

export default function TransfersStep() {
  const router = useRouter();
  const { state, update } = useBooking();

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) router.replace("/book/step-1");
  }, [router, state.plan.length, state.range, state.startDate]);

  const travellers = calculatePartyOccupancy(state.numAdults, state.childAges).totalTravellers;
  const recommended = recommendedVehicle(travellers);
  const chosen = state.transferVehicle;
  const chosenVehicle = transferVehicle(chosen);

  const lastTap = useRef<{ choice: TransferChoice; time: number } | null>(null);

  function choose(choice: TransferChoice, event: React.MouseEvent) {
    // A quick second tap on the same option clears it.
    const now = event.timeStamp;
    const previous = lastTap.current;
    if (previous && previous.choice === choice && now - previous.time < 400) {
      lastTap.current = null;
      update({ transferVehicle: null, transfers: false });
      return;
    }
    lastTap.current = { choice, time: now };
    update({ transferVehicle: choice, transfers: choice !== "own" });
  }

  function next() {
    if (chosen) router.push("/book/step-4");
  }

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-32 sm:pb-10">
      <div className="border-b border-[#e0e5e2] bg-white px-4 pb-2 pt-2 sm:rounded-b-[28px] sm:px-7 sm:shadow-[0_10px_30px_rgba(25,50,40,0.06)]">
        <div className="mx-auto grid max-w-4xl grid-cols-[40px_minmax(0,1fr)_72px] items-center gap-2">
          <button type="button" onClick={() => router.push("/book/step-3")} className="flex h-10 w-9 items-center justify-start text-[#17201c] transition hover:-translate-x-0.5 hover:text-[#1f6b48]" aria-label="Back to resort selection">
            <BackIcon />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4d7863]">Step 3 of 3</p>
            <h1 className="font-display truncate text-xl font-bold leading-tight text-[#17201c] sm:text-2xl">Transfers</h1>
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
          <StepIndicator current={3} currentTone="green" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="px-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Getting there</p>
          <h2 className="font-display mt-1 text-[28px] font-bold leading-tight text-[#111111] sm:text-4xl">How will you reach the jungle?</h2>
          <p className="mt-1.5 text-xs leading-5 text-[#68736d] sm:text-sm">
            Pickup and drop for your whole trip. Travelling {travellers} {travellers === 1 ? "person" : "people"}. Double-tap a selected option to remove it.
          </p>
        </div>

        <div className="mt-5 space-y-3" role="radiogroup" aria-label="Transfer vehicle">
          {TRANSFER_VEHICLES.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={chosen === vehicle.id}
              recommended={recommended === vehicle.id}
              tooSmall={travellers > vehicle.maxTravellers}
              onSelect={(event) => choose(vehicle.id, event)}
            />
          ))}

          <button
            type="button"
            role="radio"
            aria-checked={chosen === "own"}
            onClick={(event) => choose("own", event)}
            className={`flex w-full items-center gap-4 rounded-[22px] border-2 bg-white p-4 text-left transition ${
              chosen === "own" ? "border-[#1f6b48] shadow-[0_10px_26px_rgba(31,107,72,0.14)]" : "border-[#e1e5e2] hover:border-[#fdcb08]"
            }`}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f1f3f1] text-[#3d4a43]">
              <KeyIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold text-[#17201c]">No, I&apos;ll come by my own vehicle</span>
              <span className="mt-0.5 block text-xs text-[#68736d]">We&apos;ll skip pickup and drop. Nothing added to your total.</span>
            </span>
            <Radio checked={chosen === "own"} />
          </button>
        </div>

        <div className="mt-6 hidden items-center justify-between rounded-[20px] bg-white p-4 shadow-sm sm:flex">
          <button type="button" onClick={() => router.push("/book/step-3")} className="rounded-xl px-5 py-3 text-sm font-bold text-[#4f5a54]">Back</button>
          <button type="button" onClick={next} disabled={!chosen} className="rounded-xl bg-[#fdcb08] px-8 py-3.5 text-sm font-extrabold text-[#111111] shadow-[0_8px_20px_rgba(253,203,8,0.28)] disabled:opacity-40">Continue to review →</button>
        </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-50 sm:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#161c19] px-3.5 py-3 shadow-[0_14px_32px_rgba(0,0,0,0.3)]">
            <div className="flex shrink-0 items-center gap-1">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tiles/gypsy.png" alt="Safari added" className="h-[44px] w-[44px] max-w-none object-contain" />
              </span>
              <span aria-hidden="true" className="text-sm font-extrabold leading-none text-[#FFE36D]">+</span>
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chosenVehicle?.image ?? "/tiles/taxi.png"} alt="" aria-hidden="true" className="h-[48px] w-[48px] max-w-none object-contain" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              {chosen === "own" ? (
                <>
                  <p className="truncate text-sm font-bold text-white">Own vehicle</p>
                  <p className="truncate text-xs text-white/70">No transfers needed</p>
                </>
              ) : chosenVehicle ? (
                <>
                  <p className="truncate text-sm font-bold text-white">{chosenVehicle.name} added · ₹{chosenVehicle.price.toLocaleString("en-IN")}</p>
                  <p className="truncate text-xs text-white/70">Pickup &amp; drop</p>
                </>
              ) : (
                <>
                  <p className="truncate text-sm font-bold text-white">Choose your transfer</p>
                  <p className="truncate text-xs text-white/70">Pick a ride as per your convenience</p>
                </>
              )}
            </div>
          </div>
          {chosen && (
            <button
              type="button"
              onClick={next}
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

function VehicleCard({
  vehicle,
  selected,
  recommended,
  tooSmall,
  onSelect,
}: {
  vehicle: TransferVehicle;
  selected: boolean;
  recommended: boolean;
  tooSmall: boolean;
  onSelect: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative w-full overflow-hidden rounded-[22px] border-2 bg-white text-left transition ${
        selected ? "border-[#1f6b48] shadow-[0_12px_28px_rgba(31,107,72,0.16)]" : "border-[#e6e9e7] shadow-[0_4px_14px_rgba(17,17,17,0.04)] hover:border-[#fdcb08]"
      }`}
    >
      {recommended && (
        <span className="absolute right-0 top-0 z-10 rounded-bl-2xl bg-[#FFE36D] px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#1c1608]">Best for your group</span>
      )}

      <div className="flex items-center gap-3.5 p-4 pb-3">
        <span className="flex h-[76px] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_60%,#fff1a8,#fffdf0_70%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={vehicle.image} alt={vehicle.name} loading="lazy" className="h-[84px] w-[84px] max-w-none object-contain drop-shadow-[0_6px_6px_rgba(0,0,0,0.18)]" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full bg-[#eef5f0] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#3d7658]">{vehicle.category}</span>
          <h3 className="font-display mt-1 text-[17px] font-bold leading-tight text-[#17201c]">{vehicle.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-[#68736d]">
            <SeatIcon />
            {vehicle.seats}
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-x-3 gap-y-1.5 px-4 pb-3 sm:grid-cols-3">
        {vehicle.features.map((feature) => (
          <li key={feature} className="flex items-center gap-1.5 text-[11px] font-medium text-[#55625b]">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-[#1f6b48]" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {feature}
          </li>
        ))}
      </ul>

      <div className={`flex items-center justify-between gap-3 border-t border-dashed px-4 py-3 ${selected ? "border-[#bfe0cc] bg-[#f1faf4]" : "border-[#e6e9e7] bg-[#fafbfa]"}`}>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-none text-[#17201c]">₹{vehicle.price.toLocaleString("en-IN")}</p>
          <p className="mt-1 truncate text-[10px] text-[#7b847f]">Pickup &amp; drop · complete trip</p>
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold transition ${selected ? "bg-[#1f6b48] text-white" : "bg-[#161c19] text-white"}`}>
          {selected ? (
            <>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Selected
            </>
          ) : (
            "Select"
          )}
        </span>
      </div>
      {tooSmall && <p className="bg-[#fdecea] px-4 py-2 text-[10px] font-semibold text-[#b3261e]">Seats {vehicle.maxTravellers} — your group is larger, so this may not fit everyone.</p>}
    </button>
  );
}

function SeatIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 5 5" strokeLinecap="round" /></svg>;
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${checked ? "border-[#1f6b48] bg-[#1f6b48] text-white" : "border-[#cfd6d2] bg-white"}`}>
      {checked && <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" aria-hidden="true"><path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );
}

function KeyIcon() {
  // Steering wheel
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.2" /><path d="M3.2 10.5c2.6.4 5 .9 6.6 1.5M20.8 10.5c-2.6.4-5 .9-6.6 1.5M12 14.2V21" strokeLinecap="round" strokeLinejoin="round" /></svg>;
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
