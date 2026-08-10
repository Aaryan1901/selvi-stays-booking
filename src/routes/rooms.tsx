import { createFileRoute, Link } from "@tanstack/react-router";
import { BedDouble, Check, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROOMS, inr } from "@/lib/hotel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms & Rates — Selvi Residency, Puducherry" },
      {
        name: "description",
        content:
          "All six rooms at Selvi Residency: standard, deluxe and family suites from ₹1800 per night with AC, WiFi, TV and hot water.",
      },
      { property: "og:title", content: "Rooms & Rates — Selvi Residency" },
      {
        property: "og:description",
        content: "Standard, deluxe and family rooms in Muthialpet, Puducherry from ₹1800/night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoomsPage,
});

function RoomCard({ room }: { room: (typeof ROOMS)[number] }) {
  const [active, setActive] = useState(0);

  return (
    <article className="lift-card overflow-hidden rounded-3xl border bg-card shadow-soft">
      <div className="grid md:grid-cols-2">
        <div className="relative">
          <div className="aspect-4/3 overflow-hidden md:h-full">
            <img
              src={room.images[active]}
              alt={`${room.name} view ${active + 1}`}
              loading="lazy"
              width={1280}
              height={960}
              className="size-full object-cover transition-opacity duration-500"
            />
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            {room.images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1} of ${room.name}`}
                className={cn(
                  "size-12 overflow-hidden rounded-xl border-2 transition-all",
                  i === active ? "border-gold" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={img} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
          <Badge
            className={cn(
              "absolute right-4 top-4 rounded-full",
              room.available ? "bg-card text-card-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {room.available ? "Available" : "Booked out"}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div>
            <h2 className="font-display text-3xl">{room.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{room.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-4 text-gold" /> Max {room.occupancy} guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-gold" /> {room.beds}
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-2 text-sm">
            {room.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-gold" />
                <span className="min-w-0 truncate">{a}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t pt-5">
            <p>
              <span className="font-display text-3xl">{inr(room.price)}</span>
              <span className="text-sm text-muted-foreground"> / night</span>
            </p>
            <Button asChild disabled={!room.available} className="rounded-full">
              <Link to="/booking" search={{ room: room.id }}>
                {room.available ? "Book Now" : "Join waitlist"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function RoomsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">Six rooms</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">Rooms &amp; rates</h1>
      <p className="mt-6 max-w-xl text-muted-foreground">
        Every room is air-conditioned, cleaned daily and priced with GST shown transparently at
        checkout. Rates below are per night for the room.
      </p>

      <div className="mt-12 space-y-8">
        {ROOMS.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}
