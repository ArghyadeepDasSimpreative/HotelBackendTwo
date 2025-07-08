import express from "express";
import { addRoomDiscount, getDiscountsByOwner } from "../controllers/discount.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const discountRoutes = express.Router();

discountRoutes.post("/", authorize(["propertyOwner"]), addRoomDiscount); 
discountRoutes.get("/", authorize(["propertyOwner"]), getDiscountsByOwner);

export default discountRoutes;