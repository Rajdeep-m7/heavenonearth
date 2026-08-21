export type Region = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  alt: string;
  badge?: string;
};

/** "Start Close. Go Far." — the nearby regions rail. */
export const regions: Region[] = [
  {
    slug: "darjeeling",
    name: "Darjeeling",
    blurb:
      "The Queen of the Hills. Experience world-class tea estates, heritage toy-train rides and sunrise over Kanchenjunga.",
    image: "/images/region-darjeeling.jpg",
    alt: "The Darjeeling Himalayan toy train winding past hill houses and tea slopes in the mist",
    badge: "Popular",
  },
  {
    slug: "sikkim",
    name: "Sikkim",
    blurb:
      "Mystical monasteries, alpine lakes, and dramatic mountain passes await in this quietly spectacular Himalayan state.",
    image: "/images/region-sikkim.jpg",
    alt: "Prayer flags above a Sikkim valley with snow-capped Himalayan peaks in the distance",
  },
  {
    slug: "dooars",
    name: "Dooars",
    blurb:
      "Gateway to Bhutan. A paradise for wildlife enthusiasts, featuring dense sal forests, tea belts and river beds.",
    image: "/images/region-dooars.jpg",
    alt: "Golden morning light over a forest river in the Dooars with wildlife on the bank",
  },
];
