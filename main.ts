import { MongoClient } from "mongodb"
import { ApolloServer } from "npm:@apollo/server"
import { startStandaloneServer } from "npm:@apollo/server/standalone"
import { RestaurantModel } from "./types.ts";
import { typeDefs } from "./schemaQL.ts";
import { resolvers } from "./resolvers.ts";

const MONGO_URL = Deno.env.get("MONGO_URL");

if(!MONGO_URL) {
  throw Error("Please enter a valid MONGO_URL");
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected succesfully to DDBB");

const db = client.db("BBDD_Ordinario");
const RestaurantCollection = db.collection<RestaurantModel>("restaurants");

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const {url} = await startStandaloneServer(server, {
  context: async () => ({rc: RestaurantCollection})
});

console.log(`Server running on: ${url}`);

