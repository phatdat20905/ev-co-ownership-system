import express from "express";
import dotenv from "dotenv";
import Database from "./config/database.js";
import { logger } from "@ev-coownership/shared";

// Load biến môi trường
dotenv.config();

const app = express();
app.use(express.json());

// Routes test
app.get("/", (req, res) => res.json({ message: "AI Service running 🚀" }));

// Hàm khởi động server
async function startServer() {
  try {
    // 1️⃣ Kết nối MongoDB
    await Database.connect();

    // 2️⃣ Start Express
    const PORT = process.env.PORT || 3010;
    app.listen(PORT, () => {
      logger.info(`🚀 AI Service listening on port ${PORT}`);
    });

  } catch (error) {
    logger.error("❌ Failed to start AI Service", { error: error.message });
    process.exit(1); // thoát nếu không kết nối được DB
  }
}

// Chạy server
startServer();

// Graceful shutdown (nên có)
process.on("SIGINT", async () => {
  logger.info("🧹 Shutting down gracefully...");
  await Database.disconnect();
  process.exit(0);
});
