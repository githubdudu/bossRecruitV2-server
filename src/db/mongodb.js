import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Connect to database function
export async function connectToDatabase() {
  // MongoDB connection URI
  const uri = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@${process.env.clusterName}.mongodb.net/${process.env.db_name}?retryWrites=true&w=majority&appName=Cluster0`;

  /*
   * Mongoose connection options
   * Ref: https://github.com/Automattic/mongoose/discussions/12875
   * Ref: https://www.mongodb.com/developer/languages/javascript/mongoose-versus-nodejs-driver/
   */
  const options = {
    serverApi: {
      version: "1",
      strict: false,
      deprecationErrors: true,
    },
  };
  try {
    setupConnectionMonitoring();
    await mongoose.connect(uri, options);

    return mongoose.connection;
  } catch (error) {
    throw error;
  }
}

// Connection state descriptions mapped to their numeric values
const CONNECTION_STATES = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

// Get the current connection status
export function getConnectionStatus() {
  const state = mongoose.connection.readyState;
  return {
    state,
    stateDescription: CONNECTION_STATES[state] || "unknown",
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  };
}

// Check if database is connected
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

// Event listeners for connection status
function setupConnectionMonitoring() {
  mongoose.connection.on("connected", () => {
    console.log("Mongoose connection established");
    console.log("Connection status:", getConnectionStatus());
  });

  mongoose.connection.on("disconnected", () => {
    console.log("\nMongoose connection disconnected");
    console.log("Connection status:", getConnectionStatus());
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
    console.log("Connection status:", getConnectionStatus());
  });

  // Handle application termination
  process.on("SIGINT", async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
}

// Disconnect function (optional but good practice)
export async function disconnectFromDatabase() {
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}
