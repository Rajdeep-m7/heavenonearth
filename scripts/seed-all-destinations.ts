/**
 * Comprehensive Seeder for Real International and Domestic Packages.
 * Upserts all categories and curated journey packages with realistic pricing,
 * detailed day-by-day itineraries, verified high-resolution images, and full inclusions.
 *
 * Run with: npx tsx scripts/seed-all-destinations.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import mongoose from "mongoose";
import { Category } from "../lib/db/models/Category";
import { Package } from "../lib/db/models/Package";
import { Trending } from "../lib/db/models/Trending";

const img = (photoId: string, alt: string) => {
  const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=1200`;
  return {
    publicId: url,
    url,
    width: 1200,
    height: 800,
    alt,
  };
};

type SeedItem = {
  category: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    photoId: string;
    isInternational?: boolean;
  };
  pkg: {
    title: string;
    slug: string;
    destination: string;
    summary: string;
    description: string;
    days: number;
    nights: number;
    priceFrom: number;
    badge: "bestSeller" | "newJourney" | "none";
    isFeatured?: boolean;
    inclusions: string[];
    exclusions: string[];
    itinerary: { day: number; title: string; detail: string }[];
    coverPhotoId: string;
    galleryPhotoIds: string[];
  };
};

const DESTINATIONS: SeedItem[] = [
  /* ========================================================================== */
  /* 1. INTERNATIONAL DESTINATIONS                                              */
  /* ========================================================================== */
  {
    category: {
      name: "Thailand",
      slug: "thailand",
      tagline: "Golden temples, buzzing night markets, and turquoise island escapes.",
      description: "From the majestic Grand Palace in Bangkok to the idyllic beaches of the Andaman Sea, experience the warm hospitality and vibrant flavors of the Land of Smiles.",
      photoId: "photo-1552465011-b4e21bf6e79a",
      isInternational: true,
    },
    pkg: {
      title: "Exotic Thailand & Coral Islands Getaway",
      slug: "exotic-thailand-coral-islands-getaway",
      destination: "Bangkok & Pattaya, Thailand",
      summary: "Marvel at ancient Buddhist stupas, cruise along Chao Phraya, and speed across azure waters to Coral Island on an unforgettable Thai escapade.",
      description: "Discover the best of Thailand across 5 exhilarating days. Tour Bangkok's sacred Wat Pho and Wat Arun, dive into Pattaya's nightlife, and relax on the pristine white sands of Koh Larn.",
      days: 5,
      nights: 4,
      priceFrom: 28999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["4-Star Hotel Accommodation", "Daily Buffet Breakfast", "Coral Island Speedboat Tour with Lunch", "Bangkok City & Temple Tour", "Private Airport Transfers", "English-speaking Local Guide"],
      exclusions: ["International Flights", "Thailand Visa on Arrival", "Personal Expenses & Water Sports", "Travel Insurance"],
      itinerary: [
        { day: 1, title: "Sawasdee Thailand & Transfer to Pattaya", detail: "Arrive at Suvarnabhumi Airport, meet your private chauffeur, and transfer to Pattaya. Enjoy an evening at leisure exploring the vibrant beach promenade." },
        { day: 2, title: "Coral Island Speedboat Adventure", detail: "Board a speedboat to Koh Larn. Indulge in parasailing, sea walking, or lounge under palm trees followed by a delicious seafood lunch." },
        { day: 3, title: "Transfer to Bangkok & Chao Phraya Cruise", detail: "Scenic drive back to Bangkok. Check into your hotel and embark on a starlit dinner cruise on the Chao Phraya River." },
        { day: 4, title: "Grand Palace & Ancient Temples", detail: "Visit the Reclining Buddha at Wat Pho, the dawn temple Wat Arun, and spend the afternoon souvenir hunting at ICONSIAM." },
        { day: 5, title: "Farewell Thailand", detail: "Enjoy a morning Thai breakfast before your private transfer to Bangkok airport for your flight home." }
      ],
      coverPhotoId: "photo-1552465011-b4e21bf6e79a",
      galleryPhotoIds: ["photo-1506665531195-3566af2b4dfa", "photo-1528181304800-259b08848526", "photo-1554092917-15b3e3f9e85a"]
    }
  },
  {
    category: {
      name: "Vietnam",
      slug: "vietnam",
      tagline: "Limestone karsts, emerald waters, and lanterns along ancient rivers.",
      description: "A country of breathtaking natural beauty and deep cultural heritage, spanning misty emerald bays in the north to lantern-lit trading towns in the center.",
      photoId: "photo-1528127269322-539801943592",
      isInternational: true,
    },
    pkg: {
      title: "Splendours of Vietnam: Hanoi to Ha Long Bay",
      slug: "splendours-of-vietnam-hanoi-halong-bay",
      destination: "Hanoi & Ha Long Bay, Vietnam",
      summary: "Sail through thousands of limestone pinnacles on an overnight luxury cruise and explore the historic French colonial quarters of Hanoi.",
      description: "Experience the magic of Northern Vietnam with a cruise through UNESCO-protected Ha Long Bay, kayaking through hidden lagoons, and tasting authentic street pho in Hanoi's Old Quarter.",
      days: 5,
      nights: 4,
      priceFrom: 34999,
      badge: "newJourney",
      isFeatured: true,
      inclusions: ["4-Star Hotel in Hanoi", "Luxury Overnight Cruise in Ha Long Bay", "All Meals on Cruise", "Hanoi Street Food Walking Tour", "Roundtrip AC Coach Transfers", "English-speaking Tour Escort"],
      exclusions: ["International Airfare", "Vietnam e-Visa Fees", "Beverages & Gratuities", "Optional Kayak Rental"],
      itinerary: [
        { day: 1, title: "Arrival in Charming Hanoi", detail: "Arrive at Noi Bai International Airport and transfer to your boutique hotel. Stroll around Hoan Kiem Lake and witness the famous Water Puppet Show." },
        { day: 2, title: "Hanoi Heritage & Night Food Trail", detail: "Tour the Temple of Literature, Ho Chi Minh Mausoleum, and enjoy an evening tasting egg coffee, bun cha, and fresh spring rolls." },
        { day: 3, title: "Boarding the Ha Long Bay Luxury Cruise", detail: "Drive to Ha Long Bay. Check into your sea-view cabin, cruise past fighting cock islets, and explore Sung Sot Cave." },
        { day: 4, title: "Dawn Tai Chi & Return to Hanoi", detail: "Practice morning Tai Chi on deck as the sun rises over limestone karsts. Brunch while sailing back to the port, followed by transfer to Hanoi." },
        { day: 5, title: "Departure", detail: "Leisure morning for shopping silk and coffee beans before transferring to Hanoi airport for departure." }
      ],
      coverPhotoId: "photo-1528127269322-539801943592",
      galleryPhotoIds: ["photo-1559592413-7cec4d0cae2b", "photo-1509042239860-f550ce710b93", "photo-1554092917-15b3e3f9e85a"]
    }
  },
  {
    category: {
      name: "Phuket",
      slug: "phuket",
      tagline: "Crystal waters, limestone sea cliffs, and tranquil tropical bays.",
      description: "Thailand’s premier island wonderland offering powder-white beaches, secluded coral lagoons, and world-class luxury resorts.",
      photoId: "photo-1589394815804-964ed0be2eb5",
      isInternational: true,
    },
    pkg: {
      title: "Phuket Tropical Paradise & Phi Phi Islands",
      slug: "phuket-tropical-paradise-phi-phi-islands",
      destination: "Phuket & Phi Phi, Thailand",
      summary: "Snorkel in turquoise lagoons, sail to Maya Bay, and watch the sun melt into the Andaman Sea from Promthep Cape.",
      description: "Escape to paradise with an unforgettable 4-day island tour. Experience speedboating around Phi Phi Don, Maya Bay, and Monkey Beach, followed by cultural sights like the Big Buddha.",
      days: 4,
      nights: 3,
      priceFrom: 24500,
      badge: "bestSeller",
      inclusions: ["Beachfront Resort Stay", "Phi Phi & Maya Bay Speedboat Tour", "Phuket Viewpoint & City Tour", "Daily Breakfast & Island Lunch", "Roundtrip Airport Transfers"],
      exclusions: ["National Park Entry Fees", "Flight Tickets", "Water Sports Fees", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Welcome to Phuket Island", detail: "Private transfer from Phuket Airport to your coastal resort. Unwind on the beach and enjoy an authentic Thai dinner." },
        { day: 2, title: "Full-day Phi Phi & Maya Bay Speedboat Tour", detail: "Speed through crystal waters to Maya Bay (The Beach fame), snorkel amidst vibrant coral reefs, and visit Viking Cave." },
        { day: 3, title: "Big Buddha & Old Phuket Town", detail: "Ascend to the hilltop Big Buddha for 360-degree views, marvel at Wat Chalong, and walk through Sino-Portuguese streets in Old Phuket." },
        { day: 4, title: "Departure", detail: "Savor a leisurely breakfast by the pool before checking out and transferring to Phuket Airport." }
      ],
      coverPhotoId: "photo-1589394815804-964ed0be2eb5",
      galleryPhotoIds: ["photo-1537956965359-7573183d1f57", "photo-1554092917-15b3e3f9e85a", "photo-1552465011-b4e21bf6e79a"]
    }
  },
  {
    category: {
      name: "Sri Lanka",
      slug: "sri-lanka",
      tagline: "Rolling tea hills, ancient rock fortresses, and golden ocean shores.",
      description: "The pearl of the Indian Ocean, blessed with UNESCO heritage ruins, misty high-country tea plantations, and thrilling wildlife safaris.",
      photoId: "photo-1586861635167-e5223aadc9fe",
      isInternational: true,
    },
    pkg: {
      title: "Wonders of Ceylon: Kandy, Nuwara Eliya & Bentota",
      slug: "wonders-of-ceylon-kandy-nuwara-eliya-bentota",
      destination: "Kandy, Nuwara Eliya & Bentota, Sri Lanka",
      summary: "Climb the ancient fortress of Sigiriya, sip Ceylon tea in misty Nuwara Eliya, and relax on the golden coast of Bentota.",
      description: "A breathtaking loop across Sri Lanka. Witness the sacred Temple of the Tooth in Kandy, travel past cascading waterfalls into high tea estates, and unwind along the southwestern beaches.",
      days: 6,
      nights: 5,
      priceFrom: 32999,
      badge: "bestSeller",
      inclusions: ["4-Star Hotels with Breakfast", "Private AC Vehicle with Chauffeur Guide", "Pinnawala Elephant Sanctuary Visit", "Tea Factory Tour & Tasting", "Madu River Boat Safari", "All Sightseeing Permits"],
      exclusions: ["Airfare", "Sri Lanka ETA Visa", "Camera & Video Permits", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Colombo to Cultural Kandy", detail: "Arrive at Bandaranaike Airport. Stop by Pinnawala Elephant Orphanage en route to Kandy. Evening visit to the sacred Temple of the Sacred Tooth Relic." },
        { day: 2, title: "Sigiriya Rock Fortress", detail: "Ascend the world-renowned 5th-century Sigiriya Lion Rock Fortress and admire the royal gardens and ancient frescoes." },
        { day: 3, title: "Scenic Drive to Little England (Nuwara Eliya)", detail: "Drive through emerald tea country. Tour an authentic Ceylon tea plantation and marvel at Ramboda Falls." },
        { day: 4, title: "Down to the Bentota Coast", detail: "Descend to the sunny coastal retreat of Bentota. Enjoy a boat safari along the mangrove-lined Madu Ganga river." },
        { day: 5, title: "Galle Fort Exploration", detail: "Day excursion to the historic 17th-century Dutch Galle Fort, followed by beach relaxation in Bentota." },
        { day: 6, title: "Colombo City & Departure", detail: "Brief panoramic city tour of Colombo (Independence Square, Galle Face Green) before airport drop-off." }
      ],
      coverPhotoId: "photo-1586861635167-e5223aadc9fe",
      galleryPhotoIds: ["photo-1612862862126-865765df2ded", "photo-1578328819058-b69f3a3b0f6b", "photo-1554092917-15b3e3f9e85a"]
    }
  },
  {
    category: {
      name: "UAE",
      slug: "uae",
      tagline: "Futuristic architecture, royal palaces, and desert dunes.",
      description: "A land of boundless ambition, blending traditional Bedouin heritage with dazzling modern wonders across seven magnificent emirates.",
      photoId: "photo-1512453979798-5ea266f8880c",
      isInternational: true,
    },
    pkg: {
      title: "Grand UAE Experience: Dubai & Abu Dhabi",
      slug: "grand-uae-experience-dubai-abu-dhabi",
      destination: "Dubai & Abu Dhabi, UAE",
      summary: "Experience the glittering towers of Dubai alongside the regal splendor of the Sheikh Zayed Grand Mosque in Abu Dhabi.",
      description: "Immerse yourself in Emirati grandeur with a comprehensive dual-city itinerary. Includes the Burj Khalifa observatory, an adrenaline-pumping desert dune bash, and Abu Dhabi cultural landmarks.",
      days: 6,
      nights: 5,
      priceFrom: 46999,
      badge: "newJourney",
      inclusions: ["4-Star City Hotel Stay", "Burj Khalifa 124th Floor Entry", "Desert Safari with BBQ Dinner & Tanoura Show", "Full-day Abu Dhabi City Tour with Grand Mosque", "Marina Dhow Dinner Cruise", "Airport Transfers"],
      exclusions: ["UAE Tourist Visa", "Tourism Dirham Fee at Hotel", "International Airfare", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Welcome to Dubai", detail: "Arrive at Dubai International Airport. Meet and transfer to your hotel. Evening Marina Dhow Cruise with international buffet dinner." },
        { day: 2, title: "Dubai City Tour & Burj Khalifa", detail: "Half-day city tour covering Dubai Creek, Jumeirah Mosque, and Atlantis. Afternoon visit to Dubai Mall and 124th floor of Burj Khalifa." },
        { day: 3, title: "Desert Safari Extravaganza", detail: "Morning at leisure. Afternoon 4x4 dune bashing adventure in red desert dunes, followed by camel ride, shisha, and starlit BBQ dinner." },
        { day: 4, title: "Day Tour to Abu Dhabi", detail: "Scenic coastal drive to Abu Dhabi. Marvel at the majestic Sheikh Zayed Grand Mosque, drive along the Corniche, and glimpse Emirates Palace." },
        { day: 5, title: "Miracle Garden & Global Village", detail: "Explore the floral wonder of Dubai Miracle Garden and spend the evening enjoying cultural pavilions and street eats at Global Village." },
        { day: 6, title: "Departure", detail: "Last-minute duty-free shopping before your private transfer to Dubai International Airport." }
      ],
      coverPhotoId: "photo-1512453979798-5ea266f8880c",
      galleryPhotoIds: ["photo-1518684079-3c830dcef090", "photo-1546412414-e1885259563a", "photo-1580674684081-7617fbf3d745"]
    }
  },
  {
    category: {
      name: "Dubai",
      slug: "dubai",
      tagline: "The world's most glamorous skyline, luxury shopping, and golden sands.",
      description: "A dazzling metropolis where modern architectural marvels rise straight from Arabian desert sands alongside premier luxury experiences.",
      photoId: "photo-1580674684081-7617fbf3d745",
      isInternational: true,
    },
    pkg: {
      title: "Glitz & Glamour of Dubai",
      slug: "glitz-and-glamour-of-dubai",
      destination: "Dubai, United Arab Emirates",
      summary: "Ascend the world's tallest tower, race across desert dunes in a 4x4, and cruise past illuminated skyscrapers along Dubai Marina.",
      description: "Our signature 5-day Dubai holiday is crafted for travelers seeking iconic landmarks, premier dining, and authentic desert culture.",
      days: 5,
      nights: 4,
      priceFrom: 38999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["4-Star Downtown Hotel", "Burj Khalifa At The Top Ticket", "Desert Safari with 4x4 Dune Bashing & BBQ", "Dubai Marina Luxury Dhow Cruise", "Roundtrip Private Airport Transfers"],
      exclusions: ["Flight Tickets", "UAE Visa Fees", "Tourism Dirham Hotel Tax", "Personal Gratuities"],
      itinerary: [
        { day: 1, title: "Arrival in Futuristic Dubai", detail: "Arrival at DXB Airport, private transfer to hotel. Relax before an enchanting evening Marina Dhow cruise with Tanoura show." },
        { day: 2, title: "Iconic City Tour & Burj Khalifa", detail: "Panoramic drive past Burj Al Arab and Palm Jumeirah. Ascend to Burj Khalifa's 124th floor observation deck followed by the Dubai Fountain show." },
        { day: 3, title: "Gold Souk & Thrilling Desert Safari", detail: "Morning visit to traditional Deira Gold & Spice Souks. Afternoon desert safari featuring dune bashing, sandboarding, and Bedouin camp dinner." },
        { day: 4, title: "Dubai Frame & Shopping Spree", detail: "Walk the glass bridge of Dubai Frame and indulge in retail therapy across world-class malls." },
        { day: 5, title: "Farewell Dubai", detail: "Transfer to DXB Airport for departure with cherished memories of the Emirates." }
      ],
      coverPhotoId: "photo-1580674684081-7617fbf3d745",
      galleryPhotoIds: ["photo-1526478806334-5fd488fcaabc", "photo-1512453979798-5ea266f8880c", "photo-1546412414-e1885259563a"]
    }
  },
  {
    category: {
      name: "Nepal",
      slug: "nepal",
      tagline: "Roof of the world, ancient medieval shrines, and tranquil lakes.",
      description: "Home to the mighty Himalayas and eight of the world's highest peaks, Nepal offers sacred pagoda temples, river valleys, and panoramic alpine views.",
      photoId: "photo-1544735716-392fe2489ffa",
      isInternational: true,
    },
    pkg: {
      title: "Himalayan Highlights: Kathmandu & Pokhara",
      slug: "himalayan-highlights-kathmandu-pokhara",
      destination: "Kathmandu & Pokhara, Nepal",
      summary: "Gaze upon the Annapurna range reflected in Phewa Lake and explore UNESCO World Heritage shrines in the Kathmandu Valley.",
      description: "An awe-inspiring 6-day journey across the spiritual and natural treasures of Nepal. Highlights include Pashupatinath Temple, Boudhanath Stupa, Sarangkot sunrise, and boating on Pokhara's Phewa Lake.",
      days: 6,
      nights: 5,
      priceFrom: 23999,
      badge: "bestSeller",
      inclusions: ["3/4-Star Hotel Stays", "Daily Breakfast", "Private AC Vehicle for All Sightseeing", "Kathmandu Heritage Temple Tour", "Pokhara Boating & Sarangkot Sunrise Tour", "English/Hindi Speaking Driver Guide"],
      exclusions: ["Flights to Kathmandu", "Monument Entrance Fees", "Adventure Activities (Paragliding, Ultralight)", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival in Kathmandu Valley", detail: "Touch down at Tribhuvan International Airport, meet your representative, and check in. Evening visit to lively Thamel." },
        { day: 2, title: "Kathmandu UNESCO Heritage Trail", detail: "Tour sacred Pashupatinath on Bagmati river, the giant eyes of Boudhanath Stupa, and hilltop Swayambhunath (Monkey Temple)." },
        { day: 3, title: "Scenic Drive to Serene Pokhara", detail: "Drive along the Trishuli River to the valley of Pokhara. Check into your hotel and enjoy evening lakeside walks." },
        { day: 4, title: "Sarangkot Sunrise & Pokhara Wonders", detail: "Early morning drive to Sarangkot for sunrise over Annapurna and Dhaulagiri. Visit Davis Falls, Gupteshwor Cave, and boat on Phewa Lake." },
        { day: 5, title: "Return to Kathmandu & Bhaktapur", detail: "Drive back to Kathmandu. Stop at the ancient medieval town of Bhaktapur Durbar Square to admire intricately carved wood architecture." },
        { day: 6, title: "Departure", detail: "Transfer to Kathmandu Airport for your homeward journey." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1582650625119-3a31f8418399", "photo-1605640840605-14ac1855827b", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Bhutan",
      slug: "bhutan",
      tagline: "The last Shangri-La, cliffside monasteries, and pristine valleys.",
      description: "A kingdom where happiness is a national measure, Bhutan charms travelers with fortress dzongs, prayer-flagged passes, and untouched mountain landscapes.",
      photoId: "photo-1578637387939-43c525550085",
      isInternational: true,
    },
    pkg: {
      title: "Enchanting Bhutan: Thimphu, Punakha & Paro",
      slug: "enchanting-bhutan-thimphu-punakha-paro",
      destination: "Thimphu, Punakha & Paro, Bhutan",
      summary: "Hike to the legendary Tiger’s Nest monastery clinging to sheer granite cliffs and immerse yourself in the serene tranquility of the Thunder Dragon kingdom.",
      description: "Discover the spiritual heart of Bhutan across 6 memorable days. Cross the Dochula Pass with 108 memorial chortens, visit Punakha Dzong, and stand before the sacred cliffside Taktsang Monastery.",
      days: 6,
      nights: 5,
      priceFrom: 41999,
      badge: "newJourney",
      inclusions: ["3-Star Deluxe Hotel Accommodations", "All Meals (Breakfast, Lunch & Dinner)", "Bhutan Tourism Sustainable Development Fee (SDF)", "Private Transport with Driver & Licensed Guide", "Tiger's Nest Trek Assistance & Monument Fees"],
      exclusions: ["Flights to Paro", "Travel Insurance", "Personal Tips & Beverages", "Horse Ride at Tiger's Nest"],
      itinerary: [
        { day: 1, title: "Arrival in Paro & Drive to Thimphu", detail: "Land at the dramatic Paro Airport. Scenic drive along river valleys to capital city Thimphu. Visit Tashichho Dzong." },
        { day: 2, title: "Thimphu City Sights", detail: "Visit Buddha Dordenma (Giant Buddha), Memorial Chorten, the Motithang Takin Preserve, and traditional painting school." },
        { day: 3, title: "Dochula Pass to Punakha", detail: "Cross the 3,100m Dochula Pass offering panoramic snow-capped vistas. Visit the magnificent Punakha Dzong set between two rivers." },
        { day: 4, title: "Punakha to Valley of Paro", detail: "Return drive to Paro. Visit Ta Dzong (National Museum) and the historic Rinpung Dzong fortress." },
        { day: 5, title: "Trek to Iconic Tiger's Nest (Paro Taktsang)", detail: "Unforgettable morning hike up pine forests to Taktsang Monastery perched 900 meters above the valley floor." },
        { day: 6, title: "Departure from Paro", detail: "Transfer to Paro Airport for your departure flight with blessing memories of Bhutan." }
      ],
      coverPhotoId: "photo-1578637387939-43c525550085",
      galleryPhotoIds: ["photo-1567157577867-05ccb1388e66", "photo-1524492412937-b28074a5d7da", "photo-1544735716-392fe2489ffa"]
    }
  },

  /* ========================================================================== */
  /* 2. NATIONAL DESTINATIONS (INDIA)                                           */
  /* ========================================================================== */
  {
    category: {
      name: "Andaman",
      slug: "andaman",
      tagline: "Turquoise lagoons, pristine coral reefs, and untouched island beaches.",
      description: "An archipelago of tropical paradise in the Bay of Bengal, famous for Radhanagar Beach, scuba diving, and Cellular Jail heritage.",
      photoId: "photo-1544551763-46a013bb70d5",
    },
    pkg: {
      title: "Exotic Andaman & Havelock Island Odyssey",
      slug: "exotic-andaman-havelock-island-odyssey",
      destination: "Port Blair & Havelock Island, Andaman",
      summary: "Relax on Asia's best beach at Radhanagar, witness the historic Cellular Jail light & sound show, and explore vibrant coral reefs.",
      description: "Spend 5 days in coastal bliss across Port Blair and Havelock. Includes private catamaran cruise, Radhanagar sunset, and Elephant Beach waters.",
      days: 5,
      nights: 4,
      priceFrom: 22499,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["Beach Resort & City Hotels", "Daily Breakfast", "Inter-island Catamaran Tickets (Makruzz / Nautika)", "Cellular Jail Entry with Light & Sound Show", "Elephant Beach Speedboat with Snorkeling", "Private AC Cab Transfers"],
      exclusions: ["Airfare to Port Blair", "Water Sports (Scuba, Sea Walk)", "Personal Expenses & Tips"],
      itinerary: [
        { day: 1, title: "Arrival in Port Blair & Cellular Jail", detail: "Arrive at Port Blair. Check in and visit historic Cellular Jail followed by the stirring evening Light and Sound show." },
        { day: 2, title: "Cruise to Havelock Island & Radhanagar Sunset", detail: "Take a morning luxury ferry to Havelock Island. Afternoon relaxation and sunset photography at world-renowned Radhanagar Beach." },
        { day: 3, title: "Elephant Beach Coral & Water Adventure", detail: "Speedboat excursion to Elephant Beach. Complimentary snorkeling among live coral reefs and leisure on the sand." },
        { day: 4, title: "Return to Port Blair & Chidiya Tapu", detail: "Ferry back to Port Blair. Evening drive to Chidiya Tapu for its iconic sunset over the ocean horizon." },
        { day: 5, title: "Departure", detail: "Transfer to Port Blair airport with memories of emerald seas." }
      ],
      coverPhotoId: "photo-1544551763-46a013bb70d5",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1510414842594-a61c69b5ae57", "photo-1512343879784-a960bf40e7f2"]
    }
  },
  {
    category: {
      name: "Vizag",
      slug: "vizag",
      tagline: "Where the Eastern Ghats roll directly into the Bay of Bengal.",
      description: "The City of Destiny blends scenic coastal roads and hill viewpoints with submarine museums and the lush coffee hills of Araku Valley.",
      photoId: "photo-1609854534028-b512f5246abc",
    },
    pkg: {
      title: "Coastal Charm: Vizag & Araku Valley",
      slug: "coastal-charm-vizag-araku-valley",
      destination: "Visakhapatnam & Araku, Andhra Pradesh",
      summary: "Ride the scenic Vistadome train into misty Araku coffee hills, explore million-year-old Borra Caves, and relax by Rishikonda Beach.",
      description: "A wonderful 4-day journey combining Vizag's submarine museum, Kailasagiri hill park, Rishikonda coastline, and the forested slopes of Araku Valley.",
      days: 4,
      nights: 3,
      priceFrom: 12999,
      badge: "none",
      inclusions: ["Hotel Accommodation in Vizag & Araku", "Daily Breakfast", "Vistadome Train Experience to Araku", "Borra Caves Entry & Sightseeing", "Submarine Museum Entry", "Private AC Transport"],
      exclusions: ["Train/Air Tickets to Vizag", "Personal Expenses", "Camera Fees"],
      itinerary: [
        { day: 1, title: "Arrival in Vizag & Submarine Museum", detail: "Arrive in Vizag. Visit the INS Kursura Submarine Museum, TU 142 Aircraft Museum, and Ramakrishna Beach." },
        { day: 2, title: "Vistadome Train to Scenic Araku Valley", detail: "Scenic morning train through tunnels to Araku Valley. Tour Borra Caves, Chaparai water cascade, and coffee plantations." },
        { day: 3, title: "Tribal Museum & Return to Vizag", detail: "Visit the Araku Tribal Museum and Padmapuram Gardens. Scenic drive back to Vizag and evening visit to Rishikonda Beach." },
        { day: 4, title: "Kailasagiri & Departure", detail: "Take the ropeway to Kailasagiri hilltop park for coastal panoramas before airport or railway drop-off." }
      ],
      coverPhotoId: "photo-1609854534028-b512f5246abc",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Ooty",
      slug: "ooty",
      tagline: "Queen of Hill Stations set amidst rolling Nilgiri blue mountains.",
      description: "Famous for its emerald tea slopes, colonial bungalows, eucalyptus forests, and the UNESCO heritage Nilgiri Mountain Railway.",
      photoId: "photo-1589182373726-e4f658ab50f0",
    },
    pkg: {
      title: "Queen of the Hills: Ooty & Coonoor Escape",
      slug: "queen-of-the-hills-ooty-coonoor-escape",
      destination: "Ooty & Coonoor, Tamil Nadu",
      summary: "Ride the historic toy train across viaducts, stroll through fragrant botanical gardens, and look down over tea valleys from Doddabetta.",
      description: "A classic 4-day southern hill retreat taking in Ooty Lake, the Government Botanical Garden, Sim's Park, and Dolphin's Nose in Coonoor.",
      days: 4,
      nights: 3,
      priceFrom: 13999,
      badge: "bestSeller",
      inclusions: ["3-Star Hill Resort Accommodation", "Daily Breakfast", "Toy Train Ride (Subject to availability)", "Private Sightseeing Cab", "Doddabetta & Coonoor Sightseeing"],
      exclusions: ["Travel to Coimbatore/Ooty", "Boating & Entry Tickets", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival via Coimbatore & Welcome to Ooty", detail: "Pickup from Coimbatore railway/airport. Scenic drive up 36 hairpin bends to Ooty. Evening walk around Ooty Lake." },
        { day: 2, title: "Botanical Garden & Doddabetta Peak", detail: "Explore the sprawling 55-acre Botanical Gardens, Tea Factory & Museum, and ascend to Doddabetta Peak for sweeping valley views." },
        { day: 3, title: "Toy Train Ride & Coonoor Day Trip", detail: "Heritage toy train ride to Coonoor. Visit Sim's Park, Lamb's Rock, and Dolphin's Nose tea estate viewpoint." },
        { day: 4, title: "Pykara Lake & Departure", detail: "Morning visit to serene Pykara Lake and waterfalls before driving down to Coimbatore for your departure." }
      ],
      coverPhotoId: "photo-1589182373726-e4f658ab50f0",
      galleryPhotoIds: ["photo-1648113821624-244c6c1baf54", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Kerala",
      slug: "kerala",
      tagline: "God's Own Country: tea hills, houseboats, and spice plantations.",
      description: "A serene coastal state famous for labyrinthine palm-lined backwaters, Ayurvedic wellness, spice-scented hills, and Kathakali culture.",
      photoId: "photo-1602216056096-3b40cc0c9944",
    },
    pkg: {
      title: "Glimpse of God's Own Country: Munnar & Alleppey",
      slug: "glimpse-of-gods-own-country-munnar-alleppey",
      destination: "Cochin, Munnar & Alleppey, Kerala",
      summary: "Cruise on a traditional thatched houseboat along emerald backwaters and wander through endless green tea carpets in Munnar.",
      description: "5 days of sheer tranquility across Kerala's most beloved destinations, covering Fort Kochi Chinese nets, Munnar tea gardens, and an overnight backwater cruise.",
      days: 5,
      nights: 4,
      priceFrom: 18999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["3 Nights Hotel + 1 Night Deluxe Private Houseboat", "All Meals on Houseboat (Authentic Kerala Cuisine)", "Breakfast at Hotels", "Private AC Sedan for Entire Tour", "Spice Garden Tour & Tea Museum Visit"],
      exclusions: ["Flights/Train Tickets", "Ayurvedic Massages", "Personal Expenses & Tips"],
      itinerary: [
        { day: 1, title: "Arrival in Cochin & Drive to Munnar", detail: "Arrive at Cochin Airport. Drive through Cheeyappara & Valara waterfalls into the misty hills of Munnar." },
        { day: 2, title: "Munnar Tea Hills & Mattupetty Dam", detail: "Visit Eravikulam National Park (home to Nilgiri Tahr), Tea Museum, Mattupetty Dam, and Echo Point." },
        { day: 3, title: "Munnar to Alleppey Houseboat Check-in", detail: "Scenic drive down to Alleppey. Board your traditional houseboat at noon. Cruise through canals with freshly prepared Kerala lunch and dinner." },
        { day: 4, title: "Houseboat Checkout & Fort Kochi", detail: "Disembark after morning breakfast. Drive to historic Fort Kochi to see Chinese Fishing Nets, St. Francis Church, and Jew Town." },
        { day: 5, title: "Departure", detail: "Transfer to Cochin Airport for your return journey." }
      ],
      coverPhotoId: "photo-1602216056096-3b40cc0c9944",
      galleryPhotoIds: ["photo-1593693397690-362cb9666fc2", "photo-1595815771614-ade9d652a65d", "photo-1512343879784-a960bf40e7f2"]
    }
  },
  {
    category: {
      name: "Munnar",
      slug: "munnar",
      tagline: "Rolling tea terraces, misty hills, and crisp mountain air.",
      description: "Nestled at 1,600m in the Western Ghats, Munnar was once the summer retreat of the British government in South India.",
      photoId: "photo-1595815771614-ade9d652a65d",
    },
    pkg: {
      title: "Misty Munnar Tea Trails & Wildlife",
      slug: "misty-munnar-tea-trails-wildlife",
      destination: "Munnar, Kerala",
      summary: "Wake up to misty green plantations, spot rare Nilgiri Tahr mountain goats, and take a tranquil boat ride on Kundala Lake.",
      description: "A focused 3-night romantic and scenic getaway in Munnar exploring Top Station, Kolukkumalai tea viewpoints, and spice gardens.",
      days: 4,
      nights: 3,
      priceFrom: 14500,
      badge: "none",
      inclusions: ["3 Nights in Premium Hill Resort", "Daily Breakfast & Dinner", "Eravikulam National Park Safari", "Boating at Mattupetty Lake", "Private AC Cab from/to Cochin"],
      exclusions: ["Travel to Cochin", "Optional Jeep Safaris", "Entry Tickets to Gardens"],
      itinerary: [
        { day: 1, title: "Cochin to Munnar Hill Highway", detail: "Pick up from Cochin. Enjoy scenic road trip stopping at spice plantations and waterfalls. Check into your resort." },
        { day: 2, title: "Tea Gardens & Eravikulam National Park", detail: "Morning safari in Rajamalai to see Nilgiri Tahr. Afternoon tour of Lockhart Tea Museum and tasting session." },
        { day: 3, title: "Top Station & Lake Circuit", detail: "Drive to Top Station for panoramic views of Tamil Nadu plains. Visit Kundala Dam and enjoy boating." },
        { day: 4, title: "Departure via Cochin", detail: "Morning breakfast with valley views before transfer back to Cochin airport." }
      ],
      coverPhotoId: "photo-1595815771614-ade9d652a65d",
      galleryPhotoIds: ["photo-1616489953149-8d1487317765", "photo-1602216056096-3b40cc0c9944", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Puducherry",
      slug: "puducherry",
      tagline: "French colonial boulevards, coastal cafes, and spiritual tranquility.",
      description: "Known affectionately as Pondy, this coastal enclave charms visitors with mustard-yellow colonial villas, chic cafes, and the peace of Auroville.",
      photoId: "photo-1597073642928-48c0971f7ded",
    },
    pkg: {
      title: "French Riviera of the East: Pondicherry & Auroville",
      slug: "french-riviera-of-the-east-pondicherry-auroville",
      destination: "Pondicherry, Tamil Nadu",
      summary: "Cycle past vibrant French Quarter colonial villas, meditate at the golden dome of Matrimandir, and stroll along Promenade Beach.",
      description: "A relaxed 3-day weekend retreat soaking in French-Tamil architecture, Sri Aurobindo Ashram, Paradise Beach by boat, and oceanfront dining.",
      days: 3,
      nights: 2,
      priceFrom: 9999,
      badge: "newJourney",
      inclusions: ["Heritage Boutique Hotel Stay", "Daily Continental/Indian Breakfast", "Chunambar Boat to Paradise Beach", "Auroville Matrimandir Viewing", "Private AC Vehicle from Chennai"],
      exclusions: ["Travel to Chennai", "Watersports on Paradise Beach", "Meals not specified"],
      itinerary: [
        { day: 1, title: "Chennai to Pondy & French Quarter Walk", detail: "Drive along the scenic East Coast Road. Check in and explore White Town's colonial avenues, cafes, and Promenade Beach." },
        { day: 2, title: "Auroville & Paradise Island Beach", detail: "Morning visit to experimental township Auroville and Matrimandir viewpoint. Afternoon ferry to idyllic Paradise Beach." },
        { day: 3, title: "Sri Aurobindo Ashram & Departure", detail: "Visit Sri Aurobindo Ashram and sacred Manakula Vinayagar Temple before your return drive to Chennai." }
      ],
      coverPhotoId: "photo-1597073642928-48c0971f7ded",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1609854534028-b512f5246abc"]
    }
  },
  {
    category: {
      name: "Mysore",
      slug: "mysore",
      tagline: "Royal palaces, fragrant sandalwood, and opulent heritage.",
      description: "The City of Palaces showcases the grandeur of the Wadiyar dynasty, vibrant silk markets, Chamundi Hills, and illuminated evening gardens.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Royal Heritage of Mysore & Srirangapatna",
      slug: "royal-heritage-of-mysore-srirangapatna",
      destination: "Mysore, Karnataka",
      summary: "Stand in awe of the illuminated Mysore Palace, climb Chamundi Hill, and visit the historic island fortress of Tipu Sultan.",
      description: "A 3-day royal cultural journey through Karnataka's heritage capital, taking in palaces, Devaraja fruit and flower market, and Brindavan Gardens.",
      days: 3,
      nights: 2,
      priceFrom: 8999,
      badge: "none",
      inclusions: ["3-Star Deluxe Hotel Stay", "Daily Breakfast", "Mysore Palace Entry Ticket", "Brindavan Gardens Musical Fountain Tour", "Private AC Cab from Bangalore"],
      exclusions: ["Travel to Bangalore", "Camera Fees inside Palaces", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Bangalore to Mysore & Srirangapatna", detail: "Drive from Bangalore. Tour Tipu Sultan's summer palace at Srirangapatna en route. Evening visit to Brindavan Gardens musical fountain." },
        { day: 2, title: "Grand Mysore Palace & Chamundi Hill", detail: "Guided tour through the Durbar Hall and royal chambers of Mysore Palace. Afternoon drive up to Chamundeshwari Temple." },
        { day: 3, title: "Art Gallery, Silk Shopping & Departure", detail: "Visit Jaganmohan Palace Art Gallery and shop authentic Mysore silk sarees before return drive to Bangalore." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Hyderabad",
      slug: "hyderabad",
      tagline: "Nizami grandeur, world-famous biryani, and historic fortresses.",
      description: "A fascinating blend of 400-year-old Nizami monuments, pearls, modern tech corridors, and iconic culinary traditions.",
      photoId: "photo-1572435555646-7ad1b6b55cf2",
    },
    pkg: {
      title: "City of Pearls: Hyderabad & Golconda Heritage",
      slug: "city-of-pearls-hyderabad-golconda-heritage",
      destination: "Hyderabad, Telangana",
      summary: "Explore the acoustics of Golconda Fort, marvel at the four minarets of Charminar, and sample legendary Hyderabadi dum biryani.",
      description: "A 3-day cultural deep-dive covering Salar Jung Museum, Chowmahalla Palace, Hussain Sagar lake boating, and Ramoji Film City options.",
      days: 3,
      nights: 2,
      priceFrom: 10499,
      badge: "none",
      inclusions: ["Centrally Located Hotel", "Daily Breakfast", "Golconda Fort Sound & Light Show", "Charminar & Laad Bazaar Walking Tour", "Private AC Vehicle for Sightseeing"],
      exclusions: ["Airfare/Train to Hyderabad", "Monument Entry Tickets", "Meals other than Breakfast"],
      itinerary: [
        { day: 1, title: "Welcome to Hyderabad & Hussain Sagar", detail: "Arrival and hotel check-in. Evening boat ride on Hussain Sagar Lake to the towering Buddha statue and Lumbini Park." },
        { day: 2, title: "Charminar, Chowmahalla & Golconda Fort", detail: "Morning visit to Charminar, Mecca Masjid, and Chowmahalla Palace. Afternoon exploration of mighty Golconda Fort with evening sound & light show." },
        { day: 3, title: "Salar Jung Museum & Departure", detail: "Visit the antique treasures of Salar Jung Museum and shop pearls at Laad Bazaar before airport transfer." }
      ],
      coverPhotoId: "photo-1572435555646-7ad1b6b55cf2",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1549817997-f6958ecf47b9", "photo-1695981152719-3fc012dc3da4"]
    }
  },
  {
    category: {
      name: "Alappuzha",
      slug: "alappuzha",
      tagline: "Venice of the East, endless lagoons, and tranquil canal life.",
      description: "Alleppey is the heart of Kerala's backwaters, where traditional kettuvallam houseboats glide through shimmering canals lined with coconut palms.",
      photoId: "photo-1593693397690-362cb9666fc2",
    },
    pkg: {
      title: "Alleppey Backwater Cruise & Marari Beach Haven",
      slug: "alleppey-backwater-cruise-marari-beach-haven",
      destination: "Alappuzha & Marari, Kerala",
      summary: "Spend 24 hours on a luxury private houseboat watching rural backwater life and unwind at the peaceful fishing beaches of Marari.",
      description: "An authentic coastal backwater getaway with serene canal cruises, traditional Karimeen fish fry meals, and quiet seaside sunset walks.",
      days: 3,
      nights: 2,
      priceFrom: 14999,
      badge: "bestSeller",
      inclusions: ["1 Night Deluxe Houseboat (All Meals)", "1 Night Beach Resort in Marari (Breakfast)", "Private Cruise with Dedicated Captain & Chef", "Private Transfers from Cochin Airport"],
      exclusions: ["Travel to Cochin", "Personal Expenses & Drinks", "Ayurveda Treatments"],
      itinerary: [
        { day: 1, title: "Houseboat Embarkation & Canal Cruise", detail: "Arrive in Alleppey. Board your traditional houseboat at noon. Sail through Vembanad Lake, narrow village canals, and watch toddy tappers." },
        { day: 2, title: "Disembarkation & Marari Beachfront", detail: "Morning cruise with breakfast. Disembark at 9:30 AM and transfer to Marari Beach. Afternoon relaxation on the quiet, unspoiled sand." },
        { day: 3, title: "Coir Village Walk & Departure", detail: "Visit a traditional coir rope-making village before transfer back to Cochin airport." }
      ],
      coverPhotoId: "photo-1593693397690-362cb9666fc2",
      galleryPhotoIds: ["photo-1602216056096-3b40cc0c9944", "photo-1512343879784-a960bf40e7f2", "photo-1554092917-15b3e3f9e85a"]
    }
  },
  {
    category: {
      name: "Tirupati",
      slug: "tirupati",
      tagline: "Sacred abode of Lord Venkateswara among seven holy hills.",
      description: "One of the most revered and visited pilgrimage destinations in the world, situated atop the sacred Seshachalam Hills of Andhra Pradesh.",
      photoId: "photo-1597073642928-48c0971f7ded",
    },
    pkg: {
      title: "Divya Darshan: Tirupati Balaji Pilgrimage",
      slug: "divya-darshan-tirupati-balaji-pilgrimage",
      destination: "Tirupati, Andhra Pradesh",
      summary: "Experience divine darshan at Sri Venkateswara Swamy Temple on Tirumala hills and visit historic shrines of Padmavathi Ammavari.",
      description: "A seamless 2-night spiritual tour organized with comfortable hotel stays, prompt local transfers, and sacred temple visits across Tirumala and Tirupati.",
      days: 3,
      nights: 2,
      priceFrom: 7999,
      badge: "none",
      inclusions: ["Hotel Accommodation in Tirupati", "Daily Breakfast", "Dedicated Private AC Transport for Tirumala Hills", "Assistance for Temple Darshan", "Padmavathi Temple & Kapila Theertham Visits"],
      exclusions: ["Train/Flight to Tirupati/Chennai", "Darshan Ticket / Seva Booking", "Personal Offerings"],
      itinerary: [
        { day: 1, title: "Arrival in Tirupati", detail: "Pickup from Tirupati railway/airport. Check into your hotel. Afternoon visit to Sri Padmavathi Ammavari Temple at Tiruchanur." },
        { day: 2, title: "Tirumala Hills & Lord Balaji Darshan", detail: "Scenic drive up the ghat road to Tirumala. Seek the divine blessings of Lord Venkateswara, followed by visits to Silathoranam and Chakra Theertham." },
        { day: 3, title: "Kapila Theertham & Departure", detail: "Morning visit to Kapila Theertham waterfall temple and Sri Govindaraja Swamy Temple before departure." }
      ],
      coverPhotoId: "photo-1597073642928-48c0971f7ded",
      galleryPhotoIds: ["photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Hampi",
      slug: "hampi",
      tagline: "Boulder-strewn landscapes and magnificent Vijayanagara ruins.",
      description: "A UNESCO World Heritage marvel where medieval temples, stone chariots, and royal palaces sit amid surreal golden boulder hills by the Tungabhadra.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Echoes of an Empire: Hampi Heritage Trail",
      slug: "echoes-of-an-empire-hampi-heritage-trail",
      destination: "Hampi & Hospet, Karnataka",
      summary: "Marvel at the world-famous Stone Chariot at Vittala Temple, watch the sunset from Matanga Hill, and coracle ride across the river.",
      description: "An unforgettable 3-day exploration of the 14th-century Vijayanagara Empire ruins, Virupaksha temple, Lotus Mahal, and sunset over Tungabhadra.",
      days: 3,
      nights: 2,
      priceFrom: 11999,
      badge: "newJourney",
      inclusions: ["3-Star Hotel in Hospet/Hampi", "Daily Breakfast", "Expert Archeological Local Guide", "Tungabhadra Coracle Ride", "Private Cab for Ruin Circuits"],
      exclusions: ["Travel to Hospet/Hubli", "Monument Entry Fees", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival & Sacred Center", detail: "Pickup from Hospet. Check in and visit active Virupaksha Temple, Hemakuta Hill sunset, and Sasivekalu Ganesha statue." },
        { day: 2, title: "Vittala Temple & Royal Enclosure", detail: "Explore the musical pillars and iconic Stone Chariot at Vittala Temple, followed by Queen's Bath, Elephant Stables, and Lotus Mahal." },
        { day: 3, title: "Coracle Boat Ride & Anjaneya Hill", detail: "Early morning coracle ride across Tungabhadra River, explore Anegundi village, and depart with royal memories." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Puri",
      slug: "puri",
      tagline: "Sacred Jagannath temple, golden beaches, and Konark Sun wonders.",
      description: "One of India's four sacred Char Dham pilgrimage sites, set beside the rolling surf of the Bay of Bengal and close to the UNESCO Konark Sun Temple.",
      photoId: "photo-1609854534028-b512f5246abc",
    },
    pkg: {
      title: "Sacred Shores: Puri, Konark & Chilika Lake",
      slug: "sacred-shores-puri-konark-chilika-lake",
      destination: "Puri & Konark, Odisha",
      summary: "Offer prayers at Lord Jagannath Temple, gaze at the chariot wheels of Konark Sun Temple, and spot dolphins in Chilika Lake.",
      description: "A 4-day pilgrimage and coastal tour combining Puri Golden Beach, the architectural wonder of Konark, Pipili applique village, and Chilika lagoon.",
      days: 4,
      nights: 3,
      priceFrom: 11499,
      badge: "bestSeller",
      inclusions: ["Beachfront Hotel in Puri", "Daily Breakfast", "Chilika Lake Boat Safari (Satapada)", "Konark Sun Temple Excursion", "Private AC Transport from Bhubaneswar"],
      exclusions: ["Train/Air Tickets", "Temple Priest Dakshina", "Entry Fees to Monuments"],
      itinerary: [
        { day: 1, title: "Bhubaneswar to Puri & Jagannath Darshan", detail: "Pickup from Bhubaneswar. Drive to Puri stopping at Dhauli Peace Pagoda. Evening darshan at Lord Jagannath Temple." },
        { day: 2, title: "Konark Sun Temple & Chandrabhaga Beach", detail: "Drive on Marine Drive to 13th-century Konark Sun Temple. Enjoy coastal sunset at Chandrabhaga Beach." },
        { day: 3, title: "Chilika Lake Irrawaddy Dolphin Safari", detail: "Excursion to Satapada on Chilika Lake. Boat ride to see playful Irrawaddy dolphins and the sea mouth." },
        { day: 4, title: "Pipili Crafts & Departure", detail: "Shop colorful handicrafts at Pipili artisan village en route to Bhubaneswar airport/railway station." }
      ],
      coverPhotoId: "photo-1609854534028-b512f5246abc",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1695981152719-3fc012dc3da4"]
    }
  },
  {
    category: {
      name: "Mandarmani",
      slug: "mandarmani",
      tagline: "India's longest motorable beach and red crab sand dunes.",
      description: "A popular seaside beach resort in West Bengal offering wide, calm coastal shores, thrilling beach ATV rides, and ocean-facing luxury resorts.",
      photoId: "photo-1554092917-15b3e3f9e85a",
    },
    pkg: {
      title: "Mandarmani Seaside Weekend Retreat",
      slug: "mandarmani-seaside-weekend-retreat",
      destination: "Mandarmani, West Bengal",
      summary: "Drive right along the golden beach, watch thousands of red ghost crabs scurry across the sand, and feast on fresh Bay of Bengal seafood.",
      description: "A refreshing 2-night coastal weekend getaway with swimming pool resort amenities, peaceful beach walks, and ocean breezes.",
      days: 3,
      nights: 2,
      priceFrom: 7499,
      badge: "none",
      inclusions: ["Beach Resort Stay with Swimming Pool", "Daily Breakfast & One Seafood Dinner", "Pick-up & Drop from Digha or Kolkata Option", "Private AC Cab"],
      exclusions: ["Water Sports & ATV rides", "Personal Beverages", "Any Extra Meals"],
      itinerary: [
        { day: 1, title: "Kolkata to Mandarmani Beach Drive", detail: "Scenic morning drive from Kolkata. Check into your beachfront resort. Afternoon leisure on the wide, tranquil beach." },
        { day: 2, title: "Red Crab Delta & Beach Thrills", detail: "Walk to the delta where red crabs gather. Enjoy thrilling quad biking and evening beach bonfire." },
        { day: 3, title: "Sunrise by the Sea & Departure", detail: "Witness the golden sunrise over Bay of Bengal and enjoy breakfast before departure." }
      ],
      coverPhotoId: "photo-1554092917-15b3e3f9e85a",
      galleryPhotoIds: ["photo-1512343879784-a960bf40e7f2", "photo-1609854534028-b512f5246abc", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Digha",
      slug: "digha",
      tagline: "Bengal's favourite coastal haven, casuarina groves, and seafood trails.",
      description: "The classic beach destination of eastern India, boasting New Digha's vibrant promenade, Udaipur beach, and marine exhibits.",
      photoId: "photo-1512343879784-a960bf40e7f2",
    },
    pkg: {
      title: "Digha & Udaipur Beach Coastal Break",
      slug: "digha-udaipur-beach-coastal-break",
      destination: "Digha, West Bengal",
      summary: "Stroll along New Digha promenade, explore secluded Udaipur beach on the border, and visit the Marine Aquarium.",
      description: "A comfortable 3-day family beach holiday with easy transport, ocean-view hotel stays, and authentic Bengali seafood delicacies.",
      days: 3,
      nights: 2,
      priceFrom: 6999,
      badge: "none",
      inclusions: ["AC Hotel Stay near Beach", "Daily Breakfast", "Sightseeing Cab for New Digha, Old Digha & Udaipur Beach", "Marine Aquarium Visit"],
      exclusions: ["Train/Bus Tickets", "Water Sports", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival in Digha & Old Digha Coast", detail: "Arrive in Digha. Check in and visit Old Digha beach promenade and Amravati Park ropeway." },
        { day: 2, title: "Udaipur Beach & Marine Aquarium", detail: "Morning excursion to serene Udaipur beach fringed by casuarina trees. Visit the Marine Aquarium and Science City." },
        { day: 3, title: "Shopping & Return Journey", detail: "Shop for handcrafted seashell souvenirs and cashew nuts before catching the afternoon train home." }
      ],
      coverPhotoId: "photo-1512343879784-a960bf40e7f2",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1609854534028-b512f5246abc", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Darjeeling",
      slug: "darjeeling",
      tagline: "Queen of the Himalayas, steam toy trains, and sunrise over Kanchenjunga.",
      description: "Cradled by rolling tea gardens and the world's third highest peak, Darjeeling is our flagship Himalayan destination.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Darjeeling Tea & Mountain Escape",
      slug: "darjeeling-tea-and-mountain-escape",
      destination: "Darjeeling, West Bengal",
      summary: "Wake up to gold-dusted Kanchenjunga peaks from Tiger Hill, ride the heritage steam toy train, and tour aromatic tea estates.",
      description: "An authentic 4-day curated Himalayan journey taking in Batasia Loop, Ghoom Monastery, Himalayan Mountaineering Institute, and tea tastings.",
      days: 4,
      nights: 3,
      priceFrom: 13999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["3-Star View Resort in Darjeeling", "Daily Breakfast & Dinner", "Tiger Hill Sunrise Tour with Ghoom Monastery", "Seven Points Sightseeing Tour", "Private AC Cab from/to NJP or Bagdogra"],
      exclusions: ["Toy Train Ticket (Subject to booking)", "Entry Tickets at HMI/Zoo", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Bagdogra/NJP to Darjeeling Hill Drive", detail: "Scenic climb through Kurseong and pine forests. Check in and enjoy an evening stroll on Mall Road and Chowrasta." },
        { day: 2, title: "Tiger Hill Sunrise & Heritage Sights", detail: "4:00 AM trip to Tiger Hill for sunrise over Kanchenjunga. Visit Batasia Loop and Ghoom Monastery. Afternoon tour of HMI and Himalayan Zoo." },
        { day: 3, title: "Tea Gardens & Japanese Peace Pagoda", detail: "Visit Happy Valley Tea Estate, Japanese Peace Pagoda, and Tibetan Refugee Self-Help Centre." },
        { day: 4, title: "Mirik Lake & Departure", detail: "Scenic return drive via Mirik Lake and pine-fringed Nepal border before drop-off at Bagdogra/NJP." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Darjeeling Offbeat",
      slug: "darjeeling-offbeat",
      tagline: "Pine wilderness, misty hamlets, and serene eco-villages.",
      description: "Step away from crowded tourist centers into peaceful mountain hamlets like Lamahatta, Chatakpur, Tinchuley, and Lepchajagat.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Hidden Hamlets: Lamahatta, Tinchuley & Chatakpur",
      slug: "hidden-hamlets-lamahatta-tinchuley-chatakpur",
      destination: "Offbeat Darjeeling, West Bengal",
      summary: "Walk beneath towering dhupi pine canopies at Lamahatta, stay at peaceful village homestays, and look upon snow-capped peaks in silence.",
      description: "A 4-day soul-soothing mountain journey designed for nature lovers seeking fresh mountain air, birdsong, and homestay hospitality.",
      days: 4,
      nights: 3,
      priceFrom: 11999,
      badge: "newJourney",
      inclusions: ["Authentic Village Homestays with Valley Views", "All Meals (Home-cooked Organic Local Food)", "Lamahatta Eco Park & Sacred Lake Trek", "Tinchuley Sunrise Viewpoint & Chhota Mangwa Drive", "Dedicated Mountain Cab"],
      exclusions: ["Travel to NJP/Bagdogra", "Personal Expenses", "Tips to Homestay Hosts"],
      itinerary: [
        { day: 1, title: "NJP to Peaceful Lamahatta", detail: "Scenic drive to Lamahatta village. Walk through manicured alpine gardens and meditate amidst towering pine trees." },
        { day: 2, title: "Tinchuley & Tea Valley Vistas", detail: "Excursion to Tinchuley Gumbadara viewpoint, Peshok tea garden viewpoint, and the confluence of Teesta and Rangeet rivers." },
        { day: 3, title: "Chatakpur Eco Forest Hamlet", detail: "Drive to high-altitude Chatakpur inside Senchal Wildlife Sanctuary. Enjoy unhindered panoramic Kanchenjunga views." },
        { day: 4, title: "Down through Tea Hills to NJP", detail: "Warm farewell from your hosts before a scenic downhill drive to NJP or Bagdogra." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Kalimpong",
      slug: "kalimpong",
      tagline: "Floral nurseries, colonial heritage, and quiet Himalayan ridges.",
      description: "Perched on a mountain ridge above the Teesta River, Kalimpong offers flower nurseries, monasteries, and peaceful colonial atmosphere.",
      photoId: "photo-1589182373726-e4f658ab50f0",
    },
    pkg: {
      title: "Kalimpong Ridge & Valley Retreat",
      slug: "kalimpong-ridge-and-valley-retreat",
      destination: "Kalimpong, West Bengal",
      summary: "Take in 360-degree vistas from Deolo Hill, visit exotic orchid nurseries, and stay at a charming British-era mountain manor.",
      description: "A tranquil 3-day holiday covering Morgan House, Durpin Monastery, Pine View Nursery with 1,500 cactus species, and paragliding options.",
      days: 3,
      nights: 2,
      priceFrom: 9999,
      badge: "none",
      inclusions: ["3-Star Heritage Resort", "Daily Breakfast & Dinner", "Deolo Hill & Morgan House Tour", "Durpin Gompa & Cactus Nursery Visit", "Roundtrip Private Cab from NJP/Bagdogra"],
      exclusions: ["Paragliding Charges", "Monument Entry Tickets", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Drive up the Teesta Gorge to Kalimpong", detail: "Pickup from NJP/Bagdogra. Follow the emerald Teesta river into Kalimpong. Evening visit to local craft market." },
        { day: 2, title: "Deolo Viewpoint & Monastery Tour", detail: "Visit Deolo Hill park for sweeping Himalayan vistas. Tour Zang Dhok Palri Phodang monastery and Pine View cactus nursery." },
        { day: 3, title: "Morgan House & Return Journey", detail: "Visit colonial Morgan House before driving down to NJP or Bagdogra for departure." }
      ],
      coverPhotoId: "photo-1589182373726-e4f658ab50f0",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Kalimpong Offbeat",
      slug: "kalimpong-offbeat",
      tagline: "Canopy walks, mist-laden fir forests, and quiet wilderness.",
      description: "Unravel the enchanting forests of Lava, the hanging canopy walk of Lolegaon, and the silent snow vistas of Rishyap.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Wilderness Triangle: Lava, Rishyap & Lolegaon",
      slug: "wilderness-triangle-lava-rishyap-lolegaon",
      destination: "Lava & Rishyap, West Bengal",
      summary: "Walk among cloud-wrapped cedar forests, cross the wooden canopy suspension bridge, and gaze across Neora Valley National Park.",
      description: "A 4-day peaceful escape into the remote fir forests of the Kalimpong foothills, featuring village homestays and untouched nature trails.",
      days: 4,
      nights: 3,
      priceFrom: 11499,
      badge: "newJourney",
      inclusions: ["Homestays/Eco Resorts in Lava & Rishyap", "All Meals Included", "Lava Monastery & Nature Interpretation Centre", "Lolegaon Canopy Walk", "Dedicated Mountain Vehicle"],
      exclusions: ["Travel to NJP", "Forest Safari Entry", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "NJP to Misty Lava", detail: "Scenic uphill drive via Gorubathan. Check in at Lava amidst dense pine woods. Visit the grand Lava Kagyu Monastery." },
        { day: 2, title: "Lolegaon Canopy Walk & Heritage Park", detail: "Day trip to Lolegaon. Walk across the suspended wooden rope canopy bridge deep inside towering oak forests." },
        { day: 3, title: "Peaceful Rishyap Kanchenjunga Panorama", detail: "Short scenic drive to Rishyap. Unwind with an uninterrupted 300-degree view of the snow-clad Kanchenjunga range." },
        { day: 4, title: "Departure", detail: "Morning sunrise over snow peaks followed by downhill drive to NJP or Bagdogra." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Gangtok",
      slug: "gangtok",
      tagline: "Sikkim's vibrant capital, sacred monasteries, and alpine lakes.",
      description: "A clean, modern hill city perched on a mountain ridge, serving as the gateway to Sikkim's sacred lakes, passes, and Buddhist sanctuaries.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Jewel of Sikkim: Gangtok & Tsomgo Lake",
      slug: "jewel-of-sikkim-gangtok-tsomgo-lake",
      destination: "Gangtok, Sikkim",
      summary: "Drive to high-altitude glacial Tsomgo Lake at 12,300 ft, ride the Gangtok ropeway, and stroll the pedestrian boulevard of MG Marg.",
      description: "A 4-day high-altitude adventure covering Rumtek Monastery, Ban Jhakri waterfalls, Tsomgo Lake, and Baba Harbhajan Singh Mandir.",
      days: 4,
      nights: 3,
      priceFrom: 14499,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["3-Star Hotel in Gangtok", "Daily Breakfast & Dinner", "Tsomgo Lake & Baba Mandir Permit and Excursion", "Gangtok Full Day City Tour", "Private Cab from/to NJP/Bagdogra"],
      exclusions: ["Nathula Pass Permit (Subject to availability/Army clearance)", "Ropeway Tickets", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "NJP/Bagdogra to Gangtok", detail: "Scenic drive along the Teesta River entering Sikkim at Rangpo. Evening stroll on Gangtok's vibrant, car-free MG Marg." },
        { day: 2, title: "Sacred Glacial Tsomgo Lake & Baba Mandir", detail: "Excursion to 12,310 ft Tsomgo Lake reflecting snow-dusted ridges. Continue to Baba Harbhajan Mandir near the Indo-China border." },
        { day: 3, title: "Gangtok City Wonders & Rumtek Monastery", detail: "Tour Rumtek Monastery, Do Drul Chorten, Namgyal Institute of Tibetology, and cascading Ban Jhakri Falls." },
        { day: 4, title: "Departure", detail: "Morning mountain breakfast before scenic downhill drive to NJP or Bagdogra." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "North Sikkim",
      slug: "north-sikkim",
      tagline: "Sacred turquoise lakes, snow deserts, and valley of flowers.",
      description: "One of the most remote and dramatic landscapes on Earth, featuring the 17,800 ft Gurudongmar Lake and rhododendron blooms in Yumthang.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Expedition North Sikkim: Lachen, Lachung & Gurudongmar",
      slug: "expedition-north-sikkim-lachen-lachung-gurudongmar",
      destination: "North Sikkim",
      summary: "Stand before the holy, emerald waters of Gurudongmar Lake at 17,800 ft and witness the valley of flowers at Yumthang.",
      description: "A legendary 5-day mountain expedition across rugged Himalayan terrain, staying in remote wooden village lodges in Lachen and Lachung.",
      days: 5,
      nights: 4,
      priceFrom: 21999,
      badge: "bestSeller",
      inclusions: ["Gangtok, Lachen & Lachung Hotel Stays", "All Meals in North Sikkim (Breakfast, Lunch, Dinner)", "Special North Sikkim Inner Line Permits", "Gurudongmar Lake & Yumthang Valley Excursions", "Dedicated Heavy-duty SUV (Innova/Scorpio/Bolero)"],
      exclusions: ["Zero Point Excursion (Payable directly)", "Warm Clothes / Boots Rental", "Travel to Gangtok"],
      itinerary: [
        { day: 1, title: "Gangtok to Mountain Village of Lachen", detail: "Scenic drive north past Naga Waterfall and Chungthang confluence. Arrive at high-altitude Lachen (8,800 ft)." },
        { day: 2, title: "Sacred Gurudongmar Lake to Lachung", detail: "Dawn drive to 17,800 ft Gurudongmar Lake near the Tibetan plateau. Return for lunch and drive to Lachung." },
        { day: 3, title: "Yumthang Valley of Flowers & Hot Spring", detail: "Explore the alpine meadows of Yumthang Valley and natural sulfur hot springs. Return to Gangtok by evening." },
        { day: 4, title: "Gangtok Local Leisure", detail: "Relaxing day in Gangtok exploring local bakeries, monasteries, and handicraft centers." },
        { day: 5, title: "Departure", detail: "Downhill transfer to NJP/Bagdogra with memories of a lifetime." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "South Sikkim",
      slug: "south-sikkim",
      tagline: "Gigantic pilgrimage monuments, Buddha park, and rolling tea estates.",
      description: "Renowned for the colossal statues of Namchi Char Dham, the peaceful Buddha Park in Ravangla, and Sikkim's only tea garden at Temi.",
      photoId: "photo-1589182373726-e4f658ab50f0",
    },
    pkg: {
      title: "Serenity of South Sikkim: Namchi & Ravangla",
      slug: "serenity-of-south-sikkim-namchi-ravangla",
      destination: "Namchi & Ravangla, South Sikkim",
      summary: "Gaze at the 130 ft Golden Buddha in Ravangla, explore replica shrines at Char Dham, and walk through Temi Tea Estate.",
      description: "A 3-day spiritual and scenic retreat combining peaceful mountain stays with South Sikkim's premier cultural landmarks.",
      days: 3,
      nights: 2,
      priceFrom: 10999,
      badge: "none",
      inclusions: ["Hill Resort Stay in Ravangla/Namchi", "Daily Breakfast & Dinner", "Siddheshwar Dham (Char Dham) Tour", "Buddha Park of Ravangla Entry", "Private AC Cab from/to NJP"],
      exclusions: ["Travel to NJP", "Personal Expenses", "Entry Fees to Temi Tea Factory"],
      itinerary: [
        { day: 1, title: "NJP to Scenic Ravangla", detail: "Drive through Teesta valley up into tranquil Ravangla. Evening stroll around the serene mountain town." },
        { day: 2, title: "Buddha Park & Namchi Char Dham", detail: "Visit the grand Buddha Park against the backdrop of snow peaks. Proceed to Namchi to tour the 108 ft Shiva at Char Dham and Samdruptse." },
        { day: 3, title: "Temi Tea Garden & Departure", detail: "Visit lush Temi Tea Garden and taste organic Sikkim tea before driving back down to NJP." }
      ],
      coverPhotoId: "photo-1589182373726-e4f658ab50f0",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Guwahati",
      slug: "guwahati",
      tagline: "Gateway to the Northeast, mighty Brahmaputra, and sacred river temples.",
      description: "Assam’s largest city sits beside the vast Brahmaputra River, housing sacred hill temples, silk markets, and river sunset cruises.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Gateway to Assam: Guwahati & Brahmaputra Charms",
      slug: "gateway-to-assam-guwahati-brahmaputra-charms",
      destination: "Guwahati, Assam",
      summary: "Cruise into the sunset on the vast Brahmaputra River, visit sacred Kamakhya Temple, and take the ropeway over Umananda Island.",
      description: "A 3-day gateway tour exploring Kamakhya Temple, the world's smallest inhabited river island Umananda, and riverfront heritage.",
      days: 3,
      nights: 2,
      priceFrom: 8999,
      badge: "none",
      inclusions: ["3-Star City Hotel Stay", "Daily Breakfast", "Brahmaputra Evening Sunset Cruise", "Kamakhya & Umananda Island Temple Tours", "Private AC Transport"],
      exclusions: ["Airfare/Train to Guwahati", "VIP Darshan Passes", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival in Guwahati & Sunset Cruise", detail: "Pickup from Guwahati Airport/Railway. Check in and embark on a starlit dinner/sunset cruise along the Brahmaputra River." },
        { day: 2, title: "Kamakhya Temple & Umananda Island", detail: "Morning darshan at the powerful Maa Kamakhya Temple atop Nilachal Hill. Take the ropeway across to Umananda Peacock Island." },
        { day: 3, title: "Srimanta Sankaradeva Kalakshetra & Departure", detail: "Visit the cultural museum at Kalakshetra to explore Assamese heritage before airport drop-off." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1695981152719-3fc012dc3da4", "photo-1597073642928-48c0971f7ded", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Kamakhya Temple",
      slug: "kamakhya-temple",
      tagline: "Ancient Shakti Peetha atop sacred Nilachal Hill.",
      description: "One of the oldest and most venerated Shakti shrines, celebrated for its unique tantric architecture and profound spiritual aura.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Divine Blessings: Maa Kamakhya Pilgrimage Tour",
      slug: "divine-blessings-maa-kamakhya-pilgrimage-tour",
      destination: "Guwahati, Assam",
      summary: "Perform special puja and darshan at the revered Kamakhya Peeth and visit surrounding shrines of the Ten Mahavidyas on Nilachal Hill.",
      description: "A dedicated 2-day pilgrimage package arranged with knowledgeable local guides to ensure peaceful darshan and rituals at Kamakhya Temple.",
      days: 2,
      nights: 1,
      priceFrom: 5999,
      badge: "none",
      inclusions: ["AC Hotel Stay near Nilachal Hill", "Breakfast Included", "Assistance for Temple Darshan", "Dedicated AC Cab for Airport/Station Transfers & Temple"],
      exclusions: ["VIP Darshan Ticket Fees", "Pooja Offerings / Dakshina", "Airfare/Train"],
      itinerary: [
        { day: 1, title: "Arrival & Evening Nilachal Hill Aarti", detail: "Pickup from Guwahati airport/station. Check in. Afternoon visit to Nilachal Hill for sunset views and evening temple ambiance." },
        { day: 2, title: "Maa Kamakhya Darshan & Departure", detail: "Early morning sacred darshan at the main sanctum. Visit Bhuvneshwari Temple atop the hill before departure." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Kaziranga",
      slug: "kaziranga",
      tagline: "Realm of the endangered Greater One-horned Rhinoceros.",
      description: "A world-renowned UNESCO World Heritage national park in the floodplains of Assam, home to two-thirds of the world's one-horned rhinos.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Wild Kaziranga: Rhinos & Grasslands Safari",
      slug: "wild-kaziranga-rhinos-grasslands-safari",
      destination: "Kaziranga National Park, Assam",
      summary: "Embark on dawn elephant and open-top jeep safaris to spot wild rhinos, Asian elephants, wild water buffaloes, and tigers.",
      description: "A thrilling 3-day wildlife adventure exploring both Central (Kohora) and Western (Bagori) ranges of Kaziranga National Park.",
      days: 3,
      nights: 2,
      priceFrom: 13999,
      badge: "bestSeller",
      inclusions: ["Jungle Resort Stay with Breakfast & Dinner", "1 Early Morning Elephant Safari", "1 Jeep Safari in Central/Western Range", "Park Entry & Forest Guard Fees", "Private AC Cab from/to Guwahati"],
      exclusions: ["Travel to Guwahati", "Camera Fees inside Park", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Guwahati to Kaziranga Jungle Resort", detail: "Pickup from Guwahati. 4-hour scenic drive into Kaziranga. Check in and visit Kaziranga National Orchid & Biodiversity Park." },
        { day: 2, title: "Elephant & Jeep Safaris in Rhino Country", detail: "Dawn elephant safari through tall elephant grass to see one-horned rhinos up close. Afternoon open-top 4x4 jeep safari." },
        { day: 3, title: "Return to Guwahati & Departure", detail: "Enjoy a leisurely breakfast listening to jungle calls before your return drive to Guwahati airport." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Jaldapara",
      slug: "jaldapara",
      tagline: "Dense Dooars sal forests, Torsa river, and rhino sanctuaries.",
      description: "Located in the foothills of the Eastern Himalayas in West Bengal, Jaldapara is a lush wildlife park famed for one-horned rhinos and elephants.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Dooars Wildlife Trail: Jaldapara & Chilapata",
      slug: "dooars-wildlife-trail-jaldapara-chilapata",
      destination: "Jaldapara & Dooars, West Bengal",
      summary: "Ride through dense sal forests on elephant safari, explore ancient ruins inside Chilapata forest, and listen to the call of leopards.",
      description: "An authentic 3-day forest retreat in the Bengal Dooars combining rhino safaris at Jaldapara with the mysterious Nalraja Garh ruins in Chilapata.",
      days: 3,
      nights: 2,
      priceFrom: 10499,
      badge: "none",
      inclusions: ["Forest Resort Accommodation", "Daily Breakfast & Dinner", "Jaldapara Jungle Jeep Safari", "Chilapata Forest Excursion", "Private Cab from/to Hasimara or NJP"],
      exclusions: ["Train Tickets to NJP/Hasimara", "Elephant Safari Ticket (Direct booking)", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "NJP to Jaldapara Forest Entry", detail: "Scenic drive through tea gardens and river bridges into Jaldapara. Check into your eco-lodge and evening tribal dance show." },
        { day: 2, title: "Jaldapara Safari & Chilapata Forest", detail: "Morning jungle safari along Torsa river bed to spot rhinos and deer. Afternoon excursion into dense Chilapata forest." },
        { day: 3, title: "South Khayerbari Tiger Rescue & Departure", detail: "Visit South Khayerbari leopard rehabilitation center before return transfer to NJP or Alipurduar." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Gwalior",
      slug: "gwalior",
      tagline: "The pearl of Indian fortresses, musical heritage, and royal palaces.",
      description: "Dominated by its hilltop sandstone fort, Gwalior is a city steeped in medieval bravery, classical Hindustani music, and Scindia royal grandeur.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Splendour of the Scindias: Gwalior Fort & Palaces",
      slug: "splendour-of-the-scindias-gwalior-fort-palaces",
      destination: "Gwalior, Madhya Pradesh",
      summary: "Walk along the blue-tiled walls of Man Mandir Palace, see the world's largest crystal chandeliers at Jai Vilas, and pay homage to Tansen.",
      description: "A rich 2-night heritage break in Madhya Pradesh exploring Gwalior Fort, Saas-Bahu temples, Teli Ka Mandir, and royal museums.",
      days: 3,
      nights: 2,
      priceFrom: 9499,
      badge: "none",
      inclusions: ["Heritage/3-Star Hotel Stay", "Daily Breakfast", "Gwalior Fort & Jai Vilas Palace Guided Tour", "Private AC Cab for Sightseeing"],
      exclusions: ["Travel to Gwalior", "Monument Entry Tickets", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival & Evening Sound and Light Show", detail: "Arrive in Gwalior. Check in and witness the evocative Sound and Light show at Gwalior Fort amphitheater." },
        { day: 2, title: "Gwalior Fort, Saas Bahu & Jai Vilas Palace", detail: "Tour the 8th-century fort complex, intricately carved Saas-Bahu temples, and the European-style Jai Vilas Palace museum." },
        { day: 3, title: "Tomb of Tansen & Departure", detail: "Visit the serene tomb of legendary musician Tansen and Sun Temple before departure." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Satpura National Park",
      slug: "satpura-national-park",
      tagline: "Untamed gorges, river canoe safaris, and leopard wilderness.",
      description: "A pristine biodiversity hotspot in Central India famous for walking safaris, boat safaris on the Denwa River, and rugged sandstone ravines.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Wild Satpura: River Safaris & Leopard Trails",
      slug: "wild-satpura-river-safaris-leopard-trails",
      destination: "Satpura Tiger Reserve, Madhya Pradesh",
      summary: "Canoe across tranquil Denwa River, walk on foot with armed naturalists, and search for leopards and sloth bears on 4x4 safaris.",
      description: "A 3-day premium wilderness experience in Madhya Pradesh's most picturesque and exclusive national park.",
      days: 3,
      nights: 2,
      priceFrom: 18999,
      badge: "newJourney",
      inclusions: ["Jungle Eco-Lodge on River Bank", "All Meals Included", "1 Denwa River Boat Safari", "1 Jeep Safari in Madhai Core Zone", "Private Cab from/to Bhopal or Itarsi"],
      exclusions: ["Travel to Bhopal/Itarsi", "Optional Night Safari", "Personal Tips & Beverages"],
      itinerary: [
        { day: 1, title: "Bhopal to Madhai (Satpura)", detail: "Scenic drive from Bhopal. Cross the Denwa River by motorboat to check into your riverside jungle lodge. Evening birdwatching walk." },
        { day: 2, title: "Core Zone Jeep Safari & Canoe Ride", detail: "Dawn 4x4 safari deep into Satpura's sandstone hills to track leopards and sloth bears. Afternoon tranquil canoe river safari." },
        { day: 3, title: "Nature Walking Safari & Departure", detail: "Unique morning walking safari accompanied by a trained forest naturalist before departure transfer to Bhopal." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1695981152719-3fc012dc3da4"]
    }
  },
  {
    category: {
      name: "Lalbag",
      slug: "lalbag",
      tagline: "Nawabi palace of a thousand doors along the Bhagirathi.",
      description: "The historic heart of Murshidabad in West Bengal, famed for Hazarduari Palace, Katra Mosque, and the royal heritage of Bengal Nawabs.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Nawabi Murshidabad: Hazarduari & Lalbag Heritage",
      slug: "nawabi-murshidabad-hazarduari-lalbag-heritage",
      destination: "Murshidabad & Lalbag, West Bengal",
      summary: "Tour the grand 1000-door Hazarduari Palace, visit Katra Mosque, and take a horse-cart ride along the Bhagirathi River.",
      description: "A 2-day historical expedition into Bengal's former capital, featuring royal armories, palaces, and authentic Murshidabad silk weaving.",
      days: 3,
      nights: 2,
      priceFrom: 8499,
      badge: "none",
      inclusions: ["AC Hotel Stay in Murshidabad", "Daily Breakfast", "Hazarduari Palace & Imambara Guided Tour", "Katra Mosque & Nashipur Rajbari Excursion", "Private AC Cab from Kolkata"],
      exclusions: ["Monument Entry Fees", "Tonga (Horse-cart) Rides", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Kolkata to Murshidabad Heritage Drive", detail: "Drive from Kolkata to historic Murshidabad. Check in and take an evening walk along the Bhagirathi river bank." },
        { day: 2, title: "Hazarduari Palace & Katra Mosque", detail: "Guided exploration of Hazarduari Palace museum with royal weapons and paintings, Nizamat Imambara, and the ruined Katra Mosque." },
        { day: 3, title: "Nashipur Rajbari, Silk Shopping & Return", detail: "Visit Nashipur Rajbari and Kathgola Palace before driving back to Kolkata with sweet Murshidabad memories." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Delhi",
      slug: "delhi",
      tagline: "Ancient Mughal monuments, grand boulevards, and vibrant street markets.",
      description: "India's historic capital seamlessly weaves centuries of Mughal and British empires with world-class contemporary museums and dining.",
      photoId: "photo-1587474260584-136574528ed5",
    },
    pkg: {
      title: "Capitals of Empires: Old & New Delhi Heritage",
      slug: "capitals-of-empires-old-and-new-delhi-heritage",
      destination: "Delhi NCR",
      summary: "Explore Red Fort, Humayun’s Tomb, and Qutub Minar, drive past India Gate, and experience rickshaw rides in Chandni Chowk.",
      description: "A 3-day deep cultural exploration of the Indian capital, covering UNESCO heritage sites, street food trails, and colonial architecture.",
      days: 3,
      nights: 2,
      priceFrom: 9999,
      badge: "none",
      inclusions: ["4-Star Hotel Accommodation", "Daily Breakfast", "Full-Day Old & New Delhi Guided Tour", "Chandni Chowk Cycle Rickshaw Ride", "Private AC Chauffeur Cab"],
      exclusions: ["Monument Entry Fees", "Airfare/Train to Delhi", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival & Lutyens' Delhi", detail: "Arrival in Delhi. Drive past Rashtrapati Bhavan, Parliament House, and stop at India Gate. Evening visit to Lotus Temple." },
        { day: 2, title: "Old Delhi Heritage & Spice Market", detail: "Tour Jama Masjid, take a cycle rickshaw ride through bustling Chandni Chowk spice markets, and view Red Fort." },
        { day: 3, title: "Qutub Minar, Humayun's Tomb & Departure", detail: "Visit UNESCO-listed Humayun's Tomb and the towering Qutub Minar before airport or railway station drop-off." }
      ],
      coverPhotoId: "photo-1587474260584-136574528ed5",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Agra",
      slug: "agra",
      tagline: "The timeless romance of the Taj Mahal and Mughal grandeur.",
      description: "Home to the world's greatest monument of love, Agra was the heart of the Mughal Empire at the height of its wealth and artistic expression.",
      photoId: "photo-1564507592333-c60657eea523",
    },
    pkg: {
      title: "Mughal Splendour: Taj Mahal & Agra Fort",
      slug: "mughal-splendour-taj-mahal-and-agra-fort",
      destination: "Agra, Uttar Pradesh",
      summary: "Witness the white marble Taj Mahal glowing at sunrise, explore the red sandstone courts of Agra Fort, and visit Mehtab Bagh.",
      description: "A classic 2-day Mughal heritage journey taking in the Taj Mahal, Agra Fort, Itmad-ud-Daulah (Baby Taj), and sunset over the Yamuna River.",
      days: 2,
      nights: 1,
      priceFrom: 6999,
      badge: "bestSeller",
      inclusions: ["4-Star Hotel in Agra", "Breakfast Included", "Taj Mahal Sunrise Guided Visit", "Agra Fort Guided Tour", "Private AC Cab from/to Delhi"],
      exclusions: ["Monument Entry Tickets", "Meals other than Breakfast", "Personal Tips"],
      itinerary: [
        { day: 1, title: "Delhi to Agra & Agra Fort", detail: "Drive via Yamuna Expressway to Agra. Check in and visit red sandstone Agra Fort and sunset across the river at Mehtab Bagh." },
        { day: 2, title: "Taj Mahal Sunrise & Return", detail: "Early morning sunrise visit to the Taj Mahal. Tour marble inlay workshops before driving back to Delhi." }
      ],
      coverPhotoId: "photo-1564507592333-c60657eea523",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Varanasi",
      slug: "varanasi",
      tagline: "The world's oldest living spiritual city along the sacred Ganges.",
      description: "Known as Kashi, Varanasi is the spiritual core of India where evening Ganga Aarti, sunrise boat rituals, and ancient alleys define the experience.",
      photoId: "photo-1699630923504-9a24dbaab37c",
    },
    pkg: {
      title: "Mystical Kashi: Varanasi & Sarnath Spiritual Trail",
      slug: "mystical-kashi-varanasi-sarnath-spiritual-trail",
      destination: "Varanasi, Uttar Pradesh",
      summary: "Witness the mesmerizing evening Ganga Aarti at Dashashwamedh Ghat, take a sunrise boat ride, and visit deer park Sarnath.",
      description: "A transformative 3-day spiritual retreat covering Kashi Vishwanath temple, Manikarnika ghats, classical music traditions, and Buddha's first sermon site at Sarnath.",
      days: 3,
      nights: 2,
      priceFrom: 9999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["Heritage/3-Star Hotel in Varanasi", "Daily Breakfast", "Evening Ganga Aarti Boat View", "Dawn Boat Ride on Holy River", "Sarnath Buddhist Excursion", "Private AC Cab for Transfers"],
      exclusions: ["Travel to Varanasi", "VIP Temple Darshan Fees", "Personal Offerings"],
      itinerary: [
        { day: 1, title: "Arrival in Varanasi & Ganga Aarti", detail: "Pickup from airport/railway. Check in. Evening private boat to witness the grand Ganga Aarti ceremonies with oil lamps and conch shells." },
        { day: 2, title: "Dawn Boat Ride & Sarnath", detail: "5:30 AM boat ride witnessing morning prayers along ancient ghats. Darshan at Kashi Vishwanath corridor. Afternoon trip to Sarnath." },
        { day: 3, title: "Banarasi Silk Trail & Departure", detail: "Explore Banarasi silk weaving looms and old alleyways before departure transfer." }
      ],
      coverPhotoId: "photo-1699630923504-9a24dbaab37c",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Brindavan",
      slug: "brindavan",
      tagline: "The sacred land of Krishna, Prem Mandir, and Yamuna ghats.",
      description: "The divine playground of Lord Krishna across Vrindavan, Mathura, and Govardhan, filled with devotional chants, marble temples, and festive spirit.",
      photoId: "photo-1695981152719-3fc012dc3da4",
    },
    pkg: {
      title: "Braj Bhoomi Pilgrimage: Vrindavan & Mathura",
      slug: "braj-bhoomi-pilgrimage-vrindavan-mathura",
      destination: "Mathura & Vrindavan, Uttar Pradesh",
      summary: "Visit Krishna Janmabhoomi, attend evening aarti at Banke Bihari temple, and marvel at the illuminated white Italian marble Prem Mandir.",
      description: "A 2-day devotional journey through the holiest sites of Braj, featuring ISKCON temple, Banke Bihari, and sacred Vishram Ghat on the Yamuna.",
      days: 2,
      nights: 1,
      priceFrom: 6499,
      badge: "none",
      inclusions: ["Deluxe Hotel in Vrindavan", "Daily Breakfast", "Prem Mandir & Banke Bihari Guided Darshan", "Krishna Janmasthan Visit in Mathura", "Private AC Cab from/to Delhi"],
      exclusions: ["Airfare/Train to Delhi", "Pooja Offerings", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Delhi to Mathura & Vrindavan", detail: "Drive to Mathura. Visit Shri Krishna Janmabhoomi temple and Vishram Ghat. Evening mesmerizing musical fountain at Prem Mandir." },
        { day: 2, title: "Banke Bihari Darshan & Return to Delhi", detail: "Morning darshan at Banke Bihari and ISKCON temple before your return drive to Delhi." }
      ],
      coverPhotoId: "photo-1695981152719-3fc012dc3da4",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"]
    }
  },
  {
    category: {
      name: "Taj Mahal",
      slug: "taj-mahal",
      tagline: "The world's greatest monument of eternal love.",
      description: "Dedicated exclusively to the poetic grandeur of the Taj Mahal and surrounding UNESCO World Heritage treasures of Fatehpur Sikri.",
      photoId: "photo-1564507592333-c60657eea523",
    },
    pkg: {
      title: "Taj Mahal Golden Dawn & Fatehpur Sikri",
      slug: "taj-mahal-golden-dawn-fatehpur-sikri",
      destination: "Agra & Fatehpur Sikri, Uttar Pradesh",
      summary: "Experience the Taj Mahal bathed in early morning pink and gold sunlight, followed by a visit to the preserved Mughal city of Fatehpur Sikri.",
      description: "An intensive 2-day architectural masterpiece tour exploring the Taj Mahal, Buland Darwaza, Salim Chishti Dargah, and Mughal gardens.",
      days: 2,
      nights: 1,
      priceFrom: 7499,
      badge: "bestSeller",
      inclusions: ["4-Star Hotel Stay in Agra", "Breakfast Included", "Taj Mahal Sunrise Entry & Expert Guide", "Fatehpur Sikri Excursion", "Private AC Cab from Delhi"],
      exclusions: ["Monument Entry Fees", "Personal Expenses", "Tips"],
      itinerary: [
        { day: 1, title: "Delhi to Fatehpur Sikri & Agra", detail: "Drive to Fatehpur Sikri to explore the deserted Mughal capital and Buland Darwaza. Continue to Agra for sunset at Mehtab Bagh." },
        { day: 2, title: "Taj Mahal Sunrise Experience & Return", detail: "Unforgettable dawn exploration of the Taj Mahal. Return to hotel for breakfast before driving back to Delhi." }
      ],
      coverPhotoId: "photo-1564507592333-c60657eea523",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "J & K",
      slug: "j-and-k",
      tagline: "Paradise on Earth: Dal Lake houseboats, Gulmarg snow, and Pahalgam valleys.",
      description: "Jammu & Kashmir is celebrated worldwide for shikara rides on Dal Lake, meadow walks in Pahalgam, and Asia's highest gondola at Gulmarg.",
      photoId: "photo-1685716271205-83a5ac2ba63b",
    },
    pkg: {
      title: "Heaven on Earth: Kashmir Valley & Gulmarg Snow",
      slug: "heaven-on-earth-kashmir-valley-gulmarg-snow",
      destination: "Srinagar, Gulmarg & Pahalgam, Jammu & Kashmir",
      summary: "Stay on an intricately carved Dal Lake luxury houseboat, take the Gulmarg Gondola up into the clouds, and walk through Betaab Valley.",
      description: "Our signature 6-day Kashmir holiday covers Mughal Gardens of Srinagar, ski slopes of Gulmarg, and the Lidder river banks of Pahalgam.",
      days: 6,
      nights: 5,
      priceFrom: 26999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["1 Night Luxury Dal Lake Houseboat + 4 Nights Premium Hotels", "Daily Breakfast & Dinner (MAP Plan)", "1-Hour Shikara Ride on Dal Lake", "Full Day Gulmarg & Pahalgam Excursions", "Private AC Vehicle (Innova/Etios) for All Transfers"],
      exclusions: ["Gondola Cable Car Ticket (Phases 1 & 2)", "Pony Rides in Pahalgam / Gulmarg", "Airfare to Srinagar"],
      itinerary: [
        { day: 1, title: "Arrival in Srinagar & Dal Lake Shikara", detail: "Arrive at Srinagar Airport. Check into your luxury carved cedar houseboat. Evening romantic shikara ride on floating markets of Dal Lake." },
        { day: 2, title: "Mughal Gardens of Srinagar", detail: "Tour Nishat Bagh (Garden of Pleasure), Shalimar Bagh, Chashme Shahi spring, and Shankaracharya hilltop temple." },
        { day: 3, title: "Day Excursion to Meadow of Flowers (Gulmarg)", detail: "Drive through pine slopes to Gulmarg. Ride the world's second-highest cable car (Gondola) up to snow-clad Apharwat Peak." },
        { day: 4, title: "Scenic Valley of Shepherds (Pahalgam)", detail: "Scenic drive via saffron fields of Pampore to Pahalgam. Enjoy walking along the rushing Lidder River." },
        { day: 5, title: "Betaab & Aru Valley Exploration", detail: "Visit scenic Betaab Valley, named after the Bollywood blockbuster, and alpine Aru Valley. Return to Srinagar." },
        { day: 6, title: "Departure", detail: "Transfer to Srinagar airport with unforgettable memories of Kashmir." }
      ],
      coverPhotoId: "photo-1685716271205-83a5ac2ba63b",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0"]
    }
  },
  {
    category: {
      name: "Shimla",
      slug: "shimla",
      tagline: "Colonial summer capital, cedar ridge walks, and snow vistas.",
      description: "Set amidst pine forests in Himachal Pradesh, Shimla features the pedestrian Ridge, historic Christ Church, and panoramic Himalayan viewpoints.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Shimla & Kufri Colonial Hill Holiday",
      slug: "shimla-kufri-colonial-hill-holiday",
      destination: "Shimla & Kufri, Himachal Pradesh",
      summary: "Stroll along the historic Mall Road, explore the British Viceregal Lodge, and enjoy panoramic snow mountain views from Kufri.",
      description: "A 4-day classic hill station retreat in Himachal Pradesh taking in the Ridge, Jakhu Temple with its giant Hanuman statue, and Kufri pine forests.",
      days: 4,
      nights: 3,
      priceFrom: 12999,
      badge: "none",
      inclusions: ["3-Star Valley View Resort", "Daily Breakfast & Dinner", "Kufri Excursion & Nature Park", "Jakhu Temple & Mall Road Walking Tour", "Private AC Cab from/to Chandigarh or Delhi"],
      exclusions: ["Travel to Delhi/Chandigarh", "Adventure rides at Kufri", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Drive to Queen of Hills", detail: "Pick up from Delhi/Chandigarh. Scenic drive up Himalayan highways to Shimla. Evening walk on the Ridge and Mall Road." },
        { day: 2, title: "Kufri Snow Viewpoint & Adventure", detail: "Drive to Kufri (8,600 ft). Enjoy pony rides, panoramic views of the Mahasu peak, and visit the Himalayan Nature Park." },
        { day: 3, title: "Viceregal Lodge & Jakhu Temple", detail: "Visit the grand Viceregal Lodge (Indian Institute of Advanced Study) and ascend to Jakhu Temple for 360-degree vistas." },
        { day: 4, title: "Departure", detail: "Scenic downhill drive back to Chandigarh or Delhi for your onward journey." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Kullu",
      slug: "kullu",
      tagline: "Valley of Gods, rushing Beas river, and apple orchards.",
      description: "Flanked by cedar-covered mountains and the roaring Beas River, Kullu is famous for river rafting, shawl weaving, and apple groves.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Valley of the Gods: Kullu & Naggar Castle",
      slug: "valley-of-the-gods-kullu-naggar-castle",
      destination: "Kullu & Naggar, Himachal Pradesh",
      summary: "Raft down the roaring Beas River, visit ancient wood-and-stone Naggar Castle, and explore traditional Kullu shawl weaving centers.",
      description: "A 3-day adventure and cultural journey in Kullu Valley, featuring river rafting, Roerich Art Gallery, and peaceful apple orchard stays.",
      days: 3,
      nights: 2,
      priceFrom: 10499,
      badge: "none",
      inclusions: ["Orchard View Resort Stay", "Daily Breakfast & Dinner", "Beas River Rafting Session (14 km)", "Naggar Castle Heritage Tour", "Private Cab from/to Bhuntar/Chandigarh"],
      exclusions: ["Travel to Chandigarh/Bhuntar", "Paragliding", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival in Kullu Valley", detail: "Arrive in Kullu. Check into your resort surrounded by apple orchards. Evening visit to authentic Kullu Shawl weaving cooperatives." },
        { day: 2, title: "White Water Rafting & Naggar Castle", detail: "Thrilling morning rafting on the Beas River. Afternoon excursion to historic 15th-century Naggar Castle and Nicholas Roerich Art Gallery." },
        { day: 3, title: "Bijli Mahadev & Departure", detail: "Visit the scenic viewpoint before departure transfer to Bhuntar or Chandigarh." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Manali",
      slug: "manali",
      tagline: "Snow peaks, Solang adventure, and pine-scented mountain air.",
      description: "India's adventure capital nestled in the northern end of Kullu Valley, leading to the high-altitude trans-Himalayan passes of Ladakh and Spiti.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Manali Snow Adventure & Solang Valley",
      slug: "manali-snow-adventure-solang-valley",
      destination: "Manali, Himachal Pradesh",
      summary: "Paraglide over Solang Valley, drive through the engineering marvel of Atal Tunnel to Sissu, and visit the ancient Hadimba Temple.",
      description: "A thrilling 5-day mountain holiday taking in Old Manali cafes, Vashisht hot water springs, Solang Valley snow sports, and Atal Tunnel.",
      days: 5,
      nights: 4,
      priceFrom: 16999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["3-Star Mountain Resort", "Daily Breakfast & Dinner", "Full-Day Solang Valley & Atal Tunnel / Sissu Tour", "Hadimba Temple & Vashisht Village Tour", "Private AC Cab from/to Chandigarh/Delhi"],
      exclusions: ["Paragliding / Skiing / Quad Biking", "Rohtang Pass NGT Permit (Subject to opening)", "Travel to Delhi/Chandigarh"],
      itinerary: [
        { day: 1, title: "Scenic Himalayan Highway to Manali", detail: "Drive along the Beas River to Manali (6,700 ft). Check into your resort and evening leisure on Mall Road." },
        { day: 2, title: "Hadimba Temple, Vashisht & Old Manali", detail: "Visit the 450-year-old timber Hadimba Temple in cedar woods, Vashisht hot sulfur springs, and vibrant Old Manali cafes." },
        { day: 3, title: "Solang Valley & Atal Tunnel to Lahaul", detail: "Full day of adventure at Solang Valley. Drive through the 9-km Atal Tunnel into Lahaul Valley to see the frozen Sissu waterfall." },
        { day: 4, title: "Naggar Castle or River Relaxation", detail: "Relax with river walks along the Beas, visit Tibetan monasteries, and shop for local fruit jams and honey." },
        { day: 5, title: "Departure", detail: "Morning mountain breakfast before return drive to Chandigarh or Delhi." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Nainital",
      slug: "nainital",
      tagline: "Shimmering eye-shaped lake, pine hills, and Himalayan peaks.",
      description: "A beloved Kumaon lake town in Uttarakhand set around pear-shaped Naini Lake, with panoramic views of snow-dusted peaks from high ridges.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Lakes & Ridges: Nainital & Bhimtal Getaway",
      slug: "lakes-and-ridges-nainital-bhimtal-getaway",
      destination: "Nainital & Bhimtal, Uttarakhand",
      summary: "Row across emerald Naini Lake, take the ropeway to Snow View Point, and visit the tranquil island cafe in the middle of Bhimtal.",
      description: "A refreshing 4-day Kumaon holiday exploring Naini Lake, Naina Devi Temple, Tiffin Top, Bhimtal, Sattal, and Naukuchiatal.",
      days: 4,
      nights: 3,
      priceFrom: 12499,
      badge: "none",
      inclusions: ["3-Star Lake View Hotel", "Daily Breakfast & Dinner", "Naini Lake Boating", "Lake Tour of Bhimtal, Sattal & Naukuchiatal", "Private AC Cab from/to Kathgodam/Delhi"],
      exclusions: ["Travel to Delhi/Kathgodam", "Ropeway Tickets", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Delhi/Kathgodam to Nainital", detail: "Scenic drive ascending through pine hills. Check in and enjoy an evening stroll on Mall Road and boating on Naini Lake." },
        { day: 2, title: "Snow View Point & Local Sights", detail: "Cable car up to Snow View Point for vistas of Trishul and Nanda Devi peaks. Visit Naina Devi Temple and Cave Garden." },
        { day: 3, title: "Lake Tour: Bhimtal, Sattal & Naukuchiatal", detail: "Day excursion to the nine-cornered Naukuchiatal, Bhimtal lake with island aquarium, and seven interconnected lakes at Sattal." },
        { day: 4, title: "Departure", detail: "Descent to Kathgodam railway station or Delhi for your journey home." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Dalhousie",
      slug: "dalhousie",
      tagline: "Scottish-style church squares, deodar forests, and Mini Switzerland.",
      description: "Built across five pine hills in Himachal Pradesh, Dalhousie charms visitors with colonial manors and the saucer-shaped green meadow of Khajjiar.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Mini Switzerland of India: Dalhousie & Khajjiar",
      slug: "mini-switzerland-of-india-dalhousie-khajjiar",
      destination: "Dalhousie & Khajjiar, Himachal Pradesh",
      summary: "Walk across the emerald meadows of Khajjiar surrounded by dense cedar woods, and take in the serenity of Panchpula waterfalls.",
      description: "A 4-day colonial and alpine retreat exploring St. John’s Church, Subhash Baoli, Khajjiar Lake, and Dainkund Peak.",
      days: 4,
      nights: 3,
      priceFrom: 13499,
      badge: "none",
      inclusions: ["Hill Resort Accommodation", "Daily Breakfast & Dinner", "Full-Day Khajjiar & Kalatop Wildlife Sanctuary Tour", "Panchpula & Dainkund Trek Excursion", "Private AC Cab from/to Pathankot/Chakki Bank"],
      exclusions: ["Travel to Pathankot", "Horse Riding at Khajjiar", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Pathankot to Dalhousie Pine Hills", detail: "Pick up from Pathankot. Scenic uphill drive to Dalhousie. Evening walk around Gandhi Chowk and St. John's Church." },
        { day: 2, title: "Excursion to Khajjiar (Mini Switzerland)", detail: "Spend the day on the lush green meadows of Khajjiar centered around a natural lake and dense deodar trees." },
        { day: 3, title: "Dainkund Peak & Panchpula Cascade", detail: "Hike up Dainkund Peak for 360-degree vistas of the Pir Panjal range. Visit Panchpula memorial waterfall." },
        { day: 4, title: "Departure", detail: "Scenic downhill drive back to Pathankot railway station." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Chardham",
      slug: "chardham",
      tagline: "Sacred Himalayan pilgrimage to Yamunotri, Gangotri, Kedarnath & Badrinath.",
      description: "The ultimate Hindu pilgrimage set high in the Garhwal Himalayas of Uttarakhand, sanctified by the presence of Kedarnath and Badrinath.",
      photoId: "photo-1544735716-392fe2489ffa",
    },
    pkg: {
      title: "Sacred Chardham Yatra: Kedarnath & Badrinath",
      slug: "sacred-chardham-yatra-kedarnath-badrinath",
      destination: "Kedarnath & Badrinath, Uttarakhand",
      summary: "Trek to the holy shrine of Lord Shiva at Kedarnath (11,755 ft) and offer prayers at the colorful temple of Lord Vishnu in Badrinath.",
      description: "A spiritually uplifting 7-day Do-Dham / Char-Dham tour with curated stays in Guptkashi, Kedarnath, and Joshimath, guided by mountain drivers.",
      days: 7,
      nights: 6,
      priceFrom: 29999,
      badge: "bestSeller",
      inclusions: ["Deluxe Hotels & Kedarnath Base Camp Lodging", "Daily Breakfast & Vegetarian Dinners", "Special Yatra Registration Assistance", "Dedicated Mountain Vehicle (Innova/Tempo)", "Mana Village & Saraswati River Excursion"],
      exclusions: ["Helicopter / Pony / Palki to Kedarnath", "Travel to Haridwar/Rishikesh", "VIP Darshan Passes", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Haridwar/Rishikesh to Guptkashi", detail: "Drive along the roaring Alaknanda and Mandakini rivers through Devprayag and Rudraprayag to Guptkashi." },
        { day: 2, title: "Sonprayag to Kedarnath Trek (16 km)", detail: "Early drive to Sonprayag/Gaurikund. Trek up to Kedarnath Dham. Evening darshan and evening aarti amidst Himalayan snow peaks." },
        { day: 3, title: "Kedarnath Darshan & Downhill Trek", detail: "Morning darshan at the ancient stone temple of Kedarnath. Trek down to Gaurikund and overnight in Guptkashi." },
        { day: 4, title: "Guptkashi to Badrinath via Joshimath", detail: "Scenic drive through Chopta valleys and Joshimath to Badrinath (10,279 ft). Evening aarti at Badrinath Temple." },
        { day: 5, title: "Badrinath Darshan & Mana Village", detail: "Morning sacred bath at Tapt Kund and darshan. Visit Mana (India's first border village), Vyas Cave, and Bhim Pul." },
        { day: 6, title: "Badrinath to Srinagar/Rudraprayag", detail: "Drive down to Rudraprayag or Srinagar Garhwal. Rest after your spiritual pilgrimage." },
        { day: 7, title: "Return to Haridwar/Rishikesh & Departure", detail: "Visit Laxman Jhula and Ram Jhula in Rishikesh before drop-off at Haridwar railway station." }
      ],
      coverPhotoId: "photo-1544735716-392fe2489ffa",
      galleryPhotoIds: ["photo-1695981152719-3fc012dc3da4", "photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0"]
    }
  },
  {
    category: {
      name: "Kasol",
      slug: "kasol",
      tagline: "Parvati valley pine forests, hippie cafes, and trekking trails.",
      description: "Nestled along the turquoise Parvati River, Kasol is a haven for backpackers, trekkers, and nature lovers seeking pine forests and mountain peace.",
      photoId: "photo-1549817997-f6958ecf47b9",
    },
    pkg: {
      title: "Parvati Valley Magic: Kasol, Tosh & Manikaran",
      slug: "parvati-valley-magic-kasol-tosh-manikaran",
      destination: "Kasol & Parvati Valley, Himachal Pradesh",
      summary: "Stroll along the rushing Parvati River, visit the hot springs of Manikaran Sahib, and hike up to the picturesque wooden hamlet of Tosh.",
      description: "A 4-day bohemian mountain getaway featuring riverside Swiss camp stays, Israeli cuisine, pine forest treks, and natural thermal springs.",
      days: 4,
      nights: 3,
      priceFrom: 10999,
      badge: "newJourney",
      inclusions: ["Riverside Boutique Camps/Hotels", "Daily Breakfast & Dinner", "Tosh Village Day Trek", "Manikaran Gurudwara & Hot Springs Visit", "Private Cab from/to Chandigarh/Bhuntar"],
      exclusions: ["Travel to Chandigarh", "Kheerganga Trek Guide (Optional)", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Drive to Parvati Valley & Kasol Check-in", detail: "Drive through narrow mountain gorges along the Parvati River to Kasol. Check into your riverside camp." },
        { day: 2, title: "Chalal Village Walk & Manikaran Hot Springs", detail: "Cross the suspension bridge on a pine trail to Chalal. Afternoon visit to the sacred hot springs and langar at Manikaran Sahib." },
        { day: 3, title: "Tosh Village Hike & Mountain Cafes", detail: "Drive to Barshaini and hike up to Tosh village for panoramic views of snow-dusted peaks and apple orchards." },
        { day: 4, title: "Departure", detail: "Morning riverside coffee before return drive to Chandigarh." }
      ],
      coverPhotoId: "photo-1549817997-f6958ecf47b9",
      galleryPhotoIds: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"]
    }
  },
  {
    category: {
      name: "Punjab",
      slug: "punjab",
      tagline: "The golden spiritual glow of Amritsar and mustard fields.",
      description: "The land of five rivers, famed for the glittering Golden Temple, legendary hospitality, Wagah border patriotic fervour, and hearty Punjabi cuisine.",
      photoId: "photo-1514222134-b57cbb8ce073",
    },
    pkg: {
      title: "Spiritual Amritsar: Golden Temple & Wagah Border",
      slug: "spiritual-amritsar-golden-temple-wagah-border",
      destination: "Amritsar, Punjab",
      summary: "Gaze at the Golden Temple illuminated across the Amrit Sarovar, partake in community langar, and feel the energy at the Wagah Border parade.",
      description: "A deeply moving 3-day cultural holiday taking in Sri Harmandir Sahib, Jallianwala Bagh, Wagah Border beating retreat ceremony, and kulchas.",
      days: 3,
      nights: 2,
      priceFrom: 8499,
      badge: "bestSeller",
      inclusions: ["4-Star Hotel in Amritsar", "Daily Breakfast", "Wagah Border Beating Retreat Ceremony Visit", "Golden Temple & Jallianwala Bagh Guided Walk", "Private AC Cab for All Transfers"],
      exclusions: ["Airfare/Train to Amritsar", "Personal Expenses", "Tips"],
      itinerary: [
        { day: 1, title: "Arrival in Amritsar & Night Golden Temple", detail: "Arrival in Amritsar. Check in. Evening visit to the Golden Temple when the sanctum is bathed in golden light." },
        { day: 2, title: "Jallianwala Bagh & Electrifying Wagah Border", detail: "Visit historic Jallianwala Bagh and Partition Museum. Afternoon drive to the Indo-Pak Wagah Border for the thrilling military flag ceremony." },
        { day: 3, title: "Gobindgarh Fort & Departure", detail: "Explore the 18th-century Gobindgarh Fort and enjoy hot Amritsari kulchas before airport/railway station drop-off." }
      ],
      coverPhotoId: "photo-1514222134-b57cbb8ce073",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Mumbai",
      slug: "mumbai",
      tagline: "The City of Dreams, Queen's Necklace, and Bollywood glamour.",
      description: "India's financial and cultural powerhouse, bustling with Victorian Gothic architecture, seaside promenades, and the energy of Bollywood.",
      photoId: "photo-1570168007204-dfb528c6958f",
    },
    pkg: {
      title: "Maximum City: Mumbai Heritage & Marine Drive",
      slug: "maximum-city-mumbai-heritage-marine-drive",
      destination: "Mumbai, Maharashtra",
      summary: "Stand before the iconic Gateway of India, cruise to Elephanta Caves, and watch the sun set over the Queen's Necklace at Marine Drive.",
      description: "A 3-day cosmopolitan exploration taking in UNESCO-listed Victoria Terminus, Elephanta Island, Bandra-Worli Sea Link, and street food at Chowpatty.",
      days: 3,
      nights: 2,
      priceFrom: 12999,
      badge: "none",
      inclusions: ["4-Star Hotel in South/Central Mumbai", "Daily Breakfast", "Elephanta Caves Ferry & Guide", "Full Day Mumbai Heritage City Tour", "Private AC Chauffeur Cab"],
      exclusions: ["Airfare/Train to Mumbai", "Elephanta Toy Train / Entry Fees", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Welcome to Mumbai & Marine Drive", detail: "Arrival in Mumbai. Visit the Gateway of India and take an evening drive along Marine Drive to watch the Queen's Necklace lights." },
        { day: 2, title: "Elephanta Island & Victorian Architecture", detail: "Morning ferry across Mumbai Harbour to 6th-century rock-cut Elephanta Caves. Afternoon tour of CST Station and Dhobi Ghat." },
        { day: 3, title: "Bandra Sea Link, Siddhivinayak & Departure", detail: "Drive across Bandra-Worli Sea Link. Visit Siddhivinayak Temple before departure transfer." }
      ],
      coverPhotoId: "photo-1570168007204-dfb528c6958f",
      galleryPhotoIds: ["photo-1567157577867-05ccb1388e66", "photo-1597073642928-48c0971f7ded", "photo-1554092917-15b3e3f9e85a"]
    }
  },
  {
    category: {
      name: "Goa",
      slug: "goa",
      tagline: "Sun-drenched beaches, Portuguese churches, and susegad living.",
      description: "India's pocket paradise, blending 450 years of Portuguese heritage with golden palm-fringed sands, beach shacks, and vibrant night markets.",
      photoId: "photo-1512343879784-a960bf40e7f2",
    },
    pkg: {
      title: "Sunny Shores: North & South Goa Extravaganza",
      slug: "sunny-shores-north-and-south-goa-extravaganza",
      destination: "Goa",
      summary: "Explore Portuguese churches in Old Goa, cruise on the Mandovi River, and relax at sun-kissed beaches from Calangute to Palolem.",
      description: "A 5-day classic tropical vacation experiencing historic forts, water sports, spice plantations, and the easygoing susegad lifestyle.",
      days: 5,
      nights: 4,
      priceFrom: 18999,
      badge: "bestSeller",
      isFeatured: true,
      inclusions: ["Beachfront/Boutique Resort Stay", "Daily Buffet Breakfast", "North Goa Forts & Beach Tour", "South Goa Heritage & Old Goa Church Tour", "Mandovi River Sunset Cruise", "Roundtrip Airport Transfers"],
      exclusions: ["Airfare to Goa", "Water Sports Charges", "Personal Expenses & Drinks"],
      itinerary: [
        { day: 1, title: "Welcome to Tropical Goa", detail: "Arrival at Goa Airport/Mopa. Transfer to resort. Evening leisure with cocktails by the beach." },
        { day: 2, title: "North Goa Forts & Beaches", detail: "Visit 17th-century Fort Aguada overlooking the Arabian Sea, followed by Calangute, Baga, and Anjuna beaches." },
        { day: 3, title: "Old Goa Heritage & Mandovi Cruise", detail: "Tour Basilica of Bom Jesus and Se Cathedral in Old Goa. Afternoon spice plantation tour with lunch and evening Mandovi river cruise." },
        { day: 4, title: "South Goa Beaches & Watersports", detail: "Day trip to peaceful South Goa beaches like Colva or Palolem, or indulge in scuba diving and parasailing." },
        { day: 5, title: "Departure", detail: "Breakfast by the pool before transfer to Goa Airport." }
      ],
      coverPhotoId: "photo-1512343879784-a960bf40e7f2",
      galleryPhotoIds: ["photo-1554092917-15b3e3f9e85a", "photo-1609854534028-b512f5246abc", "photo-1544735716-392fe2489ffa"]
    }
  },
  {
    category: {
      name: "Kolkata",
      slug: "kolkata",
      tagline: "The City of Joy, colonial grandeur, and cultural soul.",
      description: "India's intellectual and cultural capital, famed for the white marble Victoria Memorial, the iconic Howrah Bridge, tramcars, and literary heritage.",
      photoId: "photo-1558431382-27e303142255",
    },
    pkg: {
      title: "City of Joy: Kolkata Heritage & Cultural Trail",
      slug: "city-of-joy-kolkata-heritage-cultural-trail",
      destination: "Kolkata, West Bengal",
      summary: "Marvel at the Victoria Memorial, ride a historic tram, cruise past Howrah Bridge on the Hooghly, and taste authentic roshogollas.",
      description: "A 3-day nostalgic journey through colonial Calcutta and modern Kolkata, featuring Dakshineswar Kali Temple, College Street, and Victoria Memorial.",
      days: 3,
      nights: 2,
      priceFrom: 8999,
      badge: "none",
      inclusions: ["Heritage/3-Star City Hotel", "Daily Breakfast", "Full-Day Kolkata Heritage Tour", "Hooghly River Evening Boat Ride", "Private AC Cab for Sightseeing"],
      exclusions: ["Airfare/Train to Kolkata", "Victoria Memorial Museum Entry", "Personal Expenses"],
      itinerary: [
        { day: 1, title: "Arrival in Kolkata & Hooghly Ghats", detail: "Arrival in Kolkata. Check in and evening boat ride near Princep Ghat admiring the illuminated Vidyasagar Setu." },
        { day: 2, title: "Victoria Memorial, St. Paul's & Park Street", detail: "Tour the grand Victoria Memorial, St. Paul's Cathedral, Marble Palace, and College Street boi para (book market)." },
        { day: 3, title: "Dakshineswar, Belur Math & Departure", detail: "Morning visit to Dakshineswar Kali Temple and Belur Math on the Hooghly River before airport/station drop-off." }
      ],
      coverPhotoId: "photo-1558431382-27e303142255",
      galleryPhotoIds: ["photo-1597073642928-48c0971f7ded", "photo-1695981152719-3fc012dc3da4", "photo-1544735716-392fe2489ffa"]
    }
  }
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Check .env.local.");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully.\n");

  console.log(`Starting upsert of ${DESTINATIONS.length} destinations and packages...\n`);

  let catCreated = 0;
  let pkgCreated = 0;

  for (let i = 0; i < DESTINATIONS.length; i++) {
    const item = DESTINATIONS[i];
    const catData = item.category;
    const pkgData = item.pkg;

    // 1. Upsert Category
    const categoryDoc = await Category.findOneAndUpdate(
      { slug: catData.slug },
      {
        $set: {
          name: catData.name,
          slug: catData.slug,
          tagline: catData.tagline,
          description: catData.description,
          thumbnail: img(catData.photoId, `${catData.name} Travel Destination`),
          heroImage: img(catData.photoId, `${catData.name} Landscape View`),
          order: i,
          isActive: true,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    catCreated++;

    // 2. Upsert Package
    const coverImage = img(pkgData.coverPhotoId, `${pkgData.title} Cover Photo`);
    const galleryImages = pkgData.galleryPhotoIds.map((pId, idx) =>
      img(pId, `${pkgData.title} Gallery Photo ${idx + 1}`)
    );

    await Package.findOneAndUpdate(
      { slug: pkgData.slug },
      {
        $set: {
          category: categoryDoc._id,
          title: pkgData.title,
          slug: pkgData.slug,
          destination: pkgData.destination,
          summary: pkgData.summary,
          description: pkgData.description,
          days: pkgData.days,
          nights: pkgData.nights,
          priceFrom: pkgData.priceFrom,
          currency: "INR",
          inclusions: pkgData.inclusions,
          exclusions: pkgData.exclusions,
          itinerary: pkgData.itinerary,
          coverImage,
          images: galleryImages,
          badge: pkgData.badge,
          isFeatured: Boolean(pkgData.isFeatured),
          isActive: true,
          order: i,
        },
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    pkgCreated++;

    // 3. Upsert into Trending collection if marked featured
    if (pkgData.isFeatured || catData.isInternational) {
      await Trending.findOneAndUpdate(
        { slug: catData.slug },
        {
          $set: {
            tab: catData.isInternational ? "international" : "india",
            name: catData.name,
            slug: catData.slug,
            style: "title",
            image: coverImage,
            order: i,
            isActive: true,
          },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }

    console.log(`[${i + 1}/${DESTINATIONS.length}] Upserted: ${catData.name} -> "${pkgData.title}"`);
  }

  console.log(`\nDONE!`);
  console.log(`Successfully processed ${catCreated} Master Categories and ${pkgCreated} Curated Tour Packages.`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

main().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
