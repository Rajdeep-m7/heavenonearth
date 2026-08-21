import "server-only";

import bcrypt from "bcryptjs";

/**
 * bcryptjs rather than native bcrypt: no compilation step, which matters on
 * Vercel's build image. Cost 12 is a deliberate balance — strong enough to make
 * offline cracking expensive, fast enough to stay inside a serverless timeout.
 */
const COST = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, COST);

export const verifyPassword = (plain: string, hash: string) =>
  bcrypt.compare(plain, hash);

/**
 * Compares against a throwaway hash so a missing user costs roughly the same
 * time as a wrong password. Blunts timing-based user enumeration.
 */
const DUMMY_HASH =
  "$2a$12$abcdefghijklmnopqrstuuLbLQ4Xc0DPRs1Q0Bg1H8kEcJ0M3l9Zq";

export const wastePasswordTime = () =>
  bcrypt.compare("not-a-real-password", DUMMY_HASH).catch(() => false);
