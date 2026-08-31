/**
 * Importing this module registers every schema on the shared Mongoose
 * instance. `populate("category")` fails if the referenced model has not been
 * registered yet, so route handlers import from here rather than cherry-picking
 * one model file.
 */
export { Admin, type AdminDoc } from "./Admin";
export { Category, type CategoryDoc } from "./Category";
export { GalleryItem, type GalleryItemDoc } from "./GalleryItem";
export { Package, type PackageDoc } from "./Package";
export { Review, type ReviewDoc, aggregateRating } from "./Review";
export { Room, type RoomDoc, syncStayPriceFrom } from "./Room";
export { Stay, type StayDoc } from "./Stay";
export { Trending, type TrendingDoc } from "./Trending";
