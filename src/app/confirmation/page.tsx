"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
type StoredDemoPlan = {
  range: string | null;
  safariCount: number;
  nights: number;
  gypsiesRequired: number;
  total: number;
  demoId: string;
};

function ConfirmationContent() {
  const params = useSearchParams();
  const id = params.get("id");
  // sessionStorage doesn't exist during server rendering, so this must
  // start null on every render (server and first client pass alike) and
  // only get filled in after mount — reading it eagerly here would make
  // the server-rendered and hydrated HTML disagree on whether the
  // reference card exists at all, not just its text.
  const [data, setData] = useState<StoredDemoPlan | null>(null);
  useEffect(() => {
    if (!id) return;
    const raw = sessionStorage.getItem(`demo-plan:${id}`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount-only client read, not a derived-state effect
    if (raw) setData(JSON.parse(raw));
  }, [id]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-3xl text-white">
        ✓
      </div>
      <p className="section-kicker mt-6">Frontend demo</p>
      <h1 className="font-display mt-2 text-3xl font-bold text-brand-dark">Demo plan complete</h1>
      <p className="mt-2 text-muted">
        This plan was created in your browser only. No enquiry was sent and no booking was made.
      </p>

      {data && (
        <div className="booking-card mt-8 p-6 text-left">
          <p className="text-sm text-muted">Reference</p>
          <p className="font-mono text-sm font-semibold">{data.demoId}</p>
          <div className="my-4 h-px bg-border" />
          <p className="text-sm">
            {data.range} · {data.safariCount} safaris ·{" "}
            {data.nights} night{data.nights === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {data.gypsiesRequired}{" "}
            {data.gypsiesRequired === 1 ? "gypsy" : "gypsies"} per safari
          </p>
          <p className="mt-1 text-lg font-semibold text-brand">
            ₹{data.total.toLocaleString("en-IN")} <span className="text-sm font-normal text-muted">(quote)</span>
          </p>
        </div>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(253,203,8,0.24)] transition hover:bg-[#a97e00]"
      >
        Back to home
      </Link>
    </div>
  );
}

export default function Confirmation() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  );
}
