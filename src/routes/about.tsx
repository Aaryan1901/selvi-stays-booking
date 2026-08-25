import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import lobby from "@/assets/lobby.jpg";
import { AMENITIES, HOTEL } from "@/lib/hotel";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Selvi Residency — Family Stay in Puducherry" },
      {
        name: "description",
        content:
          "The story behind Selvi Residency: a two-room family-run stay in Muthialpet, Puducherry built on clean rooms and fair pricing.",
      },
      { property: "og:title", content: "About Selvi Residency" },
      {
        property: "og:description",
        content: "A family-run, two-room residency in Muthialpet, Puducherry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">About</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">
        A family house that became a residency
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-3xl">Our history</h2>
            <p className="mt-3 text-muted-foreground">
              Selvi Residency began as a family home on a quiet lane in Muthialpet. As friends and
              relatives kept arriving for temple visits, weddings and beach weekends, the house grew
              into a small two-room residency, run with the same instincts: clean
              linen, hot water on time and someone at the desk who knows your name.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl">Our mission</h2>
            <p className="mt-3 text-muted-foreground">
              To make a comfortable Puducherry stay affordable for families. We take bookings
              directly so nothing is lost to commissions, and we pass that saving straight into the
              nightly rate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl">Facilities</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {AMENITIES.map((a) => (
                <li key={a} className="rounded-xl border bg-card px-3 py-2">
                  {a}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <img
            src={lobby}
            alt="Reception desk at Selvi Residency"
            loading="lazy"
            width={1280}
            height={960}
            className="aspect-4/3 w-full rounded-3xl border object-cover shadow-soft"
          />
          <div className="glass-panel rounded-3xl p-6">
            <p className="eyebrow">Owner's message</p>
            <p className="mt-3 font-display text-2xl leading-snug">
              “Treat every guest the way we would treat family visiting for Pongal.”
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              — The Selvi family, {HOTEL.address}
            </p>
          </div>
          <Button asChild className="w-full rounded-full">
            <Link to="/booking">Book your stay</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
