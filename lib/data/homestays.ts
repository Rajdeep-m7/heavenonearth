export type Homestay = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
  alt: string;
  location: string;
};

/** "Stay Like You Belong Here" — the homestay rail. */
export const homestays: Homestay[] = [
  {
    slug: "glenburn-tea-estate",
    name: "Glenburn Tea Estate",
    blurb:
      "A colonial-era planter's bungalow surrounded by rolling tea gardens.",
    image: "/images/stay-glenburn.jpg",
    alt: "A heritage planter's bungalow with a flowering porch set among Darjeeling tea gardens",
    location: "Darjeeling, West Bengal",
  },
  {
    slug: "kesarey-tea-bungalow",
    name: "Kesarey Tea Bungalow",
    blurb:
      "A restored garden bungalow with wraparound verandas and first-flush mornings.",
    image: "/images/stay-glenburn.jpg",
    alt: "A restored tea-garden bungalow with a stone path and blooming borders",
    location: "Kurseong, West Bengal",
  },
  {
    slug: "yangsum-heritage-farm",
    name: "Yangsum Heritage Farm",
    blurb: "A rustic, organic farm run by a local family in West Sikkim.",
    image: "/images/stay-yangsum.jpg",
    alt: "A traditional carved timber farmhouse with prayer flags below snow peaks in West Sikkim",
    location: "Rinchenpong, West Sikkim",
  },
];
