import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { createProperty, getAllProperties, getMyProperties } from "../controllers/property.controllers.js";
import { uploadMultipleFiles } from "../middlewares/fileupload.js";

const propertyRoutes = express.Router();

propertyRoutes.post("/", authorize(["propertyOwner"]), uploadMultipleFiles("image"), createProperty);
propertyRoutes.get("/all", authorize(["admin", "user"]), getAllProperties);
propertyRoutes.get("/", authorize(["propertyOwner"]), getMyProperties);

export default propertyRoutes;