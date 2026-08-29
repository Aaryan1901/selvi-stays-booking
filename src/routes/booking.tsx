import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CheckCircle2, ShieldCheck, TicketPercent } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { HOTEL, inr } from "@/lib/hotel";
import { roomImages } from "@/lib/room-images";
import { openRazorpay } from "@/lib/razorpay";
import {
  checkAvailability,
  confirmPayment,
  createBooking,
  listRooms,
  quoteBooking,
  startPayment,
} from "@/lib/hotel.functions";

type RoomRow = Awaited<ReturnType<typeof listRooms>>[number];

type BookingSearch = {
  room?: string | undefined;
  checkIn?: string | undefined;
  checkOut?: string | undefined;
  guests?: number | undefined;
};

export const Route = createFileRoute("/booking")({
  loader: () => listRooms(),
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
  errorComponent: () => (
    <div className="mx-auto max-w-3xl px-4 pt-40 text-center">
      <h1 className="font-display text-4xl">Booking is loading slowly</h1>
      <p className="mt-3 text-muted-foreground">Please refresh in a moment.</p>
    </div>
  ),
  notFoundComponent: () => <div className="pt-40 text-center">Not found</div>,
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

type Confirmation = Awaited<ReturnType<typeof createBooking>>;

function BookingPage() {
  const rooms = Route.useLoaderData() as RoomRow[];
  const search = Route.useSearch();
  const today = new Date().toISOString().slice(0, 10);

  const submitBooking = useServerFn(createBooking);
  const getQuote = useServerFn(quoteBooking);
  const getAvailability = useServerFn(checkAvailability);
  const beginPayment = useServerFn(startPayment);
  const finishPayment = useServerFn(confirmPayment);

  const [roomCode, setRoomCode] = useState(search.room ?? rooms[0]?.code ?? "");
  const [checkIn, setCheckIn] = useState(search.checkIn ?? today);
  const [checkOut, setCheckOut] = useState(search.checkOut ?? "");
  const [adults, setAdults] = useState(search.guests ?? 2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [request, setRequest] = useState("");
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [bookedCodes, setBookedCodes] = useState<string[]>([]);
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteBooking>> | null>(null);
  const [confirmed, setConfirmed] = useState<Confirmation | null>(null);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const room = useMemo(
    () => rooms.find((r) => r.code === roomCode) ?? rooms[0],
    [rooms, roomCode],
  );

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setBookedCodes([]);
      return;
    }
    let cancelled = false;
    void getAvailability({ data: { checkIn, checkOut } })
      .then((res) => {
        if (!cancelled) setBookedCodes(res.bookedCodes);
      })
      .catch(() => setBookedCodes([]));
    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, getAvailability]);

  useEffect(() => {
    if (!room || !checkIn || !checkOut) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    void getQuote({
      data: { roomCode: room.code, checkIn, checkOut, coupon: appliedCoupon || undefined },
    })
      .then((res) => {
        if (!cancelled) setQuote(res);
      })
      .catch(() => setQuote(null));
    return () => {
      cancelled = true;
    };
  }, [room, checkIn, checkOut, appliedCoupon, getQuote]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const parsed = schema.safeParse({ name, phone, email, checkIn, checkOut });
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    }
    if (!quote || quote.nights <= 0) next["checkOut"] = "Check-out must be after check-in";
    if (adults + children > room.occupancy)
      next["adults"] = `This room sleeps up to ${room.occupancy} guests`;

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      const result = await submitBooking({
        data: {
          roomCode: room.code,
          checkIn,
          checkOut,
          adults,
          children,
          name,
          phone,
          email,
          request: request || undefined,
          coupon: appliedCoupon || undefined,
        },
      });
      setConfirmed(result);
      toast.success("Booking request received", {
        description: `Reference ${result.reference}. Reception will confirm shortly.`,
      });
    } catch (err) {
      toast.error("We couldn't save that booking", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  const payNow = async () => {
    if (!confirmed) return;
    setPaying(true);
    try {
      const order = await beginPayment({ data: { reference: confirmed.reference } });
      await openRazorpay({
        key: order.keyId,
        amount: order.amount,
        currency: "INR",
        name: HOTEL.name,
        description: `${order.roomName} · ${confirmed.reference}`,
        order_id: order.orderId,
        prefill: {
          name: order.guest.name,
          email: order.guest.email,
          contact: order.guest.contact,
        },
        notes: { reference: confirmed.reference },
        theme: { color: "#1b2f5e" },
        modal: { ondismiss: () => setPaying(false) },
        handler: (res) => {
          void finishPayment({
            data: {
              reference: confirmed.reference,
              orderId: res.razorpay_order_id,
              paymentId: res.razorpay_payment_id,
              signature: res.razorpay_signature,
            },
          })
            .then(() => {
              setPaid(true);
              toast.success("Payment received", {
                description: `Your stay is confirmed, reference ${confirmed.reference}.`,
              });
            })
            .catch((err: unknown) =>
              toast.error("We couldn't verify that payment", {
                description: err instanceof Error ? err.message : "Please contact reception.",
              }),
            )
            .finally(() => setPaying(false));
        },
      });
    } catch (err) {
      setPaying(false);
      toast.error("Payment could not be started", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  };

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
        <div className="glass-panel rise-in rounded-3xl p-8 text-center sm:p-12">
          <CheckCircle2 className="mx-auto size-14 text-gold" />
          <h1 className="mt-6 font-display text-4xl">
            {paid ? "Payment received" : "Booking request confirmed"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {paid
              ? `Your stay at ${HOTEL.name} is fully confirmed. See you soon!`
              : `We've held your stay at ${HOTEL.name}. Pay now to confirm instantly, or reception will call ${phone}.`}
          </p>
          <dl className="mt-8 space-y-3 rounded-2xl border bg-card p-6 text-left text-sm">
            <Row label="Reference" value={confirmed.reference} />
            <Row label="Room" value={confirmed.roomName} />
            <Row
              label="Stay"
              value={`${checkIn} → ${checkOut} · ${confirmed.nights} night(s)`}
            />
            <Row label="Guests" value={`${adults} adults, ${children} children`} />
            {confirmed.discount > 0 && (
              <Row label="Discount" value={`− ${inr(confirmed.discount)}`} />
            )}
            <Row
              label={paid ? "Amount paid" : "Amount payable"}
              value={inr(confirmed.total)}
              strong
            />
          </dl>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!paid && (
              <Button onClick={payNow} disabled={paying} size="lg" className="rounded-full">
                {paying ? "Opening payment…" : `Pay ${inr(confirmed.total)} securely`}
              </Button>
            )}
            <Button asChild variant={paid ? "default" : "outline"} className="rounded-full">
              <Link to="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href={`https://wa.me/${HOTEL.whatsapp}`} target="_blank" rel="noreferrer">
                Message us on WhatsApp
              </a>
            </Button>
          </div>
          {!paid && (
            <p className="mt-5 text-xs text-muted-foreground">
              Cards, UPI, net banking and wallets via Razorpay. You can also pay at the hotel.
            </p>
          )}
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
        <form
          onSubmit={submit}
          noValidate
          className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft sm:p-8"
        >
          <div className="space-y-1.5">
            <Label>Room</Label>
            <Select value={roomCode} onValueChange={setRoomCode}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => {
                  const taken = bookedCodes.includes(r.code);
                  return (
                    <SelectItem key={r.code} value={r.code} disabled={taken}>
                      {r.name} — {inr(r.price)}/night{taken ? " (booked for these dates)" : ""}
                    </SelectItem>
                  );
                })}
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
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
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

          <div className="space-y-1.5">
            <Label>Coupon code</Label>
            <div className="flex gap-2">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="DIRECT10"
                className="rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setAppliedCoupon(coupon.trim())}
              >
                <TicketPercent className="mr-1.5 size-4" /> Apply
              </Button>
            </div>
            {quote?.couponError && (
              <p className="text-xs text-destructive">{quote.couponError}</p>
            )}
            {!quote?.couponError && quote && quote.discount > 0 && (
              <p className="text-xs text-gold">Coupon applied — you save {inr(quote.discount)}.</p>
            )}
          </div>

          <Field label="Special request">
            <Textarea
              rows={4}
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Early check-in, extra bed, ground floor…"
              className="rounded-xl"
            />
          </Field>

          <Button type="submit" size="lg" disabled={pending} className="w-full rounded-full">
            {pending ? "Saving…" : "Confirm booking"}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-gold" /> Secure payment by Razorpay — UPI, cards,
            net banking. You can also choose to pay at the hotel.
          </p>
        </form>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="grid aspect-4/3 place-items-center bg-secondary p-8 text-center">
              <div>
                <Building2 className="mx-auto size-10 text-gold" />
                <p className="mt-3 font-display text-xl">Interior photos coming soon</p>
                <p className="mt-1 text-xs text-muted-foreground">Authentic room images will be added shortly</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <h2 className="font-display text-2xl">{room?.name}</h2>
              <dl className="space-y-2.5 text-sm">
                <Row label="Rate per night" value={inr(room?.price ?? 0)} />
                <Row label="Nights" value={String(quote?.nights ?? 0)} />
                <Row label="Subtotal" value={inr(quote?.subtotal ?? 0)} />
                {(quote?.discount ?? 0) > 0 && (
                  <Row label="Coupon discount" value={`− ${inr(quote?.discount ?? 0)}`} />
                )}
                <Row label="GST (12%)" value={inr(quote?.tax ?? 0)} />
                <div className="border-t pt-3">
                  <Row label="Final amount" value={inr(quote?.total ?? 0)} strong />
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
