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
import roomRoutes from "./routes/room.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import transactionRoutes from "./routes/transation.routes.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();
connectDB();
app.use(cors());
app.use(express.json());


app.use("/auth", authRoutes);
app.use("/amenities", amenityRoutes);
app.use("/cities", cityRoutes);
app.use("/features", featureRoutes);
app.use("/properties", propertyRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/transactions", transactionRoutes);
app.use("/reviews", reviewRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
