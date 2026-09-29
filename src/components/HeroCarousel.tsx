"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  id: string;
  title?: string;
  cta: string;
  ctaAlign?: "center";
  href: string;
  image: string;
  overlay?: boolean;
  ctaBottom?: number;
};

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [ctaIndex, setCtaIndex] = useState(0);
  const [ctaVisible, setCtaVisible] = useState(true);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4800);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    setCtaVisible(false);
    const swap = setTimeout(() => setCtaIndex(index), 600);
    return () => clearTimeout(swap);
  }, [index]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setCtaVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [ctaIndex]);

  return (
    <div className="fixed inset-x-0 top-0 z-0 h-[430px] overflow-hidden bg-[#0b0b0b]">
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative min-w-full bg-cover bg-center px-5 pb-24 pt-24"
            style={{
              backgroundImage:
                slide.overlay === false
                  ? `url('${slide.image}')`
                  : `linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.35) 30%,rgba(0,0,0,.92) 100%),url('${slide.image}')`,
            }}
          >
            {slide.title && (
              <h1 className="font-display max-w-[280px] text-[27px] font-bold leading-[1.1] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.4)]">
                {slide.title}
              </h1>
            )}
            {slide.ctaAlign !== "center" && (
              <Link
                href={slide.href}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,.45)] transition active:scale-[.98]"
              >
                {slide.cta}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {slides[ctaIndex].ctaAlign === "center" && (
        <div
          className="pointer-events-none absolute inset-x-0 flex justify-center"
          style={{ bottom: slides[ctaIndex].ctaBottom ?? 144 }}
        >
          <Link
            href={slides[ctaIndex].href}
            className={`pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,.45)] transition-all duration-[700ms] ease-out active:scale-[.98] ${
              ctaVisible ? "translate-x-0 opacity-100 blur-none" : "-translate-x-24 opacity-0 blur-sm"
            }`}
          >
            {slides[ctaIndex].cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Show slide ${i + 1} of ${slides.length}`}
            onClick={() => setIndex(i)}
            className={`pointer-events-auto h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-accent" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
