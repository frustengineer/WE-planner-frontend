import { rankZonesForRange } from "@/lib/engine";
import { PRICING, tripSlots } from "@/lib/mockData";
import type { AvailabilitySnapshot, RecommendedSafari, Zone, ZoneType } from "@/lib/types";

const MAX_GYPSIES = 6;

export type AvailabilitySelection = {
  zone: Zone;
  date: string;
  session: "morning" | "afternoon";
  rank: number;
  isDemandBased: boolean;
  isProvisional: boolean;
};

export function AvailabilityGrid({
  range,
  zoneType,
  dates,
  plan,
  availability,
  maxScrapedDate = null,
  gypsiesRequired = 1,
  onToggleSelection,
}: {
  range: string;
  zoneType: ZoneType;
  dates: string[];
  plan: RecommendedSafari[];
  availability: AvailabilitySnapshot[];
  maxScrapedDate?: string | null;
  gypsiesRequired?: number;
  onToggleSelection?: (selection: AvailabilitySelection) => void;
}) {
  const zones = rankZonesForRange(range, zoneType, availability);
  const slots = tripSlots(dates);
  const permitPrice = PRICING.permitPerSafari * gypsiesRequired;

  return (
    <div className="space-y-4">
      {zones.map(({ zone, rank, isDemandBased }) => (
        <article
          key={zone.id}
          className="overflow-hidden rounded-[22px] border border-[#e1e5e2] bg-white shadow-[0_8px_24px_rgba(30,54,45,0.07)]"
        >
          <header className="flex items-center justify-between gap-3 border-b border-[#edf0ee] px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <ZoneMonogram name={zone.name} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-extrabold text-[#18211d]">{zone.name}</h4>
                  <span className="rounded-full bg-[#f0f3f1] px-2 py-0.5 text-[9px] font-extrabold text-[#64736b]">#{rank}</span>
                </div>
                <p className="mt-0.5 truncate text-[10px] font-medium text-[#738079]">
                  {zone.type === "core" ? "Core" : "Buffer"} zone · Gate {zone.gate}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold text-[#1d3e2e]">₹{permitPrice.toLocaleString("en-IN")}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8a958f]">per permit</p>
            </div>
          </header>

          <div className="flex items-center justify-between px-4 pt-3 sm:px-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#64736b]">Choose a date & session</p>
            <span className="text-[9px] font-bold text-[#89958f]">Swipe dates →</span>
          </div>

          <div className="permit-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 pt-2.5">
            {slots.map(({ date, session }) => {
              const snapshot = availability.find(
                (item) => item.zoneId === zone.id && item.date === date && item.session === session
              );
              const selected = plan.some(
                (item) => item.zone.id === zone.id && item.date === date && item.session === session
              );
              const beyondCoverage = !snapshot && Boolean(maxScrapedDate) && date > maxScrapedDate!;
              const portalAvailable = snapshot?.status === "available" || beyondCoverage;
              const vehicleCount = beyondCoverage ? MAX_GYPSIES : snapshot?.availableCount ?? 0;
              const isAvailable = portalAvailable && vehicleCount >= gypsiesRequired;
              const shortfall = portalAvailable && vehicleCount < gypsiesRequired;
              const status = availabilityLabel(snapshot?.status, shortfall);
              const disabled = !onToggleSelection || (!selected && !isAvailable);

              return (
                <button
                  type="button"
                  key={`${date}-${session}`}
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() =>
                    onToggleSelection?.({
                      zone,
                      date,
                      session,
                      rank,
                      isDemandBased,
                      isProvisional: beyondCoverage,
                    })
                  }
                  className={`first:ml-4 last:mr-4 w-[68vw] max-w-[244px] shrink-0 snap-start scroll-ml-4 overflow-hidden rounded-2xl border text-left transition active:scale-[0.98] sm:first:ml-5 sm:last:mr-5 sm:scroll-ml-5 ${
                    selected
                      ? "border-[#2e7251] bg-[#eef8f1] shadow-[0_8px_20px_rgba(46,114,81,0.16)]"
                      : isAvailable
                        ? "border-[#abd9ba] bg-[#f1faf3] hover:-translate-y-0.5 hover:border-[#218552]"
                        : "border-[#eaded8] bg-[#fbf7f5] opacity-75"
                  }`}
                >
                  <span className={`flex items-center justify-between gap-2 border-b px-3 py-2 ${
                    selected
                      ? "border-[#245e41] bg-[#2e7251] text-white"
                      : isAvailable
                        ? "border-[#c2e4cb] bg-[#d8f2df] text-[#173b28]"
                        : "border-[#eaded8] bg-[#f4e6df] text-[#684b3e]"
                  }`}>
                    <span>
                      <span className="block text-xs font-extrabold">{formatLong(date)}</span>
                      <span className={`mt-0.5 flex items-center gap-1 text-[9px] font-bold ${selected ? "text-white/70" : "opacity-70"}`}>
                        {session === "morning" ? <SunIcon /> : <MoonIcon />}
                        {session === "morning" ? "Morning safari" : "Evening safari"}
                      </span>
                    </span>
                    {selected && <span className="rounded-full bg-white/15 px-2 py-1 text-[9px] font-extrabold">Selected</span>}
                  </span>

                  <span className="block px-3 py-2.5">
                    <span className={`flex items-center gap-1.5 text-[13px] font-extrabold ${selected ? "text-[#17633b]" : isAvailable ? "text-[#08752f]" : "text-[#9a4e2c]"}`}>
                      {selected ? <CheckIcon /> : isAvailable ? <SparkIcon /> : <ClockIcon />}
                      {selected ? "Added to your plan" : isAvailable ? `Available ${vehicleCount} Gypsy` : status}
                    </span>
                    <span className={`mt-2 flex items-center justify-between gap-2 text-[9px] ${selected ? "text-[#456555]" : "text-[#637169]"}`}>
                      <span className="font-semibold">Zone Rating: {getZoneRating(rank)} ★</span>
                      <span>{selected ? "Remove" : isAvailable ? "Select →" : "Unavailable"}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function availabilityLabel(status: AvailabilitySnapshot["status"] | undefined, shortfall: boolean) {
  if (shortfall) return "Not enough vehicles";
  if (status === "waitlist") return "Waitlist";
  if (status === "gate-closed") return "Gate closed";
  if (status === "window-closed") return "Booking not open";
  if (status === "NA") return "Not listed";
  return "Sold out";
}

function formatLong(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getZoneRating(rank: number) {
  return Math.max(3.5, 4.9 - rank * 0.15).toFixed(1);
}

function ZoneMonogram({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(145deg,#d9f0e1,#f3faf5)] text-lg font-black text-[#17633b] shadow-[inset_0_0_0_1px_rgba(46,114,81,0.08)]">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function SunIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" /></svg>;
}

function MoonIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SparkIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 17h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.4 1.4-1.5 2.5h-4c-.1-1.1-.6-1.8-1.5-2.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ClockIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
