/**
 * Adds or updates one admin account. Unlike scripts/seed.ts (which only
 * touches the single owner named by SEED_ADMIN_EMAIL on first run), this is
 * for adding additional admins after the site is already live — there is no
 * API route for it, deliberately: admin accounts are never self-service.
 *
 *   npm run admin:add -- --email you@example.com --password "..." [--name "..."] [--role editor|owner]
 *
 * Upserts by email: re-running with a new --password rotates that admin's
 * password; omitting --password on an existing email leaves it untouched.
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { Admin } from "../lib/db/models/Admin";

const MIN_PASSWORD_LENGTH = 12;

function arg(name: string): string | undefined {
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local.");

  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD;
  const name = arg("name") ?? process.env.ADMIN_NAME ?? email.split("@")[0];
  const role = (arg("role") ?? process.env.ADMIN_ROLE ?? "editor") as "owner" | "editor";

  if (!email || !email.includes("@")) {
    throw new Error("Pass a valid --email.");
  }
  if (role !== "owner" && role !== "editor") {
    throw new Error('--role must be "owner" or "editor".');
  }

  await mongoose.connect(uri);

  const existing = await Admin.findOne({ email }).lean();

  if (!password) {
    if (!existing) throw new Error(`No admin exists for ${email} yet — pass --password to create one.`);
    console.log(`${email} already exists. No --password given, so nothing changed.`);
    await mongoose.disconnect();
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    // Warn, don't silently strengthen it — the caller asked for this exact
    // password. Refusing outright would be safer, but this script is only
    // ever run by someone with database credentials in hand.
    console.warn(
      `WARNING: password is ${password.length} characters; ${MIN_PASSWORD_LENGTH}+ is the project standard. ` +
        `Proceeding because it was explicitly given — change it after first login.`,
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    await Admin.updateOne({ email }, { $set: { passwordHash, name, role, isActive: true } });
    console.log(`Updated existing admin: ${email} (role: ${role})`);
  } else {
    await Admin.create({ email, passwordHash, name, role, isActive: true });
    console.log(`Created admin: ${email} (role: ${role})`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
