import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");
const globalForMongo = globalThis as typeof globalThis & { mongoPromise?: Promise<MongoClient> };
const clientPromise = globalForMongo.mongoPromise ?? new MongoClient(uri).connect();
if (process.env.NODE_ENV !== "production") globalForMongo.mongoPromise = clientPromise;
export async function db() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "univault_qa");
}