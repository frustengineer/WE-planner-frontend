import Image from "next/image";
import Link from "next/link";
import { JungleCard } from "@/components/JungleCard";
import { HeroCarousel, type HeroSlide } from "@/components/HeroCarousel";
import { JUNGLES } from "@/lib/jungles";
import type { Jungle } from "@/lib/types";

// The homepage highlights a curated handful; Step 1 uses the full local list.
const POPULAR_JUNGLE_SLUGS = ["tadoba", "pench", "bandhavgarh"];

const FEATURED = [
  {
    eyebrow: "Tadoba · Private gypsy",
    title: "Morning safari — Kolara range",
    detail: "Sample vehicle availability · Expert-picked gates",
    price: "From ₹4,500",
  },
  {
    eyebrow: "Pench · Full vehicle",
    title: "Core & buffer safari plan",
    detail: "Morning and evening sessions · Sample data",
    price: "From ₹5,200",
  },
];

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "plan",
    cta: "Plan My Safari",
    ctaAlign: "center",
    href: "/book/step-1",
    image: "/hero/home-1.jpg",
    overlay: false,
    ctaBottom: 117,
  },
  {
    id: "stays",
    cta: "Browse Stays",
    ctaAlign: "center",
    href: "/book/step-3",
    image: "/hero/home-2.jpg",
    overlay: false,
    ctaBottom: 117,
  },
  {
    id: "guides",
    title: "Not sure which zone to pick? Ask Maya",
    cta: "Book Now",
    ctaAlign: "center",
    href: "/book/step-1",
    image: JUNGLES.find((j) => j.slug === "bandhavgarh")?.image ?? "/logo.webp",
  },
];

type IconName =
  | "jeep"
  | "tent"
  | "car"
  | "binoculars"
  | "camera"
  | "people"
  | "radar"
  | "spark"
  | "family"
  | "permit"
  | "briefcase"
  | "gift"
  | "paw"
  | "group"
  | "partner"
  | "photo"
  | "work"
  | "owl"
  | "hotel"
  | "resort";

type TileItem = {
  title: string;
  subtitle: string;
  highlight?: string;
  icon: IconName;
  image?: string;
  imageClass?: string;
  href: string;
  badge?: string;
  size: "tall" | "short";
  tint: string;
};

// Left column: two tall tiles. Right column: three short tiles.
const TILES_LEFT: TileItem[] = [
  { title: "Jungle Safari", subtitle: "Buffer & core", highlight: "20+ parks", icon: "paw", image: "/tiles/junglesafari.png", imageClass: "bottom-1 right-1 h-[110px] w-[110px]", href: "/book/step-1", size: "tall", tint: "#fdeeb8" },
  { title: "Resorts", subtitle: "Stays near your gate", highlight: "Flat 20% Off", icon: "resort", image: "/tiles/resort.png", imageClass: "-bottom-3 -right-9 h-[140px] w-[140px]", href: "/book/step-3", size: "tall", tint: "#d9ecdf" },
];

const TILES_RIGHT: TileItem[] = [
  { title: "Gypsy", subtitle: "Private 6-seater", icon: "jeep", image: "/tiles/gypsy.png", href: "/book/step-2", size: "short", tint: "#fdeeb8" },
  { title: "Naturalist", subtitle: "Expert-led drives", icon: "binoculars", image: "/tiles/naturalist.png", href: "/guides/jungle-safari-in-india", size: "short", tint: "#e3ecf7" },
  { title: "Cabs", subtitle: "Airport pickup", highlight: "10% Off", icon: "car", image: "/tiles/taxi.png", imageClass: "bottom-2 right-1.5 h-auto w-[100px]", href: "/book/step-1", size: "short", tint: "#e3ecf7", badge: "New" },
];

type QuickLinkItem = {
  label: string;
  icon: IconName;
  href: string;
  badge?: string;
  from: string;
  to: string;
  color: string;
};

