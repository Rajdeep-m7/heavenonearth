import "server-only";

import mongoose from "mongoose";

import { ApiError } from "@/lib/api/respond";
import { serverEnv } from "@/lib/env";

/**
 * A serverless container is reused across invocations, but module state is not
 * guaranteed to survive — and in dev, hot reload re-evaluates modules. Caching
 * the connection on `globalThis` covers both, and stops us from opening a new
 * Atlas connection per request until the free-tier cap is hit.
 */

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalCache = globalThis as typeof globalThis & { _hoeMongoose?: Cache };

const cache: Cache = (globalCache._hoeMongoose ??= {
  conn: null,
  promise: null,
});

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose
    .connect(serverEnv().MONGODB_URI, {
      // Fail fast on a cold container rather than silently queueing commands
      // until the function times out.
      bufferCommands: false,
      // Deliberately small: many concurrent containers x a large pool will
      // exhaust an M0 cluster's connection limit.
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      family: 4,
    })
    .catch((error) => {
      // Clear the promise so the next request retries instead of awaiting a
      // permanently rejected one.
      cache.promise = null;
      throw error;
    });

  cache.conn = await cache.promise;
  return cache.conn;
}

/** Registers every model exactly once, then hands back the connection. */
export async function db() {
  // A generic 500 here is a bad hour of debugging. Say exactly what is wrong.
  if (!process.env.MONGODB_URI) {
    throw new ApiError(
      "SERVER_ERROR",
      "The database is not configured. Set MONGODB_URI in .env.local (see .env.example), then restart.",
    );
  }

  const conn = await connectDB();
  await import("@/lib/db/models");
  return conn;
}
