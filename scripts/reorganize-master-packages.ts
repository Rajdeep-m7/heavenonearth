/**
 * Reorganizes all packages under true Master Categories (e.g. Sikkim, Darjeeling, Himachal, Kerala)
 * and assigns distinct, crystal-clear, high-resolution photography to all packages and master categories.
 *
 * Run with: npx tsx scripts/reorganize-master-packages.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import mongoose from "mongoose";
import { Category } from "../lib/db/models/Category";
import { Package } from "../lib/db/models/Package";
import { Trending } from "../lib/db/models/Trending";

const sharpImg = (photoId: string, alt: string) => {
  const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=85&w=1600`;
  return {
    publicId: url,
    url,
    width: 1600,
    height: 1060,
    alt,
  };
};

/* -------------------------------------------------------------------------- */
/* Master Categories (Destinations / Regions)                                 */
/* -------------------------------------------------------------------------- */
const MASTER_CATEGORIES = [
  // International
  {
    name: "Thailand",
    slug: "thailand",
    tagline: "Golden temples, bustling night bazaars, and turquoise tropical islands.",
    description: "From Bangkok's ornate Grand Palace to the karst cliffs and emerald waters of Phuket, Thailand offers legendary hospitality, world-class street food, and pristine beaches.",
    photoId: "photo-1552465011-b4e21bf6e79a",
    isInternational: true,
    order: 0,
  },
  {
    name: "Vietnam",
    slug: "vietnam",
    tagline: "Limestone karsts, emerald bays, and lanterns along ancient riverbanks.",
    description: "A country of staggering natural beauty and deep cultural soul, spanning Ha Long Bay's iconic islets to Hoi An's historic streets.",
    photoId: "photo-1528127269322-539801943592",
    isInternational: true,
    order: 1,
  },
  {
    name: "UAE",
    slug: "uae",
    tagline: "Futuristic skylines, golden desert dunes, and royal Arabian luxury.",
    description: "Experience the glittering towers of Dubai, thrilling desert safaris, and the cultural grandeur of Abu Dhabi's Sheikh Zayed Mosque.",
    photoId: "photo-1512453979798-5ea266f8880c",
    isInternational: true,
    order: 2,
  },
  {
    name: "Sri Lanka",
    slug: "sri-lanka",
    tagline: "Ancient rock citadels, misty tea hills, and golden Indian Ocean coastlines.",
    description: "Discover the teardrop island of Ceylon, featuring the Sigiriya fortress, scenic train rides through Ella, and pristine beaches.",
    photoId: "photo-1612862862126-865765df2ded",
    isInternational: true,
    order: 3,
  },
  {
    name: "Nepal",
    slug: "nepal",
    tagline: "Sacred Himalayan shrines, tranquil alpine lakes, and panoramic snow peaks.",
    description: "Gaze upon the Annapurna and Everest massifs, wander ancient medieval palace squares in Kathmandu, and boat across Phewa Lake in Pokhara.",
    photoId: "photo-1544735716-392fe2489ffa",
    isInternational: true,
    order: 4,
  },
  {
    name: "Bhutan",
    slug: "bhutan",
    tagline: "The Thunder Dragon Kingdom of cliffside monasteries and Himalayan peace.",
    description: "Ascend to the legendary Tiger's Nest monastery perched on a shear cliff, explore ancient fortress dzongs, and breathe pristine mountain air.",
    photoId: "photo-1638246439638-b37095b34879",
    isInternational: true,
    order: 5,
  },

  // Domestic (India)
  {
    name: "Sikkim",
    slug: "sikkim",
    tagline: "Alpine glacial lakes, sacred monasteries, and the guardian peaks of Kanchenjunga.",
    description: "A peaceful Himalayan sanctuary home to high-altitude Gurudongmar Lake, the vibrant ridge of Gangtok, blooming Yumthang Valley, and sacred Buddhist monasteries.",
    photoId: "photo-1648113821624-244c6c1baf54",
    order: 10,
  },
  {
    name: "Darjeeling",
    slug: "darjeeling",
    tagline: "Heritage steam toy trains, world-famous tea slopes, and sunrise over Kanchenjunga.",
    description: "The Queen of the Hills, celebrated for rolling emerald tea estates, the UNESCO Himalayan Railway, Tiger Hill dawn views, and colonial-era charm.",
    photoId: "photo-1544735716-392fe2489ffa",
    order: 11,
  },
  {
    name: "Kalimpong",
    slug: "kalimpong",
    tagline: "Misty pine ridges, exotic orchid nurseries, and untouched mountain hamlets.",
    description: "A serene hill retreat overlooking the Teesta River, surrounded by the quiet forest hideaways of Lava, Rishyap, and Lolegaon.",
    photoId: "photo-1549817997-f6958ecf47b9",
    order: 12,
  },
  {
    name: "Dooars",
    slug: "dooars",
    tagline: "Dense sal forests, river sanctuaries, and wild one-horned rhinos in the Himalayan foothills.",
    description: "The gateway to Bhutan, blessed with Jaldapara National Park, Chilapata forests, Murti riverbanks, and wildlife safaris.",
    photoId: "photo-1787741188520-6de306d9d1d3",
    order: 13,
  },
  {
    name: "Kerala",
    slug: "kerala",
    tagline: "God's Own Country: emerald backwaters, misty tea plantations, and palm-fringed coastlines.",
    description: "Drift along the serene backwaters of Alleppey on a private houseboat, stroll misty tea gardens in Munnar, and rejuvenate with authentic Ayurvedic traditions.",
    photoId: "photo-1602216056096-3b40cc0c9944",
    order: 14,
  },
  {
    name: "Himachal Pradesh",
    slug: "himachal-pradesh",
    tagline: "Snowy peaks, colonial ridges, roaring alpine rivers, and pine-scented valleys.",
    description: "From the colonial promenade of Shimla to the snowy adventure trails of Manali, the deodar meadows of Dalhousie, and the mystic Parvati valley in Kasol.",
    photoId: "photo-1616942986550-ea6469c08530",
    order: 15,
  },
  {
    name: "Uttarakhand",
    slug: "uttarakhand",
    tagline: "Land of the Gods: sacred Chardham shrines and tranquil emerald mountain lakes.",
    description: "Pilgrimage journeys to Kedarnath and Badrinath, paired with the peaceful boat rides of Nainital and Bhimtal amidst the lower Himalayas.",
    photoId: "photo-1549817997-f6958ecf47b9",
    order: 16,
  },
  {
    name: "Assam",
    slug: "assam",
    tagline: "Mighty Brahmaputra river, sacred Kamakhya blessings, and one-horned rhinos in Kaziranga.",
    description: "The gateway to India's Northeast, featuring river island shrines, prehistoric rhinos in vast elephant grass grasslands, and verdant tea estates.",
    photoId: "photo-1787741188520-6de306d9d1d3",
    order: 17,
  },
  {
    name: "West Bengal",
    slug: "west-bengal",
    tagline: "City of Joy cultural grandeur, Nawabi palaces, and wide Bay of Bengal sandy shores.",
    description: "Explore the heritage architecture of Kolkata, the historic Hazarduari palace in Murshidabad, and coastal seaside getaways in Digha and Mandarmani.",
    photoId: "photo-1558431382-27e303142255",
    order: 18,
  },
  {
    name: "Uttar Pradesh",
    slug: "uttar-pradesh",
    tagline: "The golden Mughal marvel of the Taj Mahal, sacred Ganga aartis, and eternal Braj devotion.",
    description: "India's greatest cultural and spiritual heartland, encompassing the wonder of Agra, the timeless mystic ghats of Varanasi, and holy Vrindavan.",
    photoId: "photo-1564507592333-c60657eea523",
    order: 19,
  },
  {
    name: "Jammu & Kashmir",
    slug: "jammu-and-kashmir",
    tagline: "Paradise on Earth: floating shikaras on Dal Lake and snow-blanketed slopes in Gulmarg.",
    description: "Experience the timeless beauty of Srinagar's Mughal gardens, ride the high-altitude Gulmarg Gondola, and marvel at the pine valleys of Pahalgam.",
    photoId: "photo-1685716271205-83a5ac2ba63b",
    order: 20,
  },
  {
    name: "Karnataka",
    slug: "karnataka",
    tagline: "Royal palaces of Mysore and the magnificent stone empire ruins of Hampi.",
    description: "A journey through Karnataka's royal dynasties, from the glittering Mysore Palace to the UNESCO boulder-strewn ruins of the Vijayanagara Empire.",
    photoId: "photo-1695981152719-3fc012dc3da4",
    order: 21,
  },
  {
    name: "Tamil Nadu",
    slug: "tamil-nadu",
    tagline: "Queen of the Nilgiris: eucalyptus blue mountains, tea slopes, and heritage toy trains.",
    description: "Unwind in cool mountain breezes in Ooty and Coonoor, explore Pykara waterfalls, and ride the historic Nilgiri Mountain Railway.",
    photoId: "photo-1674498260932-6f7d8eed6d9f",
    order: 22,
  },
  {
    name: "Puducherry",
    slug: "puducherry",
    tagline: "French colonial boulevards, mustard villas, seaside promenade, and Auroville peace.",
    description: "The French Riviera of the East, famed for French Quarter heritage walks, tranquil beaches, and the experimental spiritual haven of Auroville.",
    photoId: "photo-1597073642928-48c0971f7ded",
    order: 23,
  },
  {
    name: "Andhra Pradesh",
    slug: "andhra-pradesh",
    tagline: "Scenic coastlines of Vizag, coffee valleys of Araku, and sacred Tirupati Balaji darshan.",
    description: "Where lush Eastern Ghats meet the Bay of Bengal, featuring Rishikonda beach, Borra Caves, and the world's most revered pilgrimage on Tirumala hill.",
    photoId: "photo-1609854534028-b512f5246abc",
    order: 24,
  },
  {
    name: "Telangana",
    slug: "telangana",
    tagline: "City of Pearls: magnificent Charminar, mighty Golconda fort, and royal Nizami feasts.",
    description: "A vibrant blend of 400-year-old heritage and dynamic modernity, celebrated for Qutb Shahi monuments, Chowmahalla Palace, and world-renowned biryani.",
    photoId: "photo-1711102230980-5f3001c1a07b",
    order: 25,
  },
  {
    name: "Odisha",
    slug: "odisha",
    tagline: "Lord Jagannath's sacred abode, Konark Sun Temple chariot, and Chilika dolphin lagoon.",
    description: "One of India's most spiritually profound coastal regions, featuring Puri's Golden Beach, Konark's stone architectural wonder, and Irrawaddy dolphin boat tours.",
    photoId: "photo-1609854534028-b512f5246abc",
    order: 26,
  },
  {
    name: "Madhya Pradesh",
    slug: "madhya-pradesh",
    tagline: "The impregnable fortress of Gwalior and untamed wilderness of Satpura National Park.",
    description: "The Heart of Incredible India, spanning the historic palaces of the Scindias and pristine river safaris through Satpura tiger country.",
    photoId: "photo-1597073642928-48c0971f7ded",
    order: 27,
  },
  {
    name: "Punjab",
    slug: "punjab",
    tagline: "Golden Temple serenity, Wagah border patriotic fervour, and hearty Punjabi warmth.",
    description: "Experience the divine spiritual atmosphere of Sri Harmandir Sahib in Amritsar, the evening flag ceremony at Wagah, and rich culinary traditions.",
    photoId: "photo-1609947017136-9daf32a5eb16",
    order: 28,
  },
  {
    name: "Maharashtra",
    slug: "maharashtra",
    tagline: "Maximum City Mumbai: Gateway of India, Marine Drive Queen's Necklace, and Bollywood energy.",
    description: "India's commercial capital and cultural powerhouse, featuring Victorian Gothic landmarks, Arabian Sea sunsets, and bustling bazaars.",
    photoId: "photo-1570168007204-dfb528c6958f",
    order: 29,
  },
  {
    name: "Goa",
    slug: "goa",
    tagline: "Golden sandy beaches, swaying palm groves, Portuguese churches, and coastal nightlife.",
    description: "India's premier beach paradise, offering thrilling water sports in North Goa, serene private bays in South Goa, and historic colonial charm.",
    photoId: "photo-1512343879784-a960bf40e7f2",
    order: 30,
  },
  {
    name: "Andaman",
    slug: "andaman",
    tagline: "Crystal turquoise lagoons, Radhanagar white sands, and vibrant coral reef adventures.",
    description: "Tropical island paradise in the Bay of Bengal, celebrated for world-class scuba diving, limestone caves, and untouched ivory beaches.",
    photoId: "photo-1554092917-15b3e3f9e85a",
    order: 31,
  },
  {
    name: "Delhi",
    slug: "delhi",
    tagline: "Centuries of royal empires: Mughal monuments, India Gate, and grand heritage avenues.",
    description: "The historic capital of India, bridging the narrow alleys and spices of Old Delhi with the imperial architecture of New Delhi.",
    photoId: "photo-1587474260584-136574528ed5",
    order: 32,
  },
];

