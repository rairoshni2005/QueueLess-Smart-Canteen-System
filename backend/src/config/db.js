import mongoose from "mongoose";

const DEFAULT_RETRY_COUNT = 5;
const DEFAULT_RETRY_DELAY_MS = 2000;

const connectDB = async ({
  retries = DEFAULT_RETRY_COUNT,
  retryDelay = DEFAULT_RETRY_DELAY_MS,
} = {}) => {
  const uri = process.env.MONGODB_URI;

  // ✅ Check inside function (NOT at import time)
  if (!uri) {
    throw new Error("❌ MONGODB_URI is missing. Check your .env file and dotenv config.");
  }

  const opts = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  let attempt = 0;

  while (attempt < retries) {
    try {
      attempt++;

      const conn = await mongoose.connect(uri, opts);

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ MongoDB disconnected");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected");
      });

      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("🛑 MongoDB connection closed");
        process.exit(0);
      });

      return conn;
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed: ${err.message}`);

      if (attempt >= retries) {
        console.error("❌ MongoDB connection failed permanently");
        throw err;
      }

      const delay = retryDelay * attempt;
      console.log(`⏳ Retrying in ${delay}ms...`);

      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

export default connectDB;