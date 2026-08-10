import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomStandard from "@/assets/room-standard.jpg";
import roomFamily from "@/assets/room-family.jpg";
import lobby from "@/assets/lobby.jpg";
import exterior from "@/assets/hero-exterior.jpg";
import frenchQuarter from "@/assets/nearby-french-quarter.jpg";
import beach from "@/assets/nearby-beach.jpg";

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
    name: "Room 101 · Standard Double",
    price: 1800,
    occupancy: 2,
    beds: "1 Double Bed",
    images: [roomDeluxe, roomStandard],
    amenities: ["AC", "Free WiFi", "TV", "Attached Bathroom", "Hot Water"],
    available: true,
    description:
      "A compact, spotless double room with everything a short stay needs.",
  },
  {
    id: "102",
    name: "Room 102 · Standard Twin",
    price: 1900,
    occupancy: 2,
    beds: "2 Single Beds",
    images: [roomStandard, roomDeluxe],
    amenities: ["AC", "Free WiFi", "TV", "Attached Bathroom", "Hot Water"],
    available: true,
    description: "Twin beds and a quiet street-facing window, ideal for friends.",
  },
  {
    id: "103",
    name: "Room 103 · Deluxe Double",
    price: 2200,
    occupancy: 3,
    beds: "1 Double + 1 Sofa Bed",
    images: [roomDeluxe, roomFamily],
    amenities: [
      "AC",
      "Free WiFi",
      "Smart TV",
      "Attached Bathroom",
      "Hot Water",
      "Work Desk",
    ],
    available: true,
    description: "Extra floor space, a work desk and a warm reading corner.",
  },
  {
    id: "201",
    name: "Room 201 · Deluxe Balcony",
    price: 2400,
    occupancy: 3,
    beds: "1 Queen Bed",
    images: [roomFamily, roomDeluxe],
    amenities: ["AC", "Free WiFi", "Smart TV", "Balcony", "Hot Water", "Mini Fridge"],
    available: false,
    description: "Private balcony overlooking the palm-lined lane below.",
  },
  {
    id: "202",
    name: "Room 202 · Family Suite",
    price: 3200,
    occupancy: 4,
    beds: "1 Double + 2 Single Beds",
    images: [roomFamily, roomStandard],
    amenities: [
      "AC",
      "Free WiFi",
      "Smart TV",
      "Attached Bathroom",
      "Hot Water",
      "Mini Fridge",
    ],
    available: true,
    description: "Our largest room, built for families travelling with children.",
  },
  {
    id: "203",
    name: "Room 203 · Family Deluxe",
    price: 3500,
    occupancy: 5,
    beds: "2 Double Beds",
    images: [roomFamily, lobby],
    amenities: [
      "AC",
      "Free WiFi",
      "Smart TV",
      "Balcony",
      "Hot Water",
      "Mini Fridge",
      "Extra Bed",
    ],
    available: true,
    description: "Top-floor suite with two double beds and a sunlit balcony.",
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
    image: beach,
    note: "Sunrise walks along the rocky shoreline.",
  },
  {
    name: "French Quarter",
    distance: "1.8 km",
    image: frenchQuarter,
    note: "Mustard walls, bougainvillea and cafés.",
  },
  {
    name: "Sri Aurobindo Ashram",
    distance: "2.0 km",
    image: lobby,
    note: "A quiet landmark at the centre of town.",
  },
];

export const GALLERY = [
  { src: exterior, label: "Exterior" },
  { src: lobby, label: "Reception" },
  { src: roomDeluxe, label: "Deluxe Room" },
  { src: roomStandard, label: "Standard Twin" },
  { src: roomFamily, label: "Family Suite" },
  { src: frenchQuarter, label: "French Quarter" },
  { src: beach, label: "Promenade Beach" },
];

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
