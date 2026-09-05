import img9159 from "@/assets/0X2A9159.jpeg.asset.json";
import img9161 from "@/assets/0X2A9161.jpeg.asset.json";
import img9165 from "@/assets/0X2A9165.jpeg.asset.json";
import img9166 from "@/assets/0X2A9166.jpeg.asset.json";
import img9169 from "@/assets/0X2A9169.jpeg.asset.json";
import img9172 from "@/assets/0X2A9172.jpeg.asset.json";
import img9174 from "@/assets/0X2A9174.jpeg.asset.json";
import img9175 from "@/assets/0X2A9175.jpeg.asset.json";
import img9178 from "@/assets/0X2A9178.jpeg.asset.json";
import img9187 from "@/assets/0X2A9187.jpeg.asset.json";

export const ROOM_IMAGES: Record<string, string[]> = {
  // Room 101 · Deluxe Double — bedroom, dressing corner, bathroom, entrance
  deluxe: [img9175.url, img9178.url, img9187.url, img9165.url],
  // Room 102 · Family Room — living area, kitchenette, corridor
  family: [img9172.url, img9159.url, img9161.url, img9174.url],
  // Common areas — staircase
  common: [img9166.url, img9169.url],
};

export const roomImages = (key: string): string[] =>
  ROOM_IMAGES[key] ?? ROOM_IMAGES["common"] ?? [];
