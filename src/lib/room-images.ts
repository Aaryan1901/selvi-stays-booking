import selviExterior from "@/assets/selvi-exterior-street.jpeg.asset.json";
import selviSign from "@/assets/selvi-sign.jpeg.asset.json";
import selviFacade from "@/assets/selvi-facade.jpeg.asset.json";

export const ROOM_IMAGES: Record<string, string[]> = {
  standard: [selviExterior.url, selviFacade.url],
  deluxe: [selviFacade.url, selviExterior.url],
  family: [selviFacade.url, selviSign.url],
};

export const roomImages = (key: string) => ROOM_IMAGES[key] ?? ROOM_IMAGES.deluxe;
