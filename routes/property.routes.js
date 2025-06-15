import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { createProperty, getAllProperties } from "../controllers/property.controllers.js";
import { uploadMultipleFiles } from "../middlewares/fileupload.js";

const propertyRoutes = express.Router();

propertyRoutes.post("/", authorize(["propertyOwner"]), uploadMultipleFiles("image"), createProperty);
propertyRoutes.get("/", authorize(["admin", "user"]), getAllProperties);

export default propertyRoutes;