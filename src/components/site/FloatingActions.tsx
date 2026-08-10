import { MessageCircle, Phone } from "lucide-react";
import { HOTEL } from "@/lib/hotel";

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3 sm:bottom-8 sm:right-6">
      <a
        href={`https://wa.me/${HOTEL.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="grid size-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="size-5" />
      </a>
      <a
        href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}
        aria-label="Call the reception"
        className="grid size-13 place-items-center rounded-full bg-gold text-primary shadow-lg transition-transform hover:scale-110"
      >
        <Phone className="size-5" />
      </a>
    </div>
  );
}
