import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { cancelBooking, completeBooking, createBooking, makePayment } from "../controllers/booking.controllers.js";
import { isBookingOwner, verifyBookingRoomOwnership } from "../middlewares/booking.js";

const bookingRoutes = express.Router();

bookingRoutes.post("/", authorize(["user"]), createBooking);
bookingRoutes.post("/:bookingId/payment", authorize(["user"]), makePayment);
bookingRoutes.put("/:bookingId/cancel", authorize(["user"]), isBookingOwner, cancelBooking);
bookingRoutes.put("/:bookingId/complete", authorize(["propertyOwner"]), verifyBookingRoomOwnership, completeBooking);

export default bookingRoutes;