# Selvi Residency — Final Issue Sweep

## Current state
Preview check shows **no console errors and no runtime errors**. The site (home, rooms, gallery, about, contact, booking, admin) is working. A few small known issues remain from the earlier pass.

## Issues to fix

1. ~~**Booking page date hydration warning**~~ **Done**
   - The booking page computes "today" in the browser, which can mismatch the server-rendered page and cause a React hydration warning (and a wrong minimum date around midnight).
   - Fix: compute `today` only after the component mounts (useEffect), so the server and client render match.

2. ~~**Booking form minimum check-out date**~~ **Done**
   - Check-out's minimum currently allows the same day as check-in, which always fails validation.
   - Fix: set the check-out minimum to the day after check-in, so guests can't pick an invalid range.

3. **Final verification pass**
   - Re-check booking flow (room selection, quote, availability), dark mode visibility, and mobile layout in the browser after the fixes.

## Not code issues (need your input, listed for clarity)
- Interior room photos — send them and I'll add them to the room cards and gallery.
- Razorpay live keys — needed before accepting real payments.
- Publishing — when you're happy with the site, we publish it to get the live URL.

## Technical details
- Files touched: `src/routes/booking.tsx` only.
- No database or design changes.
