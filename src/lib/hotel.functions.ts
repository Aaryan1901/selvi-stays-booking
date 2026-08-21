import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  GST_RATE,
  makeReference,
  nightsBetween,
  priceBreakdown,
  publicClient,
} from "@/lib/hotel.server";

export const listRooms = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("rooms")
    .select("id, code, name, description, price, occupancy, beds, amenities, image_key")
    .eq("active", true)
    .order("code");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listReviews = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("reviews")
    .select("id, guest_name, city, rating, body")
    .eq("approved", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        guest_name: z.string().trim().min(2).max(80),
        city: z.string().trim().max(60).default(""),
        rating: z.number().int().min(1).max(5),
        body: z.string().trim().min(10).max(600),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reviews").insert({ ...data, approved: false });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkAvailability = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ checkIn: z.string().min(1), checkOut: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const nights = nightsBetween(data.checkIn, data.checkOut);
    if (nights <= 0) return { nights: 0, bookedCodes: [] as string[] };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("room_code")
      .in("status", ["pending", "confirmed"])
      .lt("check_in", data.checkOut)
      .gt("check_out", data.checkIn);
    if (error) throw new Error(error.message);
    return { nights, bookedCodes: [...new Set((rows ?? []).map((r) => r.room_code))] };
  });

export const quoteBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        roomCode: z.string().min(1),
        checkIn: z.string().min(1),
        checkOut: z.string().min(1),
        coupon: z.string().trim().max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: room } = await supabase
      .from("rooms")
      .select("price")
      .eq("code", data.roomCode)
      .maybeSingle();
    const nights = nightsBetween(data.checkIn, data.checkOut);
    if (!room || nights <= 0)
      return { nights: 0, subtotal: 0, discount: 0, tax: 0, total: 0, couponError: null, gstRate: GST_RATE };

    let discount = 0;
    let couponError: string | null = null;
    const code = data.coupon?.trim().toUpperCase();
    if (code) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("discount_type, discount_value, min_nights, expires_on, usage_limit, used_count, active")
        .eq("code", code)
        .maybeSingle();
      if (!c || !c.active) couponError = "This coupon code is not valid.";
      else if (c.expires_on && new Date(c.expires_on) < new Date())
        couponError = "This coupon has expired.";
      else if (nights < c.min_nights)
        couponError = `Coupon needs a stay of at least ${c.min_nights} nights.`;
      else if (c.usage_limit !== null && c.used_count >= c.usage_limit)
        couponError = "This coupon has been fully redeemed.";
      else
        discount =
          c.discount_type === "percent"
            ? Math.round((room.price * nights * c.discount_value) / 100)
            : c.discount_value;
    }

    return {
      nights,
      ...priceBreakdown(room.price, nights, discount),
      couponError,
      gstRate: GST_RATE,
    };
  });

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        roomCode: z.string().min(1),
        checkIn: z.string().min(1),
        checkOut: z.string().min(1),
        adults: z.number().int().min(1).max(8),
        children: z.number().int().min(0).max(6),
        name: z.string().trim().min(2).max(80),
        phone: z
          .string()
          .trim()
          .regex(/^[0-9+\-\s]{7,16}$/),
        email: z.string().trim().email().max(160),
        request: z.string().trim().max(500).optional(),
        coupon: z.string().trim().max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nights = nightsBetween(data.checkIn, data.checkOut);
    if (nights <= 0) throw new Error("Check-out must be after check-in.");

    const { data: room } = await supabaseAdmin
      .from("rooms")
      .select("id, code, name, price, occupancy")
      .eq("code", data.roomCode)
      .eq("active", true)
      .maybeSingle();
    if (!room) throw new Error("That room is not available.");
    if (data.adults + data.children > room.occupancy)
      throw new Error(`This room sleeps up to ${room.occupancy} guests.`);

    const { data: clash } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("room_code", room.code)
      .in("status", ["pending", "confirmed"])
      .lt("check_in", data.checkOut)
      .gt("check_out", data.checkIn)
      .limit(1);
    if (clash && clash.length > 0)
      throw new Error("Those dates were just taken for this room. Please pick different dates.");

    let discount = 0;
    let couponCode: string | null = null;
    const code = data.coupon?.trim().toUpperCase();
    if (code) {
      const { data: c } = await supabaseAdmin
        .from("coupons")
        .select("id, discount_type, discount_value, min_nights, expires_on, usage_limit, used_count, active")
        .eq("code", code)
        .maybeSingle();
      if (
        c &&
        c.active &&
        nights >= c.min_nights &&
        (!c.expires_on || new Date(c.expires_on) >= new Date()) &&
        (c.usage_limit === null || c.used_count < c.usage_limit)
      ) {
        discount =
          c.discount_type === "percent"
            ? Math.round((room.price * nights * c.discount_value) / 100)
            : c.discount_value;
        couponCode = code;
        await supabaseAdmin
          .from("coupons")
          .update({ used_count: c.used_count + 1 })
          .eq("id", c.id);
      }
    }

    const totals = priceBreakdown(room.price, nights, discount);
    const reference = makeReference();
    const { error } = await supabaseAdmin.from("bookings").insert({
      reference,
      room_id: room.id,
      room_code: room.code,
      room_name: room.name,
      guest_name: data.name,
      guest_phone: data.phone,
      guest_email: data.email,
      check_in: data.checkIn,
      check_out: data.checkOut,
      adults: data.adults,
      children: data.children,
      nights,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      coupon_code: couponCode,
      special_request: data.request ?? null,
    });
    if (error) throw new Error(error.message);
    return { reference, nights, ...totals, roomName: room.name };
  });

