import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { ApiError } from "@/lib/api/respond";
import { serverEnv } from "@/lib/env";

const ROOT = "heavenonearth";

/** Server-side allow-list — a client cannot write anywhere it likes. */
const FOLDERS = ["categories", "packages", "stays", "rooms", "gallery", "reviews"] as const;
export type UploadFolder = (typeof FOLDERS)[number];

function configure() {
  const env = serverEnv();
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return env;
}

/**
 * Signs a direct browser -> Cloudinary upload. The file bytes never pass
 * through a Vercel function, which sidesteps the ~4.5 MB request body limit
 * and keeps uploads off the function timeout budget entirely.
 */
export function createUploadSignature(folder: string) {
  if (!FOLDERS.includes(folder as UploadFolder)) {
    throw new ApiError("VALIDATION_FAILED", "Unknown upload folder.", {
      folder: `Must be one of: ${FOLDERS.join(", ")}`,
    });
  }

  const env = configure();
  const timestamp = Math.round(Date.now() / 1000);
  const target = `${ROOT}/${folder}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: target },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    signature,
    timestamp,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder: target,
  };
}

export async function destroyAsset(publicId: string) {
  configure();
  return cloudinary.uploader.destroy(publicId, { invalidate: true });
}

/** Tiny base64 LQIP, generated once at upload time rather than per request. */
export async function buildBlurDataURL(publicId: string): Promise<string | undefined> {
  const env = configure();
  const url = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/w_16,q_30,f_jpg,e_blur:200/${publicId}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return undefined;
  }
}
