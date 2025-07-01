import express from "express";
import { uploadSingleFile, uploadToImageKit } from "../middlewares/fileupload.js";
import { uploadToCloudinarySingle } from "../middlewares/cloudinary.js";
import { addAmenity, deleteAmenity, getAllAmenities, getAmenityById, updateAmenity } from "../controllers/amenity.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const amenityRoutes = express.Router();

amenityRoutes.post("/", authorize(["admin"]), uploadSingleFile("image"),uploadToImageKit, addAmenity);
amenityRoutes.put("/:id", authorize(["admin"]), updateAmenity);
amenityRoutes.delete("/:id", authorize(["admin"]), deleteAmenity);
amenityRoutes.get("/:id", authorize(["admin"]), getAmenityById);
amenityRoutes.get("/", authorize(["admin"]), getAllAmenities);

export default amenityRoutes;