import RoomDiscount from "../models/discount.model.js";
import Property from "../models/property.model.js";
import Room from "../models/room.model.js";

export const addRoomDiscount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { roomId, name, startDate, endDate, rate } = req.body;

    if (!roomId || !name || !startDate || !endDate || rate == null) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Check if room exists and belongs to the user
    const room = await Room.findById(roomId).populate("propertyId");
    if (!room || room.propertyId.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Check for overlapping discounts
    const overlapping = await RoomDiscount.findOne({
      roomId,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: "Discount already exists for overlapping date range",
      });
    }

    // Save discount
    const newDiscount = await RoomDiscount.create({
      roomId,
      name,
      startDate,
      endDate,
      rate,
    });

    res.status(201).json({
      success: true,
      message: "Discount added successfully",
      discount: newDiscount,
    });
  } catch (err) {
    next(err);
  }
};

export const getDiscountsByOwner = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const properties = await Property.find({ ownerId }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    const rooms = await Room.find({ propertyId: { $in: propertyIds } }).select("_id");
    const roomIds = rooms.map((r) => r._id);

    const discounts = await RoomDiscount.find({ roomId: { $in: roomIds } })
      .populate({
        path: "roomId",
        select: "name roomNumber roomType propertyId",
        populate: {
          path: "propertyId",
          select: "name address",
        },
      })
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      discounts,
    });
  } catch (err) {
    next(err);
  }
};

