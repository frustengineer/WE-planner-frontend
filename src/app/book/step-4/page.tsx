"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { calculatePartyOccupancy } from "@/lib/occupancy";
import { computeCart } from "@/lib/pricing";
import { RESORT_DETAILS, RESORT_TIER_LABEL } from "@/lib/resort-details";

export default function Step4() {
  const router = useRouter();
  const { state } = useBooking();

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) router.replace("/book/step-1");
  }, [router, state.plan.length, state.range, state.startDate]);

  const { lines, total } = computeCart(state);
  const resort = RESORTS.find((item) => item.id === state.resortId);
  const resortDetails = resort ? RESORT_DETAILS[resort.tier] : null;
  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);

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
            <button type="button" onClick={() => router.push("/book/step-3")} className="flex h-10 w-9 items-center justify-start text-[#17201c] transition hover:-translate-x-0.5" aria-label="Back to resort selection"><BackIcon /></button>
            <div className="text-center">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Step 4 of 4</p>
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
            </div>

            <section className="overflow-hidden rounded-[24px] border border-[#e1e5e2] bg-white shadow-[0_10px_28px_rgba(17,17,17,0.07)] lg:sticky lg:top-5">
              <div className="border-b border-[#edf0ee] px-5 py-4"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#777777]">Trip total</p><h2 className="font-display mt-0.5 text-xl font-bold">Price breakdown</h2></div>
              <ul className="space-y-3 px-5 py-5">
                {lines.map((line) => (
                  <li key={line.label} className="flex items-start justify-between gap-4 text-xs">
                    <span className="text-[#68736d]">{line.label}{line.detail && <span className="mt-0.5 block text-[9px] text-[#929a95]">{line.detail}</span>}</span>
                    <span className="shrink-0 font-extrabold text-[#17201c]">₹{line.amount.toLocaleString("en-IN")}</span>
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
      </form>
    </main>
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
