import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/connection.js";
import authRoutes from "./routes/user.routes.js";
import amenityRoutes from "./routes/amenity.routes.js";
import cityRoutes from "./routes/city.routes.js";
import { errorHandler } from "./utils/error.js";
import featureRoutes from "./routes/feature.routes.js";
import propertyRoutes from "./routes/property.routes.js";

dotenv.config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/auth", authRoutes);
app.use("/amenities", amenityRoutes);
app.use("/cities", cityRoutes);
app.use("/features", featureRoutes);
app.use("/properties", propertyRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
