import express from "express"
import {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
  updateCityImage
} from "../controllers/city.controllers.js"
import { authorize } from "../middlewares/authorize.js"
import { uploadSingleFile } from "../middlewares/fileupload.js";

const cityRoutes = express.Router()

cityRoutes.post("/",authorize(["admin"]), createCity);
cityRoutes.get("/",authorize(["admin", "propertyOwner", "user"]), getAllCities);
cityRoutes.get("/:id",authorize(["admin"]), getCityById);
cityRoutes.put("/:id",authorize(["admin"]), updateCity);
cityRoutes.delete("/:id",authorize(["admin"]), deleteCity);
cityRoutes.put("/:id/image", authorize(["admin"]), uploadSingleFile("image"), updateCityImage);

export default cityRoutes;