const QUICK_LINKS: QuickLinkItem[] = [
  { label: "Family Safari", icon: "group", href: "/book/step-1", from: "#ffe9c7", to: "#fff7e8", color: "#b8620a" },
  { label: "Couple Safari", icon: "partner", href: "/book/step-1", badge: "New", from: "#fbdcdc", to: "#fff3f3", color: "#c0392b" },
  { label: "Photography Safari", icon: "photo", href: "/book/step-1", from: "#dcefe2", to: "#f2faf5", color: "#1f7a45" },
  { label: "Corporate Safari", icon: "work", href: "/book/step-1", from: "#efe1f6", to: "#faf4fd", color: "#7b3fa0" },
  { label: "Gift a Safari", icon: "gift", href: "/book/step-1", badge: "New", from: "#fde3d3", to: "#fff4ec", color: "#c2521a" },
  { label: "Birding Safari", icon: "owl", href: "/book/step-1", from: "#dfe9f8", to: "#f4f8fe", color: "#2f5fa7" },
  { label: "Luxury Safari", icon: "hotel", href: "/book/step-1", from: "#f6ecc4", to: "#fdf9e6", color: "#8a6d00" },
];

type MobilePark = {
  slug: string;
  name: string;
  href: string;
  image: string;
  state?: string;
  tagline?: string;
};

type MobileParkSource =
  | { slug: string; href?: string }
  | MobilePark;

