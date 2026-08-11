import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/hotel";
import {
  adminOverview,
  deleteCoupon,
  saveCoupon,
  saveRoom,
  setBookingStatus,
  setReviewApproval,
} from "@/lib/hotel.functions";

type Overview = Awaited<ReturnType<typeof adminOverview>>;

const STATUSES = ["pending", "confirmed", "checked_in", "checked_out", "cancelled"] as const;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Selvi Residency" },
      {
        name: "description",
        content:
          "Manage Selvi Residency bookings, occupancy, revenue, room rates, coupons and guest reviews.",
      },
      { property: "og:title", content: "Admin Dashboard — Selvi Residency" },
      { property: "og:description", content: "Internal booking and revenue management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOverview = useServerFn(adminOverview);

  const { data, isLoading, error } = useQuery<Overview>({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    retry: false,
  });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });

  const statusFn = useServerFn(setBookingStatus);
  const reviewFn = useServerFn(setReviewApproval);
  const roomFn = useServerFn(saveRoom);
  const couponFn = useServerFn(saveCoupon);
  const couponDeleteFn = useServerFn(deleteCoupon);

  const mutate = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      toast.success("Saved");
      refresh();
    },
    onError: (err: unknown) =>
      toast.error("Could not save", {
        description: err instanceof Error ? err.message : "Please try again.",
      }),
  });

  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "flat",
    discount_value: 10,
    min_nights: 1,
    active: true,
  });

  if (isLoading) {
    return <div className="px-4 pt-40 text-center text-muted-foreground">Loading dashboard…</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 pt-40 text-center">
        <h1 className="font-display text-3xl">Admin access required</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in but has no admin role yet. Ask an existing admin to grant
          access.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-full"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth", search: { next: "/admin" } });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  const active = data.bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const revenue = data.bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.total, 0);
  const today = new Date().toISOString().slice(0, 10);
  const occupiedToday = data.bookings.filter(
    (b) =>
      b.status !== "cancelled" && b.check_in <= today && b.check_out > today,
  ).length;
  const occupancy = data.rooms.length
    ? Math.round((occupiedToday / data.rooms.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Reception</p>
          <h1 className="gold-rule mt-2 font-display text-5xl">Admin dashboard</h1>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth", search: { next: "/admin" } });
          }}
        >
          Sign out
        </Button>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total bookings" value={String(data.bookings.length)} />
        <Stat label="Active stays" value={String(active.length)} />
        <Stat label="Occupancy today" value={`${occupancy}%`} />
        <Stat label="Revenue (incl. GST)" value={inr(revenue)} />
      </div>

      <Tabs defaultValue="bookings" className="mt-12">
        <TabsList className="rounded-full">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-3">
          {data.bookings.length === 0 && (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          )}
          {data.bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {b.guest_name} · <span className="text-muted-foreground">{b.reference}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {b.room_name} · {b.check_in} → {b.check_out} · {b.nights} night(s) ·{" "}
                  {b.adults + b.children} guests
                </p>
                <p className="text-sm text-muted-foreground">
                  {b.guest_phone} · {b.guest_email}
                  {b.coupon_code ? ` · coupon ${b.coupon_code}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl">{inr(b.total)}</span>
                <Select
                  value={b.status}
                  onValueChange={(status) =>
                    mutate.mutate(() =>
                      statusFn({
                        data: { id: b.id, status: status as (typeof STATUSES)[number] },
                      }),
                    )
                  }
                >
                  <SelectTrigger className="w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="rooms" className="mt-6 space-y-3">
          {data.rooms.map((r) => (
            <RoomRowEditor
              key={r.id}
              room={r}
              onSave={(payload) => mutate.mutate(() => roomFn({ data: payload }))}
            />
          ))}
        </TabsContent>

        <TabsContent value="coupons" className="mt-6 space-y-6">
          <div className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-5">
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={couponForm.discount_type}
                onValueChange={(v) =>
                  setCouponForm({ ...couponForm, discount_type: v as "percent" | "flat" })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="flat">Flat ₹</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Value</Label>
              <Input
                type="number"
                value={couponForm.discount_value}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min nights</Label>
              <Input
                type="number"
                value={couponForm.min_nights}
                onChange={(e) =>
                  setCouponForm({ ...couponForm, min_nights: Number(e.target.value) })
                }
                className="rounded-xl"
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full rounded-full"
                onClick={() => mutate.mutate(() => couponFn({ data: couponForm }))}
              >
                Save coupon
              </Button>
            </div>
          </div>

          {data.coupons.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div>
                <p className="font-medium">{c.code}</p>
                <p className="text-sm text-muted-foreground">
                  {c.discount_type === "percent"
                    ? `${c.discount_value}% off`
                    : `${inr(c.discount_value)} off`}{" "}
                  · min {c.min_nights} night(s) · used {c.used_count}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={c.active ? "default" : "secondary"} className="rounded-full">
                  {c.active ? "Active" : "Inactive"}
                </Badge>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => mutate.mutate(() => couponDeleteFn({ data: { id: c.id } }))}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-3">
          {data.reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {r.guest_name} · {r.rating}★{" "}
                  <span className="text-muted-foreground">{r.city}</span>
                </p>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
              <Button
                variant={r.approved ? "outline" : "default"}
                className="rounded-full"
                onClick={() =>
                  mutate.mutate(() => reviewFn({ data: { id: r.id, approved: !r.approved } }))
                }
              >
                {r.approved ? "Unpublish" : "Approve"}
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoomRowEditor({
  room,
  onSave,
}: {
  room: Overview["rooms"][number];
  onSave: (payload: {
    id: string;
    price: number;
    occupancy: number;
    active: boolean;
  }) => void;
}) {
  const [price, setPrice] = useState(room.price);
  const [occupancy, setOccupancy] = useState(room.occupancy);
  const [active, setActive] = useState(room.active);

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border bg-card p-5">
      <div className="min-w-48">
        <p className="font-medium">{room.name}</p>
        <p className="text-sm text-muted-foreground">{room.beds}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>Rate</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-28 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Sleeps</Label>
          <Input
            type="number"
            value={occupancy}
            onChange={(e) => setOccupancy(Number(e.target.value))}
            className="w-20 rounded-xl"
          />
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setActive(!active)}
          type="button"
        >
          {active ? "Listed" : "Hidden"}
        </Button>
        <Button
          className="rounded-full"
          onClick={() => onSave({ id: room.id, price, occupancy, active })}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
