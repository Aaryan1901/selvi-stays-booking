import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomStandard from "@/assets/room-standard.jpg";
import roomFamily from "@/assets/room-family.jpg";
import lobby from "@/assets/lobby.jpg";

export const ROOM_IMAGES: Record<string, string[]> = {
  standard: [roomStandard, roomDeluxe],
  deluxe: [roomDeluxe, roomFamily],
  family: [roomFamily, lobby],
};

export const roomImages = (key: string) => ROOM_IMAGES[key] ?? ROOM_IMAGES["deluxe"]!;
