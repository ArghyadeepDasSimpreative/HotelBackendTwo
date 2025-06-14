import mongoose from "mongoose";

const featureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String }
  },
  { timestamps: true }
);

export const Feature = mongoose.model("Feature", featureSchema);
