import { createFileRoute, Link } from "@tanstack/react-router";
import { BedDouble, Check, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { listRooms } from "@/lib/hotel.functions";
import { inr } from "@/lib/hotel";
import { roomImages } from "@/lib/room-images";
import { cn } from "@/lib/utils";

type RoomRow = Awaited<ReturnType<typeof listRooms>>[number];

export const Route = createFileRoute("/rooms")({
  loader: () => listRooms(),
  head: () => ({
    meta: [
      { title: "Rooms & Rates — Selvi Residency, Puducherry" },
      {
        name: "description",
        content:
          "Both rooms at Selvi Residency — a deluxe double and a family room — at a flat ₹2500 per night with AC, WiFi, smart TV and 24x7 hot water.",
      },
      { property: "og:title", content: "Rooms & Rates — Selvi Residency" },
      {
        property: "og:description",
        content: "Deluxe double and family rooms in Muthialpet, Puducherry at a flat ₹2500/night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 pt-40 text-center">
      <h1 className="font-display text-4xl">Rooms are loading slowly</h1>
      <p className="mt-3 text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  notFoundComponent: () => <div className="pt-40 text-center">Not found</div>,
  component: RoomsPage,
});

function RoomCard({ room }: { room: RoomRow }) {
  const images = roomImages(room.image_key);
  const [active, setActive] = useState(0);

  return (
    <article className="lift-card overflow-hidden rounded-3xl border bg-card shadow-soft">
      <div className="grid md:grid-cols-2">
        <div className="relative">
          <div className="aspect-4/3 overflow-hidden md:h-full">
            <img
              src={images[active]}
              alt={`Selvi Residency exterior photo ${active + 1}`}
              loading="lazy"
              width={1280}
              height={960}
              className="size-full object-cover transition-opacity duration-500"
            />
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            {images.map((img, i) => (
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
            {room.amenities.map((a: string) => (
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
            <Button asChild className="rounded-full">
              <Link to="/booking" search={{ room: room.code }}>
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function RoomsPage() {
  const rooms = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">Two rooms · flat ₹2500 / night</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">Rooms &amp; rates</h1>
      <p className="mt-6 max-w-xl text-muted-foreground">
        We keep just two rooms so every stay gets full attention. Both are air-conditioned,
        cleaned daily and priced at a flat ₹2500 per night, with 12% GST shown transparently at
        checkout — no seasonal surge, no commission.
      </p>

      <div className="mt-12 space-y-8">
        {(rooms as RoomRow[]).map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>

    </div>
  );
}
