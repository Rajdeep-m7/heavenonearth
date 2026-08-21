export type TrendingTab = "international" | "india";

export type TrendingDestination = {
  slug: string;
  name: string;
  /** Matches the mixed lettering treatment in the design. */
  style: "caps" | "italic" | "title";
  image: string;
  alt: string;
};

/** "Trending Destinations" — the arch-card carousel and its two tabs. */
export const trendingDestinations: Record<TrendingTab, TrendingDestination[]> = {
  international: [
    {
      slug: "europe",
      name: "Europe",
      style: "caps",
      image: "/images/trend-europe.jpg",
      alt: "Hot air balloons drifting over a turquoise Mediterranean coastline at sunrise",
    },
    {
      slug: "australia",
      name: "Australia",
      style: "italic",
      image: "/images/trend-australia.jpg",
      alt: "Sydney Opera House and Harbour Bridge seen across the harbour on a clear day",
    },
    {
      slug: "japan",
      name: "Japan",
      style: "caps",
      image: "/images/trend-japan.jpg",
      alt: "A red pagoda framed by cherry blossom with Mount Fuji rising behind it",
    },
    {
      slug: "vietnam",
      name: "Vietnam",
      style: "title",
      image: "/images/trend-vietnam.jpg",
      alt: "Tran Quoc Pagoda rising above palm trees beside a lake in Hanoi, Vietnam",
    },
  ],
  india: [
    {
      slug: "darjeeling",
      name: "Darjeeling",
      style: "title",
      image: "/images/region-darjeeling.jpg",
      alt: "The Darjeeling toy train curving through tea slopes below the hill town",
    },
    {
      slug: "sikkim",
      name: "Sikkim",
      style: "caps",
      image: "/images/region-sikkim.jpg",
      alt: "Prayer flags strung above a green Sikkim valley beneath snow peaks",
    },
    {
      slug: "dooars",
      name: "Dooars",
      style: "italic",
      image: "/images/region-dooars.jpg",
      alt: "Sunrise mist over a forest river in the Dooars wildlife belt",
    },
    {
      slug: "kalimpong",
      name: "Kalimpong",
      style: "title",
      image: "/images/journey-sikkim-mountain.jpg",
      alt: "A mountain highway curving through rhododendron slopes near Kalimpong",
    },
  ],
};
