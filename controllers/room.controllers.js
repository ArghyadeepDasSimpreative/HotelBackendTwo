import Room from "../models/room.model.js";
import Property from "../models/property.model.js";
import Amenity from "../models/amenity.model.js";
import { deleteFile } from "../utils/file.js";

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

export const addRoomImage = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const newImage = req.file.filename;

    if (!room.images.includes(newImage)) {
      room.images.push(newImage);
    }

    // Set thumbnail if it doesn't exist
    if (!room.thumbnail) {
      room.thumbnail = newImage;
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: "Image added successfully",
      images: room.images,
      thumbnail: room.thumbnail,
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

export const toggleRoomActivation = async (req, res, next) => {
  try {
    const { roomId, propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You do not own this property" });
    }

    const room = await Room.findOne({ _id: roomId, propertyId });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found for this property" });
    }

    room.isActive = !room.isActive;
    await room.save();

    res.status(200).json({
      success: true,
      message: `Room is now ${room.isActive ? "activated" : "deactivated"}`,
      isActive: room.isActive,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRoomImage = async (req, res, next) => {
  try {
    const { roomId, fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ success: false, message: "File name is required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (!room.images.includes(fileName)) {
      return res.status(400).json({ success: false, message: "Image not found in room" });
    }

    const updatedImages = room.images.filter((img) => img !== fileName);
    room.images = updatedImages;

    if (room.thumbnail === fileName) {
      room.thumbnail = updatedImages[0] || null;
    }

    const fileDeleted = deleteFile(fileName);
    if (!fileDeleted) {
      return res.status(500).json({ success: false, message: "Failed to delete file" });
    }

    await room.save();

    res.status(200).json({ success: true, message: "Image deleted successfully", images: room.images });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

export const updateRoomDiscount = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { discount } = req.body;

    if (discount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Discount value is required",
      });
    }

    if (isNaN(discount) || discount < 0 || discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be a number between 0 and 100",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    room.discount = discount;
    await room.save();

    res.status(200).json({
      success: true,
      message: "Room discount updated successfully",
      room,
    });
  } catch (err) {
    next(err);
  }
};



