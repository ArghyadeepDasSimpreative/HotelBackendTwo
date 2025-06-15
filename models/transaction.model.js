// models/transaction.model.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "upi", "wallet", "cod"], required: true },
    paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    transactionId: { type: String }, // simulate or use real one from gateway
    paidAt: { type: Date }
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
