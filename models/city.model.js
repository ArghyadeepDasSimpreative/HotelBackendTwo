import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String }, // new field added
  },
  { timestamps: true }
);

export const City = mongoose.model("City", citySchema);