export const startPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ reference: z.string().trim().min(4).max(32) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createRazorpayOrder } = await import("@/lib/razorpay.server");
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id, reference, total, guest_name, guest_email, guest_phone, room_name, payment_status")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found.");
    if (booking.payment_status === "paid") throw new Error("This booking is already paid.");

    const order = await createRazorpayOrder({
      amountPaise: Math.round(booking.total * 100),
      receipt: booking.reference,
      notes: { reference: booking.reference, room: booking.room_name },
    });

    return {
      orderId: order.orderId,
      keyId: order.keyId,
      amount: Math.round(booking.total * 100),
      guest: {
        name: booking.guest_name,
        email: booking.guest_email,
        contact: booking.guest_phone,
      },
      roomName: booking.room_name,
    };
  });

export const confirmPayment = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        reference: z.string().trim().min(4).max(32),
        orderId: z.string().trim().min(4).max(64),
        paymentId: z.string().trim().min(4).max(64),
        signature: z.string().trim().min(16).max(256),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { verifyRazorpaySignature } = await import("@/lib/razorpay.server");
    if (!verifyRazorpaySignature(data.orderId, data.paymentId, data.signature))
      throw new Error("Payment could not be verified.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ payment_status: "paid", status: "confirmed", payment_id: data.paymentId })
      .eq("reference", data.reference);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const [bookings, rooms, coupons, reviews] = await Promise.all([
      context.supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      context.supabase.from("rooms").select("*").order("code"),
      context.supabase.from("coupons").select("*").order("code"),
      context.supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    return {
      bookings: bookings.data ?? [],
      rooms: rooms.data ?? [],
      coupons: coupons.data ?? [],
      reviews: reviews.data ?? [],
    };
  });

export const setBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "checked_in", "checked_out", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setReviewApproval = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), approved: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reviews")
      .update({ approved: data.approved })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        price: z.number().int().min(0).max(1_000_000),
        occupancy: z.number().int().min(1).max(10),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("rooms")
      .update({ price: data.price, occupancy: data.occupancy, active: data.active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        code: z.string().trim().min(3).max(30),
        discount_type: z.enum(["percent", "flat"]),
        discount_value: z.number().int().min(1).max(100000),
        min_nights: z.number().int().min(1).max(30),
        active: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("coupons")
      .upsert({ ...data, code: data.code.toUpperCase() }, { onConflict: "code" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
