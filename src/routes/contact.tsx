import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HOTEL } from "@/lib/hotel";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Selvi Residency — Muthialpet, Puducherry" },
      {
        name: "description",
        content:
          "Call, WhatsApp or email Selvi Residency in Muthialpet, Puducherry. Reception answers 24×7 for direct bookings.",
      },
      { property: "og:title", content: "Contact Selvi Residency" },
      {
        property: "og:description",
        content: "Phone, WhatsApp, email and directions to Selvi Residency, Puducherry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,16}$/, "Enter a valid phone number"),
  message: z.string().trim().min(5, "Tell us a little more").max(1000),
});

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const issue of result.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setValues({ name: "", email: "", phone: "", message: "" });
    toast.success("Message sent", {
      description: "Reception will reply within a few hours.",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">Contact</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">Talk to reception</h1>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {[
            {
              icon: Phone,
              label: "Call us",
              value: HOTEL.phone,
              href: `tel:${HOTEL.phone.replace(/\s/g, "")}`,
            },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: "Chat with the front desk",
              href: `https://wa.me/${HOTEL.whatsapp}`,
            },
            {
              icon: Mail,
              label: "Email",
              value: HOTEL.email,
              href: `mailto:${HOTEL.email}`,
            },
            {
              icon: MapPin,
              label: "Address",
              value: HOTEL.address,
              href: HOTEL.mapLink,
            },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="lift-card flex items-start gap-4 rounded-3xl border bg-card p-5 shadow-soft"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-primary">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </span>
                <span className="block break-words">{item.value}</span>
              </span>
            </a>
          ))}

          <div className="overflow-hidden rounded-3xl border shadow-soft">
            <iframe
              title="Map to Selvi Residency"
              src={HOTEL.mapEmbed}
              loading="lazy"
              className="h-64 w-full border-0"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <form onSubmit={submit} className="glass-panel space-y-4 rounded-3xl p-6 sm:p-8" noValidate>
          <h2 className="font-display text-3xl">Send a message</h2>
          {(
            [
              { id: "name", label: "Full name", type: "text" },
              { id: "email", label: "Email", type: "email" },
              { id: "phone", label: "Phone", type: "tel" },
            ] as const
          ).map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                value={values[field.id]}
                onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
                className="rounded-xl bg-card"
              />
              {errors[field.id] && (
                <p className="text-xs text-destructive">{errors[field.id]}</p>
              )}
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={5}
              value={values.message}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
              className="rounded-xl bg-card"
            />
            {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
          </div>
          <Button type="submit" size="lg" className="w-full rounded-full">
            Send message
          </Button>
        </form>
      </div>
    </div>
  );
}
