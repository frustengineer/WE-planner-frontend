"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Message = { from: "you" | "maya"; text: string };

function TigerMark({ className }: { className?: string }) {
  return (
    <Image
      src="/bot_logo.png"
      alt=""
      width={40}
      height={40}
      className={className}
    />
  );
}

const TOPICS: { question: string; answer: string }[] = [
  {
    question: "What's the difference between Buffer and Core?",
    answer:
      "Core is the park's original protected area — often the strongest sighting odds, but permits are limited and fill up fast. Buffer is the surrounding forest — more permits available, easier to book, and still great sightings. You can mix both in one trip.",
  },
  {
    question: "What are a Range and a Zone?",
    answer:
      "A jungle (like Tadoba-Andhari) is split into Ranges (like Kolara) — each with its own entry gate. A Range is further split into Zones (like Belara) — one specific area your gypsy is assigned to for a session.",
  },
  {
    question: "How do morning and evening safaris work?",
    answer:
      "Every safari is a fixed session — morning (report before sunrise) or evening (report in the afternoon) — timed around when animals are most active. Each session rides in one gypsy, with one guide, for your group.",
  },
];

export function AskExpertWidget() {
  const pathname = usePathname();
  const isBookingFlow = pathname.startsWith("/book/");
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (isBookingFlow) {
      return;
    }
    const showAt = setTimeout(() => setShowGreeting(true), 2500);
    const hideAt = setTimeout(() => setShowGreeting(false), 9000);
    return () => {
      clearTimeout(showAt);
      clearTimeout(hideAt);
    };
  }, [isBookingFlow]);

  function ask(question: string, answer: string) {
    setMessages((m) => [...m, { from: "you", text: question }, { from: "maya", text: answer }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { from: "you", text },
      {
        from: "maya",
        text: "I'm still learning free-form questions — here's what I can walk you through for now:",
      },
    ]);
    setDraft("");
  }

  return (
    <>
      {/* Floating launcher */}
      {!isBookingFlow && (
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6">
        <Link
          href="/book/step-1"
          className="hidden items-center gap-1.5 rounded-full border border-accent bg-white px-3.5 py-2 text-xs font-semibold text-brand-dark shadow-[0_6px_18px_rgba(17,17,17,0.1)] transition hover:bg-accent-light sm:flex"
        >
          Talk to an expert
        </Link>

        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setShowGreeting(false);
          }}
          aria-label={open ? "Close safari assistant" : "Open safari assistant"}
          className={`glow-ring flex h-14 shrink-0 items-center overflow-hidden rounded-full border border-border bg-white text-brand-dark transition-[width,padding] duration-500 ease-out ${
            showGreeting && !open && !isBookingFlow ? "w-[272px] justify-start gap-3 pl-3 pr-6" : "w-14 justify-center pl-0 pr-0"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              showGreeting && !open && !isBookingFlow ? "bg-accent-light" : "bg-transparent"
            }`}
          >
            {open ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            ) : (
              <TigerMark className="h-6 w-6" />
            )}
          </span>
          <span
            className={`whitespace-nowrap text-sm font-semibold leading-none text-brand-dark text-left transition-opacity duration-300 ${
              showGreeting && !open && !isBookingFlow ? "opacity-100 delay-200" : "pointer-events-none w-0 opacity-0"
            }`}
          >
            New to jungle safari?
            <span className="mt-1 block text-[11px] font-medium text-muted">Ask Maya anything</span>
          </span>
        </button>
      </div>
      )}

      {/* Panel */}
      {open && !isBookingFlow && (
        <div className="fixed inset-x-4 bottom-24 top-auto z-50 mx-auto flex max-h-[70vh] w-auto max-w-sm flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-[0_24px_60px_rgba(17,17,17,0.25)] sm:bottom-24 sm:right-6 sm:left-auto sm:mx-0 sm:h-[520px] sm:max-h-[70vh] sm:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-muted">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            <span className="font-wordmark text-lg leading-none text-warning">
              Maya <sup className="font-sans text-[9px] font-bold uppercase tracking-wider text-muted">beta</sup>
            </span>
            <span className="w-5" aria-hidden="true" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <p className="text-2xl font-bold text-brand-dark">Hi, There</p>
            <p className="mt-1 text-sm text-muted">
              I&apos;m <span className="font-semibold text-brand-dark">Maya</span> — here to help you understand
              jungle safaris before you book.
            </p>

            <div className="mt-5 space-y-2.5">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 ${
                    m.from === "you"
                      ? "ml-auto rounded-br-sm bg-brand-dark text-white"
                      : "rounded-bl-sm border border-border bg-background text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted">You may try asking</p>
            <div className="space-y-2">
              {TOPICS.map((t) => (
                <button
                  type="button"
                  key={t.question}
                  onClick={() => ask(t.question, t.answer)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-3 text-left text-xs font-medium text-brand-dark transition hover:border-accent hover:bg-accent-light"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-light text-warning">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                      <path
                        d="M9.1 9a2.9 2.9 0 1 1 4.4 2.5c-.7.45-1.5 1.05-1.5 2.1M12 17.5v.01"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  {t.question}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#cfeedd] bg-[#f1fbf5] p-3.5">
              <p className="text-sm font-bold text-brand-dark">Need human support?</p>
              <p className="mt-0.5 text-xs leading-5 text-muted">Contact our Wild Excursions team — we&apos;re happy to help plan your safari.</p>
              <div className="mt-3 flex gap-2">
                <a
                  href="https://wa.me/?text=Hi%2C%20I%20need%20help%20planning%20my%20safari%20with%20Wild%20Excursions."
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#1fb857] active:scale-95"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12.04 2a9.84 9.84 0 0 0-8.42 14.94L2.05 22l5.19-1.36A9.84 9.84 0 1 0 12.04 2Zm0 17.97a8.15 8.15 0 0 1-4.15-1.14l-.3-.18-3.08.81.82-3-.2-.31a8.12 8.12 0 1 1 6.91 3.82Zm4.46-6.1c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.35-1.69-.14-.24-.01-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.15 1.52.09.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" /></svg>
                  WhatsApp us
                </a>
                <Link
                  href="/book/step-1"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center rounded-xl border border-[#bfe3cf] bg-white px-3 py-2.5 text-xs font-bold text-brand-dark transition active:scale-95"
                >
                  Contact team
                </Link>
              </div>
            </div>

            <Link
              href="/book/step-1"
              onClick={() => setOpen(false)}
              className="mt-4 block rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-brand-dark transition hover:brightness-95"
            >
              Talk to an expert instead →
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask me anything"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-dark text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
