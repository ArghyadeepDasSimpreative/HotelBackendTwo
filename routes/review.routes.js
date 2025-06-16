import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { isBookingOwner } from "../middlewares/booking.js";
import { addReview, getAllReviewsForOwnerRooms, getReviewById } from "../controllers/review.controllers.js";

const reviewRoutes = express.Router();

reviewRoutes.post("/:bookingId", authorize(["user"]), isBookingOwner, addReview);
reviewRoutes.get("/:bookingId/review/:reviewId", authorize(["user"]), isBookingOwner, getReviewById);
reviewRoutes.get("/", authorize(["propertyOwner"]), getAllReviewsForOwnerRooms);

export default reviewRoutes;

