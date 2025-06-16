import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";
import Room from "../models/room.model.js";
import Property from "../models/property.model.js";

export const addReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "The property owner has not marked the booking as completed yet. Please wait.",
      });
    }

    const room = await Room.findById(booking.roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const existingReview = await Review.findOne({
      roomId: room._id,
      userId,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      return res.status(200).json({ success: true, message: "Review updated successfully", review: existingReview });
    } else {
      const newReview = await Review.create({
        roomId: room._id,
        userId,
        rating,
        comment,
      });
      return res.status(201).json({ success: true, message: "Review added successfully", review: newReview });
    }

  } catch (err) {
    next(err);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).select("_id rating comment");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllReviewsForOwnerRooms = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const properties = await Property.find({ ownerId }).select("_id");
    const propertyIds = properties.map(p => p._id.toString());

    const rooms = await Room.find({ propertyId: { $in: propertyIds } }).select("_id roomNumber");
    const roomMap = {};
    const roomIds = rooms.map(room => {
      roomMap[room._id.toString()] = room.roomNumber;
      return room._id;
    });

    const reviews = await Review.find({ roomId: { $in: roomIds } })
      .populate("userId", "firstname lastname")
      .select("_id rating comment roomId userId");

    const formatted = reviews.map(r => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      roomId: r.roomId,
      roomName: roomMap[r.roomId.toString()],
      userId: r.userId._id,
      userName: `${r.userId.firstname} ${r.userId.lastname}`,
    }));

    res.status(200).json({ success: true, reviews: formatted });
  } catch (err) {
    next(err);
  }
};

