import express from "express";
import { authorize } from "../middlewares/authorize.js";
import { getUserTransactions } from "../controllers/transaction.controllers.js";

const transactionRoutes = express.Router();

transactionRoutes.get("/", authorize(["user"]), getUserTransactions);

export default transactionRoutes;