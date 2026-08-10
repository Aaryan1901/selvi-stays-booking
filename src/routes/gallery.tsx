import { createFileRoute } from "@tanstack/react-router";
import { GALLERY } from "@/lib/hotel";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Photo Gallery — Selvi Residency, Puducherry" },
      {
        name: "description",
        content:
          "Photos of Selvi Residency: rooms, reception, exterior and the Puducherry landmarks a short walk away.",
      },
      { property: "og:title", content: "Photo Gallery — Selvi Residency" },
      {
        property: "og:description",
        content: "Rooms, lobby, exterior and nearby places around Muthialpet, Puducherry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-10 pt-32 sm:px-6 sm:pt-40">
      <p className="eyebrow">Gallery</p>
      <h1 className="gold-rule mt-2 font-display text-5xl sm:text-6xl">A look around</h1>

      <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>figure]:mb-5">
        {GALLERY.map((item, i) => (
          <figure
            key={item.label}
            className="lift-card group break-inside-avoid overflow-hidden rounded-3xl border bg-card shadow-soft"
          >
            <img
              src={item.src}
              alt={item.label}
              loading="lazy"
              width={1280}
              height={960}
              className={
                i % 3 === 0
                  ? "aspect-3/4 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  : "aspect-4/3 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              }
            />
            <figcaption className="px-5 py-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {item.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
