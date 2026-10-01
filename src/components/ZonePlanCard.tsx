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
      className={`group relative w-full overflow-hidden rounded-[18px] border text-left transition active:scale-[0.98] ${
        isSelected
          ? "border-[#2e7251] bg-[#eef8f1] shadow-[0_8px_20px_rgba(46,114,81,0.18)]"
          : "border-[#dfe8e3] bg-white shadow-[0_4px_14px_rgba(30,54,45,0.07)] hover:-translate-y-0.5 hover:border-[#218552]"
      }`}
    >
      {/* Session tag */}
      <span
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-extrabold leading-none ${
          isMorning
            ? isSelected
              ? "bg-[#fdf3c8] text-[#7a5c0a]"
              : "bg-[#fff8e1] text-[#7a5c0a]"
            : isSelected
              ? "bg-[#ede7f6] text-[#4527a0]"
              : "bg-[#ede7f6] text-[#4527a0]"
        }`}
      >
        {isMorning ? <SunIcon /> : <MoonIcon />}
        {isMorning ? "Morning" : "Evening"}
        {isSelected && (
          <span className="ml-auto text-[#2e7251]">
            <CheckIcon />
          </span>
        )}
      </span>

      {/* Body */}
      <span className="block px-2.5 pb-2.5 pt-2">
        <span className="block truncate text-sm font-extrabold leading-tight text-[#18211d]">
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
            ₹{permitPrice.toLocaleString("en-IN")}
          </span>
        </span>
        <span
          className={`mt-2.5 block w-full rounded-lg py-1.5 text-center text-[10px] font-extrabold transition ${
            isSelected
              ? "bg-[#2e7251] text-white"
              : "bg-[#18211d] text-white group-hover:bg-[#2e7251]"
          }`}
        >
          {isSelected ? "✓ Added" : "Add permit"}
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v2M12 19.5v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2.5 12h2M19.5 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.4 8.4 0 1 0 11.2 11.2Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
