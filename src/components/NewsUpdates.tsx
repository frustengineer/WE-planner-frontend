import Link from "next/link";

const NEWS_ITEMS = [
  {
    title: "Jungle Safari in India: What to Expect on Your First Drive",
    date: "18 Sep",
    href: "/guides/jungle-safari-in-india",
    image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Buffer vs Core: Which Safari Zone Should You Pick?",
    date: "10 Sep",
    href: "/guides/jungle-safari-in-india",
    image: "https://images.pexels.com/photos/145939/pexels-photo-145939.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    title: "Best Time to Spot Tigers in Tadoba and Pench",
    date: "02 Sep",
    href: "/guides/jungle-safari-in-india",
    image: "https://images.pexels.com/photos/133394/pexels-photo-133394.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

export function NewsUpdates({ className = "" }: { className?: string }) {
  return (
      <section className={className} aria-label="News and updates">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[26px] font-bold leading-none text-black">News &amp; Updates</h2>
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#2a2f45]" fill="currentColor" aria-hidden="true"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10Z" /></svg>
          <span className="h-px flex-1 bg-gradient-to-r from-[#8a8fa3] to-transparent" aria-hidden="true" />
        </div>

        <div className="mt-6 space-y-7">
          {NEWS_ITEMS.slice(0, 2).map((item) => (
            <Link key={item.title} href={item.href} className="flex items-center gap-4 transition active:scale-[.99]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" loading="lazy" className="h-[86px] w-[86px] shrink-0 rounded-[20px] object-cover shadow-[0_6px_14px_rgba(0,0,0,0.12)]" />
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug text-[#1c1f2e]">{item.title}</h3>
                <p className="mt-2 text-[13px] font-medium uppercase tracking-wide text-[#8a6a00]">{item.date}</p>
              </div>
            </Link>
          ))}

          <Link href="/guides/jungle-safari-in-india" className="flex items-center gap-4 pt-1 transition active:scale-[.99]">
            <span className="relative h-[86px] w-[112px] shrink-0" aria-hidden="true">
              {NEWS_ITEMS.map((item, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.title}
                  src={item.image}
                  alt=""
                  className="absolute top-1 h-[74px] w-[74px] rounded-2xl border-2 border-white object-cover shadow-md"
                  style={{ left: index * 20, zIndex: index, transform: `rotate(${[-9, 3, -3][index] ?? 0}deg)` }}
                />
              ))}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[20px] font-medium text-[#1c1f2e]">
                View all
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </p>
              <p className="mt-1 text-[14px] leading-snug text-[#b0b0bb]">Get more updates from the world of jungles</p>
            </div>
          </Link>
        </div>
      </section>
  );
}
