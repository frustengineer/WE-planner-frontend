const STEPS = [
  { n: 1, label: "Trip Basics" },
  { n: 2, label: "Safari" },
  { n: 3, label: "Resort" },
  { n: 4, label: "Review" },
];

export function StepIndicator({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="mx-auto flex w-full max-w-[340px] items-start justify-center py-3 sm:max-w-[380px] sm:py-4">
      {STEPS.map((step, i) => (
        <li key={step.n} className={`flex min-w-0 items-start ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
          <div className="flex w-[44px] shrink-0 flex-col items-center gap-1.5 sm:w-[68px]">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition ${
                step.n < current
                  ? "bg-[#1f6b48] text-white shadow-[0_4px_12px_rgba(31,107,72,0.2)]"
                  : step.n === current
                    ? "bg-[#fdcb08] text-[#17201c] ring-4 ring-[#fff4bd] shadow-[0_4px_12px_rgba(253,203,8,0.24)]"
                    : "bg-[#eef1ef] text-[#89938d]"
              }`}
              aria-current={step.n === current ? "step" : undefined}
            >
              {step.n < current ? (
                <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m4.5 10 3.4 3.4 7.6-7.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : step.n}
            </span>
            <span
              className={`whitespace-nowrap text-center text-[9px] font-bold leading-tight sm:text-[10px] ${
                step.n === current ? "text-[#17201c]" : step.n < current ? "text-[#37604b]" : "text-[#87918b]"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-1 mt-[15px] h-0.5 min-w-2 flex-1 rounded-full sm:mx-2 ${
                step.n < current ? "bg-[#1f6b48]" : "bg-[#dfe4e1]"
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}
