import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const GST_RATE = 0.12;

export function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 86_400_000) : 0;
}

export function priceBreakdown(rate: number, nights: number, discount: number) {
  const subtotal = rate * nights;
  const capped = Math.min(discount, subtotal);
  const tax = Math.round((subtotal - capped) * GST_RATE);
  return { subtotal, discount: capped, tax, total: subtotal - capped + tax };
}

export function makeReference() {
  return `SR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}
