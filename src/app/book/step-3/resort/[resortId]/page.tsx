"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "@/lib/booking-context";
import { RESORTS } from "@/lib/mockData";
import { RESORT_DETAILS, RESORT_TIER_LABEL } from "@/lib/resort-details";

const SAMPLE_REVIEWS = [
  { name: "Aditi S.", initials: "AS", rating: 5, date: "2 weeks ago", text: "The staff arranged an early breakfast before our morning safari. The room was clean, peaceful and very comfortable." },
  { name: "Rahul M.", initials: "RM", rating: 4, date: "1 month ago", text: "A convenient stay near the safari gate. Meals were fresh, service was warm and the evening bonfire was a nice touch." },
  { name: "Meera P.", initials: "MP", rating: 5, date: "2 months ago", text: "Great option for a wildlife trip. The team understood safari timings and made the entire stay feel effortless." },
];

const RANGE_LOCATIONS: Record<string, { address: string; query: string }> = {
  Kolara: { address: "Kolara Gate, Tadoba-Andhari Tiger Reserve, Maharashtra", query: "Kolara Gate Tadoba Maharashtra" },
  Moharli: { address: "Moharli Gate, Tadoba-Andhari Tiger Reserve, Maharashtra", query: "Moharli Gate Tadoba Maharashtra" },
  Navegaon: { address: "Navegaon Gate, Tadoba-Andhari Tiger Reserve, Maharashtra", query: "Navegaon Gate Tadoba Maharashtra" },
  "Pangadi & Zari": { address: "Pangadi–Zari safari range, Maharashtra", query: "Zari Gate Tadoba Maharashtra" },
  Pench: { address: "Turia Gate, Pench Tiger Reserve, Madhya Pradesh", query: "Turia Gate Pench Madhya Pradesh" },
};

