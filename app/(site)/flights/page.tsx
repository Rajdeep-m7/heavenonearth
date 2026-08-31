import type { Metadata } from "next";

import { ServicePage } from "@/components/services/ServicePage";

export const metadata: Metadata = {
  title: "Flight Booking Assistance",
  description:
    "Flights to Bagdogra and beyond, arranged around your itinerary — fares, timings and connections handled by our team, not a booking engine.",
  alternates: { canonical: "/flights" },
};

export default function FlightsPage() {
  return (
    <ServicePage
      content={{
        service: "flight",
        eyebrow: "Getting Here",
        title: "Flights, Arranged Around Your Trip",
        intro:
          "Bagdogra (IXB) is the gateway to Darjeeling, Sikkim and the Dooars. We help you find the right flight — and the right onward connection — rather than leaving you to figure it out alone.",
        points: [
          "Fare and timing options from your home city into Bagdogra, Kolkata, or Delhi",
          "Connections timed to line up with your ground transfer, not against it",
          "Group and family bookings coordinated on the same PNR where possible",
          "Honest advice on which route actually saves you time in the hills",
        ],
        note:
          "We don't run a live fare search on this site — airline pricing changes by the hour. Message us your travel dates and we'll come back with real options, usually within a few hours.",
      }}
    />
  );
}
