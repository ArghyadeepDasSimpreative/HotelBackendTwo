import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { getCustomersOfPropertyOwner } from "../controllers/customer.controllers.js";

const customerRoutes = express.Router();

customerRoutes.get("/", authorize(["propertyOwner"]), getCustomersOfPropertyOwner);

export default customerRoutes;