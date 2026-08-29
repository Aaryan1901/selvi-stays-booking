import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Car,
  Cctv,
  Coffee,
  MapPin,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Tv,
  Users,
  Wifi,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AMENITIES, ATTRACTIONS, GALLERY, HOTEL, REVIEWS, inr } from "@/lib/hotel";
import { listRooms, listReviews } from "@/lib/hotel.functions";
import { roomImages } from "@/lib/room-images";
import selviExterior from "@/assets/selvi-exterior-street.jpeg.asset.json";

export const Route = createFileRoute("/")({
  loader: async () => ({
    rooms: await listRooms(),
    reviews: await listReviews(),
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 pt-40 text-center">
      <h1 className="font-display text-4xl">We're getting things ready</h1>
      <p className="mt-3 text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  notFoundComponent: () => <div className="pt-40 text-center">Not found</div>,
  head: () => ({
    meta: [
      { title: "Selvi Residency — Book a Room in Puducherry from ₹2500" },
      {
        name: "description",
        content:
          "Book Selvi Residency directly: two spotless AC rooms in Muthialpet, Puducherry at a flat ₹2500/night. No commission, instant confirmation.",
      },
      { property: "og:title", content: "Selvi Residency — Hotel in Muthialpet, Puducherry" },
      {
        property: "og:description",
        content:
          "A calm, family-friendly residency minutes from Promenade Beach. Direct booking, best rates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const amenityIcons: Record<string, typeof Wifi> = {
  "Free WiFi": Wifi,
  "Air Conditioning": Snowflake,
  Television: Tv,
  "Attached Bathroom": Sparkles,
  "Hot Water": Coffee,
  "Daily Housekeeping": Sparkles,
  Parking: Car,
  "24×7 Support": ShieldCheck,
  "Family Friendly": Users,
  "CCTV Security": Cctv,
};

function SearchBar() {
  const today = new Date().toISOString().slice(0, 10);
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto]">
        <div className="space-y-1.5">
          <Label htmlFor="ci" className="text-xs uppercase tracking-widest">
            Check-in
          </Label>
          <Input
            id="ci"
            type="date"
            min={today}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="rounded-xl bg-card"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="co" className="text-xs uppercase tracking-widest">
            Check-out
          </Label>
          <Input
            id="co"
            type="date"
            min={checkIn || today}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="rounded-xl bg-card"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="g" className="text-xs uppercase tracking-widest">
            Guests
          </Label>
          <Input
            id="g"
            type="number"
            min={1}
            max={8}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl bg-card lg:w-24"
          />
        </div>
        <div className="flex items-end">
          <Button asChild size="lg" className="w-full rounded-xl">
            <Link
              to="/booking"
              search={{ checkIn, checkOut, guests }}
              className="gap-2"
            >
              <CalendarDays className="size-4" /> Check availability
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

type RoomRow = Awaited<ReturnType<typeof listRooms>>[number];
type ReviewRow = Awaited<ReturnType<typeof listReviews>>[number];

function Home() {
  const { rooms, reviews } = Route.useLoaderData() as {
    rooms: RoomRow[];
    reviews: ReviewRow[];
  };
  const featured = rooms.slice(0, 3);
  const guestReviews =
    reviews.length > 0
      ? reviews.map((r) => ({ name: r.guest_name, city: r.city, rating: r.rating, text: r.body }))
      : REVIEWS;

  return (
    <>
      <section className="relative min-h-[92svh] w-full overflow-hidden">
        <img
          src={selviExterior.url}
          alt="Selvi Residency lit up at dusk with palm trees along the street"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-primary/75 via-primary/45 to-primary/85" />
        <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 sm:pb-16">
          <div className="rise-in max-w-2xl text-primary-foreground">
            <p className="eyebrow">Muthialpet · Puducherry</p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] sm:text-7xl">
              {HOTEL.name}
            </h1>
            <p className="mt-5 max-w-lg text-base opacity-85 sm:text-lg">
              Two thoughtfully kept rooms at a flat ₹2500 a night, warm hospitality and a
              five-minute ride to Promenade Beach. Book direct — never a commission.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-gold text-primary hover:bg-gold/90">
                <Link to="/booking" className="gap-2">
                  Book Now <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/rooms">View rooms</Link>
              </Button>
            </div>
          </div>

          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Stay with us</p>
            <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">Featured rooms</h2>
          </div>
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/rooms" className="gap-2">
              Both rooms <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {featured.map((room) => (
            <article
              key={room.id}
              className="lift-card overflow-hidden rounded-3xl border bg-card shadow-soft"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <img
                  src={roomImages(room.image_key)[0] ?? ""}
                  alt={room.name}
                  loading="lazy"
                  width={1280}
                  height={960}
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <Badge className="absolute left-4 top-4 rounded-full bg-card text-card-foreground">
                  {inr(room.price)} / night
                </Badge>
              </div>
              <div className="space-y-3 p-6">
                <h3 className="font-display text-2xl">{room.name}</h3>
                <p className="text-sm text-muted-foreground">{room.description}</p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" /> Up to {room.occupancy}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BedDouble className="size-3.5" /> {room.beds}
                  </span>
                </div>
                <Button asChild className="mt-2 w-full rounded-full">
                  <Link to="/booking" search={{ room: room.code }}>
                    Book this room
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Why Selvi Residency</p>
          <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">
            Small enough to care, run well enough to trust
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Direct booking, honest price",
                body: "No aggregator commission means the rate you see is the rate you pay.",
                icon: ShieldCheck,
              },
              {
                title: "Family-first rooms",
                body: "Extra beds, connecting options and a genuinely quiet residential lane.",
                icon: Users,
              },
              {
                title: "Two minutes to book",
                body: "Pick dates, confirm, pay — with instant confirmation to your phone.",
                icon: CalendarDays,
              },
            ].map((item) => (
              <div key={item.title} className="lift-card rounded-3xl border bg-card p-7 shadow-soft">
                <span className="grid size-11 place-items-center rounded-2xl bg-gold-soft text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Gallery</p>
          <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">Inside the residency</h2>
        </div>
        <div className="mt-10 flex w-max marquee-track gap-5 px-4">
           {[...GALLERY, ...GALLERY].map((item, i) => (
            <figure
              key={`${item.label}-${i}`}
              className="w-64 shrink-0 overflow-hidden rounded-3xl border bg-card shadow-soft sm:w-80"
            >
              <img
                src={item.src}
                alt={item.label}
                loading="lazy"
                width={1280}
                height={960}
                className="aspect-4/3 size-full object-cover"
              />
              <figcaption className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">
                {item.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="eyebrow">Amenities</p>
        <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">Included with every stay</h2>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {AMENITIES.map((a) => {
            const Icon = amenityIcons[a] ?? Sparkles;
            return (
              <div
                key={a}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4 text-sm shadow-soft transition-colors hover:border-gold"
              >
                <Icon className="size-4 shrink-0 text-gold" />
                <span className="min-w-0 truncate">{a}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Guest reviews</p>
          <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">What families say</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guestReviews.slice(0, 4).map((r) => (
              <blockquote
                key={r.name}
                className="lift-card rounded-3xl border bg-card p-6 shadow-soft"
              >
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">“{r.text}”</p>
                <footer className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {r.name} · {r.city}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Nearby</p>
        <h2 className="gold-rule mt-2 font-display text-4xl sm:text-5xl">Attractions around us</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {ATTRACTIONS.map((a) => (
            <article key={a.name} className="lift-card rounded-3xl border bg-card p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-soft text-primary">
                  <MapPin className="size-5" />
                </span>
                <span className="shrink-0 pt-2 text-xs uppercase tracking-widest text-gold">
                  {a.distance}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border shadow-soft">
          <iframe
            title="Selvi Residency location on Google Maps"
            src={HOTEL.mapEmbed}
            loading="lazy"
            className="h-80 w-full border-0 sm:h-96"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}
