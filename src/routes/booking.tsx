import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOTEL, ROOMS, inr } from "@/lib/hotel";

type BookingSearch = {
  room?: string | undefined;
  checkIn?: string | undefined;
  checkOut?: string | undefined;
  guests?: number | undefined;
};

export const Route = createFileRoute("/booking")({
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    room: typeof search["room"] === "string" ? search["room"] : undefined,
    checkIn: typeof search["checkIn"] === "string" ? search["checkIn"] : undefined,
    checkOut: typeof search["checkOut"] === "string" ? search["checkOut"] : undefined,
    guests: Number(search["guests"]) > 0 ? Number(search["guests"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Book a Room — Selvi Residency, Puducherry" },
      {
        name: "description",
        content:
          "Book directly at Selvi Residency, Muthialpet. Pick your dates, see nights, GST and the final amount before you confirm.",
      },
      { property: "og:title", content: "Book a Room — Selvi Residency" },
      {
        property: "og:description",
        content: "Two-minute direct booking with transparent GST pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookingPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter the guest name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,16}$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(160),
  checkIn: z.string().min(1, "Choose a check-in date"),
  checkOut: z.string().min(1, "Choose a check-out date"),
});

function BookingPage() {
  const search = Route.useSearch();
  const today = new Date().toISOString().slice(0, 10);

  const [roomId, setRoomId] = useState(search.room ?? ROOMS[0]!.id);
  const [checkIn, setCheckIn] = useState(search.checkIn ?? today);
  const [checkOut, setCheckOut] = useState(search.checkOut ?? "");
  const [adults, setAdults] = useState(search.guests ?? 2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const room = ROOMS.find((r) => r.id === roomId) ?? ROOMS[0]!;

  const totals = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const ms = end.getTime() - start.getTime();
    const nights = Number.isFinite(ms) && ms > 0 ? Math.round(ms / 86_400_000) : 0;
    const subtotal = nights * room.price;
    const gst = Math.round(subtotal * HOTEL.gstRate);
    return { nights, subtotal, gst, total: subtotal + gst };
  }, [checkIn, checkOut, room.price]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, phone, email, checkIn, checkOut });
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    }
    if (totals.nights <= 0) next["checkOut"] = "Check-out must be after check-in";
    if (adults + children > room.occupancy)
      next["adults"] = `This room sleeps up to ${room.occupancy} guests`;

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    const id = `SR${Date.now().toString().slice(-8)}`;
    setConfirmed(id);
    toast.success("Booking request received", {
      description: `Reference ${id}. Reception will confirm shortly.`,
    });
  };

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
        <div className="glass-panel rise-in rounded-3xl p-8 text-center sm:p-12">
          <CheckCircle2 className="mx-auto size-14 text-gold" />
          <h1 className="mt-6 font-display text-4xl">Booking request confirmed</h1>
          <p className="mt-3 text-muted-foreground">
            We've noted your stay at {HOTEL.name}. Reception will call {phone} to confirm.
          </p>
          <dl className="mt-8 space-y-3 rounded-2xl border bg-card p-6 text-left text-sm">
            <Row label="Reference" value={confirmed} />
            <Row label="Room" value={room.name} />
            <Row label="Stay" value={`${checkIn} → ${checkOut} · ${totals.nights} night(s)`} />
            <Row label="Guests" value={`${adults} adults, ${children} children`} />
            <Row label="Amount payable" value={inr(totals.total)} strong />
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer">
                Message us on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">Direct booking</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">Reserve your room</h1>
      <p className="mt-6 max-w-xl text-muted-foreground">
        Under two minutes. You'll see nights, GST and the final amount before confirming.
      </p>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} noValidate className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <div className="space-y-1.5">
            <Label>Room</Label>
            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {ROOMS.map((r) => (
                  <SelectItem key={r.id} value={r.id} disabled={!r.available}>
                    {r.name} — {inr(r.price)}/night
                    {r.available ? "" : " (booked out)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Check-in" error={errors["checkIn"]}>
              <Input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="rounded-xl"
              />
            </Field>
            <Field label="Check-out" error={errors["checkOut"]}>
              <Input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="rounded-xl"
              />
            </Field>
            <Field label="Adults" error={errors["adults"]}>
              <Input
                type="number"
                min={1}
                max={8}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="rounded-xl"
              />
            </Field>
            <Field label="Children">
              <Input
                type="number"
                min={0}
                max={6}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="rounded-xl"
              />
            </Field>
            <Field label="Full name" error={errors["name"]}>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            </Field>
            <Field label="Phone number" error={errors["phone"]}>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
              />
            </Field>
          </div>

          <Field label="Email" error={errors["email"]}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
            />
          </Field>

          <Field label="Special request">
            <Textarea
              rows={4}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Early check-in, extra bed, ground floor…"
              className="rounded-xl"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full rounded-full">
            Confirm booking
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold" /> Secure online payment is being set up —
            for now reception confirms by phone.
          </p>
        </form>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <img
              src={room.images[0]}
              alt={room.name}
              loading="lazy"
              width={1280}
              height={960}
              className="aspect-4/3 w-full object-cover"
            />
            <div className="space-y-4 p-6">
              <h2 className="font-display text-2xl">{room.name}</h2>
              <dl className="space-y-2.5 text-sm">
                <Row label="Rate per night" value={inr(room.price)} />
                <Row label="Nights" value={String(totals.nights)} />
                <Row label="Subtotal" value={inr(totals.subtotal)} />
                <Row label={`GST (${HOTEL.gstRate * 100}%)`} value={inr(totals.gst)} />
                <div className="border-t pt-3">
                  <Row label="Final amount" value={inr(totals.total)} strong />
                </div>
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-xl" : "font-medium"}>{value}</dd>
    </div>
  );
}
