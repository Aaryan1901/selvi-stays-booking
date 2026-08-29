// Interior photos will be added when the room images are available.
export const ROOM_IMAGES: Record<string, string[]> = {};

export const roomImages = (key: string): string[] =>
  ROOM_IMAGES[key] ?? ROOM_IMAGES["deluxe"] ?? [];
