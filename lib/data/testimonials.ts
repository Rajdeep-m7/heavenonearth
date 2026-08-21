export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  trip: string;
  /** Human-facing label shown on the card. */
  date: string;
  /** ISO date consumed by the Review structured data. */
  datePublished: string;
  rating: 5;
  avatar: string;
};

/** "Stories From The Road" — the testimonial rail. */
export const testimonials: Testimonial[] = [
  {
    id: "marcus-t",
    quote:
      "An authentic glimpse into Himalayan life. The homestays were the highlight of the whole trip.",
    author: "Marcus T.",
    trip: "Sikkim Explorer",
    date: "Nov 2023",
    datePublished: "2023-11-18",
    rating: 5,
    avatar: "/images/avatar-review.jpg",
  },
  {
    id: "priya-s",
    quote:
      "Every transfer, every meal, every viewpoint was thought through. We simply travelled.",
    author: "Priya S.",
    trip: "Darjeeling Tea Escape",
    date: "Mar 2024",
    datePublished: "2024-03-09",
    rating: 5,
    avatar: "/images/avatar-1.jpg",
  },
  {
    id: "daniel-k",
    quote:
      "Our guide grew up in the valley. That local knowledge changed the entire journey for us.",
    author: "Daniel K.",
    trip: "Dooars Wildlife Trail",
    date: "Jan 2024",
    datePublished: "2024-01-27",
    rating: 5,
    avatar: "/images/avatar-2.jpg",
  },
  {
    id: "aisha-r",
    quote:
      "Unhurried, personal and beautifully paced. Exactly the mountain break we needed.",
    author: "Aisha R.",
    trip: "Kalimpong Slow Travel",
    date: "Apr 2024",
    datePublished: "2024-04-14",
    rating: 5,
    avatar: "/images/avatar-3.jpg",
  },
];
