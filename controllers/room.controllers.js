import Room from "../models/room.model.js";
import Property from "../models/property.model.js";
import Amenity from "../models/amenity.model.js";

const allowedRoomTypes = ["single", "double", "suite", "deluxe", "family"];

export const createRoom = async (req, res, next) => {
  try {
    console.log("req.body is ", req.body);
    const {
      roomNumber,
      roomType,
      description,
      bedCount,
      capacity,
      price,
      policies,
      area,
      amenities,
    } = req.body;

    const { propertyId } = req.params;

    if (
      !propertyId ||
      !roomNumber ||
      !roomType ||
      !description ||
      !bedCount ||
      !capacity ||
      !price
    ) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const normalizedRoomType = roomType.toLowerCase();
    if (!allowedRoomTypes.includes(normalizedRoomType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid room type. Allowed types: ${allowedRoomTypes.join(", ")}`,
      });
    }

    // Check if a room with the same number already exists in this property
    const existingRoom = await Room.findOne({ propertyId, roomNumber });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: `Room number "${roomNumber}" already exists in this property.`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Thumbnail image is required" });
    }

    const thumbnail = req.file.filename;

    const room = await Room.create({
      propertyId,
      roomNumber,
      roomType: normalizedRoomType,
      description,
      bedCount,
      capacity,
      pricePerNight: price,
      policies,
      area,
      amenities: amenities ? amenities.split(",") : [],
      thumbnail,
      images: [thumbnail],
    });

    res.status(201).json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

export const getRoomsByPropertyId = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const rooms = await Room.find({ propertyId })
      .select("_id title description roomType price capacity thumbnail isActive");

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};

export const getRoomsByOwnerId = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    console.log("owner id is ", ownerId)

    const properties = await Property.find({ ownerId }).select("_id");
    console.log("added properties are ", properties)
    const propertyIds = properties.map((p) => p._id);

    const rooms = await Room.find({ propertyId: { $in: propertyIds } })
      .populate("propertyId", "name cityId address")
      .populate("amenities", "name description");

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};

export const getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    console.log("rrom id ", roomId);

    const room = await Room.findById(roomId)
      .populate("propertyId", "name cityId address")
      .populate("amenities", "name description");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    res.status(200).json({ success: true, room });
  } catch (err) {
    next(err);
  }
};

export const updateRoomAmenities = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { add = [], remove = [] } = req.body;

    if (!Array.isArray(add) || !Array.isArray(remove)) {
      return res.status(400).json({ success: false, message: "Both add and remove must be arrays" });
    }

    const allIds = [...add, ...remove];
    const existingAmenities = await Amenity.find({ _id: { $in: allIds } }).select("_id");
    const validIds = existingAmenities.map((a) => a._id.toString());

    const invalidIds = allIds.filter(id => !validIds.includes(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid amenity IDs: ${invalidIds.join(", ")}`,
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Remove amenities
    const currentAmenities = room.amenities.map((id) => id.toString());
    const updatedAmenities = currentAmenities
      .filter(id => !remove.includes(id))   // Remove ones in `remove`
      .concat(add.filter(id => !currentAmenities.includes(id))); // Add only new ones

    room.amenities = [...new Set(updatedAmenities)];
    await room.save();

    res.status(200).json({
      success: true,
      message: "Room amenities updated successfully",
      amenities: room.amenities,
    });
  } catch (err) {
    next(err);
  }
};

export const getRoomsByCity = async (req, res, next) => {
  try {
    const { cityId } = req.params;

    if (!cityId) {
      return res.status(400).json({ success: false, message: "City ID is required" });
    }

    // Get all properties in the given city
    const properties = await Property.find({ cityId }).select("_id");

    if (properties.length === 0) {
      return res.status(404).json({ success: false, message: "No properties found in this city" });
    }

    const propertyIds = properties.map(p => p._id);

    // For each property, get one room (e.g., the first)
    const rooms = await Promise.all(
      propertyIds.map(async propertyId => {
        return await Room.findOne({ propertyId })
          .populate("propertyId", "name address")
          .select("-__v")
          .lean();
      })
    );

    // Filter out nulls in case any property has no room
    const filteredRooms = rooms.filter(Boolean);

    res.status(200).json({ success: true, rooms: filteredRooms });
  } catch (err) {
    next(err);
  }
};



