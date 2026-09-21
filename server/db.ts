import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __resumecraftMongoosePromise?: Promise<typeof mongoose>;
};

/** Connects to MongoDB Atlas exactly once (reused across hot reloads). */
export async function connect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  const promise = globalForDb.__resumecraftMongoosePromise ?? mongoose.connect(uri!);
  globalForDb.__resumecraftMongoosePromise = promise;
  try {
    await promise;
  } catch (error) {
    globalForDb.__resumecraftMongoosePromise = undefined;
    throw error;
  }
  return mongoose;
}

export { mongoose };