/* -------------------------------------------------------------------------- */
/* Mapping from package slug to its true Master Category slug                */
/* -------------------------------------------------------------------------- */
const PACKAGE_TO_CATEGORY: Record<string, string> = {
  // International
  "exotic-thailand-coral-islands-getaway": "thailand",
  "phuket-tropical-paradise-phi-phi-islands": "thailand",
  "splendours-of-vietnam-hanoi-to-ha-long-bay": "vietnam",
  "splendours-of-vietnam-hanoi-halong-bay": "vietnam",
  "wonders-of-ceylon-kandy-nuwara-eliya-bentota": "sri-lanka",
  "grand-uae-experience-dubai-abu-dhabi": "uae",
  "glitz-glamour-of-dubai": "uae",
  "glitz-and-glamour-of-dubai": "uae",
  "himalayan-highlights-kathmandu-pokhara": "nepal",
  "enchanting-bhutan-thimphu-punakha-paro": "bhutan",

  // Sikkim packages (ALL UNDER SIKKIM)
  "jewel-of-sikkim-gangtok-tsomgo-lake": "sikkim",
  "expedition-north-sikkim-lachen-lachung-gurudongmar": "sikkim",
  "serenity-of-south-sikkim-namchi-ravangla": "sikkim",
  "sikkim-mountain-journey": "sikkim",

  // Darjeeling packages (ALL UNDER DARJEELING)
  "darjeeling-tea-and-mountain-escape": "darjeeling",
  "darjeeling-3n-4d": "darjeeling",
  "hidden-hamlets-lamahatta-tinchuley-chatakpur": "darjeeling",

  // Kalimpong packages (ALL UNDER KALIMPONG)
  "kalimpong": "kalimpong",
  "kalimpong-ridge-valley-retreat": "kalimpong",
  "kalimpong-ridge-and-valley-retreat": "kalimpong",
  "wilderness-triangle-lava-rishyap-lolegaon": "kalimpong",

  // Dooars packages
  "dooars-wildlife-trail-jaldapara-chilapata": "dooars",

  // Kerala packages (ALL UNDER KERALA)
  "glimpse-of-gods-own-country-munnar-alleppey": "kerala",
  "misty-munnar-tea-trails-wildlife": "kerala",
  "alleppey-backwater-cruise-marari-beach-haven": "kerala",

  // Himachal Pradesh packages (ALL UNDER HIMACHAL)
  "shimla-kufri-colonial-hill-holiday": "himachal-pradesh",
  "valley-of-the-gods-kullu-naggar-castle": "himachal-pradesh",
  "manali-snow-adventure-solang-valley": "himachal-pradesh",
  "mini-switzerland-of-india-dalhousie-khajjiar": "himachal-pradesh",
  "parvati-valley-magic-kasol-tosh-manikaran": "himachal-pradesh",

  // Uttarakhand packages (ALL UNDER UTTARAKHAND)
  "lakes-ridges-nainital-bhimtal-getaway": "uttarakhand",
  "lakes-and-ridges-nainital-bhimtal-getaway": "uttarakhand",
  "sacred-chardham-yatra-kedarnath-badrinath": "uttarakhand",

  // Assam packages (ALL UNDER ASSAM)
  "gateway-to-assam-guwahati-brahmaputra-charms": "assam",
  "divine-blessings-maa-kamakhya-pilgrimage-tour": "assam",
  "wild-kaziranga-rhinos-grasslands-safari": "assam",

  // West Bengal packages (ALL UNDER WEST BENGAL)
  "city-of-joy-kolkata-heritage-cultural-trail": "west-bengal",
  "nawabi-murshidabad-hazarduari-lalbag-heritage": "west-bengal",
  "mandarmani-seaside-weekend-retreat": "west-bengal",
  "digha-udaipur-beach-coastal-break": "west-bengal",

  // Uttar Pradesh packages (ALL UNDER UTTAR PRADESH)
  "mughal-splendour-taj-mahal-agra-fort": "uttar-pradesh",
  "mughal-splendour-taj-mahal-and-agra-fort": "uttar-pradesh",
  "taj-mahal-golden-dawn-fatehpur-sikri": "uttar-pradesh",
  "mystical-kashi-varanasi-sarnath-spiritual-trail": "uttar-pradesh",
  "braj-bhoomi-pilgrimage-vrindavan-mathura": "uttar-pradesh",

  // Jammu & Kashmir
  "heaven-on-earth-kashmir-valley-gulmarg-snow": "jammu-and-kashmir",

  // Karnataka
  "royal-heritage-of-mysore-srirangapatna": "karnataka",
  "echoes-of-an-empire-hampi-heritage-trail": "karnataka",

  // Tamil Nadu
  "queen-of-the-hills-ooty-coonoor-escape": "tamil-nadu",

  // Puducherry
  "french-riviera-of-the-east-pondicherry-auroville": "puducherry",

  // Andhra Pradesh
  "coastal-charm-vizag-araku-valley": "andhra-pradesh",
  "divya-darshan-tirupati-balaji-pilgrimage": "andhra-pradesh",

  // Telangana
  "city-of-pearls-hyderabad-golconda-heritage": "telangana",

  // Odisha
  "sacred-shores-puri-konark-chilika-lake": "odisha",

  // Madhya Pradesh
  "splendour-of-the-scindias-gwalior-fort-palaces": "madhya-pradesh",
  "wild-satpura-river-safaris-leopard-trails": "madhya-pradesh",

  // Punjab
  "spiritual-amritsar-golden-temple-wagah-border": "punjab",

  // Maharashtra
  "maximum-city-mumbai-heritage-marine-drive": "maharashtra",

  // Goa
  "sunny-shores-north-south-goa-extravaganza": "goa",
  "sunny-shores-north-and-south-goa-extravaganza": "goa",

  // Andaman
  "exotic-andaman-havelock-island-odyssey": "andaman",

  // Delhi
  "capitals-of-empires-old-new-delhi-heritage": "delhi",
  "capitals-of-empires-old-and-new-delhi-heritage": "delhi",
};

