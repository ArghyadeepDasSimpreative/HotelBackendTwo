import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { verifyPropertyOwnership } from "../middlewares/ownership.js";
import { addRoomImage, createRoom, deleteRoomImage, getRoomById, getRoomsByCity, getRoomsByOwnerId, getRoomsByPropertyId, getRoomsNearby, toggleRoomActivation, updateRoomAmenities, updateRoomDiscount } from "../controllers/room.controllers.js";
import { handleMulterErrors, uploadSingleFile, uploadToImageKit } from "../middlewares/fileupload.js";

const roomRoutes = express.Router();

roomRoutes.post("/:propertyId", authorize(["propertyOwner"]), verifyPropertyOwnership, uploadSingleFile("image"), uploadToImageKit, createRoom);
roomRoutes.get("/:propertyId", authorize(["propertyOwner"]), verifyPropertyOwnership,  getRoomsByPropertyId);
roomRoutes.get("/", authorize(["propertyOwner"]), getRoomsByOwnerId);
roomRoutes.get("/:propertyId/room/:roomId", authorize(["propertyOwner", "user"]), getRoomById);
roomRoutes.put("/:propertyId/room/:roomId/amenities", authorize(["propertyOwner"]), verifyPropertyOwnership, updateRoomAmenities);
roomRoutes.get("/city/:cityId", authorize(["user", "admin"]), getRoomsByCity);
roomRoutes.put("/:propertyId/room/:roomId/toggle-active", authorize(["propertyOwner"]), verifyPropertyOwnership, toggleRoomActivation);
roomRoutes.delete("/:propertyId/room/:roomId/image/:fileName", authorize(["propertyOwner"]),verifyPropertyOwnership, deleteRoomImage);
roomRoutes.post("/:propertyId/room/:roomId/image", authorize(["propertyOwner"]), uploadSingleFile("image"), uploadToImageKit, addRoomImage);
roomRoutes.put("/:propertyId/room/:roomId/discount", authorize(["propertyOwner"]), updateRoomDiscount);
roomRoutes.post("/city/:cityId/nearby", authorize(["user", "admin"]), getRoomsNearby);

export default roomRoutes;