export default function ResortDetailsPage() {
  const router = useRouter();
  const { resortId } = useParams<{ resortId: string }>();
  const { state, update } = useBooking();
  const [saved, setSaved] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeSection, setActiveSection] = useState("photos");
  const [isNavPinned, setIsNavPinned] = useState(false);
  const navSentinelRef = useRef<HTMLDivElement>(null);
  const resort = RESORTS.find((item) => item.id === resortId);
  const details = resort ? RESORT_DETAILS[resort.tier] : null;
  const galleryLength = details?.gallery.length ?? 1;

  useEffect(() => {
    if (!resort) router.replace("/book/step-3");
  }, [resort, router]);

  useEffect(() => {
    if (!galleryOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setGalleryOpen(false);
      if (event.key === "ArrowLeft") setActivePhoto((photo) => (photo - 1 + galleryLength) % galleryLength);
      if (event.key === "ArrowRight") setActivePhoto((photo) => (photo + 1) % galleryLength);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryLength, galleryOpen]);

  useEffect(() => {
    if (!amenitiesOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAmenitiesOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [amenitiesOpen]);

  useEffect(() => {
    const sectionIds = ["photos", "overview", "amenities", "reviews", "location"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const section = visible.at(-1)?.target.id;
        if (section) setActiveSection(section);
      },
      { rootMargin: "-44px 0px -68% 0px", threshold: 0 }
    );
    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = navSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsNavPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (!resort || !details) return null;

  const selected = state.resortId === resort.id;
  const total = resort.pricePerNight * state.nights;
  const hasSafariPlan = Boolean(state.range && state.startDate && state.plan.length > 0);
  const amenityGroups = getAmenityGroups(details.amenities);
  const googleReviewsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${resort.name} ${resort.range}`)}`;
  const location = RANGE_LOCATIONS[resort.range] ?? { address: `${resort.range} safari range`, query: `${resort.range} safari gate` };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.query)}`;
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(location.query)}&output=embed`;

  async function shareResort() {
    if (navigator.share) {
      await navigator.share({ title: resort?.name, url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
  }

  function selectResort() {
    update({ resortId: resort!.id });
    router.push(hasSafariPlan ? "/book/step-4" : "/book/step-1");
  }

  return (
    <main className="min-h-screen bg-white pb-32 text-[#17201c]">
      <section id="photos" className="relative h-[360px] overflow-hidden sm:h-[480px] sm:rounded-b-[32px]">
        <Image src={details.image} alt={`${resort.name} resort`} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <button type="button" onClick={() => router.back()} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#17201c] shadow-lg backdrop-blur" aria-label="Back to resorts"><BackIcon /></button>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSaved((value) => !value)} className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur ${saved ? "bg-[#17633b] text-white" : "bg-white/95 text-[#17201c]"}`} aria-label={saved ? "Remove saved resort" : "Save resort"}><HeartIcon filled={saved} /></button>
            <button type="button" onClick={shareResort} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#17201c] shadow-lg backdrop-blur" aria-label="Share resort"><ShareIcon /></button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-5 flex items-end justify-between px-5 sm:px-8">
          <div className="flex items-center gap-1.5" aria-label="Photo 1 of 3">
            {details.gallery.map((photo, index) => <span key={photo} className={`h-1.5 rounded-full ${index === 0 ? "w-5 bg-white" : "w-1.5 bg-white/65"}`} />)}
          </div>
          <button type="button" onClick={() => { setActivePhoto(0); setGalleryOpen(true); }} className="rounded-xl bg-black/60 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/75 active:scale-95">View {details.gallery.length} photos</button>
        </div>
      </section>

      {galleryOpen && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#08110d]/95 text-white" role="dialog" aria-modal="true" aria-label={`${resort.name} photo gallery`}>
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div><p className="text-sm font-extrabold">{resort.name}</p><p className="text-[10px] text-white/60">Photo {activePhoto + 1} of {details.gallery.length}</p></div>
            <button type="button" onClick={() => setGalleryOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="Close photo gallery"><CloseIcon /></button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image src={details.gallery[activePhoto]} alt={`${resort.name} photo ${activePhoto + 1}`} fill priority sizes="100vw" className="object-contain" />
            <button type="button" onClick={() => setActivePhoto((photo) => (photo - 1 + details.gallery.length) % details.gallery.length)} className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 backdrop-blur transition hover:bg-black/70 sm:left-6" aria-label="Previous photo"><GalleryArrow direction="left" /></button>
            <button type="button" onClick={() => setActivePhoto((photo) => (photo + 1) % details.gallery.length)} className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 backdrop-blur transition hover:bg-black/70 sm:right-6" aria-label="Next photo"><GalleryArrow direction="right" /></button>
          </div>
          <div className="permit-scroll flex justify-center gap-2 overflow-x-auto px-4 py-4">
            {details.gallery.map((photo, index) => (
              <button key={photo} type="button" onClick={() => setActivePhoto(index)} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition ${activePhoto === index ? "ring-2 ring-[#fdcb08] ring-offset-2 ring-offset-[#08110d]" : "opacity-55 hover:opacity-100"}`} aria-label={`Show photo ${index + 1}`}>
                <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {amenitiesOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-white text-[#171717]" role="dialog" aria-modal="true" aria-label={`${resort.name} amenities`}>
          <header className="sticky top-0 z-20 border-b border-[#e7e7e7] bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4 sm:px-6">
              <button type="button" onClick={() => setAmenitiesOpen(false)} className="flex h-10 w-10 items-center justify-center text-[#171717]" aria-label="Close amenities"><BackIcon /></button>
              <div><h2 className="font-display text-2xl font-bold">Amenities</h2><p className="mt-0.5 text-[10px] text-[#777777]">{resort.name}</p></div>
            </div>
            <div className="permit-scroll mx-auto flex max-w-3xl overflow-x-auto px-4 sm:px-6">
              {amenityGroups.map((group) => <a key={group.title} href={`#amenity-${group.slug}`} className="shrink-0 border-b-2 border-transparent px-4 py-3 text-xs font-bold text-[#777777] transition hover:border-[#111111] hover:text-[#111111]">{group.tab}</a>)}
            </div>
          </header>
          <div className="mx-auto max-w-3xl px-5 pb-12 pt-7 sm:px-7">
            {amenityGroups.map((group) => (
              <section key={group.title} id={`amenity-${group.slug}`} className="scroll-mt-32 pb-10 last:pb-0">
                <h3 className="font-display text-2xl font-bold">{group.title}</h3>
                <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
                  {group.items.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[#171717]"><AmenityIcon name={amenity} /></span>
                      <span className="text-sm font-semibold leading-5">{amenity}</span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <div ref={navSentinelRef} className="h-px" aria-hidden="true" />
      <div className="h-[43px]">
        <nav className={`${isNavPinned ? "fixed inset-x-0 top-0 z-50" : "relative z-40"} h-[43px] w-full border-y border-[#e5e9e6] bg-white`} aria-label="Resort details sections">
          <div className="permit-scroll mx-auto flex h-[42px] max-w-4xl overflow-x-auto px-2 sm:justify-center">
            {["Photos", "Overview", "Amenities", "Reviews", "Location"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setActiveSection(item.toLowerCase())}
                aria-current={activeSection === item.toLowerCase() ? "location" : undefined}
                className={`flex h-[42px] shrink-0 items-center border-b-2 px-4 text-[10px] font-bold sm:text-xs ${activeSection === item.toLowerCase() ? "border-[#111111] text-[#111111]" : "border-transparent text-[#777777]"}`}
              >
                {item}
              </a>
            ))}
          </div>
        </nav>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        <section id="overview" className="relative z-10 mt-5 scroll-mt-20 rounded-[26px] bg-white p-5 shadow-[0_14px_36px_rgba(20,45,33,0.13)] sm:mt-7 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#17633b] px-2.5 py-1.5 text-sm font-extrabold text-white">{details.rating}</span>
            <span className="text-sm font-extrabold text-[#17633b]">{ratingLabel(details.rating)}</span>
            <span className="text-xs text-[#758078]">· {details.reviews}</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{resort.name}</h1>
              <div className="mt-2 flex items-center gap-1 text-[#e2a700]" aria-label={`${starCount(resort.tier)} star resort`}>
                {Array.from({ length: 5 }, (_, index) => <StarIcon key={index} filled={index < starCount(resort.tier)} />)}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-[#68756e]"><PinIcon />Near {resort.range} safari gate</p>
            </div>
            <span className="rounded-full bg-[#edf7f1] px-3 py-1.5 text-[10px] font-extrabold text-[#17633b]">{RESORT_TIER_LABEL[resort.tier]}</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#59675f]">{details.description}</p>
          <div className="mt-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#777777]">Stay benefits</p>
            <div className="mt-2 divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">
              <div className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdcb08] text-[#111111]"><MealIcon /></span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#171717]">Full-board meal plan</p>
                  <p className="mt-0.5 text-[11px] text-[#6c6c6c]">Breakfast · Lunch · High tea · Dinner</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#111111]"><BadgeIcon /></span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#171717]">Recommended stay</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-[#6c6c6c]">{details.highlight}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="amenities" className="scroll-mt-20 py-9 sm:py-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Amenities</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
            {details.amenities.slice(0, 6).map((amenity) => (
              <div key={amenity} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-[#171717]"><AmenityIcon name={amenity} /></span>
                <span className="text-sm font-semibold leading-5">{amenity}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setAmenitiesOpen(true)} className="mt-8 w-full rounded-xl border-2 border-[#171717] bg-white px-5 py-3.5 text-sm font-extrabold text-[#171717] transition hover:bg-[#171717] hover:text-white">View all amenities</button>
        </section>

        <section id="reviews" className="scroll-mt-20 border-t border-[#e7ebe8] py-9 sm:py-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#50715f]">Guest feedback</p>
          <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Ratings & reviews</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[170px_1fr]">
            <div className="rounded-[22px] bg-[#eaf2ff] p-5 text-center">
              <p className="text-5xl font-black text-[#176ee8]">{details.rating}</p>
              <p className="mt-1 text-sm font-extrabold text-[#176ee8]">{ratingLabel(details.rating)}</p>
            </div>
            <div className="flex flex-col justify-center rounded-[22px] border border-[#e4e9e6] p-5">
              <p className="text-sm font-bold">{details.rating} average rating from recent guests</p>
              <p className="mt-3 flex items-center gap-2 text-sm font-bold text-[#19985a]"><ThumbIcon />{details.guestScore}% guests liked this property</p>
              <p className="mt-2 text-xs text-[#758078]">Based on {details.reviews} in this sample listing.</p>
            </div>
          </div>

          <div className="mt-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#8a8a8a]">Sample content</p>
              <h3 className="font-display mt-1 text-xl font-bold">What guests are saying</h3>
            </div>
            <a href={googleReviewsUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-[#176ee8] transition hover:underline">
              View Google reviews <ExternalLinkIcon />
            </a>
          </div>

          <div className="permit-scroll -mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0">
            {SAMPLE_REVIEWS.map((review) => (
              <article key={review.name} className="w-[78vw] max-w-[280px] shrink-0 snap-start rounded-[20px] border border-[#e5e8e6] bg-white p-4 shadow-[0_8px_22px_rgba(17,17,17,0.05)] sm:w-auto">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[10px] font-extrabold text-[#fdcb08]">{review.initials}</span>
                  <div className="min-w-0"><p className="truncate text-xs font-extrabold">{review.name}</p><p className="text-[9px] text-[#858585]">{review.date}</p></div>
                </div>
                <div className="mt-3 flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, index) => <StarIcon key={index} filled={index < review.rating} />)}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#5f6863]">{review.text}</p>
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.1em] text-[#999999]">Sample review</p>
              </article>
            ))}
          </div>
        </section>

        <section id="location" className="scroll-mt-20 border-t border-[#e7ebe8] py-9 sm:py-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#777777]">Hotel location</p>
          <h2 className="font-display mt-1 text-2xl font-bold sm:text-3xl">Near {resort.range} safari gate</h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#777777]">{location.address}</p>

          <div className="relative mt-5 h-[360px] overflow-hidden rounded-[24px] border border-[#e2e5e3] bg-[#e9efeb] shadow-[0_12px_30px_rgba(17,17,17,0.1)] sm:h-[440px]">
            <iframe title={`Approximate location of ${resort.name}`} src={googleMapsEmbedUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="pointer-events-none absolute left-1/2 top-5 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdcb08] text-[#111111]"><PinIconLarge /></span>
                <div className="min-w-0"><p className="truncate text-xs font-extrabold">{resort.name}</p><p className="mt-0.5 truncate text-[10px] text-[#707872]">Approximate area near {resort.range} gate</p></div>
              </div>
            </div>
            <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white shadow-lg transition hover:bg-[#333333]" aria-label="Open location in Google Maps"><ExpandIcon /></a>
          </div>

          <div className="mt-4 rounded-[22px] border border-[#e5e8e6] bg-white p-4 shadow-[0_8px_22px_rgba(17,17,17,0.05)]">
            <div className="permit-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {['Safari access', 'Travel', 'Essentials'].map((item, index) => <span key={item} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold ${index === 0 ? "bg-[#111111] text-white" : "border border-[#dedede] text-[#555555]"}`}>{item}</span>)}
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-[#eeeeee] pt-4">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff5c4] text-[#111111]"><PinIcon /></span><div className="min-w-0"><p className="truncate text-xs font-extrabold">{resort.range} safari gate</p><p className="mt-0.5 text-[10px] text-[#777777]">Primary safari access point</p></div></div>
              <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-[10px] font-extrabold text-[#176ee8]">View route <ExternalLinkIcon /></a>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#dfe5e1] bg-white/96 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(24,33,29,0.14)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black">₹{resort.pricePerNight.toLocaleString("en-IN")} <span className="text-[10px] font-semibold text-[#7a8580]">/ night</span></p>
            <p className="truncate text-[10px] text-[#748078]">₹{total.toLocaleString("en-IN")} for {state.nights} night{state.nights === 1 ? "" : "s"} · {formatStayDates(state.startDate, state.nights)}</p>
          </div>
          <button type="button" onClick={selectResort} className="rounded-xl bg-[#fdcb08] px-6 py-3.5 text-sm font-extrabold text-[#17201c] shadow-[0_8px_20px_rgba(253,203,8,0.28)] sm:px-10">{hasSafariPlan ? selected ? "Continue →" : "Select stay" : "Select & plan safari"}</button>
        </div>
      </div>
    </main>
  );
}

function formatStayDates(startDate: string | null, nights: number) {
  if (!startDate) return "Dates not selected";
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + nights);
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

function ratingLabel(rating: number) {
  if (rating >= 4.7) return "Excellent";
  if (rating >= 4.4) return "Very good";
  return "Good";
}

function starCount(tier: string) {
  return tier === "premium" ? 5 : tier === "comfort" ? 4 : 3;
}

function getAmenityGroups(primaryAmenities: string[]) {
  return [
    { title: "Popular amenities", tab: "Popular", slug: "popular", items: primaryAmenities },
    { title: "Important", tab: "Important", slug: "important", items: ["24-hour front desk", "Air conditioning", "Restaurant", "Parking", "Room service", "First aid"] },
    { title: "Activities", tab: "Activities", slug: "activities", items: ["Bonfire", "Nature trail", "Bird watching", "Cycling", "Picnic area", "Swimming pool"] },
    { title: "Services", tab: "Services", slug: "services", items: ["Housekeeping", "Laundry service", "Safari wake-up call", "Travel assistance"] },
  ];
}

function BackIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 12H4m7-7-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function HeartIcon({ filled }: { filled: boolean }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.9"><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ShareIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" /></svg>; }
function ExternalLinkIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6v6M20 4l-9 9" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" strokeLinecap="round" /></svg>; }
function CloseIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>; }
function GalleryArrow({ direction }: { direction: "left" | "right" }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 ${direction === "right" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function PinIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>; }
function PinIconLarge() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>; }
function ExpandIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function StarIcon({ filled }: { filled: boolean }) { return <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "text-[#e2a700]" : "text-[#d9ddda]"}`} fill="currentColor"><path d="m12 2.7 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9L12 2.7Z" /></svg>; }
function BadgeIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="currentColor"><path d="m23 12-2.44-2.79.34-3.69-3.61-.82L15.4 1.5 12 2.96 8.6 1.5 6.71 4.7l-3.61.81.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.81 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12Z" /><path d="m8.1 12.1 2.45 2.45 5.4-5.4" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function ThumbIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Zm0 10h9.4a3 3 0 0 0 2.9-2.3l1.2-5A3 3 0 0 0 17.6 9H14l.7-3.4A2.2 2.2 0 0 0 12.5 3L7 10Z" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MealIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor"><circle cx="12" cy="5" r="1.5" /><path d="M5 14.5a7 7 0 0 1 14 0H5ZM3 16h18v2H3ZM2 19h20v2H2Z" /></svg>; }

function AmenityIcon({ name }: { name: string }) {
  const value = name.toLowerCase();
  const props = { "aria-hidden": true, viewBox: "0 0 24 24", className: "h-6 w-6", fill: "none", stroke: "currentColor", strokeWidth: 1.7 } as const;
  if (value.includes("pool")) return <svg {...props}><path d="M2 15c2 0 2 1.5 4 1.5S8 15 10 15s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M2 20c2 0 2 1.5 4 1.5S8 20 10 20s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5M8 12V6a3 3 0 0 1 6 0" strokeLinecap="round" /></svg>;
  if (value.includes("restaurant") || value.includes("meal")) return <svg {...props}><path d="M7 3v7M4 3v4a3 3 0 0 0 6 0V3M7 10v11M16 13V5a3 3 0 0 1 3 3v5h-3Zm0 0v8" strokeLinecap="round" /></svg>;
  if (value.includes("bonfire")) return <svg {...props}><path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-4 3-6 0 3 1 4 2 4 2-2 1-5 0-8Z" /><path d="m5 21 14-4M5 17l14 4" strokeLinecap="round" /></svg>;
  if (value.includes("parking")) return <svg {...props}><path d="M6 21V3h7a5 5 0 0 1 0 10H6M6 13h7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value.includes("air conditioning")) return <svg {...props}><path d="M12 2v20M4 7l16 10M4 17 20 7M8 4l4 3 4-3M8 20l4-3 4 3M3 11l4 1-1 4M21 13l-4-1 1-4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value.includes("hot water")) return <svg {...props}><path d="M5 17c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 3-1.5M8 13c-2-3 2-4 0-7M14 13c-2-3 2-4 0-7" strokeLinecap="round" /></svg>;
  if (value.includes("cycling")) return <svg {...props}><circle cx="6" cy="17" r="4" /><circle cx="18" cy="17" r="4" /><path d="m6 17 4-7 4 7m-8 0h8l4-7h-5M9 6h4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value.includes("nature") || value.includes("bird")) return <svg {...props}><path d="M19 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-7 9-15Z" /><path d="M4 21c3-5 7-8 12-11" strokeLinecap="round" /></svg>;
  if (value.includes("front desk")) return <svg {...props}><circle cx="12" cy="5" r="2" /><path d="M4 12h16v7H4zM2 21h20M8 12V9h8v3" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value.includes("room service") || value.includes("concierge")) return <svg {...props}><path d="M5 16a7 7 0 0 1 14 0H5ZM3 19h18M12 7V5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (value.includes("wake-up")) return <svg {...props}><circle cx="12" cy="13" r="7" /><path d="M12 9v4l3 2M7 3 3 6M17 3l4 3" strokeLinecap="round" /></svg>;
  if (value.includes("laundry")) return <svg {...props}><rect x="4" y="2" width="16" height="20" rx="2" /><circle cx="12" cy="14" r="5" /><path d="M7 6h.01M11 6h5" strokeLinecap="round" /></svg>;
  if (value.includes("first aid")) return <svg {...props}><rect x="3" y="6" width="18" height="15" rx="2" /><path d="M9 6V3h6v3M12 10v7M8.5 13.5h7" strokeLinecap="round" /></svg>;
  if (value.includes("housekeeping")) return <svg {...props}><path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8L12 3ZM19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="8" /><path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
