import type { Metadata } from "next";

import { ServicePage } from "@/components/services/ServicePage";

export const metadata: Metadata = {
  title: "Train Ticket Booking Assistance",
  description:
    "Train travel to and from New Jalpaiguri (NJP), arranged with the right class and connections for your onward journey into the hills.",
  alternates: { canonical: "/trains" },
};

export default function TrainsPage() {
  return (
    <ServicePage
      content={{
        service: "train",
        eyebrow: "Getting Here",
        title: "Train Travel, Sorted End to End",
        intro:
          "New Jalpaiguri (NJP) is the rail gateway to the Eastern Himalayas. We help with class selection, tatkal timing, and making sure your onward car or homestay is waiting when you arrive.",
        points: [
          "Class and route guidance for the journey into NJP from your city",
          "Tatkal and premium-tatkal timing help when regular booking windows have closed",
          "Group bookings coordinated so your party travels together",
          "A car arranged to meet you at the station, so there's no scramble on arrival",
        ],
        note:
          "Popular routes into NJP fill up weeks ahead in peak season (Oct–Dec, Mar–May). The earlier you reach out, the more class and timing options we can find you.",
      }}
    />
  );
}
