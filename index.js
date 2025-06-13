import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/connection.js"; // add .js if not bundled

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Optional: basic route for testing
app.get("/", (req, res) => {
  res.send("API is running");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
