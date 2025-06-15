import Booking from "../models/booking.model.js";

export const isBookingOwner = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to this booking" });
    }

    // Attach booking to req for reuse if needed in the controller
    req.booking = booking;
    next();
  } catch (err) {
    next(err);
  }
};
