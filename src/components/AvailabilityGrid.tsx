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
  const allSlots = tripSlots(dates);
  const permitPrice = PRICING.permitPerSafari * gypsiesRequired;

  // Group slots by date → { morning?, afternoon? }
  const slotsByDate = (() => {
    const map = new Map<string, { morning?: (typeof allSlots)[0]; afternoon?: (typeof allSlots)[0] }>();
    for (const slot of allSlots) {
      const entry = map.get(slot.date) ?? {};
      entry[slot.session] = slot;
      map.set(slot.date, entry);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  })();

  return (
    <div className="space-y-4">
      {zones.map(({ zone, rank, isDemandBased }) => (
        <article
          key={zone.id}
          className="overflow-hidden rounded-[22px] border border-[#e1e5e2] bg-white shadow-[0_8px_24px_rgba(30,54,45,0.07)]"
        >
          {/* Zone header */}
          <header className="flex items-center justify-between gap-3 border-b border-[#edf0ee] px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <ZoneMonogram name={zone.gate} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-sm font-extrabold text-[#18211d]">{zone.gate} Gate</h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
                      zone.type === "core"
                        ? "bg-[#fce8d0] text-[#7c3503]"
                        : "bg-[#dff2e8] text-[#1a5c38]"
                    }`}
                  >
                    {zone.type}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] font-medium text-[#738079]">
                  Priority #{rank} · {isDemandBased ? "demand-based" : "zone ranking"}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-extrabold text-[#1d3e2e]">₹{permitPrice.toLocaleString("en-IN")}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-[#8a958f]">per permit</p>
            </div>
          </header>

          {/* Column labels */}
          <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2 border-b border-[#f0f4f1] px-4 py-1.5 sm:px-5">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#9aa59f]">Date</span>
            <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#c09000]">
              <SmallSunIcon /> Morning
            </span>
            <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#4527a0]">
              <SmallMoonIcon /> Afternoon
            </span>
          </div>

          {/* Date rows */}
          <div className="divide-y divide-[#f0f4f1]">
            {slotsByDate.map(([date, sessions]) => (
              <div key={date} className="grid grid-cols-[80px_1fr_1fr] items-stretch gap-2 px-4 py-2.5 sm:px-5">
                {/* Date label */}
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-extrabold leading-tight text-[#18211d]">
                    {formatDay(date)}
                  </span>
                  <span className="text-[10px] text-[#8a958f]">{formatMonthShort(date)}</span>
                </div>

                {/* Morning slot */}
                {sessions.morning ? (
                  <SlotButton
                    zone={zone}
                    date={date}
                    session="morning"
                    rank={rank}
                    isDemandBased={isDemandBased}
                    maxScrapedDate={maxScrapedDate}
                    availability={availability}
                    plan={plan}
                    gypsiesRequired={gypsiesRequired}
                    onToggleSelection={onToggleSelection}
                  />
                ) : (
                  <span className="flex items-center justify-center rounded-xl border border-dashed border-[#e8ede9] text-[10px] text-[#b5bdb9]">
                    —
                  </span>
                )}

                {/* Evening slot */}
                {sessions.afternoon ? (
                  <SlotButton
                    zone={zone}
                    date={date}
                    session="afternoon"
                    rank={rank}
                    isDemandBased={isDemandBased}
                    maxScrapedDate={maxScrapedDate}
                    availability={availability}
                    plan={plan}
                    gypsiesRequired={gypsiesRequired}
                    onToggleSelection={onToggleSelection}
                  />
                ) : (
                  <span className="flex items-center justify-center rounded-xl border border-dashed border-[#e8ede9] text-[10px] text-[#b5bdb9]">
                    —
                  </span>
                )}
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function SlotButton({
  zone,
  date,
  session,
  rank,
  isDemandBased,
  maxScrapedDate,
  availability,
  plan,
  gypsiesRequired,
  onToggleSelection,
}: {
  zone: Zone;
  date: string;
  session: "morning" | "afternoon";
  rank: number;
  isDemandBased: boolean;
  maxScrapedDate: string | null;
  availability: AvailabilitySnapshot[];
  plan: RecommendedSafari[];
  gypsiesRequired: number;
  onToggleSelection?: (selection: AvailabilitySelection) => void;
}) {
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
  const statusLabel = availabilityLabel(snapshot?.status, shortfall);
  const disabled = !onToggleSelection || (!selected && !isAvailable);

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() =>
        onToggleSelection?.({ zone, date, session, rank, isDemandBased, isProvisional: beyondCoverage })
      }
      className={`flex min-h-[52px] flex-col items-start justify-between rounded-xl border px-2.5 py-2 text-left transition active:scale-[0.97] ${
        selected
          ? "border-[#2e7251] bg-[#eef8f1]"
          : isAvailable
            ? "border-[#abd9ba] bg-[#f1faf3] hover:border-[#218552]"
            : "cursor-not-allowed border-[#eaded8] bg-[#fbf7f5] opacity-65"
      }`}
    >
      <span
        className={`text-[10px] font-extrabold leading-tight ${
          selected ? "text-[#17633b]" : isAvailable ? "text-[#08752f]" : "text-[#9a4e2c]"
        }`}
      >
        {selected ? (
          <span className="flex items-center gap-1">
            <MiniCheckIcon /> Added
          </span>
        ) : isAvailable ? (
          `${vehicleCount} spot${vehicleCount !== 1 ? "s" : ""}`
        ) : (
          statusLabel
        )}
      </span>
      <span
        className={`mt-auto text-[9px] font-bold ${
          selected ? "text-[#2e7251]" : isAvailable ? "text-[#218552]" : "text-[#c0a090]"
        }`}
      >
        {selected ? "Tap to remove" : isAvailable ? "Select →" : "Unavailable"}
      </span>
    </button>
  );
}

function availabilityLabel(status: AvailabilitySnapshot["status"] | undefined, shortfall: boolean) {
  if (shortfall) return "Few spots";
  if (status === "waitlist") return "Waitlist";
  if (status === "gate-closed") return "Gate closed";
  if (status === "window-closed") return "Not open yet";
  if (status === "NA") return "Not listed";
  return "Sold out";
}

function formatDay(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
}

function formatMonthShort(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { month: "short" });
}

function ZoneMonogram({ name }: { name: string }) {
  return (
    <span aria-hidden="true" className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(145deg,#d9f0e1,#f3faf5)] text-lg font-black text-[#17633b] shadow-[inset_0_0_0_1px_rgba(46,114,81,0.08)]">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function SmallSunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function SmallMoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniCheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