/* -------------------------------------------------------------------------- */
/* Distinct, curated, high-clarity photos for every package                   */
/* -------------------------------------------------------------------------- */
const PACKAGE_PHOTOS: Record<
  string,
  { cover: string; gallery: [string, string, string] }
> = {
  // Thailand
  "exotic-thailand-coral-islands-getaway": {
    cover: "photo-1552465011-b4e21bf6e79a",
    gallery: ["photo-1508009603885-50cf7c579365", "photo-1528181304800-259b08848526", "photo-1554092917-15b3e3f9e85a"],
  },
  "phuket-tropical-paradise-phi-phi-islands": {
    cover: "photo-1537956965359-7573183d1f57",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1552465011-b4e21bf6e79a"],
  },
  // Vietnam
  "splendours-of-vietnam-hanoi-to-ha-long-bay": {
    cover: "photo-1528127269322-539801943592",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0"],
  },
  // Sri Lanka
  "wonders-of-ceylon-kandy-nuwara-eliya-bentota": {
    cover: "photo-1612862862126-865765df2ded",
    gallery: ["photo-1674498260932-6f7d8eed6d9f", "photo-1554092917-15b3e3f9e85a", "photo-1544735716-392fe2489ffa"],
  },
  // UAE
  "grand-uae-experience-dubai-abu-dhabi": {
    cover: "photo-1512453979798-5ea266f8880c",
    gallery: ["photo-1518684079-3c830dcef090", "photo-1597073642928-48c0971f7ded", "photo-1570168007204-dfb528c6958f"],
  },
  "glitz-glamour-of-dubai": {
    cover: "photo-1518684079-3c830dcef090",
    gallery: ["photo-1512453979798-5ea266f8880c", "photo-1570168007204-dfb528c6958f", "photo-1597073642928-48c0971f7ded"],
  },
  // Nepal
  "himalayan-highlights-kathmandu-pokhara": {
    cover: "photo-1544735716-392fe2489ffa",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"],
  },
  // Bhutan
  "enchanting-bhutan-thimphu-punakha-paro": {
    cover: "photo-1638246439638-b37095b34879",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"],
  },

  // SIKKIM (ALL 4 PACKAGES WITH REAL, CRYSTAL-CLEAR SIKKIM & HIMALAYAN PHOTOGRAPHY)
  "jewel-of-sikkim-gangtok-tsomgo-lake": {
    cover: "photo-1648113821624-244c6c1baf54", // Glacial mountain lake / Tsomgo reflection
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"],
  },
  "expedition-north-sikkim-lachen-lachung-gurudongmar": {
    cover: "photo-1589182373726-e4f658ab50f0", // Majestic high snow peaks
    gallery: ["photo-1648113821624-244c6c1baf54", "photo-1549817997-f6958ecf47b9", "photo-1616942986550-ea6469c08530"],
  },
  "serenity-of-south-sikkim-namchi-ravangla": {
    cover: "photo-1597073642928-48c0971f7ded", // Grand temple / statue mountain backdrop
    gallery: ["photo-1544735716-392fe2489ffa", "photo-1648113821624-244c6c1baf54", "photo-1589182373726-e4f658ab50f0"],
  },
  "sikkim-mountain-journey": {
    cover: "photo-1648113821624-244c6c1baf54",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"],
  },

  // DARJEELING
  "darjeeling-tea-and-mountain-escape": {
    cover: "photo-1544735716-392fe2489ffa", // Darjeeling tea slopes
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54", "photo-1549817997-f6958ecf47b9"],
  },
  "darjeeling-3n-4d": {
    cover: "photo-1544735716-392fe2489ffa",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"],
  },
  "hidden-hamlets-lamahatta-tinchuley-chatakpur": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"],
  },

  // KALIMPONG
  "kalimpong": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"],
  },
  "kalimpong-ridge-valley-retreat": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"],
  },
  "wilderness-triangle-lava-rishyap-lolegaon": {
    cover: "photo-1589182373726-e4f658ab50f0",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa", "photo-1648113821624-244c6c1baf54"],
  },

  // DOOARS
  "dooars-wildlife-trail-jaldapara-chilapata": {
    cover: "photo-1787741188520-6de306d9d1d3", // Wildlife safari
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0"],
  },

  // KERALA
  "glimpse-of-gods-own-country-munnar-alleppey": {
    cover: "photo-1602216056096-3b40cc0c9944", // Alleppey houseboat
    gallery: ["photo-1674498260932-6f7d8eed6d9f", "photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2"],
  },
  "misty-munnar-tea-trails-wildlife": {
    cover: "photo-1674498260932-6f7d8eed6d9f", // Munnar tea slopes
    gallery: ["photo-1602216056096-3b40cc0c9944", "photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9"],
  },
  "alleppey-backwater-cruise-marari-beach-haven": {
    cover: "photo-1602216056096-3b40cc0c9944",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1674498260932-6f7d8eed6d9f"],
  },

  // HIMACHAL PRADESH
  "shimla-kufri-colonial-hill-holiday": {
    cover: "photo-1616942986550-ea6469c08530",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"],
  },
  "valley-of-the-gods-kullu-naggar-castle": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1616942986550-ea6469c08530", "photo-1589182373726-e4f658ab50f0", "photo-1648113821624-244c6c1baf54"],
  },
  "manali-snow-adventure-solang-valley": {
    cover: "photo-1616942986550-ea6469c08530",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9", "photo-1648113821624-244c6c1baf54"],
  },
  "mini-switzerland-of-india-dalhousie-khajjiar": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1616942986550-ea6469c08530", "photo-1589182373726-e4f658ab50f0", "photo-1544735716-392fe2489ffa"],
  },
  "parvati-valley-magic-kasol-tosh-manikaran": {
    cover: "photo-1589182373726-e4f658ab50f0",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1616942986550-ea6469c08530", "photo-1648113821624-244c6c1baf54"],
  },

  // UTTARAKHAND
  "lakes-ridges-nainital-bhimtal-getaway": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1589182373726-e4f658ab50f0", "photo-1544735716-392fe2489ffa", "photo-1648113821624-244c6c1baf54"],
  },
  "sacred-chardham-yatra-kedarnath-badrinath": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1616942986550-ea6469c08530", "photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9"],
  },

  // ASSAM
  "gateway-to-assam-guwahati-brahmaputra-charms": {
    cover: "photo-1549817997-f6958ecf47b9",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1787741188520-6de306d9d1d3", "photo-1544735716-392fe2489ffa"],
  },
  "divine-blessings-maa-kamakhya-pilgrimage-tour": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1787741188520-6de306d9d1d3", "photo-1544735716-392fe2489ffa"],
  },
  "wild-kaziranga-rhinos-grasslands-safari": {
    cover: "photo-1787741188520-6de306d9d1d3",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0"],
  },

  // WEST BENGAL
  "city-of-joy-kolkata-heritage-cultural-trail": {
    cover: "photo-1558431382-27e303142255", // Victoria memorial / Kolkata
    gallery: ["photo-1570168007204-dfb528c6958f", "photo-1587474260584-136574528ed5", "photo-1711102230980-5f3001c1a07b"],
  },
  "nawabi-murshidabad-hazarduari-lalbag-heritage": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1558431382-27e303142255", "photo-1570168007204-dfb528c6958f", "photo-1587474260584-136574528ed5"],
  },
  "mandarmani-seaside-weekend-retreat": {
    cover: "photo-1554092917-15b3e3f9e85a",
    gallery: ["photo-1512343879784-a960bf40e7f2", "photo-1609854534028-b512f5246abc", "photo-1549817997-f6958ecf47b9"],
  },
  "digha-udaipur-beach-coastal-break": {
    cover: "photo-1512343879784-a960bf40e7f2",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1609854534028-b512f5246abc", "photo-1544735716-392fe2489ffa"],
  },

  // UTTAR PRADESH
  "mughal-splendour-taj-mahal-agra-fort": {
    cover: "photo-1564507592333-c60657eea523", // Taj Mahal
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1587474260584-136574528ed5", "photo-1711102230980-5f3001c1a07b"],
  },
  "taj-mahal-golden-dawn-fatehpur-sikri": {
    cover: "photo-1564507592333-c60657eea523",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1587474260584-136574528ed5", "photo-1711102230980-5f3001c1a07b"],
  },
  "mystical-kashi-varanasi-sarnath-spiritual-trail": {
    cover: "photo-1699630923504-9a24dbaab37c", // Varanasi ghats
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1609947017136-9daf32a5eb16", "photo-1564507592333-c60657eea523"],
  },
  "braj-bhoomi-pilgrimage-vrindavan-mathura": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1564507592333-c60657eea523", "photo-1711102230980-5f3001c1a07b", "photo-1609947017136-9daf32a5eb16"],
  },

  // JAMMU & KASHMIR
  "heaven-on-earth-kashmir-valley-gulmarg-snow": {
    cover: "photo-1685716271205-83a5ac2ba63b",
    gallery: ["photo-1616942986550-ea6469c08530", "photo-1589182373726-e4f658ab50f0", "photo-1549817997-f6958ecf47b9"],
  },

  // KARNATAKA
  "royal-heritage-of-mysore-srirangapatna": {
    cover: "photo-1695981152719-3fc012dc3da4",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1711102230980-5f3001c1a07b", "photo-1570168007204-dfb528c6958f"],
  },
  "echoes-of-an-empire-hampi-heritage-trail": {
    cover: "photo-1695981152719-3fc012dc3da4",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1711102230980-5f3001c1a07b", "photo-1549817997-f6958ecf47b9"],
  },

  // TAMIL NADU
  "queen-of-the-hills-ooty-coonoor-escape": {
    cover: "photo-1674498260932-6f7d8eed6d9f",
    gallery: ["photo-1544735716-392fe2489ffa", "photo-1549817997-f6958ecf47b9", "photo-1589182373726-e4f658ab50f0"],
  },

  // PUDUCHERRY
  "french-riviera-of-the-east-pondicherry-auroville": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1558431382-27e303142255"],
  },

  // ANDHRA PRADESH
  "coastal-charm-vizag-araku-valley": {
    cover: "photo-1609854534028-b512f5246abc",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa"],
  },
  "divya-darshan-tirupati-balaji-pilgrimage": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1609854534028-b512f5246abc", "photo-1609947017136-9daf32a5eb16", "photo-1564507592333-c60657eea523"],
  },

  // TELANGANA
  "city-of-pearls-hyderabad-golconda-heritage": {
    cover: "photo-1711102230980-5f3001c1a07b",
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1570168007204-dfb528c6958f", "photo-1587474260584-136574528ed5"],
  },

  // ODISHA
  "sacred-shores-puri-konark-chilika-lake": {
    cover: "photo-1609854534028-b512f5246abc",
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1512343879784-a960bf40e7f2", "photo-1597073642928-48c0971f7ded"],
  },

  // MADHYA PRADESH
  "splendour-of-the-scindias-gwalior-fort-palaces": {
    cover: "photo-1597073642928-48c0971f7ded",
    gallery: ["photo-1711102230980-5f3001c1a07b", "photo-1570168007204-dfb528c6958f", "photo-1587474260584-136574528ed5"],
  },
  "wild-satpura-river-safaris-leopard-trails": {
    cover: "photo-1787741188520-6de306d9d1d3",
    gallery: ["photo-1549817997-f6958ecf47b9", "photo-1544735716-392fe2489ffa", "photo-1589182373726-e4f658ab50f0"],
  },

  // PUNJAB
  "spiritual-amritsar-golden-temple-wagah-border": {
    cover: "photo-1609947017136-9daf32a5eb16", // Golden Temple
    gallery: ["photo-1597073642928-48c0971f7ded", "photo-1587474260584-136574528ed5", "photo-1711102230980-5f3001c1a07b"],
  },

  // MAHARASHTRA
  "maximum-city-mumbai-heritage-marine-drive": {
    cover: "photo-1570168007204-dfb528c6958f", // Mumbai Gateway
    gallery: ["photo-1587474260584-136574528ed5", "photo-1558431382-27e303142255", "photo-1711102230980-5f3001c1a07b"],
  },

  // GOA
  "sunny-shores-north-south-goa-extravaganza": {
    cover: "photo-1512343879784-a960bf40e7f2", // Goa beach
    gallery: ["photo-1554092917-15b3e3f9e85a", "photo-1597073642928-48c0971f7ded", "photo-1558431382-27e303142255"],
  },

  // ANDAMAN
  "exotic-andaman-havelock-island-odyssey": {
    cover: "photo-1554092917-15b3e3f9e85a",
    gallery: ["photo-1512343879784-a960bf40e7f2", "photo-1609854534028-b512f5246abc", "photo-1537956965359-7573183d1f57"],
  },

  // DELHI
  "capitals-of-empires-old-new-delhi-heritage": {
    cover: "photo-1587474260584-136574528ed5", // India Gate
    gallery: ["photo-1564507592333-c60657eea523", "photo-1597073642928-48c0971f7ded", "photo-1570168007204-dfb528c6958f"],
  },
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri);
  console.log("Connected successfully.\n");

  /* ------------------------------------------------------------------------ */
  /* Step 1: Upsert true Master Categories                                    */
  /* ------------------------------------------------------------------------ */
  console.log("Upserting true Master Categories...");
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();

  for (const item of MASTER_CATEGORIES) {
    const thumb = sharpImg(item.photoId, `${item.name} Destination Thumbnail`);
    const hero = sharpImg(item.photoId, `${item.name} Hero Banner`);

    const doc = await Category.findOneAndUpdate(
      { slug: item.slug },
      {
        $set: {
          name: item.name,
          slug: item.slug,
          tagline: item.tagline,
          description: item.description,
          thumbnail: thumb,
          heroImage: hero,
          order: item.order,
          isActive: true,
        },
      },
      { upsert: true, new: true },
    );

    categoryMap.set(item.slug, doc._id as unknown as mongoose.Types.ObjectId);
    console.log(`  ✓ Master Category: ${item.name} (${item.slug})`);
  }

  /* ------------------------------------------------------------------------ */
  /* Step 2: Reassign every package to its proper Master Category             */
  /* and update with ultra-crisp, high-resolution imagery                     */
  /* ------------------------------------------------------------------------ */
  console.log("\nReassigning all packages to their true Master Categories...");
  const validCategorySlugs = new Set(MASTER_CATEGORIES.map((c) => c.slug));

  const allPackages = await Package.find({}).lean();
  let updatedCount = 0;

  for (const pkg of allPackages) {
    const targetCatSlug = PACKAGE_TO_CATEGORY[pkg.slug];
    if (!targetCatSlug) {
      console.log(`  ⚠ Unmapped package slug: ${pkg.slug}`);
      continue;
    }

    const catId = categoryMap.get(targetCatSlug);
    if (!catId) {
      console.log(`  ⚠ Missing category ID for: ${targetCatSlug}`);
      continue;
    }

    // High clarity photos
    const photoConfig = PACKAGE_PHOTOS[pkg.slug];
    const updateFields: Record<string, any> = {
      category: catId,
    };

    if (photoConfig) {
      updateFields.coverImage = sharpImg(photoConfig.cover, `${pkg.title} Cover Photo`);
      updateFields.images = photoConfig.gallery.map((id, idx) =>
        sharpImg(id, `${pkg.title} Gallery Photo ${idx + 1}`),
      );
    } else if (pkg.coverImage?.publicId?.includes("unsplash.com")) {
      // Ensure existing Unsplash photos are set to high-res 1600x1060 q=85
      const cleanUrl = pkg.coverImage.publicId.split("?")[0] + "?auto=format&fit=crop&q=85&w=1600";
      updateFields.coverImage = {
        publicId: cleanUrl,
        url: cleanUrl,
        width: 1600,
        height: 1060,
        alt: pkg.coverImage.alt || pkg.title,
      };
    }

    await Package.updateOne({ _id: pkg._id }, { $set: updateFields });
    updatedCount++;
    console.log(`  ✓ Package "${pkg.title}" -> linked to Master Category [${targetCatSlug}]`);
  }

  console.log(`\nSuccessfully updated ${updatedCount} packages.\n`);

  /* ------------------------------------------------------------------------ */
  /* Step 3: Remove redundant orphan sub-categories from Category collection  */
  /* ------------------------------------------------------------------------ */
  console.log("Cleaning up redundant categories that are now package sub-destinations...");
  const oldCats = await Category.find({}).lean();
  let deletedCats = 0;

  for (const cat of oldCats) {
    if (!validCategorySlugs.has(cat.slug)) {
      // Check if any package is still using it
      const count = await Package.countDocuments({ category: cat._id });
      if (count === 0) {
        await Category.deleteOne({ _id: cat._id });
        console.log(`  ✕ Deleted redundant category: ${cat.name} (${cat.slug})`);
        deletedCats++;
      } else {
        console.log(`  ⚠ Category ${cat.name} still has ${count} packages!`);
      }
    }
  }

  console.log(`\nDeleted ${deletedCats} redundant categories.`);

  /* ------------------------------------------------------------------------ */
  /* Step 4: Sync Trending homepage highlights                                 */
  /* ------------------------------------------------------------------------ */
  console.log("\nSyncing Trending homepage highlights with Master Categories...");
  const trendingList = [
    { tab: "international" as const, name: "Thailand", slug: "thailand", style: "Tropical Temples & Islands", photoId: "photo-1552465011-b4e21bf6e79a", order: 0 },
    { tab: "international" as const, name: "Vietnam", slug: "vietnam", style: "Ha Long Bay & Lanterns", photoId: "photo-1528127269322-539801943592", order: 1 },
    { tab: "international" as const, name: "UAE & Dubai", slug: "uae", style: "Skylines & Desert Luxury", photoId: "photo-1512453979798-5ea266f8880c", order: 2 },
    { tab: "international" as const, name: "Sri Lanka", slug: "sri-lanka", style: "Tea Trails & Golden Beaches", photoId: "photo-1612862862126-865765df2ded", order: 3 },
    { tab: "international" as const, name: "Nepal", slug: "nepal", style: "Himalayan Vistas & Shrines", photoId: "photo-1544735716-392fe2489ffa", order: 4 },
    { tab: "international" as const, name: "Bhutan", slug: "bhutan", style: "Tiger's Nest & Dzongs", photoId: "photo-1638246439638-b37095b34879", order: 5 },
    { tab: "india" as const, name: "Sikkim", slug: "sikkim", style: "Gangtok & Gurudongmar", photoId: "photo-1648113821624-244c6c1baf54", order: 10 },
    { tab: "india" as const, name: "Darjeeling", slug: "darjeeling", style: "Queen of the Hills", photoId: "photo-1544735716-392fe2489ffa", order: 11 },
    { tab: "india" as const, name: "Kerala", slug: "kerala", style: "Alleppey & Munnar", photoId: "photo-1602216056096-3b40cc0c9944", order: 12 },
    { tab: "india" as const, name: "Himachal Pradesh", slug: "himachal-pradesh", style: "Manali & Shimla Snow", photoId: "photo-1616942986550-ea6469c08530", order: 13 },
    { tab: "india" as const, name: "Kashmir", slug: "jammu-and-kashmir", style: "Dal Lake & Gulmarg", photoId: "photo-1685716271205-83a5ac2ba63b", order: 14 },
    { tab: "india" as const, name: "Goa", slug: "goa", style: "Sun, Sand & Waves", photoId: "photo-1512343879784-a960bf40e7f2", order: 15 },
    { tab: "india" as const, name: "Andaman", slug: "andaman", style: "Radhanagar Azure Waters", photoId: "photo-1554092917-15b3e3f9e85a", order: 16 },
  ];

  for (const t of trendingList) {
    await Trending.findOneAndUpdate(
      { slug: t.slug },
      {
        $set: {
          tab: t.tab,
          name: t.name,
          slug: t.slug,
          style: t.style,
          image: sharpImg(t.photoId, `${t.name} Trending Photo`),
          order: t.order,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }

  console.log("Trending highlights updated.");

  console.log("\nALL DONE!");
  console.log("Master categories and packages are now cleanly structured with crystal-clear high-res imagery.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
