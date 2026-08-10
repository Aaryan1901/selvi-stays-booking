import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { HOTEL } from "@/lib/hotel";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="font-display text-3xl">{HOTEL.name}</h3>
          <p className="mt-3 max-w-xs text-sm opacity-75">{HOTEL.tagline}</p>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/rooms", label: "Rooms & Rates" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
              { to: "/booking", label: "Book a Stay" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-75 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow">Reach us</p>
          <ul className="mt-4 space-y-3 text-sm opacity-80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {HOTEL.address}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              <a href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}>{HOTEL.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 px-4 py-6 text-center text-xs opacity-60 sm:px-6">
        © {new Date().getFullYear()} {HOTEL.name}. Direct bookings, no commission.
      </div>
    </footer>
  );
}
