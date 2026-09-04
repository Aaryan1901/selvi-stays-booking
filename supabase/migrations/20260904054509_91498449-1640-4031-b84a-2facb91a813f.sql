UPDATE public.rooms
SET active = false
WHERE code NOT IN ('101', '102');

UPDATE public.rooms
SET
  name = 'Room 101 · Deluxe Double',
  description = 'A bright, air-conditioned deluxe double with a work corner, smart TV and 24x7 hot water.',
  price = 2500,
  occupancy = 3,
  beds = '1 Double + 1 Sofa Bed',
  amenities = ARRAY['AC','Free WiFi','Smart TV','Attached Bathroom','Hot Water','Work Desk'],
  image_key = 'deluxe',
  active = true
WHERE code = '101';

UPDATE public.rooms
SET
  name = 'Room 102 · Family Room',
  description = 'Our spacious family room with two double beds, a balcony and a mini fridge.',
  price = 2500,
  occupancy = 4,
  beds = '2 Double Beds',
  amenities = ARRAY['AC','Free WiFi','Smart TV','Balcony','Hot Water','Mini Fridge'],
  image_key = 'family',
  active = true
WHERE code = '102';