const MOBILE_PARK_SOURCES: MobileParkSource[] = [
  { slug: "tadoba" },
  { slug: "pench" },
  { slug: "kanha", href: "https://wildexcursions.in/tours/kanha/" },
  { slug: "bandhavgarh" },
  {
    slug: "ranthambore",
    state: "Rajasthan",
    tagline: "Tigers roaming ancient fort ruins",
    name: "Ranthambore",
    href: "https://wildexcursions.in/tours/ranthambore/",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  { slug: "panna", href: "https://wildexcursions.in/tours/panna/" },
  { slug: "satpura", href: "https://wildexcursions.in/tours/satpura/" },
  {
    slug: "jim-corbett",
    state: "Uttarakhand",
    tagline: "India's first national park, in the Himalayan foothills",
    name: "Jim Corbett",
    href: "https://wildexcursions.in/tours/jim-corbett/",
    image: "https://images.pexels.com/photos/133394/pexels-photo-133394.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    slug: "gir",
    state: "Gujarat",
    tagline: "The last home of the Asiatic lion",
    name: "Gir",
    href: "https://wildexcursions.in/tours/gir/",
    image: "https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    slug: "kaziranga",
    state: "Assam",
    tagline: "One-horned rhinos across misty grasslands",
    name: "Kaziranga",
    href: "https://wildexcursions.in/tours/kaziranga/",
    image: "https://images.pexels.com/photos/677974/pexels-photo-677974.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  { slug: "tipeshwar", href: "https://wildexcursions.in/tours/tipeshwar/" },
  { slug: "nagzira", href: "https://wildexcursions.in/tours/nagzira/" },
  { slug: "umred-karhandla", href: "https://wildexcursions.in/tours/umred-karhandla/" },
];

function getMobileParks(jungles: Jungle[]): MobilePark[] {
  return MOBILE_PARK_SOURCES.flatMap((source) => {
    if ("name" in source) return [source];

    const jungle = jungles.find((item) => item.slug === source.slug);
    if (!jungle) return [];

    return [
      {
        slug: jungle.slug,
        name: jungle.name,
        image: jungle.image,
        state: jungle.state,
        tagline: jungle.tagline,
        href: source.href ?? `/jungles/${jungle.slug}`,
      },
    ];
  });
}

export default function Home() {
  const jungles = JUNGLES;
  const popularJungles = POPULAR_JUNGLE_SLUGS.map((slug) =>
    jungles.find((jungle) => jungle.slug === slug)
  ).filter((jungle): jungle is Jungle => jungle !== undefined);
  const mobileParks = getMobileParks(jungles);

  return (
    <>
      <div className="sm:hidden">
        <MobileHome parks={mobileParks} />
      </div>
      <div className="hidden sm:block">
        <DesktopHome popularJungles={popularJungles} />
      </div>
    </>
  );
}

function DesktopHome({ popularJungles }: { popularJungles: Jungle[] }) {
  return (
    <div>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
          <div className="max-w-xl">
            <p className="section-kicker">Thoughtful jungle travel</p>
            <h1 className="font-display mt-4 text-4xl font-bold leading-[1.04] text-brand-dark sm:text-6xl">
              Book your jungle safari in 3 easy steps
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-muted sm:text-base">
              Tell us where and when. Explore sample vehicle slots and build a safari plan you can review in this frontend demo.
            </p>
            <Link
              href="/book/step-1"
              className="mt-7 inline-flex items-center gap-3 rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-black shadow-[0_8px_22px_rgba(253,203,8,0.26)] transition hover:-translate-y-0.5 hover:bg-[#a97e00]"
            >
              Plan My Safari <span aria-hidden="true">→</span>
            </Link>
            <div className="mt-8 grid max-w-lg grid-cols-3 rounded-xl border border-border bg-white/70 p-4">
              <JourneyStep number="1" label="Trip Basics" active />
              <JourneyStep number="2" label="Build Safari" />
              <JourneyStep number="3" label="Review Plan" />
            </div>
          </div>

          <div className="forest-pattern relative min-h-[330px] overflow-hidden rounded-[24px] shadow-[0_22px_55px_rgba(0,0,0,0.22)] sm:min-h-[420px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,.82)_100%)]" />
            <Image
              src="/logo.webp"
              alt="Wild Excursions safari emblem"
              width={340}
              height={340}
              priority
              className="absolute right-[-35px] top-[-28px] h-[300px] w-[300px] rounded-full object-cover opacity-25 mix-blend-screen sm:h-[390px] sm:w-[390px]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/70">Wild Excursions</p>
              <p className="font-display mt-2 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">
                The right gate. The right session. One considered plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">Start exploring</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-brand-dark">Popular national parks</h2>
          </div>
          <p className="max-w-md text-sm text-muted">Choose a jungle to explore its ranges, zones and sample safari planning options.</p>
        </div>
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularJungles.map((jungle) => (
            <JungleCard key={jungle.slug} jungle={jungle} />
          ))}
        </div>
        <div className="mt-7">
          <InfoArticle />
        </div>
      </section>

      <section className="border-y border-border bg-white py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-3 sm:px-6">
          <Feature icon="✓" title="Sample gypsy availability" body="Explore illustrative vehicle counts in the planner demo." />
          <Feature icon="◇" title="Ranked by real experience" body="Zone order combines seasonal knowledge with current demand." />
          <Feature icon="◌" title="Browser-only demo" body="Your sample plan stays in this browser session." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="section-kicker">Easy starting points</p>
        <h2 className="font-display mt-2 text-3xl font-bold text-brand-dark">Featured safari plans</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {FEATURED.map((item, index) => (
            <article key={item.title} className="soft-card group grid overflow-hidden sm:grid-cols-[180px_1fr]">
              <div className={`min-h-44 ${index === 0 ? "forest-pattern" : "bg-[linear-gradient(145deg,#3a3a3a,#050505)]"}`}>
                <div className="flex h-full items-end p-4 text-xs font-semibold uppercase tracking-wider text-white/80">Recommended</div>
              </div>
              <div className="flex flex-col p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">{item.eyebrow}</p>
                <h3 className="font-display mt-2 text-xl font-bold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{item.detail}</p>
                <div className="mt-auto flex items-end justify-between pt-5">
                  <span className="text-sm font-semibold">{item.price}</span>
                  <Link href="/book/step-1" className="text-sm font-semibold text-brand group-hover:underline">Explore →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


function MobileHome({ parks }: { parks: MobilePark[] }) {
  return (
    <div className="overflow-x-hidden bg-white">
      <HeroCarousel slides={HERO_SLIDES} />

      {/* Spacer lets the fixed carousel show through; this sheet scrolls over it. */}
      <div
        className="relative z-10 mt-[300px] bg-white pb-2 shadow-[0_-12px_30px_rgba(0,0,0,0.12)]"
        style={{ borderRadius: "50% 50% 0 0 / 34px 34px 0 0" }}
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[#e3e3e3] pt-1.5" />

        <section className="px-5 pt-9">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-3">
              {TILES_LEFT.map((item) => (
                <ServiceTile key={item.title} item={item} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {TILES_RIGHT.map((item) => (
                <ServiceTile key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 px-5">
          <WideCard
            title="Live Slot Tracker"
            body="Watch buffer & core availability update"
            icon="radar"
            href="/book/step-2"
          />
          <WideCard
            title="Ask Maya"
            body="Your AI guide to zones & sessions"
            badge="New"
            icon="spark"
            href="/book/step-1"
          />
        </section>

        <section className="mt-6">
          <h2 className="font-display px-5 text-[22px] font-bold leading-tight text-black">Popular National Parks</h2>
          <div className="mt-3 flex snap-x scroll-pl-5 gap-3 overflow-x-auto px-5 pb-2">
            {parks.map((park) => (
              <Link
                key={park.name}
                href={park.href}
                target={park.href.startsWith("http") ? "_blank" : undefined}
                rel={park.href.startsWith("http") ? "noreferrer" : undefined}
                className="w-[132px] shrink-0 snap-start"
              >
                <div
                  className="h-24 rounded-[14px] bg-black bg-cover bg-center shadow-sm"
                  style={{ backgroundImage: `linear-gradient(180deg,transparent 55%,rgba(0,0,0,.2)),url('${park.image}')` }}
                />
                <p className="mt-2 text-xs font-semibold text-black">{park.name}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 px-5">
            <InfoArticle />
          </div>
        </section>

        <section className="mt-6">
          <h2 className="font-display px-5 text-base font-bold text-black">Quick Links</h2>
          <div className="no-scrollbar mt-2 flex gap-3 overflow-x-auto px-5 pb-3">
            {QUICK_LINKS.map((item) => (
              <QuickLink key={item.label} {...item} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center gap-3 px-5">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c9c9d6]" />
            <SparkleMark />
            <h2 className="font-display text-[26px] font-bold leading-none text-black">In Spotlight</h2>
            <SparkleMark />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c9c9d6]" />
          </div>
          <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-[9%] px-[9%] pb-4">
            {parks.map((park) => (
              <SpotlightCard key={park.slug} park={park} />
            ))}
          </div>
        </section>

        <section className="mt-5 border-y border-[#ececec] bg-white px-3 py-5">
          <div className="grid grid-cols-3">
            <MobileTrust icon="shield" label="Sample Safari Slots" />
            <MobileTrust icon="clock" label="Example Prices" />
            <MobileTrust icon="chat" label="Browser Demo" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SparkleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#2a2f45]" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" />
    </svg>
  );
}

function SpotlightCard({ park }: { park: MobilePark }) {
  const external = park.href.startsWith("http");
  return (
    <Link
      href={park.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="relative block h-[380px] w-[82%] shrink-0 snap-center overflow-hidden rounded-[28px] bg-black shadow-[0_14px_30px_rgba(0,0,0,.18)] transition active:scale-[.99]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={park.image} alt={park.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_38%,rgba(10,12,28,.88)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-center text-white">
        <h3 className="font-display text-[32px] font-bold leading-none">{park.name}</h3>
        {park.state && <p className="mt-2 text-xs font-semibold tracking-wide text-white/90">{park.state}</p>}
        {park.tagline && <p className="mx-auto mt-2 max-w-[260px] text-[13px] leading-snug text-white/80">{park.tagline}</p>}
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
          Plan safari <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

function HomeIcon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none" as const, className, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "jeep":
      return (
        <svg {...common}><path stroke="currentColor" d="M3 16h18M4 16V9.5l2.4-4h7.6l3 4H20a1 1 0 0 1 1 1V16" /><circle cx="7.5" cy="17.5" r="1.6" stroke="currentColor" /><circle cx="16.5" cy="17.5" r="1.6" stroke="currentColor" /><path stroke="currentColor" d="M8 5.5v4M4 9.5h16" /></svg>
      );
    case "tent":
      return (
        <svg {...common}><path stroke="currentColor" d="M4 19 12 5l8 14H4Z" /><path stroke="currentColor" d="M9 19 12 12l3 7M2 19h20" /></svg>
      );
    case "car":
      return (
        <svg {...common}><path stroke="currentColor" d="M4 16.5V12l2-4.5h12l2 4.5v4.5" /><path stroke="currentColor" d="M4 16.5h16M6 12h12" /><circle cx="7.5" cy="17.5" r="1.6" stroke="currentColor" /><circle cx="16.5" cy="17.5" r="1.6" stroke="currentColor" /></svg>
      );
    case "binoculars":
      return (
        <svg {...common}><path stroke="currentColor" d="M9 10V6h2v4M13 10V6h2v4" /><rect x="4.5" y="10" width="5" height="7" rx="2.5" stroke="currentColor" /><rect x="14.5" y="10" width="5" height="7" rx="2.5" stroke="currentColor" /><path stroke="currentColor" d="M9.5 12.5h5" /></svg>
      );
    case "camera":
      return (
        <svg {...common}><path stroke="currentColor" d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" /></svg>
      );
    case "people":
      return (
        <svg {...common}><circle cx="9" cy="8" r="2.6" stroke="currentColor" /><path stroke="currentColor" d="M3.5 19c.5-3 2.6-4.6 5.5-4.6S14 16 14.5 19" /><circle cx="16.5" cy="9" r="2.1" stroke="currentColor" /><path stroke="currentColor" d="M15 14.7c2.4.2 4 1.7 4.4 4.3" /></svg>
      );
    case "radar":
      return (
        <svg {...common}><circle cx="12" cy="12" r="8" stroke="currentColor" /><circle cx="12" cy="12" r="4.2" stroke="currentColor" /><path stroke="currentColor" d="M12 12 17 7" /></svg>
      );
    case "spark":
      return (
        <svg {...common}><path stroke="currentColor" d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>
      );
    case "family":
      return (
        <svg {...common}><circle cx="8" cy="7.5" r="2.2" stroke="currentColor" /><circle cx="16" cy="7.5" r="2.2" stroke="currentColor" /><path stroke="currentColor" d="M3 19c.4-3 2.3-4.5 5-4.5s4.6 1.5 5 4.5M13 19c.3-2.4 1.8-3.7 4-3.7s3.7 1.3 4 3.7" /><circle cx="11.6" cy="12.8" r="1.6" stroke="currentColor" /></svg>
      );
    case "permit":
      return (
        <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" /><path stroke="currentColor" d="M8 9h8M8 12.5h8M8 16h5" /></svg>
      );
    case "briefcase":
      return (
        <svg {...common}><rect x="3.5" y="8" width="17" height="11" rx="2" stroke="currentColor" /><path stroke="currentColor" d="M8.5 8V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v2M3.5 12.5h17" /></svg>
      );
    case "group":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM247-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm466 0q-47 47-113 47-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113q0 66-47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm296.5-343.5Q440-607 440-640t-23.5-56.5Q393-720 360-720t-56.5 23.5Q280-673 280-640t23.5 56.5Q327-560 360-560t56.5-23.5ZM360-240Zm0-400Z" /></svg>
      );
    case "owl":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="M480-80q-134 0-227-93t-93-227v-200q0-122 96-201t224-79q128 0 224 79t96 201v520H480Zm0-80h80q-19-25-29.5-55.5T520-280v-42q-10 1-20 1.5t-20 .5q-67 0-129.5-23.5T240-415v15q0 100 70 170t170 70Zm120-120q0 50 35 85t85 35v-255q-26 26-56 44.5T600-340v60ZM440-560q0-66-45-111t-109-48q-22 24-34 54t-12 65q0 89 72.5 144.5T480-400q95 0 167.5-55.5T720-600q0-35-12-65.5T674-720q-64 2-109 48t-45 112h-80Zm-128.5-11.5Q300-583 300-600t11.5-28.5Q323-640 340-640t28.5 11.5Q380-617 380-600t-11.5 28.5Q357-560 340-560t-28.5-11.5Zm280 0Q580-583 580-600t11.5-28.5Q603-640 620-640t28.5 11.5Q660-617 660-600t-11.5 28.5Q637-560 620-560t-28.5-11.5ZM370-778q34 14 62 37t48 52q20-29 47.5-52t61.5-37q-25-11-52.5-16.5T480-800q-29 0-56.5 5.5T370-778Zm430 618H520h280Zm-320 0q-100 0-170-70t-70-170q0 100 70 170t170 70h80-80Zm120-120q0 50 35 85t85 35q-50 0-85-35t-35-85ZM480-689Z" /></svg>
      );
    case "partner":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="M40-120v-160q0-34 23.5-57t56.5-23h131q20 0 38 10t29 27q29 39 71.5 61t90.5 22q49 0 91.5-22t70.5-61q13-17 30.5-27t36.5-10h131q34 0 57 23t23 57v160H640v-91q-35 25-75.5 38T480-160q-43 0-84-13.5T320-212v92H40Zm120-280q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T280-520q0 50-34.5 85T160-400Zm640 0q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T920-520q0 50-34.5 85T800-400Zm-320-80q-68-62-111-104.5T302-658q-24-31-33-54.5t-9-47.5q0-50 35-85t86-35q28 0 54 12.5t45 33.5q19-21 45-33.5t54-12.5q51 0 86 35t35 85q0 24-9 47.5T658-658q-24 31-67 73.5T480-480Zm0-108q72-66 106-107.5t34-64.5q0-17-12-28.5T579-800q-12 0-23.5 7T532-772l-51 59-51-57q-14-16-25.5-23t-23.5-7q-17 0-29 11.5T340-760q0 23 34 64.5T480-588Zm0 0Z" /></svg>
      );
    case "photo":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="M480-260q75 0 127.5-52.5T660-440q0-75-52.5-127.5T480-620q-75 0-127.5 52.5T300-440q0 75 52.5 127.5T480-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM160-120q-33 0-56.5-23.5T80-200v-480q0-33 23.5-56.5T160-760h126l74-80h240l74 80h126q33 0 56.5 23.5T880-680v480q0 33-23.5 56.5T800-120H160Zm0-80h640v-480H638l-73-80H395l-73 80H160v480Zm320-240Z" /></svg>
      );
    case "work":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z" /></svg>
      );
    case "hotel":
      return (
        <svg viewBox="0 -960 960 960" fill="currentColor" className={className}><path d="m668-380 152-130 120 10-176 153 52 227-102-62-46-198Zm-94-292-42-98 46-110 92 217-96-9ZM294-287l126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM173-120l65-281L20-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-340Z" /></svg>
      );
    case "paw":
      return (
        <svg {...common}><ellipse cx="12" cy="16" rx="4.5" ry="3.5" stroke="currentColor" /><circle cx="6" cy="11" r="1.8" stroke="currentColor" /><circle cx="10" cy="6.8" r="1.8" stroke="currentColor" /><circle cx="14" cy="6.8" r="1.8" stroke="currentColor" /><circle cx="18" cy="11" r="1.8" stroke="currentColor" /></svg>
      );
    case "resort":
      return (
        <svg {...common}><path stroke="currentColor" d="M5 20V8l7-4 7 4v12M3 20h18M9 20v-4h6v4M9 10h2M13 10h2M9 13h2M13 13h2" /></svg>
      );
    case "gift":
      return (
        <svg {...common}><rect x="4" y="9.5" width="16" height="10" rx="1.5" stroke="currentColor" /><path stroke="currentColor" d="M4 13h16M12 9.5V20" /><path stroke="currentColor" d="M12 9.5c-1-2.6-2.6-4-4.3-4A2 2 0 0 0 6 7.5c0 1.4 1.4 2 3 2h3ZM12 9.5c1-2.6 2.6-4 4.3-4A2 2 0 0 1 18 7.5c0 1.4-1.4 2-3 2h-3Z" /></svg>
      );
  }
}

function ServiceTile({ item }: { item: TileItem }) {
  const tall = item.size === "tall";
  return (
    <Link
      href={item.href}
      className={`relative block overflow-hidden rounded-[18px] border border-[#ececec] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,.05)] transition active:scale-[.98] ${
        tall ? "h-[192px]" : "h-[124px]"
      }`}
    >
      {/* Tinted glow + oversized icon clipped by the card edge, like the reference art */}
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          width: tall ? 170 : 110,
          height: tall ? 170 : 110,
          right: tall ? -50 : -28,
          bottom: tall ? -40 : -30,
          background: `radial-gradient(circle at 40% 40%, ${item.tint}, transparent 70%)`,
        }}
      />
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt=""
          aria-hidden="true"
          className={`pointer-events-none absolute max-w-none object-contain ${
            item.imageClass ??
            (tall ? "-bottom-[30px] -right-[38px] h-[190px] w-[190px]" : "-bottom-[30px] -right-[30px] h-[130px] w-[130px]")
          }`}
        />
      ) : (
        <HomeIcon
          name={item.icon}
          className={`absolute text-brand-dark/80 ${tall ? "-bottom-2 -right-3 h-28 w-28" : "-bottom-1 -right-2 h-16 w-16"}`}
        />
      )}
      {item.badge && (
        <span className="absolute right-3 top-3 rounded-full bg-[#dff3e6] px-2 py-0.5 text-[9px] font-bold text-success">
          {item.badge}
        </span>
      )}
      <h3 className="font-display relative text-[19px] font-bold leading-tight text-black">{item.title}</h3>
      <p className="relative mt-1 text-[11px] leading-snug text-[#555]">{item.subtitle}</p>
      {item.highlight && (
        <p className="relative mt-0.5 text-[12px] font-bold leading-snug text-success">{item.highlight}</p>
      )}
    </Link>
  );
}

function WideCard({
  title,
  body,
  badge,
  icon,
  href,
}: {
  title: string;
  body: string;
  badge?: string;
  icon: IconName;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col justify-between overflow-hidden rounded-[18px] border border-[#ececec] bg-[#f7f7f7] p-4 transition active:scale-[.98]"
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent">
          {badge}
        </span>
      )}
      <div>
        <h3 className="text-sm font-bold leading-tight text-black">{title}</h3>
        <p className="mt-1 text-[11px] leading-snug text-[#666]">{body}</p>
      </div>
      <span className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-dark shadow-sm">
        <HomeIcon name={icon} className="h-5 w-5" />
      </span>
    </Link>
  );
}

function QuickLink({ label, icon, href, badge, from, to, color }: QuickLinkItem) {
  return (
    <Link
      href={href}
      className="group relative mt-2 flex h-[104px] w-[88px] shrink-0 flex-col items-center justify-between rounded-[20px] px-2 pb-3 pt-3.5 text-center shadow-[0_3px_10px_rgba(0,0,0,.06)] transition active:scale-95"
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[20px]">
        <span
          className="absolute -right-5 -top-5 block h-16 w-16 rounded-full opacity-40"
          style={{ background: `radial-gradient(circle, ${from}, transparent 70%)`, filter: "saturate(1.6)" }}
        />
      </span>
      <span
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.1)]"
        style={{ color }}
      >
        <HomeIcon name={icon} className="h-6 w-6" />
      </span>
      <span className="relative text-[11px] font-semibold leading-[1.25] text-[#2a2a2a]">{label}</span>
      {badge && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-accent px-2 py-[3px] text-[8px] font-bold uppercase leading-none tracking-wider text-black shadow-sm">
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileTrust({ icon, label }: { icon: "shield" | "clock" | "chat"; label: string }) {
  return (
    <div className="flex flex-col items-center justify-start px-2 py-1 text-center text-black">
      {icon === "shield" && <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"><path d="M12 3 5.5 5.6v5.7c0 4.2 2.5 7.7 6.5 9.7 4-2 6.5-5.5 6.5-9.7V5.6L12 3Z" stroke="currentColor" strokeWidth="1.8" /><path d="m9.4 11.8 1.7 1.7 3.7-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      {icon === "clock" && <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}
      {icon === "chat" && <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7"><path d="M5 5.5h14v10H9l-4 3v-13Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>}
      <span className="mt-2 max-w-[82px] text-[11px] font-medium leading-[1.4] text-[#555555]">{label}</span>
    </div>
  );
}

function JourneyStep({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ${active ? "bg-[#fdcb08] text-black" : "bg-[#e3e3e3] text-[#555555]"
          }`}
      >
        {number}
      </span>
      <span className="text-[10px] font-medium leading-tight text-[#555555]">{label}</span>
    </div>
  );
}

function InfoArticle() {
  return (
    <article className="rounded-2xl bg-[#f4f3f1] p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold text-black sm:text-xl">Jungle Safari in India</h3>
      <p className="mt-2 line-clamp-5 text-sm leading-6 text-[#6b5b4a]">
        India is home to some of the finest jungle safaris in the world. Its
        national parks and tiger reserves span dense sal and teak forests,
        open grasslands and winding riverbeds, each with its own rhythm of
        wildlife — tigers, leopards, sloth bears, elephants and hundreds of
        bird species. A typical safari runs in an open-top gypsy across two
        sessions a day, morning and evening, when animals are most active
        near waterholes and forest trails. Every reserve is managed by the
        state forest department, with its own permits, gate timings and
        vehicle limits, which is why planning ahead with someone who knows
        the zones well makes all the difference between a rushed drive and a
        considered, well-timed plan.
      </p>
      <div className="mt-3 text-right">
        <Link href="/guides/jungle-safari-in-india" className="text-sm font-semibold text-[#2f6b76] hover:underline">
          Read More
        </Link>
      </div>
    </article>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-brand">{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
      </div>
    </div>
  );
}
