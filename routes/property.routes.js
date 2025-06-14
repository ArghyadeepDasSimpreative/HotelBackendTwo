import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { createProperty } from "../controllers/property.controllers.js";
import { uploadMultipleFiles } from "../middlewares/fileupload.js";

const propertyRoutes = express.Router();

propertyRoutes.post("/", authorize(["propertyOwner"]), uploadMultipleFiles("image"), createProperty);

export default propertyRoutes;