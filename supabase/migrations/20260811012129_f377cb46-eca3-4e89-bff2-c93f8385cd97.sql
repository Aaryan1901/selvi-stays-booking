-- roles
CREATE TYPE public.app_role AS ENUM ('admin','staff','user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- rooms
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  occupancy INTEGER NOT NULL DEFAULT 2,
  beds TEXT NOT NULL DEFAULT '',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  image_key TEXT NOT NULL DEFAULT 'deluxe',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms public read" ON public.rooms FOR SELECT TO anon, authenticated USING (active);
CREATE POLICY "rooms admin all" ON public.rooms FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- coupons
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percent',
  discount_value INTEGER NOT NULL DEFAULT 0,
  min_nights INTEGER NOT NULL DEFAULT 1,
  expires_on DATE,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons admin all" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  room_code TEXT NOT NULL,
  room_name TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER NOT NULL DEFAULT 0,
  nights INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  tax INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT,
  special_request TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings admin all" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX bookings_dates_idx ON public.bookings (room_code, check_in, check_out);

-- reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (approved);
CREATE POLICY "reviews admin all" ON public.reviews FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- seed rooms
INSERT INTO public.rooms (code, name, description, price, occupancy, beds, amenities, image_key) VALUES
('101','Room 101 · Standard Double','A compact, spotless double room with everything a short stay needs.',1800,2,'1 Double Bed', ARRAY['AC','Free WiFi','TV','Attached Bathroom','Hot Water'],'standard'),
('102','Room 102 · Standard Twin','Twin beds and a quiet street-facing window, ideal for friends.',1900,2,'2 Single Beds', ARRAY['AC','Free WiFi','TV','Attached Bathroom','Hot Water'],'standard'),
('103','Room 103 · Deluxe Double','Extra floor space, a work desk and a warm reading corner.',2200,3,'1 Double + 1 Sofa Bed', ARRAY['AC','Free WiFi','Smart TV','Attached Bathroom','Hot Water','Work Desk'],'deluxe'),
('201','Room 201 · Deluxe Balcony','Private balcony overlooking the palm-lined lane below.',2400,3,'1 Queen Bed', ARRAY['AC','Free WiFi','Smart TV','Balcony','Hot Water','Mini Fridge'],'deluxe'),
('202','Room 202 · Family Suite','Our largest room, built for families travelling with children.',3200,4,'1 Double + 2 Single Beds', ARRAY['AC','Free WiFi','Smart TV','Attached Bathroom','Hot Water','Mini Fridge'],'family'),
('203','Room 203 · Family Deluxe','Top-floor suite with two double beds and a sunlit balcony.',3500,5,'2 Double Beds', ARRAY['AC','Free WiFi','Smart TV','Balcony','Hot Water','Mini Fridge','Extra Bed'],'family');

-- seed reviews
INSERT INTO public.reviews (guest_name, city, rating, body, approved) VALUES
('Anitha R.','Chennai',5,'Spotless rooms and genuinely warm hosts. Walking distance to the beach promenade.',true),
('Vikram S.','Bengaluru',5,'Booked directly and saved on commission. Check-in took two minutes.',true),
('Fathima N.','Kochi',4,'Great family suite. Kids loved the balcony, we loved the quiet street.',true),
('Rahul M.','Hyderabad',5,'Hot water at 5am, strong WiFi, safe parking. Exactly what we needed.',true);

-- seed coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_nights) VALUES
('DIRECT10','percent',10,2),
('FAMILY500','flat',500,3);