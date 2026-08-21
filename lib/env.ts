import { z } from "zod";

/**
 * Validated at module load, so a missing variable fails the build instead of
 * the first request that happens to need it.
 *
 * Server-only values are read lazily through `serverEnv()` because Next.js
 * evaluates this module during the client build too, where they are absent.
 */

const serverSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cachedServerEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment.\n${missing}\n\nCopy .env.example to .env.local and fill it in.`,
    );
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/** True when the database is configured at all — drives the fixture fallback. */
export const hasDatabase = () => Boolean(process.env.MONGODB_URI);

export const publicEnv = {
  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, ""),
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
};

export const isProduction = process.env.NODE_ENV === "production";
