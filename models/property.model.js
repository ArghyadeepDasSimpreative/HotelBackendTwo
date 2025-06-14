import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }, // e.g., Hotel, Resort
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
    address: { type: String, required: true },
    pincode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    features: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feature" }],
    images: [String],
    thumbnail: { type: String },
    isActive: { type: Boolean, default: true },
    totalRooms: { type: Number },
    policies: { type: String },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
