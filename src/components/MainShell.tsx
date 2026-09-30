"use client";

import { usePathname } from "next/navigation";

// Pages whose content should start at the same offset below the header as the
// Step 1 heading. Home, Step 1 and the jungle pages manage their own top spacing.
const OFFSET_PREFIXES = ["/guides", "/confirmation"];

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const offset = OFFSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return <main className={`flex-1 ${offset ? "pt-8" : ""}`}>{children}</main>;
}
