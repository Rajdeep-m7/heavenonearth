import type { Metadata } from "next";

import { ServicePage } from "@/components/services/ServicePage";

export const metadata: Metadata = {
  title: "Private Car & Transfer Booking",
  description:
    "Private cars and drivers across Darjeeling, Sikkim and the Dooars — airport transfers, point-to-point hire, and multi-day journeys arranged directly, no fleet checkout.",
  alternates: { canonical: "/cars" },
};

export default function CarsPage() {
  return (
    <ServicePage
      content={{
        service: "car",
        eyebrow: "Getting Around",
        title: "Private Cars, Wherever the Road Goes",
        intro:
          "Hill roads reward a driver who knows them. We arrange private cars and drivers for airport pickups, point-to-point transfers, and multi-day journeys across Darjeeling, Sikkim, Kalimpong and the Dooars.",
        points: [
          "Airport and station pickups timed to your actual flight or train, not a fixed slot",
          "Point-to-point transfers between towns, tea estates and homestays",
          "Multi-day hire with a driver who knows the routes, permits, and rest stops",
          "Sedans, SUVs and larger vehicles depending on your group size",
        ],
        note:
          "Sikkim requires inner-line permits for several routes — our drivers handle the paperwork, so you're not sorting it out at a checkpoint.",
      }}
    />
  );
}
