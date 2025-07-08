import express from "express";
import { toggleFavorite } from "../controllers/favourite.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const favouriteRoutes = express.Router();

favouriteRoutes.post("/:roomId/toggle", authorize(["user"]), toggleFavorite);

export default favouriteRoutes;