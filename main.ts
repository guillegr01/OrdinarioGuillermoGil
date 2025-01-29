import { MongoClient } from "mongodb"

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL) {
  throw Error("Please enter a valid MONGO_URL");
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected succesfully to DDBB");

const db = client.db("BBDD_Ordinario");

