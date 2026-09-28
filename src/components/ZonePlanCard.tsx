import { PRICING } from "@/lib/mockData";
import type { RecommendedSafari } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

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

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={`first:ml-5 last:mr-5 w-[79vw] max-w-[292px] shrink-0 snap-start scroll-ml-5 overflow-hidden rounded-[22px] border text-left transition active:scale-[0.98] sm:first:ml-0 sm:last:mr-0 sm:w-auto sm:max-w-none ${
        isSelected
          ? "border-[#2e7251] bg-[#eef8f1] shadow-[0_12px_28px_rgba(46,114,81,0.18)]"
          : "border-[#b1dfbd] bg-[#effaf2] shadow-[0_8px_22px_rgba(33,133,82,0.09)] hover:-translate-y-0.5 hover:border-[#218552]"
      }`}
    >
      <span className={`flex items-start justify-between gap-3 border-b px-4 py-3 ${isSelected ? "border-[#245e41] bg-[#2e7251] text-white" : "border-[#b6dfc0] bg-[#baf0c8] text-[#143c27]"}`}>
        <span className="min-w-0">
          <span className="block truncate text-base font-extrabold">{safari.zone.name}</span>
          <span className={`mt-0.5 block text-[9px] font-bold uppercase tracking-[0.13em] ${isSelected ? "text-white/50" : "text-[#3b7651]"}`}>
            {safari.zone.type} permit · #{safari.safariNumber}
          </span>
        </span>
        <span className="shrink-0 text-base font-extrabold">₹{permitPrice.toLocaleString("en-IN")}</span>
      </span>

      <span className="block px-4 py-4">
        <span className={`flex items-center gap-2 text-[15px] font-extrabold ${isSelected ? "text-[#17633b]" : "text-[#08752f]"}`}>
          {isSelected ? <CheckIcon /> : <BulbIcon />}
          {isSelected ? "Added to your plan" : "Recommended permit"}
        </span>
        <span className={`mt-2 block text-xs font-semibold ${isSelected ? "text-[#20382c]" : "text-[#273c32]"}`}>
          {formatDate(safari.date)} · {safari.session === "morning" ? "Morning" : "Afternoon"}
        </span>
        <span className={`mt-1.5 block text-[11px] leading-4 ${isSelected ? "text-[#587065]" : "text-[#627269]"}`}>
          {safari.reason}
        </span>
        <span className={`mt-3 flex items-center justify-between border-t pt-3 text-[10px] font-bold ${isSelected ? "border-[#c5dfcd] text-[#24583d]" : "border-[#cce7d3] text-[#274437]"}`}>
          <span>{safari.gypsiesRequired} {safari.gypsiesRequired === 1 ? "vehicle" : "vehicles"}</span>
          <span>{isSelected ? "Tap to remove" : "Add permit →"}</span>
        </span>
      </span>
    </button>
  );
}

function CheckIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function BulbIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 17h6M10 21h4M8.5 14.5a6 6 0 1 1 7 0c-.9.7-1.4 1.4-1.5 2.5h-4c-.1-1.1-.6-1.8-1.5-2.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
