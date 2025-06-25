import Booking from "../models/booking.model.js";
import Room from "../models/room.model.js";
import Transaction from "../models/transaction.model.js";
import Property from "../models/property.model.js";
import mongoose from "mongoose";

export const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, personsToStay } = req.body;
    const userId = req.user._id; // assuming authorize middleware sets this

    // Validate required fields
    if (!roomId || !checkInDate || !checkOutDate || !personsToStay) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Parse dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: "Check-out must be after check-in." });
    }

    // Check room existence
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    // Optional: validate person capacity
    if (personsToStay > room.capacity) {
      return res.status(400).json({ success: false, message: `Room supports up to ${room.capacity} guests.` });
    }

    // Check for overlapping booking for same room
    const overlappingBooking = await Booking.findOne({
      roomId: room._id,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          checkInDate: { $lt: checkOut },
          checkOutDate: { $gt: checkIn },
        },
      ],
    });

    if (overlappingBooking) {
      return res.status(409).json({ success: false, message: "Room is already booked for selected dates." });
    }

    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * room.pricePerNight;

    const booking = await Booking.create({
      roomId: room._id,
      propertyId: room.propertyId,
      userId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: personsToStay,
      totalAmount,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

export const makePayment = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const { bookingId } = req.params;
    const userId = req.user._id;

    const allowedMethods = ["card", "upi", "wallet", "cod"];
    const method = paymentMethod?.toLowerCase();

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Use one of: ${allowedMethods.join(", ")}`
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "You have already paid for this booking" });
    }

    // Simulated transaction ID
    const transactionId = `TXN-${Date.now()}`;

    const transaction = await Transaction.create({
      bookingId,
      userId,
      amount: booking.totalAmount,
      paymentMethod: method,
      paymentStatus: "success",
      transactionId,
      paidAt: new Date()
    });

    booking.paymentStatus = "paid";
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      transaction
    });

  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    if (booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Completed booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded"; // optionally update this
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (err) {
    next(err);
  }
};

export const completeBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ success: false, message: `Cannot complete a ${booking.status} booking` });
    }

    const room = await Room.findById(booking.roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const property = await Property.findById(room.propertyId);
    if (!property || property.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to complete this booking" });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking marked as completed", booking });
  } catch (err) {
    next(err);
  }
};

export const getOwnerRoomBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const ownerProperties = await Property.find({ ownerId }).select("_id");
    const propertyIds = ownerProperties.map(p => p._id.toString());

    const ownerRooms = await Room.find({ propertyId: { $in: propertyIds } })
      .select("_id pricePerNight discount");
    const roomMap = {};
    const roomIds = ownerRooms.map(room => {
      roomMap[room._id.toString()] = room;
      return room._id;
    });

    // Step 3: Get bookings of these rooms
    const bookings = await Booking.find({ roomId: { $in: roomIds } })
      .populate("userId", "name email")
      .populate("roomId"); // removed field filter to avoid populate failure

    // Step 4: Construct response
    const response = bookings.map(booking => {
      const roomRaw = roomMap[booking.roomId._id.toString()];
      const price = roomRaw?.pricePerNight || 0;
      const discount = roomRaw?.discount || 0;
      const discountedPrice = price - (price * discount / 100);

      return {
        bookingId: booking._id,
        customer: booking.userId,
        room: booking.roomId,
        original_price: price,
        discount_percent: discount,
        discounted_price: discountedPrice,
        check_in: booking.checkInDate,
        check_out: booking.checkOutDate,
        guests: booking.guests,
        total_amount: booking.totalAmount,
        status: booking.status,
        payment_status: booking.paymentStatus,
      };
    });

    res.status(200).json({
      total: response.length,
      bookings: response,
    });

  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Failed to fetch bookings." });
  }
};

