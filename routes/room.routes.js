import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { verifyPropertyOwnership } from "../middlewares/ownership.js";
import { createRoom, getRoomById, getRoomsByCity, getRoomsByOwnerId, getRoomsByPropertyId, updateRoomAmenities } from "../controllers/room.controllers.js";
import { handleMulterErrors, uploadSingleFile } from "../middlewares/fileupload.js";

const roomRoutes = express.Router();

roomRoutes.post("/:propertyId", authorize(["propertyOwner"]), verifyPropertyOwnership, uploadSingleFile("image"), createRoom);
roomRoutes.get("/:propertyId", authorize(["propertyOwner"]), verifyPropertyOwnership,  getRoomsByPropertyId);
roomRoutes.get("/", authorize(["propertyOwner"]), getRoomsByOwnerId);
roomRoutes.get("/:propertyId/room/:roomId", authorize(["propertyOwner"]), verifyPropertyOwnership, getRoomById);
roomRoutes.put("/:propertyId/room/:roomId/amenities", authorize(["propertyOwner"]), verifyPropertyOwnership, updateRoomAmenities)
roomRoutes.get("/city/:cityId", authorize(["user", "admin"]), getRoomsByCity);

export default roomRoutes;