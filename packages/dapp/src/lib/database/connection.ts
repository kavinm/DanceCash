import { MongoClient } from "mongodb";

require("dotenv").config();
const uri = process.env.MONGODB_URI!;
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    clientPromise = client.connect();
  }
  const connectedClient = await clientPromise!;
  return connectedClient.db("dancecash");
}

export default connectToDatabase;

// Utility function to clean up old increments
export async function cleanupOldIncrements(collection: any, address: string) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await collection.updateOne(
    { address },
    { $pull: { incrementHistory: { timestamp: { $lt: twentyFourHoursAgo } } } }
  );
}