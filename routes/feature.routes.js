import express from "express";
import {
  featuresCreate,
  featuresUpdate,
  featuresDelete,
  featuresGetAll,
  featuresGetById
} from "../controllers/feature.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const featureRoutes = express.Router();

featureRoutes.post("/", authorize(["admin"]), featuresCreate);
featureRoutes.put("/:id", authorize(["admin"]), featuresUpdate);
featureRoutes.delete("/:id", authorize(["admin"]), featuresDelete);
featureRoutes.get("/", authorize(["admin", "propertyOwner"]), featuresGetAll);
featureRoutes.get("/:id", authorize(["admin"]), featuresGetById);

export default featureRoutes;
