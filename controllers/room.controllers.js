import Room from "../models/room.model.js";
import Property from "../models/property.model.js";
import Amenity from "../models/amenity.model.js";
import { deleteFile } from "../utils/file.js";
import Favorite from "../models/favourite.model.js";
import RoomDiscount from "../models/discount.model.js";

const allowedRoomTypes = ["single", "double", "suite", "deluxe", "family"];

export const createRoom = async (req, res, next) => {
  try {

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
      name
    } = req.body;

    const { propertyId } = req.params;

    if (
      !propertyId ||
      !roomNumber ||
      !roomType ||
      !description ||
      !bedCount ||
      !capacity ||
      !price ||
      !name
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

    const thumbnail = req.file.imagekit.url;

    const room = await Room.create({
      name,
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
      .select("_id title description roomType price capacity thumbnail isActive name");

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};

export const getRoomsByOwnerId = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    // Get all property _ids owned by the user
    const properties = await Property.find({ ownerId }).select("_id");
    const propertyIds = properties.map((p) => p._id);

    // Fetch all rooms that belong to those properties
    const rooms = await Room.find({ propertyId: { $in: propertyIds } })
      .select("roomNumber roomType description bedCount capacity pricePerNight discount isAvailable isActive area policies thumbnail images amenities propertyId name")
      .populate("propertyId", "name cityId address location") // Include location here
      .populate("amenities", "name description");

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};


export const getRoomById = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(roomId)
      .populate("propertyId", "name cityId address location")
      .populate("amenities", "name description");

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isFavorited = await Favorite.exists({ userId, roomId });

    // Get the currently active discount (if any)
    const today = new Date();
    const currentDiscount = await RoomDiscount.findOne({
      roomId,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).select("name rate startDate endDate");
    console.log("current discount is ", currentDiscount.rate)

    res.status(200).json({
      success: true,
      room,
      isFavorited: !!isFavorited,
      currentDiscount: currentDiscount.rate || null,
    });
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

    const newImage = req.file.imagekit.url;

    console.log("guguugu", newImage)

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
    const { search } = req.query;

    if (!cityId) {
      return res.status(400).json({ success: false, message: "City ID is required" });
    }

    const properties = await Property.find({ cityId }).select("_id name address");

    if (!properties.length) {
      return res.status(404).json({ success: false, message: "No properties found in this city" });
    }

    const allRooms = [];

    for (const property of properties) {
      const rooms = await Room.find({
        propertyId: property._id,
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { roomType: { $regex: search, $options: "i" } },
          ],
        }),
      })
        .populate("amenities", "name")
        .select("-__v -createdAt -updatedAt")
        .lean();

      rooms.forEach((room) => {
        allRooms.push({
          ...room,
          propertyName: property.name,
          propertyAddress: property.address,
        });
      });
    }

    res.status(200).json({ success: true, rooms: allRooms });
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

export const getRoomsNearby = async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const { longitude, latitude, distance } = req.body;

    if (!longitude || !latitude || !distance || !cityId) {
      return res.status(400).json({ success: false, message: "longitude, latitude, distance, and cityId are required" });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const dist = parseFloat(distance);

    // STEP 1: Filter properties by city and location proximity
    const nearbyProperties = await Property.find({
      cityId,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: dist
        }
      }
    }).select("_id");

    const propertyIds = nearbyProperties.map((p) => p._id);

    // STEP 2: Get all rooms for those properties
    const rooms = await Room.find({ propertyId: { $in: propertyIds } })
      .select("roomNumber roomType description bedCount capacity pricePerNight discount isAvailable isActive area policies thumbnail images amenities propertyId name")
      .populate("propertyId", "name cityId address location")
      .populate("amenities", "name description");

    res.status(200).json({ success: true, rooms });
  } catch (err) {
    next(err);
  }
};





