import express from "express"
import {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity
} from "../controllers/city.controllers.js"
import { authorize } from "../middlewares/authorize.js"

const cityRoutes = express.Router()

cityRoutes.post("/",authorize(["admin"]), createCity);
cityRoutes.get("/",authorize(["admin"]), getAllCities);
cityRoutes.get("/:id",authorize(["admin"]), getCityById);
cityRoutes.put("/:id",authorize(["admin"]), updateCity);
cityRoutes.delete("/:id",authorize(["admin"]), deleteCity);

export default cityRoutes;
