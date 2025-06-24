import mongoose from "mongoose";

import { NameModel } from "./schema.js";
import { connectToDatabase, disconnectFromDatabase } from "./mongodb.js";

const names = [{ name: "Andrew Mead" }, { name: "Bob" }, { name: "Charlie" }];

async function initDatabase() {
  await connectToDatabase();

  await NameModel.deleteMany({}); // Clear existing names
  await NameModel.insertMany(names); // Insert new names

  console.log("✨Database initialized done!✨");

  await disconnectFromDatabase();
}

initDatabase();
