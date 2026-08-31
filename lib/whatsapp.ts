import { siteConfig } from "@/lib/site";

/**
 * Every "Book" / "Enquire" action on the site is a wa.me link, not a form
 * submission. Nothing is booked, paid, or stored here — the message is built
 * client- or server-side and the conversation happens entirely in WhatsApp.
 * See docs/06-stays-cars-bookings.md for why.
 */
export function whatsappLink(message: string): string {
  const phone = siteConfig.phone.replace(/\D/g, ""); // wa.me wants digits only
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const whatsappForPackage = (title: string, url: string) =>
  whatsappLink(
    `Hi! I'm interested in the "${title}" package (${url}). Could you share more details?`,
  );

export const whatsappForRoom = (stayName: string, roomName: string, url: string) =>
  whatsappLink(`Hi! I'd like to ask about the ${roomName} at ${stayName} (${url}).`);

export const whatsappForStay = (stayName: string, url: string) =>
  whatsappLink(`Hi! I'm interested in staying at ${stayName} (${url}).`);

export const whatsappForService = (service: "flight" | "car" | "train") =>
  whatsappLink(`Hi! I'd like help arranging a ${service}.`);

export const whatsappGeneral = () =>
  whatsappLink("Hi! I'd like help planning a trip.");
