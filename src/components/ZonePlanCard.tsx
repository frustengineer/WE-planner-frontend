import { PRICING } from "@/lib/mockData";
import type { RecommendedSafari } from "@/lib/types";

export function ZonePlanCard({
  safari,
  isSelected = false,
  onToggle,
}: {
  safari: RecommendedSafari;
  isSelected?: boolean;
  onToggle?: () => void;
}) {
  const permitPrice = PRICING.permitPerSafari * safari.gypsiesRequired;
  const isMorning = safari.session === "morning";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`group flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition active:scale-[0.99] ${
        isSelected
          ? "border-[#2e7251] bg-[#eef8f1] shadow-[0_6px_20px_rgba(46,114,81,0.15)]"
          : "border-[#e3ebe6] bg-white shadow-[0_3px_12px_rgba(30,54,45,0.07)] hover:border-[#2e7251] hover:shadow-[0_6px_20px_rgba(46,114,81,0.10)]"
      }`}
    >
      {/* Session icon pill */}
      <span
        className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl ${
          isMorning ? "bg-[#fff3d0]" : "bg-[#ede7f6]"
        }`}
      >
        {isMorning ? <SunIcon /> : <MoonIcon />}
        <span className={`mt-0.5 text-[7px] font-extrabold uppercase tracking-wide ${isMorning ? "text-[#7a5c0a]" : "text-[#4527a0]"}`}>
          {isMorning ? "AM" : "PM"}
        </span>
      </span>

      {/* Gate + type */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-[#18211d]">
          {safari.zone.gate} Gate
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span
            className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${
              safari.zone.type === "core"
                ? "bg-[#fce8d0] text-[#7c3503]"
                : "bg-[#dff2e8] text-[#1a5c38]"
            }`}
          >
            {safari.zone.type}
          </span>
          <span className="text-[10px] font-semibold text-[#8a958f]">
            {isMorning ? "Morning safari" : "Afternoon safari"}
          </span>
        </span>
      </span>

      {/* Price + action */}
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-sm font-extrabold text-[#18211d]">₹{permitPrice.toLocaleString("en-IN")}</span>
        <span
          className={`rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition ${
            isSelected
              ? "bg-[#2e7251] text-white"
              : "bg-[#1f6b48] text-white group-hover:bg-[#2e7251]"
          }`}
        >
          {isSelected ? "✓ Added" : "Add →"}
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#c08000]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[#5c35a0]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
