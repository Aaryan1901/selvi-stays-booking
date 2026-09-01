import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { HOTEL } from "@/lib/hotel";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setDark((d) => !d)}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-panel border-b py-2" : "border-b border-transparent py-4",
        overHero ? "text-primary-foreground" : "text-foreground",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-french-red font-display text-lg text-primary-foreground">
            S
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-xl leading-tight">
              {HOTEL.name}
            </span>
            <span className={cn(
              "block truncate text-[0.65rem] uppercase tracking-[0.22em]",
              overHero ? "text-primary-foreground/70" : "text-muted-foreground",
            )}>
              Muthialpet · Puducherry
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                 className={cn(
                   "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                   overHero
                     ? "text-primary-foreground/75 hover:bg-primary-foreground/12 hover:text-primary-foreground"
                     : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                 )}
                 activeProps={{ className: overHero ? "bg-primary-foreground text-primary" : "text-foreground bg-secondary" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className={cn(overHero && "[&_button]:text-primary-foreground [&_button]:hover:bg-primary-foreground/12")}>
            <ThemeToggle />
          </span>
          <Button asChild className="hidden rounded-full bg-french-red text-primary-foreground hover:bg-french-red/90 sm:inline-flex">
            <Link to="/booking">Book Now</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-10 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 font-display text-2xl transition-colors hover:bg-secondary"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 rounded-full">
                  <Link to="/booking" onClick={() => setOpen(false)}>
                    Book Now
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
