export type Journey = {
  slug: string;
  title: string;
  /** The design breaks the title across three lines. */
  titleLines: string[];
  quote: string;
  duration: string;
  days: number;
  nights: number;
  priceFrom: number;
  currency: "INR";
  inclusions: string[];
  image: string;
  alt: string;
  badge: string;
  badgeTone: "light" | "gold";
  cardTone: "white" | "ice";
  region: string;
};

/** "Journeys Made For You" — the two featured packages. */
export const journeys: Journey[] = [
  {
    slug: "darjeeling-tea-and-mountain-escape",
    title: "Darjeeling Tea & Mountain Escape",
    titleLines: ["Darjeeling Tea", "& Mountain", "Escape"],
    quote: "Tea gardens, misty mornings and unforgettable Himalayan views.",
    duration: "4 Days / 3 Nights",
    days: 4,
    nights: 3,
    priceFrom: 12999,
    currency: "INR",
    inclusions: ["Stay", "Breakfast", "Local Transfers"],
    image: "/images/journey-darjeeling-tea.jpg",
    alt: "Layered tea gardens above a misty river valley with the Himalaya beyond",
    badge: "Best Seller",
    badgeTone: "light",
    cardTone: "white",
    region: "Darjeeling, West Bengal",
  },
  {
    slug: "sikkim-mountain-journey",
    title: "Sikkim Mountain Journey",
    titleLines: ["Sikkim", "Mountain", "Journey"],
    quote:
      "Journey through high altitude lakes, ancient monasteries, and vibrant alpine valleys.",
    duration: "6 Days / 5 Nights",
    days: 6,
    nights: 5,
    priceFrom: 24500,
    currency: "INR",
    inclusions: ["Stay", "All Meals", "Guided Tours"],
    image: "/images/journey-sikkim-mountain.jpg",
    alt: "A vehicle on a hairpin mountain road through rhododendron blooms in Sikkim",
    badge: "New Journey",
    badgeTone: "gold",
    cardTone: "ice",
    region: "Sikkim, India",
  },
];
