"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { useBooking } from "@/lib/booking-context";
import { computeCart } from "@/lib/pricing";
import { RESORTS } from "@/lib/mockData";
import { calculatePartyOccupancy } from "@/lib/occupancy";

export default function Step3() {
  const router = useRouter();
  const { state } = useBooking();

  useEffect(() => {
    if (!state.range || !state.startDate || state.plan.length === 0) {
      router.replace("/book/step-1");
      return;
    }
  }, [router, state.plan.length, state.range, state.startDate]);

  const { lines, total } = computeCart(state);
  const resort = RESORTS.find((r) => r.id === state.resortId);
  const occupancy = calculatePartyOccupancy(state.numAdults, state.childAges);

  function handleComplete(e: React.FormEvent) {
    e.preventDefault();
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
    <div>
      <StepIndicator current={3} />
      <form onSubmit={handleComplete} className="booking-card space-y-7 p-5 sm:p-8">
        <div>
          <p className="section-kicker">Step 3 of 3 · Final review</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-brand-dark">Review Your Plan</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Review your day-wise itinerary, group size, and sample quote.
          </p>
          <p className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning">
            Frontend demo only: sample availability and prices. No booking or enquiry will be sent.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
          <div className="space-y-6">
            <section>
              <h2 className="font-display mb-3 text-xl font-bold text-brand-dark">Your Day-wise Plan</h2>
              <p className="mb-3 text-xs text-muted">
                {occupancy.totalTravellers} travellers · {occupancy.gypsiesRequired} {occupancy.gypsiesRequired === 1 ? "gypsy" : "gypsies"} per safari
              </p>
              <div className="space-y-3">
                {state.plan.map((s) => (
                  <article key={`${s.date}-${s.session}`} className="soft-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Safari {s.safariNumber} · {formatDate(s.date)}</p>
                        <h3 className="font-display mt-1 text-lg font-bold text-brand-dark">{s.zone.name}</h3>
                        <p className="mt-1 text-xs text-muted">
                          {s.session === "morning" ? "Morning" : "Evening"} safari · {s.gypsiesRequired} {s.gypsiesRequired === 1 ? "gypsy" : "gypsies"}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f7ecd0] px-2.5 py-1 text-[10px] font-semibold capitalize text-brand">{s.zone.type}</span>
                    </div>
                  </article>
                ))}
                {resort && (
                  <article className="soft-card p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Your stay</p>
                    <h3 className="font-display mt-1 text-lg font-bold text-brand-dark">{resort.name}</h3>
                    <p className="mt-1 text-xs text-muted">{state.nights} night{state.nights === 1 ? "" : "s"} · Preferred resort</p>
                  </article>
                )}
              </div>
            </section>

          </div>

          <div className="space-y-4">
            <section className="rounded-xl border border-brand bg-[#fffdf2] p-4 sm:p-5">
              <h2 className="font-display mb-3 text-lg font-bold text-brand-dark">Price Breakdown</h2>
              <ul className="space-y-2 text-xs">
                {lines.map((l) => (
                  <li key={l.label} className="flex justify-between gap-4">
                    <span className="text-muted">{l.label}{l.detail && <span className="ml-1 text-[10px]">({l.detail})</span>}</span>
                    <span className="font-semibold">₹{l.amount.toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
              <div className="my-4 h-px bg-border" />
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold">Total quote</span>
                <span className="font-display text-2xl font-bold text-brand-dark">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-muted">Example prices only. No payment or booking is made.</p>
            </section>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border pt-5">
          <button type="button" onClick={() => router.push("/book/step-2")} className="rounded-lg border border-border bg-white px-5 py-3 font-semibold text-foreground transition hover:border-brand">Back</button>
          <button type="submit" className="flex-1 rounded-lg bg-accent py-3 font-semibold text-black shadow-[0_8px_20px_rgba(253,203,8,0.24)] transition hover:bg-[#a97e00]">
            Complete demo plan
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
