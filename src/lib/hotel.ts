import selviExterior from "@/assets/selvi-exterior-street.jpeg.asset.json";
import selviSign from "@/assets/selvi-sign.jpeg.asset.json";
import selviFacade from "@/assets/selvi-facade.jpeg.asset.json";
import { ROOM_IMAGES } from "@/lib/room-images";

const propertyPhotos = {
  exterior: selviExterior.url,
  sign: selviSign.url,
  facade: selviFacade.url,
};

export const HOTEL = {
  name: "Selvi Residency",
  tagline: "A calm, family-friendly stay in the heart of Puducherry",
  address: "Muthialpet, Puducherry 605003, India",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  email: "stay@selviresidency.in",
  gstRate: 0.12,
  mapEmbed:
    "https://www.google.com/maps?q=Muthialpet,%20Puducherry&output=embed",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Muthialpet,Puducherry",
};

export type Room = {
  id: string;
  name: string;
  price: number;
  occupancy: number;
  beds: string;
  images: string[];
  amenities: string[];
  available: boolean;
  description: string;
};

export const ROOMS: Room[] = [
  {
    id: "101",
    name: "Room 101 · Deluxe Double",
    price: 2500,
    occupancy: 3,
    beds: "1 Double + 1 Sofa Bed",
    images: [],
    amenities: [
      "AC",
      "Free WiFi",
      "Smart TV",
      "Attached Bathroom",
      "Hot Water",
      "Work Desk",
    ],
    available: true,
    description:
      "A bright, air-conditioned deluxe double with a work corner, smart TV and 24x7 hot water.",
  },
  {
    id: "102",
    name: "Room 102 · Family Room",
    price: 2500,
    occupancy: 4,
    beds: "2 Double Beds",
    images: [],
    amenities: [
      "AC",
      "Free WiFi",
      "Smart TV",
      "Balcony",
      "Hot Water",
      "Mini Fridge",
    ],
    available: true,
    description:
      "Our spacious family room with two double beds, a balcony and a mini fridge.",
  },
];


export const AMENITIES = [
  "Free WiFi",
  "Air Conditioning",
  "Television",
  "Attached Bathroom",
  "Hot Water",
  "Daily Housekeeping",
  "Parking",
  "24×7 Support",
  "Family Friendly",
  "CCTV Security",
];

export const REVIEWS = [
  {
    name: "Anitha R.",
    city: "Chennai",
    rating: 5,
    text: "Spotless rooms and genuinely warm hosts. Walking distance to the beach promenade.",
  },
  {
    name: "Vikram S.",
    city: "Bengaluru",
    rating: 5,
    text: "Booked directly and saved on commission. Check-in took two minutes.",
  },
  {
    name: "Fathima N.",
    city: "Kochi",
    rating: 4,
    text: "Great family suite. Kids loved the balcony, we loved the quiet street.",
  },
  {
    name: "Rahul M.",
    city: "Hyderabad",
    rating: 5,
    text: "Hot water at 5am, strong WiFi, safe parking. Exactly what we needed.",
  },
];

export const ATTRACTIONS = [
  {
    name: "Promenade Beach",
    distance: "1.2 km",
    note: "Sunrise walks along the rocky shoreline.",
  },
  {
    name: "French Quarter",
    distance: "1.8 km",
    note: "Mustard walls, bougainvillea and cafés.",
  },
  {
    name: "Sri Aurobindo Ashram",
    distance: "2.0 km",
    note: "A quiet landmark at the centre of town.",
  },
];

const deluxe = ROOM_IMAGES["deluxe"] ?? [];
const family = ROOM_IMAGES["family"] ?? [];
const common = ROOM_IMAGES["common"] ?? [];

export const GALLERY = [
  { src: propertyPhotos.exterior, label: "Street view" },
  { src: propertyPhotos.facade, label: "Residency facade" },
  { src: propertyPhotos.sign, label: "Selvi Residency sign" },
  { src: deluxe[0]!, label: "Deluxe Double bedroom" },
  { src: family[0]!, label: "Family Room living area" },
  { src: family[1]!, label: "In-room kitchenette" },
  { src: deluxe[2]!, label: "Attached bathroom with geyser" },
  { src: common[0]!, label: "Staircase" },
  { src: deluxe[3]!, label: "Room entrance" },
];

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
